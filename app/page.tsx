import Link from "next/link";
import { AnimatedSection } from "@/components/AnimatedSection";
import { BentoCard, BentoGrid } from "@/components/BentoGrid";
import { Section, SectionHeader } from "@/components/Section";
import { StatCard, StatsGrid } from "@/components/StatCard";

const features = [
  {
    title: "AI scam simulator",
    description: "Take a practice voice or text call from an AI scammer that adapts its tactics as you reply.",
    icon: "🎭",
  },
  {
    title: "AI coach agent",
    description: "Ask why a transfer failed. The coach reads your real Fuji transactions and explains what happened.",
    icon: "🤖",
  },
  {
    title: "Real testnet practice",
    description: "Send test AVAX and inspect gas fees on Avalanche Fuji. Real blockchain behavior, no real funds.",
    icon: "⚡",
  },
  {
    title: "On-chain certificate",
    description: "Complete the available missions and receive a non-transferable safety certificate on Fuji.",
    icon: "🎓",
  },
];

const missionHighlights = [
  { value: "4", label: "Live Missions", description: "Scam calls, transfers, and gas fees" },
  { value: "100%", label: "Testnet Only", description: "No real funds at risk" },
  { value: "Core", label: "Wallet", description: "Connect your existing wallet on Fuji" },
];

const partners = ["ElevenLabs", "Avalanche", "ElevenLabs", "Avalanche"];

function PartnerRow({ reverse = false }: { reverse?: boolean }) {
  return (
    <div className="overflow-hidden border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
      <div className={`${reverse ? "sponsor-scroll-reverse" : "sponsor-scroll"} whitespace-nowrap`}>
        {[0, 1].map((set) => (
          <div key={set} className="inline-flex" aria-hidden={set === 1}>
            {partners.map((partner, index) => (
              <span
                key={`${set}-${partner}-${index}`}
                className="sponsor-cell inline-flex min-w-[200px] items-center justify-center px-12 py-5 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300"
              >
                {partner}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex-1">
      <section className="relative flex flex-col overflow-hidden bg-black">
        <div className="hero-rain absolute inset-0" aria-hidden="true" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-48 pt-12 sm:px-8 sm:pb-52 sm:pt-16 lg:pb-56 lg:pt-20">
          <AnimatedSection animation="fade-up">
            <div className="flex flex-col gap-8">
              <div className="max-w-5xl space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">Avalanche Fuji · no real money</p>
                <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Make your first crypto mistakes <span className="text-[var(--avalanche-red)]">here</span>,{" "}
                  <span className="fx-typewriter">not with real money</span>.
                </h1>
                <p className="max-w-3xl text-base leading-relaxed text-zinc-300 sm:text-lg">
                  SafeStart is an AI safety coach for crypto beginners. Practise with an adaptive scam call, a read-only AI coach, and transactions you sign with Core.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/play" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-zinc-900 hover:bg-zinc-100">
                  Start practising <span aria-hidden="true">→</span>
                </Link>
                <Link href="/play" className="inline-flex items-center rounded-xl border border-zinc-700 px-6 py-3.5 font-semibold text-white hover:border-zinc-500 hover:bg-zinc-900">
                  View missions
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
        <div className="absolute inset-x-0 bottom-0 z-10" aria-label="Technology partners">
          <PartnerRow />
          <PartnerRow reverse />
        </div>
      </section>

      <Section className="border-y border-[var(--border-subtle)] bg-zinc-50 dark:bg-zinc-900/30">
        <StatsGrid>
          {missionHighlights.map((stat, index) => (
            <AnimatedSection key={stat.label} animation="fade-up" delay={index * 100}>
              <StatCard {...stat} highlight={stat.value === "100%"} />
            </AnimatedSection>
          ))}
        </StatsGrid>
      </Section>

      <Section>
        <AnimatedSection animation="fade-up">
          <SectionHeader title="Learn by doing. Fail safely. Stay secure." subtitle="Four ways to build practical crypto safety skills on Avalanche Fuji." />
        </AnimatedSection>
        <BentoGrid>
          {features.map((feature, index) => (
            <AnimatedSection key={feature.title} animation="scale" delay={index * 100}>
              <BentoCard>
                <div className="flex h-full flex-col gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-2xl dark:bg-zinc-900">{feature.icon}</div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="leading-relaxed text-[var(--text-muted)]">{feature.description}</p>
                  </div>
                </div>
              </BentoCard>
            </AnimatedSection>
          ))}
        </BentoGrid>
      </Section>

      <Section className="border-t border-[var(--border-subtle)] bg-zinc-50 dark:bg-zinc-900/30">
        <SectionHeader title="Fast chain. Safe practice." subtitle="Use a real Core wallet on Fuji while every lesson stays testnet-only." />
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            ["43113", "Fuji chain ID", "The app rejects wallet writes on every other network."],
            ["4", "Live missions", "Spot scams, fund the wallet, send safely, and read gas."],
            ["2", "Practice modes", "Use ElevenLabs voice by default or switch to text."],
          ].map(([value, label, text], index) => (
            <AnimatedSection key={label} animation="fade-up" delay={index * 100}>
              <p className="text-4xl font-bold text-[var(--avalanche-red)]">{value}</p>
              <h3 className="mt-3 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">{label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{text}</p>
            </AnimatedSection>
          ))}
        </div>
      </Section>

      <Section>
        <AnimatedSection animation="scale">
          <div className="rounded-3xl border border-[var(--border-subtle)] bg-gradient-to-br from-white to-zinc-50 p-10 text-center dark:from-zinc-950 dark:to-zinc-900 sm:p-16">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Ready to practise?</h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">Connect Core on Fuji, take the support call, and learn each warning sign without risking real funds.</p>
            <Link href="/play" className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-8 py-4 text-lg font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
              Launch SafeStart <span aria-hidden="true">→</span>
            </Link>
          </div>
        </AnimatedSection>
      </Section>
    </main>
  );
}
