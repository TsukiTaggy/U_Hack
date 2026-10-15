import lesson1 from "@/content/lessons/1.json";
import lesson2 from "@/content/lessons/2.json";
import lesson3 from "@/content/lessons/3.json";
import lesson4 from "@/content/lessons/4.json";

export type Locale = "th" | "en";
export type LessonId = "1" | "2" | "3" | "4";

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
};

export type LessonContent = {
  id: LessonId;
  title: LocalizedText;
  summary: LocalizedText;
  lesson: LocalizedText;
  keyPoints: LocalizedText[];
  quiz: QuizQuestion[];
};

export type QuizAnswers = Record<string, string>;

const lessonList = [lesson1, lesson2, lesson3, lesson4] as unknown as LessonContent[];

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
): { correct: boolean; explanation: LocalizedText } {
  const optionExists = question.options.some((option) => option.id === optionId);
  return {
    correct: optionExists && optionId === question.correctOptionId,
    explanation: question.explanation,
  };
}

export function isLearningQuizPassed(lesson: LessonContent, answers: QuizAnswers): boolean {
  return (
    lesson.quiz.length > 0 &&
    lesson.quiz.every((question) => evaluateLearningAnswer(question, answers[question.id] ?? "").correct)
  );
}
