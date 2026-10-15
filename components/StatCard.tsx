import type { ReactNode } from "react";

export function StatsGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-8 sm:grid-cols-3">{children}</div>;
}

export function StatCard({
  value,
  label,
  description,
  highlight = false,
}: {
  value: string;
  label: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className={`text-4xl font-bold ${highlight ? "text-[var(--avalanche-red)]" : ""}`}>{value}</p>
      <h3 className="font-semibold">{label}</h3>
      <p className="text-sm text-[var(--text-muted)]">{description}</p>
    </div>
  );
}
