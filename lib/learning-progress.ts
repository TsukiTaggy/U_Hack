import { lessons, type LessonId, type Locale } from "@/lib/learning";

export const LEARNING_STORAGE_KEY = "safestart.learning.v1";

export type LearningProgress = {
  version: 1;
  locale: Locale;
  completedLessonIds: LessonId[];
};

const lessonIds = lessons.map((lesson) => lesson.id);

export function defaultLearningProgress(): LearningProgress {
  return {
    version: 1,
    locale: "th",
    completedLessonIds: [],
  };
}

export function parseLearningProgress(value: unknown): LearningProgress {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return defaultLearningProgress();
  }

  const stored = value as {
    version?: unknown;
    locale?: unknown;
    completedLessonIds?: unknown;
  };

  if (stored.version !== 1) {
    return defaultLearningProgress();
  }

  const locale: Locale = stored.locale === "en" || stored.locale === "th" ? stored.locale : "th";
  const storedIds = Array.isArray(stored.completedLessonIds) ? stored.completedLessonIds : [];
  const completedLessonIds = lessonIds.filter((id) => storedIds.includes(id));

  return {
    version: 1,
    locale,
    completedLessonIds,
  };
}

export function markLessonCompleted(progress: LearningProgress, lessonId: string): LearningProgress {
  if (!lessonIds.includes(lessonId as LessonId) || progress.completedLessonIds.includes(lessonId as LessonId)) {
    return progress;
  }

  return parseLearningProgress({
    ...progress,
    completedLessonIds: [...progress.completedLessonIds, lessonId],
  });
}

export function isLessonCompleted(progress: LearningProgress, lessonId: string): boolean {
  return lessonIds.includes(lessonId as LessonId) && progress.completedLessonIds.includes(lessonId as LessonId);
}

export function canOpenLesson(progress: LearningProgress, lessonId: string): boolean {
  const lessonIndex = lessonIds.indexOf(lessonId as LessonId);
  if (lessonIndex < 0) return false;
  return lessonIds.slice(0, lessonIndex).every((id) => isLessonCompleted(progress, id));
}

export function nextLessonId(progress: LearningProgress): LessonId | undefined {
  return lessonIds.find((id) => !isLessonCompleted(progress, id));
}

export function readLearningProgress(storage: Pick<Storage, "getItem">): LearningProgress {
  try {
    const raw = storage.getItem(LEARNING_STORAGE_KEY);
    return raw ? parseLearningProgress(JSON.parse(raw) as unknown) : defaultLearningProgress();
  } catch {
    return defaultLearningProgress();
  }
}

export function writeLearningProgress(
  storage: Pick<Storage, "setItem">,
  progress: LearningProgress,
): boolean {
  try {
    storage.setItem(LEARNING_STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}
