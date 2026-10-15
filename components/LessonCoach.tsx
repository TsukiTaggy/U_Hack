"use client";

import { useState } from "react";
import { CoachText } from "@/components/missions/CoachText";
import { post } from "@/components/missions/types";
import type { LessonContent, Locale } from "@/lib/learning";

const copy = {
  th: {
    eyebrow: "AI COACH",
    title: "ถามโค้ชเกี่ยวกับบทนี้",
    body: "ถามสิ่งที่ยังไม่เข้าใจในบทเรียนนี้ได้ โค้ชจะอธิบายด้วยภาษาง่าย ๆ ไม่ต้องเชื่อม wallet และจะไม่บอกคำตอบของแบบทดสอบ",
    placeholder: "เช่น ทำไม private key ถึงสำคัญ?",
    ask: "ถามโค้ช",
    asking: "กำลังคิด…",
    examples: ["อธิบายบทนี้แบบง่าย ๆ หน่อย", "ยกตัวอย่างในชีวิตจริงให้หน่อย"],
    note: "คำตอบมาจาก AI ใช้เพื่อการเรียนรู้เท่านั้น ไม่ใช่คำแนะนำการลงทุน",
  },
  en: {
    eyebrow: "AI COACH",
    title: "Ask the coach about this lesson",
    body: "Ask about anything in this lesson you are unsure of. The coach explains in plain words, needs no wallet and will not give away quiz answers.",
    placeholder: "e.g. Why does a private key matter?",
    ask: "Ask the coach",
    asking: "Thinking…",
    examples: ["Explain this lesson simply", "Give me a real-life example"],
    note: "Answers come from AI and are for learning only, not financial advice.",
  },
} as const;

export function LessonCoach({ lesson, locale }: { lesson: LessonContent; locale: Locale }) {
  const text = copy[locale];
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function ask(q = question) {
    if (!q.trim() || busy) return;
    setQuestion(q);
    setBusy(true);
    setError("");
    setAnswer("");
    try {
      const res = await post<{ answer: string }>("/api/learn-coach", { lessonId: lesson.id, question: q, lang: locale });
      setAnswer(res.answer);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      aria-label={text.title}
      className="rounded-3xl border border-[var(--border-subtle)] bg-white p-6 shadow-sm dark:bg-zinc-950 sm:p-8"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--avalanche-red)]">{text.eyebrow}</p>
      <h3 className="mt-2 text-2xl font-bold tracking-tight">{text.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{text.body}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {text.examples.map((example) => (
          <button
            key={example}
            type="button"
            disabled={busy}
            onClick={() => ask(example)}
            className="min-h-11 rounded-full border border-[var(--border-subtle)] px-4 text-sm hover:bg-zinc-50 disabled:opacity-50 dark:hover:bg-zinc-900"
          >
            {example}
          </button>
        ))}
      </div>

      <form
        className="mt-4 flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          void ask();
        }}
      >
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          maxLength={500}
          placeholder={text.placeholder}
          aria-label={text.title}
          className="min-h-11 flex-1 rounded-xl border border-[var(--border-subtle)] bg-transparent px-4 text-sm"
        />
        <button
          type="submit"
          disabled={busy || !question.trim()}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-zinc-900 px-6 font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          {busy ? text.asking : text.ask}
        </button>
      </form>

      <div aria-live="polite" className="mt-4 space-y-2">
        {error && <p className="text-sm text-[var(--avalanche-red)]">{error}</p>}
        {answer && <CoachText text={answer} />}
        {answer && <p className="text-xs text-[var(--text-muted)]">{text.note}</p>}
      </div>
    </section>
  );
}
