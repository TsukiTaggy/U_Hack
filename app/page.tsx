import Link from "next/link";
import { BentoCard, BentoGrid } from "@/components/BentoGrid";
import { Section, SectionHeader } from "@/components/Section";
import { StatsGrid, StatCard } from "@/components/StatCard";
import { AnimatedSection } from "@/components/AnimatedSection";

const features = [
  {
    title: "AI scam simulator",
    description: "Take a practice call from an AI scammer that adapts its tactics as you reply. Learn to spot red flags before they cost you.",
    icon: "🎭",
  },
  {
    title: "AI coach agent",
    description: "Ask why a transfer failed. The coach reads your real transactions on Fuji and explains what happened in plain language.",
    icon: "🤖",
  },
  {
    title: "Real testnet practice",
    description: "Send AVAX, pay gas fees, and face an approval trap on Avalanche Fuji testnet. Real blockchain, no real money at risk.",
    icon: "⚡",
  },
  {
    title: "On-chain certificate",
    description: "Complete all missions to receive a non-transferable certificate on Fuji. Proof you know how to stay safe.",
    icon: "🎓",
  },
];

const missionHighlights = [
  { number: "5", label: "Core Missions", description: "From scam calls to gas fees" },
  { number: "100%", label: "Testnet Only", description: "No real funds at risk" },
  { number: "0", label: "Sign-ups Required", description: "Use a guest wallet instantly" },
];

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero Section - Avalanche Style with Rain Effect */}
      <section className="relative flex flex-col overflow-hidden bg-black">
        {/* Rain Animation Background */}
        <div className="hero-rain absolute inset-0" aria-hidden="true"></div>
        
        {/* Content */}
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-8 pb-48 sm:px-8 sm:pt-12 sm:pb-52 lg:pt-16 lg:pb-56">
          <AnimatedSection animation="fade-up">
            <div className="flex flex-col gap-6 lg:gap-8">
              <div className="max-w-5xl space-y-4">
                <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Make your first crypto mistakes{" "}
                  <span className="text-[var(--avalanche-red)]">here</span>,{" "}
                  <span className="fx-typewriter">not with real money</span>.
                </h1>
                
                <p className="max-w-3xl text-base leading-relaxed text-zinc-300 sm:text-lg">
                  SafeStart is an AI safety coach for crypto beginners. Practise the mistakes that cost people real money—with AI that scams you, coaches you, and reads your own transactions.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/play"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-zinc-900 transition-all hover:bg-zinc-100"
                >
                  Start practising
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/play"
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-6 py-3.5 text-base font-semibold text-white transition-all hover:border-zinc-600 hover:bg-zinc-900"
                >
                  View missions
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Sponsor Grid Section - Inside Hero */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          {/* Row 1 - Scroll Right */}
          <div className="relative bg-zinc-950/80 backdrop-blur-sm border-t border-zinc-800 overflow-hidden">
            <div className="sponsor-scroll whitespace-nowrap">
              {/* First set */}
              <div className="inline-flex">
                <div className="sponsor-cell inline-flex items-center justify-center py-3 px-12 min-w-[200px]">
                  <img src="/img/ElevenLabs%20Logo%20-%20White%20-%201969x256%20-%20zonalogo.com.png" alt="ElevenLabs" className="h-5 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity" />
                </div>
                <div className="sponsor-cell inline-flex items-center justify-center py-3 px-12 min-w-[200px]">
                  <img src="/img/%E0%B9%82%E0%B8%A5%E0%B9%82%E0%B8%81%E0%B9%89%20Avalanche%20%E0%B8%AA%E0%B8%B5%E0%B8%82%E0%B8%B2%E0%B8%A7%E0%B8%9A%E0%B8%99%E0%B8%9E%E0%B8%B7%E0%B9%89%E0%B8%99%E0%B9%82%E0%B8%9B%E0%B8%A3%E0%B9%88%E0%B8%87%E0%B9%83%E0%B8%AA.png" alt="Avalanche" className="h-16 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" />
                </div>
                <div className="sponsor-cell inline-flex items-center justify-center py-3 px-12 min-w-[200px]">
                  <img src="/img/ElevenLabs%20Logo%20-%20White%20-%201969x256%20-%20zonalogo.com.png" alt="ElevenLabs" className="h-5 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity" />
                </div>
                <div className="sponsor-cell inline-flex items-center justify-center py-3 px-12 min-w-[200px]">
                  <img src="/img/%E0%B9%82%E0%B8%A5%E0%B9%82%E0%B8%81%E0%B9%89%20Avalanche%20%E0%B8%AA%E0%B8%B5%E0%B8%82%E0%B8%B2%E0%B8%A7%E0%B8%9A%E0%B8%99%E0%B8%9E%E0%B8%B7%E0%B9%89%E0%B8%99%E0%B9%82%E0%B8%9B%E0%B8%A3%E0%B9%88%E0%B8%87%E0%B9%83%E0%B8%AA.png" alt="Avalanche" className="h-16 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" />
                </div>
                <div className="sponsor-cell inline-flex items-center justify-center py-3 px-12 min-w-[200px]">
                  <img src="/img/ElevenLabs%20Logo%20-%20White%20-%201969x256%20-%20zonalogo.com.png" alt="ElevenLabs" className="h-5 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity" />
                </div>
              </div>
              {/* Duplicate set for seamless loop */}
              <div className="inline-flex">
                <div className="sponsor-cell inline-flex items-center justify-center py-3 px-12 min-w-[200px]">
                  <img src="/img/ElevenLabs%20Logo%20-%20White%20-%201969x256%20-%20zonalogo.com.png" alt="ElevenLabs" className="h-5 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity" />
                </div>
                <div className="sponsor-cell inline-flex items-center justify-center py-3 px-12 min-w-[200px]">
                  <img src="/img/%E0%B9%82%E0%B8%A5%E0%B9%82%E0%B8%81%E0%B9%89%20Avalanche%20%E0%B8%AA%E0%B8%B5%E0%B8%82%E0%B8%B2%E0%B8%A7%E0%B8%9A%E0%B8%99%E0%B8%9E%E0%B8%B7%E0%B9%89%E0%B8%99%E0%B9%82%E0%B8%9B%E0%B8%A3%E0%B9%88%E0%B8%87%E0%B9%83%E0%B8%AA.png" alt="Avalanche" className="h-16 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" />
                </div>
                <div className="sponsor-cell inline-flex items-center justify-center py-3 px-12 min-w-[200px]">
                  <img src="/img/ElevenLabs%20Logo%20-%20White%20-%201969x256%20-%20zonalogo.com.png" alt="ElevenLabs" className="h-5 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity" />
                </div>
                <div className="sponsor-cell inline-flex items-center justify-center py-3 px-12 min-w-[200px]">
                  <img src="/img/%E0%B9%82%E0%B8%A5%E0%B9%82%E0%B8%81%E0%B9%89%20Avalanche%20%E0%B8%AA%E0%B8%B5%E0%B8%82%E0%B8%B2%E0%B8%A7%E0%B8%9A%E0%B8%99%E0%B8%9E%E0%B8%B7%E0%B9%89%E0%B8%99%E0%B9%82%E0%B8%9B%E0%B8%A3%E0%B9%88%E0%B8%87%E0%B9%83%E0%B8%AA.png" alt="Avalanche" className="h-16 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" />
                </div>
                <div className="sponsor-cell inline-flex items-center justify-center py-3 px-12 min-w-[200px]">
                  <img src="/img/ElevenLabs%20Logo%20-%20White%20-%201969x256%20-%20zonalogo.com.png" alt="ElevenLabs" className="h-5 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          </div>

          {/* Row 2 - Scroll Left (Reverse) */}
          <div className="relative bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800 overflow-hidden">
            <div className="sponsor-scroll-reverse whitespace-nowrap">
              {/* First set */}
              <div className="inline-flex">
                <div className="sponsor-cell inline-flex items-center justify-center py-3 px-12 min-w-[200px]">
                  <img src="/img/%E0%B9%82%E0%B8%A5%E0%B9%82%E0%B8%81%E0%B9%89%20Avalanche%20%E0%B8%AA%E0%B8%B5%E0%B8%82%E0%B8%B2%E0%B8%A7%E0%B8%9A%E0%B8%99%E0%B8%9E%E0%B8%B7%E0%B9%89%E0%B8%99%E0%B9%82%E0%B8%9B%E0%B8%A3%E0%B9%88%E0%B8%87%E0%B9%83%E0%B8%AA.png" alt="Avalanche" className="h-16 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" />
                </div>
                <div className="sponsor-cell inline-flex items-center justify-center py-3 px-12 min-w-[200px]">
                  <img src="/img/ElevenLabs%20Logo%20-%20White%20-%201969x256%20-%20zonalogo.com.png" alt="ElevenLabs" className="h-5 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity" />
                </div>
                <div className="sponsor-cell inline-flex items-center justify-center py-3 px-12 min-w-[200px]">
                  <img src="/img/%E0%B9%82%E0%B8%A5%E0%B9%82%E0%B8%81%E0%B9%89%20Avalanche%20%E0%B8%AA%E0%B8%B5%E0%B8%82%E0%B8%B2%E0%B8%A7%E0%B8%9A%E0%B8%99%E0%B8%9E%E0%B8%B7%E0%B9%89%E0%B8%99%E0%B9%82%E0%B8%9B%E0%B8%A3%E0%B9%88%E0%B8%87%E0%B9%83%E0%B8%AA.png" alt="Avalanche" className="h-16 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" />
                </div>
                <div className="sponsor-cell inline-flex items-center justify-center py-3 px-12 min-w-[200px]">
                  <img src="/img/ElevenLabs%20Logo%20-%20White%20-%201969x256%20-%20zonalogo.com.png" alt="ElevenLabs" className="h-5 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity" />
                </div>
                <div className="sponsor-cell inline-flex items-center justify-center py-3 px-12 min-w-[200px]">
                  <img src="/img/%E0%B9%82%E0%B8%A5%E0%B9%82%E0%B8%81%E0%B9%89%20Avalanche%20%E0%B8%AA%E0%B8%B5%E0%B8%82%E0%B8%B2%E0%B8%A7%E0%B8%9A%E0%B8%99%E0%B8%9E%E0%B8%B7%E0%B9%89%E0%B8%99%E0%B9%82%E0%B8%9B%E0%B8%A3%E0%B9%88%E0%B8%87%E0%B9%83%E0%B8%AA.png" alt="Avalanche" className="h-16 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" />
                </div>
              </div>
              {/* Duplicate set for seamless loop */}
              <div className="inline-flex">
                <div className="sponsor-cell inline-flex items-center justify-center py-3 px-12 min-w-[200px]">
                  <img src="/img/%E0%B9%82%E0%B8%A5%E0%B9%82%E0%B8%81%E0%B9%89%20Avalanche%20%E0%B8%AA%E0%B8%B5%E0%B8%82%E0%B8%B2%E0%B8%A7%E0%B8%9A%E0%B8%99%E0%B8%9E%E0%B8%B7%E0%B9%89%E0%B8%99%E0%B9%82%E0%B8%9B%E0%B8%A3%E0%B9%88%E0%B8%87%E0%B9%83%E0%B8%AA.png" alt="Avalanche" className="h-16 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" />
                </div>
                <div className="sponsor-cell inline-flex items-center justify-center py-3 px-12 min-w-[200px]">
                  <img src="/img/ElevenLabs%20Logo%20-%20White%20-%201969x256%20-%20zonalogo.com.png" alt="ElevenLabs" className="h-5 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity" />
                </div>
                <div className="sponsor-cell inline-flex items-center justify-center py-3 px-12 min-w-[200px]">
                  <img src="/img/%E0%B9%82%E0%B8%A5%E0%B9%82%E0%B8%81%E0%B9%89%20Avalanche%20%E0%B8%AA%E0%B8%B5%E0%B8%82%E0%B8%B2%E0%B8%A7%E0%B8%9A%E0%B8%99%E0%B8%9E%E0%B8%B7%E0%B9%89%E0%B8%99%E0%B9%82%E0%B8%9B%E0%B8%A3%E0%B9%88%E0%B8%87%E0%B9%83%E0%B8%AA.png" alt="Avalanche" className="h-16 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" />
                </div>
                <div className="sponsor-cell inline-flex items-center justify-center py-3 px-12 min-w-[200px]">
                  <img src="/img/ElevenLabs%20Logo%20-%20White%20-%201969x256%20-%20zonalogo.com.png" alt="ElevenLabs" className="h-5 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity" />
                </div>
                <div className="sponsor-cell inline-flex items-center justify-center py-3 px-12 min-w-[200px]">
                  <img src="/img/%E0%B9%82%E0%B8%A5%E0%B9%82%E0%B8%81%E0%B9%89%20Avalanche%20%E0%B8%AA%E0%B8%B5%E0%B8%82%E0%B8%B2%E0%B8%A7%E0%B8%9A%E0%B8%99%E0%B8%9E%E0%B8%B7%E0%B9%89%E0%B8%99%E0%B9%82%E0%B8%9B%E0%B8%A3%E0%B9%88%E0%B8%87%E0%B9%83%E0%B8%AA.png" alt="Avalanche" className="h-16 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Avalanche Style */}
      <Section className="border-y border-[var(--border-subtle)] bg-zinc-50 dark:bg-zinc-900/30">
        <AnimatedSection animation="fade-in">
          <StatsGrid>
            {missionHighlights.map((stat, i) => (
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
      </Section>

      {/* Features Bento Grid - Avalanche Style */}
      <Section>
        <AnimatedSection animation="fade-up">
          <SectionHeader
            title="Learn by doing. Fail safely. Stay secure."
            subtitle="Four AI-powered ways to build real crypto safety skills on Avalanche testnet."
          />
        </AnimatedSection>
        
        <BentoGrid>
          {features.map((feature, i) => (
            <AnimatedSection key={feature.title} animation="scale" delay={i * 100}>
              <BentoCard span={i < 2 ? "1" : "1"}>
                <div className="flex h-full flex-col gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-2xl dark:bg-zinc-900">
                    {feature.icon}
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-[var(--text-muted)] leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </BentoCard>
            </AnimatedSection>
          ))}
        </BentoGrid>
      </Section>

      {/* How It Works Section */}
      <Section className="border-t border-[var(--border-subtle)] bg-zinc-50 dark:bg-zinc-900/30">
        <AnimatedSection animation="fade-up">
          <SectionHeader
            title="Final in seconds. No reorgs. No real risk."
            subtitle="Practice on Avalanche Fuji with the same speed and finality as mainnet, but with test AVAX."
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatedSection animation="slide-left" delay={0}>
              <div className="space-y-3">
                <div className="text-4xl font-bold text-[var(--avalanche-red)]">
                  &lt; 0.5s
                </div>
                <div className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Transaction finality
                </div>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  Your testnet transactions are final in under half a second. Practice at real-world speeds.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={100}>
              <div className="space-y-3">
                <div className="text-4xl font-bold">
                  5
                </div>
                <div className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Safety missions
                </div>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  From spotting scams to reading gas fees. Each mission teaches one costly mistake.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="slide-right" delay={200}>
              <div className="space-y-3">
                <div className="text-4xl font-bold">
                  100%
                </div>
                <div className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  AI-powered
                </div>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  AI reads your real on-chain data to coach you, scam you, and explain every transaction.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </AnimatedSection>
      </Section>

      {/* CTA Section */}
      <Section>
        <AnimatedSection animation="scale">
          <div className="rounded-3xl border border-[var(--border-subtle)] bg-gradient-to-br from-white to-zinc-50 p-12 text-center dark:from-zinc-950 dark:to-zinc-900 sm:p-16">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to practise?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
              Start with mission 1: take a call from an AI scammer and learn to spot the red flags.
            </p>
            <Link
              href="/play"
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              Launch SafeStart
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </AnimatedSection>
      </Section>
    </main>
  );
}
