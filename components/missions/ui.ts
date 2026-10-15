// Shared class names for mission UI, matching the landing page (rounded-xl buttons, rounded-3xl cards).

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100";

export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border-subtle)] px-5 py-2.5 text-sm font-semibold hover:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:border-zinc-600";

export const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--avalanche-red)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40";

export const btnChip =
  "rounded-full border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-medium hover:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:border-zinc-600";

/** Buttons on the black hero band. */
export const btnHero =
  "inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-zinc-900 hover:bg-zinc-100 disabled:opacity-40";

export const btnHeroSmall =
  "inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 disabled:opacity-40";

export const inputClass =
  "w-full rounded-xl border border-[var(--border-subtle)] bg-transparent px-4 py-2.5 text-sm outline-none focus:border-zinc-400 dark:focus:border-zinc-500";

export const eyebrow = "text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]";

export const panel = "rounded-2xl border border-[var(--border-subtle)] bg-zinc-50 p-4 dark:bg-zinc-900/40";

export type RiskLevel = "low" | "medium" | "high";

export const riskStyle: Record<RiskLevel, { label: string; className: string }> = {
  low: { label: "Low risk", className: "bg-[var(--success-soft)] text-[var(--success)]" },
  medium: { label: "Check carefully", className: "bg-[var(--warning-soft)] text-[var(--warning)]" },
  high: { label: "High risk", className: "bg-[var(--danger-soft)] text-[var(--avalanche-red)]" },
};
