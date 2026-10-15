import type { LessonId, Locale } from "@/lib/learning";

export type LessonPathItem = {
  id: LessonId;
  title: string;
  status: "locked" | "current" | "completed";
  selected: boolean;
};

const statusCopy = {
  th: {
    locked: "ยังไม่ปลดล็อก",
    current: "กำลังเรียน",
    completed: "เรียนจบแล้ว",
  },
  en: {
    locked: "Locked",
    current: "Current lesson",
    completed: "Completed",
  },
} as const;

export function LessonPath({
  items,
  locale,
  onSelect,
}: {
  items: LessonPathItem[];
  locale: Locale;
  onSelect: (lessonId: LessonId) => void;
}) {
  return (
    <nav
      aria-label="Learning path"
      className="rounded-3xl border border-[var(--border-subtle)] bg-white p-5 shadow-sm dark:bg-zinc-950"
    >
      <ol className="space-y-3">
        {items.map((item, index) => {
          const disabled = item.status === "locked";
          const status = statusCopy[locale][item.status];

          return (
            <li key={item.id} className="relative">
              {index < items.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-[1.35rem] top-11 h-[calc(100%-2rem)] w-px bg-[var(--border-subtle)]"
                />
              )}
              <button
                type="button"
                disabled={disabled}
                aria-current={item.selected ? "step" : undefined}
                aria-label={`${item.title}: ${status}`}
                onClick={() => onSelect(item.id)}
                className={`relative flex min-h-11 w-full items-start gap-3 rounded-2xl border p-3 text-left transition-colors ${
                  item.selected
                    ? "border-[var(--avalanche-red)] bg-red-50 dark:bg-red-950/20"
                    : "border-transparent hover:border-zinc-300 hover:bg-zinc-50 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
                } disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-transparent disabled:hover:bg-transparent`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                    item.status === "completed"
                      ? "border-[var(--avalanche-red)] bg-[var(--avalanche-red)] text-white"
                      : item.selected
                        ? "border-[var(--avalanche-red)] text-[var(--avalanche-red)]"
                        : "border-zinc-300 text-zinc-500 dark:border-zinc-700"
                  }`}
                >
                  {item.id}
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold leading-snug">{item.title}</span>
                  <span className="mt-1 block text-xs text-[var(--text-muted)]">{status}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
