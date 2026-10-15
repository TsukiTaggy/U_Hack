import type { ReactNode } from "react";

export function BentoGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-5 md:grid-cols-2">{children}</div>;
}

export function BentoCard({ children, span = "1" }: { children: ReactNode; span?: "1" | "2" | "full" }) {
  const spanClass = span === "1" ? "" : "md:col-span-2";

  return (
    <article className={`h-full rounded-3xl border border-[var(--border-subtle)] bg-white p-7 shadow-sm dark:bg-zinc-950 ${spanClass}`}>
      {children}
    </article>
  );
}
