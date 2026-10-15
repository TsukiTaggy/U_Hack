import { clientIp, errorMessage, fail, langOf, rateLimited, readJson } from "@/lib/api";
import { chat } from "@/lib/llm";
import { getPersona, MAX_LEARNER_TURNS, parseTranscript, scammerSystemPrompt, TRAINING_STOP } from "@/lib/scam";
import { looksLikeSecret } from "@/lib/verify";

// Text-mode practice scammer: returns the caller's next line.

export async function POST(request: Request) {
  if (rateLimited(`scam:${clientIp(request)}`, 40, 60_000)) return fail(429, "Slow down a little.");

  const body = await readJson(request);
  const persona = getPersona(body.personaId);
  const transcript = parseTranscript(body.transcript ?? []);
  const lang = langOf(body.lang);
  if (!persona || !transcript) return fail(400, "Invalid persona or transcript.");

  if (transcript.length === 0) return Response.json({ reply: persona.opening, done: false });

  const learnerTurns = transcript.filter((t) => t.role === "learner");
  const last = learnerTurns.at(-1);
  if (last && looksLikeSecret(last.text)) return Response.json({ reply: TRAINING_STOP, done: true, secretDetected: true });
  if (learnerTurns.length >= MAX_LEARNER_TURNS) return Response.json({ reply: "(The caller hangs up.)", done: true });

  try {
    const { text } = await chat(
      [
        { role: "system", content: scammerSystemPrompt(persona, lang) },
        ...transcript.map((t) =>
          t.role === "scammer" ? { role: "assistant" as const, content: t.text } : { role: "user" as const, content: t.text },
        ),
      ],
      150,
    );
    const done = text.includes("[END]");
    return Response.json({ reply: text.replace("[END]", "").trim() || "(The caller hangs up.)", done });
  } catch (err) {
    return fail(503, `The practice call is unavailable right now: ${errorMessage(err)}`);
  }
}
