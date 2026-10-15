"use client";

import { useEffect, useMemo, useState } from "react";
import { LearningQuiz } from "@/components/LearningQuiz";
import { LessonCoach } from "@/components/LessonCoach";
import { LessonPanel } from "@/components/LessonPanel";
import { LessonPath, type LessonPathItem } from "@/components/LessonPath";
import { Section } from "@/components/Section";
import {
  isLearningQuizPassed,
  lessonById,
  lessons,
  localizedText,
  type LessonId,
  type Locale,
  type QuizAnswers,
} from "@/lib/learning";
import {
  canOpenLesson,
  defaultLearningProgress,
  isLessonCompleted,
  markLessonCompleted,
  nextLessonId,
  readLearningProgress,
  writeLearningProgress,
  type LearningProgress,
} from "@/lib/learning-progress";

type Phase = "lesson" | "quiz" | "completed";

type CourseState = {
  progress: LearningProgress;
  activeLessonId: LessonId;
  storageReady: boolean;
};

const copy = {
  th: {
    eyebrow: "SAFESTART LEARNING CENTER",
    titleLead: "เรียนรู้ก่อน",
    titleAccent: "ลงมือจริง",
    intro: "13 บทเรียนสั้น ๆ ตั้งแต่พื้นฐานบล็อกเชน การใช้ wallet ไปจนถึงการรับมือมิจฉาชีพ ช่วยให้คุณสังเกตความเสี่ยงและปกป้องกระเป๋าของตัวเอง",
    testnet: "เรียนได้โดยไม่ต้องเชื่อม wallet",
    pathTitle: "เส้นทางการเรียนรู้",
    pathSubtitle: "เรียนตามลำดับและปลดล็อกบทถัดไปเมื่อทำแบบทดสอบผ่าน",
    completedTitle: "จบบทเรียนแล้ว",
    completedBody: "คุณตอบถูกครบทุกข้อและปลดล็อกบทถัดไปแล้ว",
    courseCompletedTitle: "เรียนครบทั้งหลักสูตรแล้ว",
    courseCompletedBody: "คุณสามารถกลับไปทบทวนบทเรียนหรือทำแบบทดสอบซ้ำได้ทุกเมื่อ",
    nextLesson: "ไปบทถัดไป",
    reviewLesson: "ทบทวนบทเรียนนี้",
    thai: "ไทย",
    english: "English",
  },
  en: {
    eyebrow: "SAFESTART LEARNING CENTER",
    titleLead: "Learn before you",
    titleAccent: "act",
    intro: "13 short lessons, from blockchain basics and using a wallet to handling scams, that help you spot risk and protect your wallet.",
    testnet: "No wallet connection required",
    pathTitle: "Learning path",
    pathSubtitle: "Follow the lessons in order and unlock the next one by passing its quiz.",
    completedTitle: "Lesson completed",
    completedBody: "You answered every question correctly and unlocked the next lesson.",
    courseCompletedTitle: "Course completed",
    courseCompletedBody: "You can review any lesson or retake its quiz whenever you want.",
    nextLesson: "Continue to next lesson",
    reviewLesson: "Review this lesson",
    thai: "ไทย",
    english: "English",
  },
} as const;

const initialCourseState: CourseState = {
  progress: defaultLearningProgress(),
  activeLessonId: "1",
  storageReady: false,
};

