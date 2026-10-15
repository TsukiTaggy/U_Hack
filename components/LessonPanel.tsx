import { localizedText, type LessonContent, type Locale } from "@/lib/learning";

const copy = {
  th: {
    lessonLabel: "บทที่",
    keyPoints: "สิ่งสำคัญที่ต้องจำ",
    start: "เริ่มทำแบบทดสอบ",
    review: "ทบทวนแบบทดสอบ",
    reviewed: "บทนี้เรียนจบแล้ว คุณสามารถทบทวนเนื้อหาและทำแบบทดสอบอีกครั้งได้",
  },
  en: {
    lessonLabel: "Lesson",
    keyPoints: "What to remember",
    start: "Start the quiz",
    review: "Review the quiz",
    reviewed: "You completed this lesson. Review the material or take the quiz again.",
  },
} as const;

export function LessonPanel({
  lesson,
  locale,
  review,
  onStartQuiz,
}: {
  lesson: LessonContent;
  locale: Locale;
  review: boolean;
  onStartQuiz: () => void;
}) {
  const text = copy[locale];

  return (
    <article className="rounded-3xl border border-[var(--border-subtle)] bg-white p-6 shadow-sm dark:bg-zinc-950 sm:p-8">
      <header className="max-w-3xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--avalanche-red)]">
          {localizedText(lesson.chapter.title, locale)} · {text.lessonLabel} {lesson.id}
        </p>
        <h3 className="text-3xl font-bold tracking-tight sm:text-4xl">{localizedText(lesson.title, locale)}</h3>
        <p className="text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">
          {localizedText(lesson.summary, locale)}
        </p>
      </header>

      <div className="mt-8 max-w-3xl space-y-8">
        <p className="text-base leading-8 text-zinc-700 dark:text-zinc-300">
          {localizedText(lesson.lesson, locale)}
        </p>

        <section aria-labelledby={`lesson-${lesson.id}-key-points`}>
          <h4 id={`lesson-${lesson.id}-key-points`} className="text-lg font-semibold">
            {text.keyPoints}
          </h4>
          <ul className="mt-4 space-y-3">
            {lesson.keyPoints.map((point, index) => (
              <li key={index} className="flex gap-3 rounded-2xl border border-[var(--border-subtle)] p-4">
                <span className="font-bold text-[var(--avalanche-red)]" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="leading-relaxed">{localizedText(point, locale)}</span>
              </li>
            ))}
          </ul>
        </section>

        {review && <p className="text-sm text-[var(--text-muted)]">{text.reviewed}</p>}

        <button
          type="button"
          onClick={onStartQuiz}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-zinc-900 px-6 py-3 font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          {review ? text.review : text.start}
        </button>
      </div>
    </article>
  );
}
