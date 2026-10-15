import { describe, expect, it } from "vitest";
import {
  evaluateLearningAnswer,
  isLearningQuizPassed,
  lessonById,
  lessons,
  localizedText,
  type QuizAnswers,
} from "@/lib/learning";

describe("learning content", () => {
  it("exposes four ordered bilingual lessons with three questions each", () => {
    expect(lessons.map((lesson) => lesson.id)).toEqual(["1", "2", "3", "4"]);

    for (const lesson of lessons) {
      expect(lesson.title.th.trim()).not.toBe("");
      expect(lesson.title.en.trim()).not.toBe("");
      expect(lesson.summary.th.trim()).not.toBe("");
      expect(lesson.summary.en.trim()).not.toBe("");
      expect(lesson.lesson.th.trim()).not.toBe("");
      expect(lesson.lesson.en.trim()).not.toBe("");
      expect(lesson.keyPoints.length).toBeGreaterThanOrEqual(3);
      expect(lesson.quiz).toHaveLength(3);

      for (const text of lesson.keyPoints) {
        expect(text.th.trim()).not.toBe("");
        expect(text.en.trim()).not.toBe("");
      }

      expect(new Set(lesson.quiz.map((question) => question.id)).size).toBe(lesson.quiz.length);

      for (const question of lesson.quiz) {
        expect(question.prompt.th.trim()).not.toBe("");
        expect(question.prompt.en.trim()).not.toBe("");
        expect(question.explanation.th.trim()).not.toBe("");
        expect(question.explanation.en.trim()).not.toBe("");
        expect(question.options.length).toBeGreaterThanOrEqual(2);
        expect(new Set(question.options.map((option) => option.id)).size).toBe(question.options.length);
        expect(question.options.filter((option) => option.id === question.correctOptionId)).toHaveLength(1);

        for (const option of question.options) {
          expect(option.text.th.trim()).not.toBe("");
          expect(option.text.en.trim()).not.toBe("");
        }
      }
    }
  });

  it("falls back to English when requested locale text is missing", () => {
    expect(localizedText({ th: "", en: "Fallback" }, "th")).toBe("Fallback");
  });

  it("returns undefined for an unknown lesson", () => {
    expect(lessonById("99")).toBeUndefined();
  });
});

describe("learning quiz rules", () => {
  const lesson = lessons[0];
  const question = lesson.quiz[0];

  it("accepts the configured correct option", () => {
    expect(evaluateLearningAnswer(question, question.correctOptionId)).toEqual({
      correct: true,
      explanation: question.explanation,
    });
  });

  it("rejects an unknown option", () => {
    expect(evaluateLearningAnswer(question, "not-an-option")).toEqual({
      correct: false,
      explanation: question.explanation,
    });
  });

  it("requires every question to be answered correctly", () => {
    const correctAnswers: QuizAnswers = Object.fromEntries(
      lesson.quiz.map((item) => [item.id, item.correctOptionId]),
    );
    const missingAnswer = { ...correctAnswers };
    delete missingAnswer[lesson.quiz[2].id];

    expect(isLearningQuizPassed(lesson, correctAnswers)).toBe(true);
    expect(isLearningQuizPassed(lesson, missingAnswer)).toBe(false);
    expect(isLearningQuizPassed(lesson, { ...correctAnswers, [question.id]: "not-an-option" })).toBe(false);
  });
});
