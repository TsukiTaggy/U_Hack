import {
  evaluateLearningAnswer,
  localizedText,
  type LessonContent,
  type Locale,
} from "@/lib/learning";

const copy = {
  th: {
    quiz: "แบบทดสอบ",
    question: "คำถาม",
    check: "ตรวจคำตอบ",
    retry: "ลองอีกครั้ง",
    next: "คำถามถัดไป",
    finish: "ดูผลลัพธ์",
    correct: "ตอบถูก",
    incorrect: "ยังไม่ถูก ลองอีกครั้ง",
    hint: "คำใบ้",
  },
  en: {
    quiz: "Quiz",
    question: "Question",
    check: "Check answer",
    retry: "Try again",
    next: "Next question",
    finish: "See result",
    correct: "Correct",
    incorrect: "Not quite. Try again",
    hint: "Hint",
  },
} as const;

export function LearningQuiz({
  lesson,
  locale,
  questionIndex,
  selectedOptionId,
  checked,
  onSelect,
  onCheck,
  onRetry,
  onNext,
}: {
  lesson: LessonContent;
  locale: Locale;
  questionIndex: number;
  selectedOptionId: string;
  checked: boolean;
  onSelect: (optionId: string) => void;
  onCheck: () => void;
  onRetry: () => void;
  onNext: () => void;
}) {
  const question = lesson.quiz[questionIndex];
  if (!question) return null;

  const text = copy[locale];
  const result = evaluateLearningAnswer(question, selectedOptionId);
  const isLastQuestion = questionIndex === lesson.quiz.length - 1;

  return (
    <article className="rounded-3xl border border-[var(--border-subtle)] bg-white p-6 shadow-sm dark:bg-zinc-950 sm:p-8">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--avalanche-red)]">{text.quiz}</p>
          <h3 className="mt-1 text-2xl font-bold">{localizedText(lesson.title, locale)}</h3>
        </div>
        <p className="text-sm font-medium text-[var(--text-muted)]">
          {text.question} {questionIndex + 1}/{lesson.quiz.length}
        </p>
      </header>

      <fieldset className="mt-7" role="radiogroup" aria-labelledby={`question-${question.id}`}>
        <legend id={`question-${question.id}`} className="text-xl font-semibold leading-relaxed">
          {localizedText(question.prompt, locale)}
        </legend>
        <div className="mt-5 space-y-3">
          {question.options.map((option) => {
            const selected = selectedOptionId === option.id;
            return (
              <label
                key={option.id}
                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors ${
                  selected
                    ? "border-[var(--avalanche-red)] bg-red-50 dark:bg-red-950/20"
                    : "border-[var(--border-subtle)] hover:border-zinc-400 dark:hover:border-zinc-600"
                } ${checked ? "cursor-default" : ""}`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.id}
                  checked={selected}
                  disabled={checked}
                  onChange={() => onSelect(option.id)}
                  className="h-5 w-5 accent-[var(--avalanche-red)]"
                />
                <span className="leading-relaxed">{localizedText(option.text, locale)}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {checked && (
        <section
          aria-live="polite"
          className={`mt-6 rounded-2xl border p-4 ${
            result.correct
              ? "border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100"
              : "border-red-300 bg-red-50 text-red-950 dark:border-red-900 dark:bg-red-950/30 dark:text-red-100"
          }`}
        >
          <p className="font-semibold">{result.correct ? text.correct : text.incorrect}</p>
          <p className="mt-1 text-sm leading-relaxed">
            {!result.correct && question.hint && <span className="font-semibold">{text.hint}: </span>}
            {localizedText(result.feedback, locale)}
          </p>
        </section>
      )}

      <div className="mt-6 flex justify-end">
        {!checked ? (
          <button
            type="button"
            disabled={!selectedOptionId}
            onClick={onCheck}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-zinc-900 px-6 py-3 font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            {text.check}
          </button>
        ) : result.correct ? (
          <button
            type="button"
            onClick={onNext}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--avalanche-red)] px-6 py-3 font-semibold text-white hover:brightness-95"
          >
            {isLastQuestion ? text.finish : text.next}
          </button>
        ) : (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-300 px-6 py-3 font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            {text.retry}
          </button>
        )}
      </div>
    </article>
  );
}