export default function LearningClient() {
  const [course, setCourse] = useState<CourseState>(initialCourseState);
  const [phase, setPhase] = useState<Phase>("lesson");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswers>({});

  useEffect(() => {
    const progress = readLearningProgress(window.localStorage);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate browser-only progress after stable Thai SSR output
    setCourse({
      progress,
      activeLessonId: nextLessonId(progress) ?? "1",
      storageReady: true,
    });
  }, []);

  useEffect(() => {
    if (course.storageReady) {
      writeLearningProgress(window.localStorage, course.progress);
    }
  }, [course.progress, course.storageReady]);

  const { progress, activeLessonId } = course;
  const locale = progress.locale;
  const text = copy[locale];
  const activeLesson = lessonById(activeLessonId) ?? lessons[0];
  const completed = isLessonCompleted(progress, activeLesson.id);
  const nextId = nextLessonId(progress);

  const pathItems = useMemo<LessonPathItem[]>(
    () =>
      lessons.map((lesson) => ({
        id: lesson.id,
        chapter: localizedText(lesson.chapter.title, locale),
        title: localizedText(lesson.title, locale),
        status: isLessonCompleted(progress, lesson.id)
          ? "completed"
          : nextId === lesson.id
            ? "current"
            : "locked",
        selected: activeLesson.id === lesson.id,
      })),
    [activeLesson.id, locale, nextId, progress],
  );

  function resetQuiz() {
    setQuestionIndex(0);
    setSelectedOptionId("");
    setChecked(false);
    setAnswers({});
  }

  function selectLesson(lessonId: LessonId) {
    if (!canOpenLesson(progress, lessonId)) return;
    setCourse((current) => ({ ...current, activeLessonId: lessonId }));
    setPhase("lesson");
    resetQuiz();
  }

  function setLocale(localeValue: Locale) {
    setCourse((current) => ({
      ...current,
      progress: { ...current.progress, locale: localeValue },
    }));
  }

  function startQuiz() {
    resetQuiz();
    setPhase("quiz");
  }

  function selectOption(optionId: string) {
    if (checked) return;
    const question = activeLesson.quiz[questionIndex];
    setSelectedOptionId(optionId);
    setAnswers((current) => ({ ...current, [question.id]: optionId }));
  }

  function checkAnswer() {
    if (selectedOptionId) setChecked(true);
  }

  function retryQuestion() {
    const question = activeLesson.quiz[questionIndex];
    setAnswers((current) => {
      const next = { ...current };
      delete next[question.id];
      return next;
    });
    setSelectedOptionId("");
    setChecked(false);
  }

  function continueQuiz() {
    const question = activeLesson.quiz[questionIndex];
    const nextAnswers = { ...answers, [question.id]: selectedOptionId };

    if (questionIndex < activeLesson.quiz.length - 1) {
      setQuestionIndex((current) => current + 1);
      setSelectedOptionId("");
      setChecked(false);
      return;
    }

    if (!isLearningQuizPassed(activeLesson, nextAnswers)) return;

    setCourse((current) => ({
      ...current,
      progress: markLessonCompleted(current.progress, activeLesson.id),
    }));
    setPhase("completed");
  }

  function continueToNextLesson() {
    const followingId = lessons[lessons.findIndex((lesson) => lesson.id === activeLesson.id) + 1]?.id;
    if (followingId && canOpenLesson(progress, followingId)) {
      selectLesson(followingId);
    }
  }

  return (
    <main className="flex-1" lang={locale}>
      <section className="relative overflow-hidden bg-black text-white">
        <div className="hero-rain absolute inset-0" aria-hidden="true" />
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-14 sm:px-8 sm:py-20">
          <div className="max-w-4xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">{text.eyebrow}</p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              {text.titleLead}
              {locale === "en" ? " " : ""}
              <span className="text-[var(--avalanche-red)]">{text.titleAccent}</span>
            </h1>
            <p className="max-w-3xl text-base leading-relaxed text-zinc-300 sm:text-lg">{text.intro}</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-zinc-400">{text.testnet}</p>
            <div className="flex rounded-xl border border-zinc-700 p-1" role="group" aria-label="Course language">
              {(["th", "en"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={locale === option}
                  onClick={() => setLocale(option)}
                  className={`min-h-11 rounded-lg px-4 text-sm font-semibold ${
                    locale === option ? "bg-white text-zinc-900" : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  {option === "th" ? text.thai : text.english}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Section className="bg-zinc-50 dark:bg-zinc-900/30">
        <header className="mb-8 max-w-3xl space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">{text.pathTitle}</h2>
          <p className="text-[var(--text-muted)]">{text.pathSubtitle}</p>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* On phones the lesson comes first and the 13-lesson path follows it. */}
          <aside className="order-last lg:sticky lg:top-20 lg:order-none lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
            <LessonPath items={pathItems} locale={locale} onSelect={selectLesson} />
          </aside>

          <div className="min-w-0 space-y-6">
          {phase === "lesson" && (
            <>
              <LessonPanel lesson={activeLesson} locale={locale} review={completed} onStartQuiz={startQuiz} />
              {/* key resets the coach's answer when the learner opens another lesson */}
              <LessonCoach key={activeLesson.id} lesson={activeLesson} locale={locale} />
            </>
          )}

          {phase === "quiz" && (
            <LearningQuiz
              lesson={activeLesson}
              locale={locale}
              questionIndex={questionIndex}
              selectedOptionId={selectedOptionId}
              checked={checked}
              onSelect={selectOption}
              onCheck={checkAnswer}
              onRetry={retryQuestion}
              onNext={continueQuiz}
            />
          )}

          {phase === "completed" && (
            <section
              aria-live="polite"
              className="rounded-3xl border border-[var(--border-subtle)] bg-white p-8 shadow-sm dark:bg-zinc-950"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--avalanche-red)]">
                {localizedText(activeLesson.title, locale)}
              </p>
              <h3 className="mt-3 text-3xl font-bold tracking-tight">
                {nextId ? text.completedTitle : text.courseCompletedTitle}
              </h3>
              <p className="mt-3 max-w-2xl leading-relaxed text-[var(--text-muted)]">
                {nextId ? text.completedBody : text.courseCompletedBody}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                {nextId && (
                  <button
                    type="button"
                    onClick={continueToNextLesson}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-zinc-900 px-6 py-3 font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                  >
                    {text.nextLesson}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPhase("lesson")}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-300 px-6 py-3 font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
                >
                  {text.reviewLesson}
                </button>
              </div>
            </section>
          )}
          </div>
        </div>
      </Section>
    </main>
  );
}
