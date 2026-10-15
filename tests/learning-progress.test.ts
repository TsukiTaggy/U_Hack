import { describe, expect, it } from "vitest";
import {
  LEARNING_STORAGE_KEY,
  canOpenLesson,
  defaultLearningProgress,
  isLessonCompleted,
  markLessonCompleted,
  nextLessonId,
  parseLearningProgress,
  readLearningProgress,
  writeLearningProgress,
} from "@/lib/learning-progress";

describe("learning progress parsing", () => {
  it("returns the exact Thai-first default for malformed or old data", () => {
    const expected = { version: 1, locale: "th", completedLessonIds: [] };

    expect(defaultLearningProgress()).toEqual(expected);
    expect(parseLearningProgress(null)).toEqual(expected);
    expect(parseLearningProgress([])).toEqual(expected);
    expect(parseLearningProgress({ version: 0, locale: "en", completedLessonIds: ["1"] })).toEqual(expected);
  });

  it("normalizes locale, duplicates, unknown IDs, and stored order", () => {
    expect(
      parseLearningProgress({
        version: 1,
        locale: "unknown",
        completedLessonIds: ["2", "1", "2", "99"],
      }),
    ).toEqual({ version: 1, locale: "th", completedLessonIds: ["1", "2"] });
  });
});

describe("learning progression", () => {
  it("marks valid lessons immutably and without duplicates", () => {
    const initial = defaultLearningProgress();
    const completed = markLessonCompleted(initial, "1");

    expect(initial.completedLessonIds).toEqual([]);
    expect(completed.completedLessonIds).toEqual(["1"]);
    expect(markLessonCompleted(completed, "1")).toEqual(completed);
    expect(markLessonCompleted(completed, "99")).toEqual(completed);
    expect(isLessonCompleted(completed, "1")).toBe(true);
    expect(isLessonCompleted(completed, "99")).toBe(false);
  });

  it("unlocks lessons sequentially and reports the next incomplete lesson", () => {
    const initial = defaultLearningProgress();
    expect(canOpenLesson(initial, "1")).toBe(true);
    expect(canOpenLesson(initial, "2")).toBe(false);
    expect(nextLessonId(initial)).toBe("1");

    const afterOne = markLessonCompleted(initial, "1");
    expect(canOpenLesson(afterOne, "1")).toBe(true);
    expect(canOpenLesson(afterOne, "2")).toBe(true);
    expect(canOpenLesson(afterOne, "3")).toBe(false);
    expect(nextLessonId(afterOne)).toBe("2");

    const completed = ["2", "3", "4"].reduce(markLessonCompleted, afterOne);
    expect(nextLessonId(completed)).toBeUndefined();
    expect(canOpenLesson(completed, "4")).toBe(true);
  });
});

describe("learning progress storage", () => {
  it("returns the default when reading or parsing storage fails", () => {
    expect(readLearningProgress({ getItem: () => "not-json" })).toEqual(defaultLearningProgress());
    expect(
      readLearningProgress({
        getItem: () => {
          throw new Error("storage unavailable");
        },
      }),
    ).toEqual(defaultLearningProgress());
  });

  it("writes canonical JSON under the versioned key", () => {
    const writes: Array<[string, string]> = [];
    const progress = markLessonCompleted(defaultLearningProgress(), "1");

    expect(
      writeLearningProgress(
        {
          setItem: (key, value) => writes.push([key, value]),
        },
        progress,
      ),
    ).toBe(true);
    expect(writes).toEqual([[LEARNING_STORAGE_KEY, JSON.stringify(progress)]]);
  });

  it("reports a failed write without throwing", () => {
    expect(
      writeLearningProgress(
        {
          setItem: () => {
            throw new Error("quota exceeded");
          },
        },
        defaultLearningProgress(),
      ),
    ).toBe(false);
  });
});
