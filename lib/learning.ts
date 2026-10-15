import lesson1 from "@/content/lessons/1.json";
import lesson2 from "@/content/lessons/2.json";
import lesson3 from "@/content/lessons/3.json";
import lesson4 from "@/content/lessons/4.json";
import lesson5 from "@/content/lessons/5.json";
import lesson6 from "@/content/lessons/6.json";
import lesson7 from "@/content/lessons/7.json";
import lesson8 from "@/content/lessons/8.json";
import lesson9 from "@/content/lessons/9.json";
import lesson10 from "@/content/lessons/10.json";
import lesson11 from "@/content/lessons/11.json";
import lesson12 from "@/content/lessons/12.json";
import lesson13 from "@/content/lessons/13.json";

export type Locale = "th" | "en";
/** Lesson IDs are the lesson numbers as strings, "1" to "13", in course order. */
export type LessonId = string;

export type LocalizedText = {
  th: string;
  en: string;
};

export type QuizOption = {
  id: string;
  text: LocalizedText;
};

export type QuizQuestion = {
  id: string;
  prompt: LocalizedText;
  options: QuizOption[];
  correctOptionId: string;
  explanation: LocalizedText;
  /** Nudge shown after a wrong answer; the explanation is shown once the answer is correct. */
  hint?: LocalizedText;
};

export type Chapter = {
  id: string;
  title: LocalizedText;
};

export type LessonContent = {
  id: LessonId;
  chapter: Chapter;
  title: LocalizedText;
  summary: LocalizedText;
  lesson: LocalizedText;
  keyPoints: LocalizedText[];
  quiz: QuizQuestion[];
};

export type QuizAnswers = Record<string, string>;

const lessonList = [
  lesson1, lesson2, lesson3, lesson4, lesson5, lesson6, lesson7,
  lesson8, lesson9, lesson10, lesson11, lesson12, lesson13,
] as unknown as LessonContent[];

export const lessons: readonly LessonContent[] = lessonList;

export function lessonById(id: string): LessonContent | undefined {
  return lessons.find((lesson) => lesson.id === id);
}

export function localizedText(value: LocalizedText, locale: Locale): string {
  return value[locale]?.trim() || value.en?.trim() || value.th?.trim() || "";
}

export function evaluateLearningAnswer(
  question: QuizQuestion,
  optionId: string,
): { correct: boolean; explanation: LocalizedText; feedback: LocalizedText } {
  const optionExists = question.options.some((option) => option.id === optionId);
  const correct = optionExists && optionId === question.correctOptionId;
  return {
    correct,
    explanation: question.explanation,
    // A wrong answer gets the hint (so the answer is not given away); a right answer gets the explanation.
    feedback: correct ? question.explanation : (question.hint ?? question.explanation),
  };
}

export function isLearningQuizPassed(lesson: LessonContent, answers: QuizAnswers): boolean {
  return (
    lesson.quiz.length > 0 &&
    lesson.quiz.every((question) => evaluateLearningAnswer(question, answers[question.id] ?? "").correct)
  );
}
