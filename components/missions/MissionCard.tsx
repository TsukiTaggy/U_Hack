import type { ReactNode } from "react";
import { eyebrow } from "./ui";

/** A mission in the landing page's card style: red mission number, lesson, task, then the activity. */
export function MissionCard({
  n,
  title,
  lesson,
  task,
  done,
  children,
}: {
  n: string;
  title: string;
  lesson: string;
  task: string;
  done: boolean;
  children: ReactNode;
}) {
  return (
    <article
      className={`rounded-3xl border bg-white p-6 shadow-sm sm:p-7 dark:bg-zinc-950 ${
        done ? "border-[var(--success)]" : "border-[var(--border-subtle)]"
      }`}
    >
      <header className="mb-4 flex items-start gap-4">
        <span className="text-4xl font-bold leading-none tabular-nums text-[var(--avalanche-red)]">{n.padStart(2, "0")}</span>
        <div className="min-w-0 flex-1 space-y-1">
          <p className={eyebrow}>Mission {n}</p>
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        </div>
        {done && (
          <span className="shrink-0 rounded-full bg-[var(--success-soft)] px-3 py-1 text-xs font-semibold text-[var(--success)]">Passed</span>
        )}
      </header>
      <p className="leading-relaxed text-[var(--text-muted)]">{lesson}</p>
      <p className="mt-3 font-medium">{task}</p>
      <div className="mt-5 space-y-4">{children}</div>
    </article>
  );
}

/** A plain card for non-mission blocks (certificate, coach). */
export function PlainCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-3xl border border-[var(--border-subtle)] bg-white p-6 shadow-sm sm:p-7 dark:bg-zinc-950 ${className}`}>
      {children}
    </section>
  );
}
