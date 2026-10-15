'use client';

import { AnimatedSection } from '@/components/AnimatedSection';
import { StatsGrid, StatCard } from '@/components/StatCard';

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
          <StatsGrid>
            {stats.map((stat, i) => (
              <AnimatedSection key={stat.label} animation="fade-up" delay={i * 100}>
                <StatCard
                  value={stat.number}
                  label={stat.label}
                  description={stat.description}
                  highlight={stat.number === "100%"}
                />
              </AnimatedSection>
            ))}
          </StatsGrid>
        </AnimatedSection>
      </div>
    </section>
  );
}
