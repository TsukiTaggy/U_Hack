import { clientIp, errorMessage, fail, langOf, rateLimited, readJson } from "@/lib/api";
import { learnCoachLesson, learnCoachSystem, LEARN_COACH_MAX_QUESTION } from "@/lib/learn-coach";
import { lessonById } from "@/lib/learning";
import { chat, untrusted } from "@/lib/llm";

// Lesson tutor for /learn: answers questions about one lesson. No tools, no wallet.

export async function POST(request: Request) {
  if (rateLimited(`learn-coach:${clientIp(request)}`, 20, 60_000)) return fail(429, "Too many questions. Wait a minute.");

  const body = await readJson(request);
  const lesson = lessonById(typeof body.lessonId === "string" ? body.lessonId : "");
  const question = typeof body.question === "string" ? body.question.trim().slice(0, LEARN_COACH_MAX_QUESTION) : "";
  const lang = langOf(body.lang);
  if (!lesson) return fail(400, "Unknown lesson.");
  if (!question) return fail(400, "Ask a question.");

  try {
    const { text, provider } = await chat(
      [
        { role: "system", content: learnCoachSystem(lang) },
        { role: "user", content: `<lesson>\n${learnCoachLesson(lesson, lang)}\n</lesson>\n\n${untrusted("learner", question)}` },
      ],
      350,
    );
    return Response.json({ answer: text || "Sorry, I could not answer that. Try asking again.", provider });
  } catch (err) {
    return fail(503, `Coach is unavailable right now: ${errorMessage(err)}`);
  }
}
