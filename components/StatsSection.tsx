import { AnimatedSection } from '@/components/AnimatedSection';

interface StatsSectionProps {
  stats: Array<{
    number: string;
    label: string;
    description: string;
  }>;
}

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <section className="relative w-full overflow-hidden bg-zinc-50 dark:bg-zinc-900/30">
      {/* Content Layer */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-12 sm:px-8 sm:py-16 lg:py-20">
        <AnimatedSection animation="fade-in">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {stats.map((stat, i) => (
              <AnimatedSection key={stat.label} animation="fade-up" delay={i * 100}>
                <div className="flex flex-col items-center text-center">
                  <p className="fx-mesh text-6xl font-bold tracking-tight sm:text-7xl lg:text-8xl">
                    {stat.number}
                  </p>
                  <h2 className="mt-4 text-base font-semibold uppercase tracking-wider text-[var(--text-muted)] sm:text-lg">
                    {stat.label}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {stat.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
