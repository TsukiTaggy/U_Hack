"use client";

import { useCallback, useEffect, useState } from "react";
import { formatEther, isHash, type Hash } from "viem";
import m1 from "@/content/missions/1.json";
import m2 from "@/content/missions/2.json";
import { AnimatedSection } from "@/components/AnimatedSection";
import { StatCard, StatsGrid } from "@/components/StatCard";
import VoicePracticeCall from "@/components/VoicePracticeCall";
import { AgentSteps } from "@/components/missions/AgentSteps";
import { FeeMission } from "@/components/missions/FeeMission";
import { MissionCard, PlainCard } from "@/components/missions/MissionCard";
import { Bubble, PhoneFrame } from "@/components/missions/PhoneFrame";
import { SendMission } from "@/components/missions/SendMission";
import { post, short, type CheckResponse, type FeeEstimate, type Lang, type Receipt, type Step } from "@/components/missions/types";
import { btnChip, btnHero, btnHeroSmall, btnPrimary, btnSecondary, eyebrow, inputClass } from "@/components/missions/ui";
import { publicClient } from "@/lib/chain";
import { addressUrl, txUrl } from "@/lib/config";
import type { VoiceTurn } from "@/lib/voice";
import { connectCore, walletChainId, type Wallet } from "@/lib/wallet";

type Turn = { role: "scammer" | "learner"; text: string };

const FAUCET_URL = "https://build.avax.network/console/primary-network/faucet";
const MISSION_IDS = ["1", "2", "3", "4"];

function useStored<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- load saved progress once on mount
      setValue(raw ? (JSON.parse(raw) as T) : initial);
    } catch {
      setValue(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const save = useCallback(
    (next: T) => {
      setValue(next);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // storage unavailable: keep in memory only
      }
    },
    [key],
  );
  return [value, save] as const;
}

