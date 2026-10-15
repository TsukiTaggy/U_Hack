interface StatCardProps {
  value: string;
  label: string;
  description?: string;
  highlight?: boolean;
}

export function StatCard({ value, label, description, highlight = false }: StatCardProps) {
  return (
    <div className="group flex flex-col items-center text-center transition-all hover:opacity-90 backdrop-blur-xl">
      <div className={`fx-mesh text-7xl font-bold tracking-tight sm:text-8xl lg:text-9xl ${highlight ? "text-[var(--avalanche-red)]" : ""}`}>
        {value}
      </div>
      <div className="mt-4 text-lg font-semibold uppercase tracking-wider text-[var(--text-muted)] sm:text-xl">
        {label}
      </div>
      {description && (
        <p className="mt-2 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-xl">
          {description}
        </p>
      )}
    </div>
  );
}

interface StatsGridProps {
  children: React.ReactNode;
}

export function StatsGrid({ children }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:gap-4">
      {children}
    </div>
  );
}
