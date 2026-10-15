import { clientIp, errorMessage, fail, langOf, rateLimited, readJson } from "@/lib/api";
import { runAgent, untrusted, UNTRUSTED_RULE } from "@/lib/llm";
import { coachHandlers, coachTools } from "@/lib/tools";
import { parseAddress } from "@/lib/verify";
import { addresses } from "@/lib/config";

// AI coach agent: answers learner questions by calling read-only Fuji tools.

export async function POST(request: Request) {
  if (rateLimited(`coach:${clientIp(request)}`, 20, 60_000)) return fail(429, "Too many questions. Wait a minute.");

  const body = await readJson(request);
  const question = typeof body.question === "string" ? body.question.slice(0, 1000) : "";
  const address = parseAddress(body.address);
  const hashes = Array.isArray(body.txHashes) ? body.txHashes.filter((h): h is string => typeof h === "string").slice(-10) : [];
  const missionId = typeof body.missionId === "string" ? body.missionId.slice(0, 4) : "";
  const lang = langOf(body.lang);
  if (!question) return fail(400, "Ask a question.");

  const system = [
    "You are SafeStart Coach, a patient crypto-safety tutor for beginners on Avalanche Fuji testnet.",
    "Always check facts with the tools before explaining a balance, transaction, fee or approval. Never guess numbers.",
    "Explain in short, plain sentences (max 5). Point out exactly what went wrong and what to do next.",
    "This is testnet practice; never give investment advice or tell anyone to buy or sell.",
    "Never ask for a recovery phrase or private key, and tell the learner never to share one.",
    UNTRUSTED_RULE,
    `Reply in ${lang === "th" ? "Thai" : "English"}.`,
  ].join(" ");

  const context = [
    `Learner address: ${address ?? "not connected"}`,
    `Current mission: ${missionId || "none"}`,
    `Tutor address (correct recipient for mission 3): ${addresses.tutor ?? "not configured"}`,
    `Suspicious airdrop contract (mission 5): ${addresses.fakeAirdrop ?? "not configured"}`,
    `Transactions sent in this session: ${hashes.length ? hashes.join(", ") : "none"}`,
  ].join("\n");

  try {
    const result = await runAgent({
      system,
      user: `${context}\n\n${untrusted("learner", question)}`,
      tools: coachTools,
      handlers: coachHandlers(hashes),
    });
    return Response.json({ answer: result.text || "Sorry, I could not answer that. Try asking again.", steps: result.steps, provider: result.provider });
  } catch (err) {
    return fail(503, `Coach is unavailable right now: ${errorMessage(err)}`);
  }
}