export default function PlayClient() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [balanceWei, setBalanceWei] = useState<bigint | null>(null);
  const [balanceError, setBalanceError] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const [busy, setBusy] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const key = wallet ? `safestart.${wallet.address.toLowerCase()}` : "safestart.none";
  const [receipts, setReceipts] = useStored<Receipt[]>(`${key}.receipts`, []);
  const [txHashes, setTxHashes] = useStored<string[]>(`${key}.txs`, []);
  const [estimates, setEstimates] = useStored<Record<string, FeeEstimate>>(`${key}.estimates`, {});
  const passed = (id: string) => receipts.some((r) => r.missionId === id);
  const passedCount = MISSION_IDS.filter(passed).length;

  const addReceipt = (r?: Receipt) => {
    if (r) setReceipts([...receipts.filter((x) => x.missionId !== r.missionId), r]);
  };

  const refreshBalance = useCallback(async () => {
    if (!wallet) return;
    try {
      setBalanceWei(await publicClient.getBalance({ address: wallet.address }));
      setBalanceError(false);
    } catch {
      setBalanceError(true);
    }
  }, [wallet]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch balance when the wallet changes
    void refreshBalance();
  }, [refreshBalance]);

  // Total network fees paid by the transactions sent from this page, read from their real receipts.
  const [feesPaidWei, setFeesPaidWei] = useState<bigint | null>(null);
  useEffect(() => {
    const hashes = txHashes.filter((h): h is Hash => isHash(h)).slice(-10);
    if (!hashes.length) return;
    let cancelled = false;
    void (async () => {
      const results = await Promise.all(hashes.map((hash) => publicClient.getTransactionReceipt({ hash }).catch(() => null)));
      const total = results.reduce((sum, r) => (r ? sum + r.gasUsed * r.effectiveGasPrice : sum), 0n);
      if (!cancelled) setFeesPaidWei(total);
    })();
    return () => {
      cancelled = true;
    };
  }, [txHashes]);

  async function run(label: string, fn: () => Promise<void>) {
    setBusy(label);
    setMessage("");
    try {
      await fn();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy("");
    }
  }

  // ---------- Mission 1: practice call ----------
  const [personaId, setPersonaId] = useState("wallet-support");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [reply, setReply] = useState("");
  const [callDone, setCallDone] = useState(false);
  const [feedback, setFeedback] = useState<{ passed: boolean; text: string } | null>(null);
  const [callMode, setCallMode] = useState<"voice" | "text">("voice");
  const [voiceActive, setVoiceActive] = useState(false);

  const startCall = () =>
    run("call", async () => {
      setFeedback(null);
      setCallDone(false);
      const res = await post<{ reply: string; done: boolean }>("/api/scam/turn", { personaId, transcript: [], lang });
      setTurns([{ role: "scammer", text: res.reply }]);
    });

  const sendReply = () =>
    run("call", async () => {
      if (!reply.trim()) return;
      const next: Turn[] = [...turns, { role: "learner", text: reply.trim() }];
      setTurns(next);
      setReply("");
      const res = await post<{ reply: string; done: boolean }>("/api/scam/turn", { personaId, transcript: next, lang });
      setTurns([...next, { role: "scammer", text: res.reply }]);
      if (res.done) setCallDone(true);
    });

  const evaluateCall = (transcript: VoiceTurn[]) =>
    run("evaluate", async () => {
      if (!wallet) throw new Error("Connect a wallet first.");
      const res = await post<CheckResponse & { evaluation?: { feedback: string; tacticsSeen: string[] } }>("/api/scam/evaluate", {
        address: wallet.address,
        chainId: await walletChainId(wallet),
        transcript,
      });
      setCallDone(true);
      const tactics = res.evaluation?.tacticsSeen?.length ? ` Tactics used: ${res.evaluation.tacticsSeen.join(", ")}.` : "";
      setFeedback({ passed: res.passed, text: `${res.reason}${tactics} ${res.evaluation?.feedback ?? ""}`.trim() });
      addReceipt(res.receipt);
    });

  const endCall = () => evaluateCall(turns);

  const selectCallMode = (mode: "voice" | "text") => {
    setCallMode(mode);
    setTurns([]);
    setCallDone(false);
    setFeedback(null);
  };

  // ---------- Mission 2: test AVAX ----------
  const check2 = () =>
    run("check2", async () => {
      if (!wallet) throw new Error("Connect a wallet first.");
      const res = await post<CheckResponse>("/api/verify/2", { address: wallet.address });
      setMessage(res.reason);
      addReceipt(res.receipt);
    });

  // ---------- Missions 3 and 4 ----------
  const recordSend = (hash: Hash, estimate: FeeEstimate | null) => {
    setTxHashes([...txHashes, hash]);
    if (estimate) setEstimates({ ...estimates, [hash]: estimate });
  };
  const m3Receipt = receipts.find((r) => r.missionId === "3");
  const m3Hash = m3Receipt && isHash(m3Receipt.evidence) ? m3Receipt.evidence : null;

  // ---------- Certificate ----------
  const [certTx, setCertTx] = useState("");
  const mint = () =>
    run("mint", async () => {
      if (!wallet) throw new Error("Connect a wallet first.");
      const res = await post<{ txHash: string }>("/api/mint", { address: wallet.address, receipts });
      setCertTx(res.txHash);
    });

  // ---------- Coach ----------
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [steps, setSteps] = useState<Step[]>([]);
  const ask = (q?: string) =>
    run("coach", async () => {
      if (!wallet) throw new Error("Connect your Core wallet first.");
      const text = (q ?? question).trim();
      if (!text) return;
      setSteps([]);
      setAnswer("");
      const res = await post<{ answer: string; steps: Step[] }>("/api/coach", {
        question: text,
        address: wallet?.address,
        txHashes,
        missionId: MISSION_IDS.find((id) => !passed(id)) ?? "done",
        lang,
      });
      setSteps(res.steps);
      setAnswer(res.answer);
    });
  const askCoach = (q: string) => {
    setQuestion(q);
    document.getElementById("coach")?.scrollIntoView({ behavior: "smooth", block: "start" });
    void ask(q);
  };

  const ready = passedCount === MISSION_IDS.length;

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden bg-black text-white">
        <div className="hero-rain absolute inset-0 opacity-30" aria-hidden="true" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-12 sm:px-8 sm:py-16">
          <AnimatedSection animation="fade-up">
            <div className="space-y-6">
              <div className="max-w-3xl space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">Avalanche Fuji · no real money</p>
                <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
                  Practise the mistakes that <span className="text-[var(--avalanche-red)]">cost real money</span>.
                </h1>
                <p className="text-base leading-relaxed text-zinc-300 sm:text-lg">
                  Four missions with real transactions you sign in Core. An AI scams you, warns you before you sign and reads your transactions afterwards.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {wallet ? (
                  <div className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm">
                    <span className="h-2 w-2 rounded-full bg-[var(--success)]" aria-hidden="true" />
                    <a className="font-mono underline-offset-4 hover:underline" href={addressUrl(wallet.address)} target="_blank" rel="noreferrer">
                      {short(wallet.address)}
                    </a>
                    <button type="button" className="text-zinc-400 hover:text-white" onClick={() => void refreshBalance()}>
                      Refresh
                    </button>
                  </div>
                ) : (
                  <>
                    <button type="button" className={btnHero} disabled={!!busy} onClick={() => run("connect", async () => setWallet(await connectCore()))}>
                      Connect Core wallet <span aria-hidden="true">→</span>
                    </button>
                    <span className="text-sm text-zinc-400">Core Extension required. Turn on Testnet mode first.</span>
                  </>
                )}
                <label className="ml-auto flex items-center gap-2 text-sm text-zinc-400">
                  AI language
                  <select
                    className="rounded-lg border border-zinc-700 bg-black px-2 py-1.5 text-white"
                    value={lang}
                    onChange={(e) => setLang(e.target.value as Lang)}
                  >
                    <option value="en">English</option>
                    <option value="th">ไทย</option>
                  </select>
                </label>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="border-b border-[var(--border-subtle)] bg-zinc-50 px-6 py-8 sm:px-8 dark:bg-zinc-900/30">
        <div className="mx-auto w-full max-w-6xl">
          <StatsGrid>
            <StatCard value={`${passedCount}/4`} label="Missions passed" description="Each pass is checked by code against Fuji." highlight={ready} />
            <StatCard
              value={balanceWei !== null ? Number(formatEther(balanceWei)).toFixed(4) : balanceError ? "?" : "—"}
              label="Test AVAX"
              description={wallet ? "Your Core wallet balance on Fuji." : "Connect Core to see your balance."}
            />
            <StatCard
              value={feesPaidWei !== null && txHashes.length ? Number(formatEther(feesPaidWei)).toPrecision(3) : "—"}
              label="Fees paid (AVAX)"
              description={txHashes.length ? `Read from ${Math.min(txHashes.length, 10)} real receipt${txHashes.length === 1 ? "" : "s"}.` : "Every transaction pays gas, even a failed one."}
            />
          </StatsGrid>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-6">
          {message && (
            <p className="rounded-2xl border border-[var(--border-subtle)] bg-zinc-50 px-4 py-3 text-sm dark:bg-zinc-900/40" role="status">
              {message}
            </p>
          )}

          <AnimatedSection animation="fade-up">
            <MissionCard n="1" title={m1.title} lesson={m1.lesson} task={m1.task} done={passed("1")}>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Call mode">
                <button type="button" className={callMode === "voice" ? btnPrimary : btnSecondary} disabled={voiceActive || !!busy} onClick={() => selectCallMode("voice")}>
                  Voice call
                </button>
                <button type="button" className={callMode === "text" ? btnPrimary : btnSecondary} disabled={voiceActive || !!busy} onClick={() => selectCallMode("text")}>
                  Text chat
                </button>
              </div>
              {callMode === "voice" ? (
                <VoicePracticeCall
                  disabled={!wallet || !!busy}
                  onActiveChange={setVoiceActive}
                  onTranscriptChange={setTurns}
                  onFinish={evaluateCall}
                  onFallback={(reason) => {
                    setCallMode("text");
                    setMessage(`${reason} Switched to text practice.`);
                  }}
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  <select className={`${inputClass} w-auto`} value={personaId} onChange={(e) => setPersonaId(e.target.value)} aria-label="Caller">
                    <option value="wallet-support">Wallet support call</option>
                    <option value="airdrop-friend">Community airdrop</option>
                  </select>
                  <button type="button" className={btnPrimary} disabled={!wallet || !!busy} onClick={startCall}>
                    {turns.length ? "Restart call" : "Answer the call"}
                  </button>
                  {turns.length > 1 && (
                    <button type="button" className={btnSecondary} disabled={!!busy} onClick={endCall}>
                      End call &amp; get feedback
                    </button>
                  )}
                </div>
              )}
              {turns.length > 0 && (
                <PhoneFrame name="Unknown caller" status="Practice call · the caller is an AI playing a scammer">
                  {turns.map((t, i) => (
                    <Bubble key={i} from={t.role === "scammer" ? "them" : "me"}>
                      {t.text}
                    </Bubble>
                  ))}
                  {!callDone && callMode === "text" && (
                    <div className="flex gap-2 pt-2">
                      <input
                        className="w-full rounded-xl border border-zinc-700 bg-transparent px-4 py-2.5 text-sm text-white outline-none focus:border-zinc-500"
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendReply()}
                        placeholder="Your reply…"
                        aria-label="Your reply"
                      />
                      <button type="button" className={btnHeroSmall} disabled={!!busy} onClick={sendReply}>
                        Send
                      </button>
                    </div>
                  )}
                </PhoneFrame>
              )}
              {feedback && (
                <p className={`rounded-2xl p-4 text-sm ${feedback.passed ? "bg-[var(--success-soft)]" : "bg-[var(--danger-soft)]"}`}>
                  <strong className={feedback.passed ? "text-[var(--success)]" : "text-[var(--avalanche-red)]"}>{feedback.passed ? "Passed. " : "Not yet. "}</strong>
                  {feedback.text}
                </p>
              )}
            </MissionCard>
          </AnimatedSection>

          <AnimatedSection animation="fade-up">
            <MissionCard n="2" title={m2.title} lesson={m2.lesson} task={m2.task} done={passed("2")}>
              <div className="flex flex-wrap gap-3">
                {wallet ? (
                  <a className={btnPrimary} href={FAUCET_URL} target="_blank" rel="noreferrer">
                    Open Avalanche faucet
                  </a>
                ) : (
                  <span className="self-center text-sm text-[var(--text-muted)]">Connect Core wallet first.</span>
                )}
                <button type="button" className={btnSecondary} disabled={!wallet || !!busy} onClick={check2}>
                  Check my balance
                </button>
              </div>
            </MissionCard>
          </AnimatedSection>

          <AnimatedSection animation="fade-up">
            <SendMission
              wallet={wallet}
              balanceWei={balanceWei}
              lang={lang}
              done={passed("3")}
              busy={busy}
              run={run}
              onSent={recordSend}
              onReceipt={addReceipt}
              refreshBalance={refreshBalance}
              askCoach={askCoach}
            />
          </AnimatedSection>

          <AnimatedSection animation="fade-up">
            <FeeMission
              wallet={wallet}
              mission3Hash={m3Hash}
              estimate={m3Hash ? (estimates[m3Hash] ?? null) : null}
              receipts={receipts}
              done={passed("4")}
              busy={busy}
              run={run}
              onReceipt={addReceipt}
              askCoach={askCoach}
            />
          </AnimatedSection>

          <PlainCard>
            <p className={eyebrow}>Certificate</p>
            <h2 className="mb-3 mt-1 text-xl font-semibold tracking-tight">Non-transferable safety certificate on Fuji</h2>
            {certTx ? (
              <p className="text-sm">
                Certificate minted on Fuji.{" "}
                <a className="underline" href={txUrl(certTx)} target="_blank" rel="noreferrer">
                  View transaction
                </a>
              </p>
            ) : (
              <button type="button" className={btnPrimary} disabled={!ready || !!busy} onClick={mint}>
                {busy === "mint" ? "Minting…" : ready ? "Mint my certificate" : "Pass missions 1–4 to unlock"}
              </button>
            )}
          </PlainCard>
        </div>

        <aside id="coach" className="h-fit scroll-mt-24 lg:sticky lg:top-20">
          <PlainCard className="space-y-4">
            <div className="space-y-1">
              <p className={eyebrow}>AI coach agent</p>
              <h2 className="text-xl font-semibold tracking-tight">Ask about your own transactions</h2>
              <p className="text-sm text-[var(--text-muted)]">The coach reads your real Fuji data with read-only tools before it answers. It never signs anything.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Why did my mission 3 fail?", "How much gas did I pay?", "What is in my wallet?"].map((q) => (
                <button key={q} type="button" className={btnChip} disabled={!wallet || !!busy} onClick={() => askCoach(q)}>
                  {q}
                </button>
              ))}
            </div>
            <textarea
              className={inputClass}
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={!wallet}
              placeholder={wallet ? "Ask about your wallet or a transaction…" : "Connect Core wallet first…"}
              aria-label="Question for the coach"
            />
            <button type="button" className={btnPrimary} disabled={!wallet || !!busy || !question.trim()} onClick={() => ask()}>
              {busy === "coach" ? "Reading the chain…" : "Ask the coach"}
            </button>
            <AgentSteps steps={steps} />
            {answer && <p className="whitespace-pre-wrap text-sm leading-relaxed">{answer}</p>}
          </PlainCard>
        </aside>
      </div>
    </main>
  );
}
