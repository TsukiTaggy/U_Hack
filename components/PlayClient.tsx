"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatEther, parseEther, type Address } from "viem";
import m1 from "@/content/missions/1.json";
import m2 from "@/content/missions/2.json";
import m3 from "@/content/missions/3.json";
import m4 from "@/content/missions/4.json";
import { publicClient } from "@/lib/chain";
import { addresses, addressUrl, txUrl } from "@/lib/config";
import { addressChoices, seedFromAddress } from "@/lib/decoys";
import { connectInjected, hasInjectedWallet, loadOrCreateGuest, sendAvax, walletChainId, type Wallet } from "@/lib/wallet";

type Receipt = { address: string; missionId: string; passedAt: number; evidence: string; sig: string };
type Turn = { role: "scammer" | "learner"; text: string };
type Step = { tool: string; args: Record<string, unknown>; ok: boolean; summary: string };
type Lang = "en" | "th";

const FAUCET_URL = "https://build.avax.network/console/primary-network/faucet";
const short = (a: string) => `${a.slice(0, 8)}…${a.slice(-6)}`;

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  return data as T;
}

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

// Animated Hero Headline Component - Scroll-linked animation
function AnimatedHeadline() {
  const headlineRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate transforms based on scroll
  const progress = Math.min(scrollY / 500, 1);
  const translateY = scrollY * 0.3; // Parallax effect
  const opacity = Math.max(1 - progress * 1.5, 0);
  const scale = Math.max(1 - progress * 0.2, 0.8);

  return (
    <div 
      ref={headlineRef}
      className="relative overflow-hidden"
      style={{
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity: opacity,
        transition: "transform 0.05s linear, opacity 0.1s linear",
      }}
    >
      <h1 className="relative text-[clamp(2.5rem,8vw,6rem)] font-bold leading-[1.1] tracking-tight">
        <span className="block">
          Make your first crypto mistakes{" "}
          <span className="relative inline-block">
            <span className="text-[var(--avalanche-red)]">here</span>
            <span 
              className="absolute left-0 top-0 text-[var(--avalanche-red)] opacity-20"
              style={{
                transform: `translateX(${scrollY * 0.1}px)`,
              }}
            >
              here
            </span>
          </span>
          , not with real money.
        </span>
      </h1>
    </div>
  );
}

function Card({ n, title, done, children }: { n: string; title: string; done: boolean; children: React.ReactNode }) {
  return (
    <section className={`rounded-3xl border p-6 transition-all duration-300 sm:p-8 ${done ? "border-emerald-500 bg-emerald-50 shadow-sm dark:border-emerald-600 dark:bg-emerald-950/40" : "border-[var(--border-subtle)] bg-white hover:border-zinc-300 dark:bg-zinc-950 dark:hover:border-zinc-700"}`}>
      <h2 className="mb-4 flex items-center gap-3 text-xl font-bold sm:text-2xl">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold ${done ? "bg-emerald-600 text-white" : "bg-[var(--avalanche-red)] text-white"}`}>{n}</span>
        {title}
        {done && <span className="ml-auto rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">✓ Passed</span>}
      </h2>
      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}

const btn = "inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-zinc-900 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 dark:disabled:hover:bg-white";
const btnGhost = "inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold transition-all hover:border-zinc-400 hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:hover:border-zinc-600 dark:hover:bg-zinc-900";
const btnRed = "inline-flex items-center gap-2 rounded-xl bg-[var(--avalanche-red)] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-600 disabled:opacity-40";
const input = "w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm transition-colors focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-600";

export default function PlayClient() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [balance, setBalance] = useState<string>("");
  const [lang, setLang] = useState<Lang>("en");
  const [busy, setBusy] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const key = wallet ? `safestart.${wallet.address.toLowerCase()}` : "safestart.none";
  const [receipts, setReceipts] = useStored<Receipt[]>(`${key}.receipts`, []);
  const [txHashes, setTxHashes] = useStored<string[]>(`${key}.txs`, []);
  const passed = (id: string) => receipts.some((r) => r.missionId === id);

  const addReceipt = (r?: Receipt) => {
    if (r) setReceipts([...receipts.filter((x) => x.missionId !== r.missionId), r]);
  };

  const refreshBalance = useCallback(async () => {
    if (!wallet) return;
    try {
      setBalance(formatEther(await publicClient.getBalance({ address: wallet.address })));
    } catch {
      setBalance("?");
    }
  }, [wallet]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch balance when the wallet changes
    void refreshBalance();
  }, [refreshBalance]);

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
  const [feedback, setFeedback] = useState("");

  const startCall = () =>
    run("call", async () => {
      setFeedback("");
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

  const endCall = () =>
    run("evaluate", async () => {
      if (!wallet) throw new Error("Connect a wallet first.");
      const res = await post<{ passed: boolean; reason: string; evaluation?: { feedback: string; tacticsSeen: string[] }; receipt?: Receipt }>(
        "/api/scam/evaluate",
        { address: wallet.address, chainId: await walletChainId(wallet), transcript: turns },
      );
      setCallDone(true);
      const tactics = res.evaluation?.tacticsSeen?.length ? ` Tactics used: ${res.evaluation.tacticsSeen.join(", ")}.` : "";
      setFeedback(`${res.passed ? "✅" : "❌"} ${res.reason}${tactics} ${res.evaluation?.feedback ?? ""}`);
      addReceipt(res.receipt);
    });

  // ---------- Mission 2: test AVAX ----------
  const topUp = () =>
    run("topup", async () => {
      if (!wallet) throw new Error("Connect a wallet first.");
      await post("/api/guest-topup", { address: wallet.address });
      await refreshBalance();
    });

  const check2 = () =>
    run("check2", async () => {
      if (!wallet) throw new Error("Connect a wallet first.");
      const res = await post<{ passed: boolean; reason: string; receipt?: Receipt }>("/api/verify/2", { address: wallet.address });
      setMessage(res.reason);
      addReceipt(res.receipt);
    });

  // ---------- Mission 3: right address ----------
  const choices = useMemo(
    () => (wallet && addresses.tutor ? addressChoices(addresses.tutor, seedFromAddress(wallet.address)) : []),
    [wallet],
  );
  const [picked, setPicked] = useState<Address | "">("");
  const m3Receipt = receipts.find((r) => r.missionId === "3");

  const send3 = () =>
    run("send3", async () => {
      if (!wallet || !picked) throw new Error("Pick an address first.");
      const hash = await sendAvax(wallet, picked, parseEther("0.01"));
      setTxHashes([...txHashes, hash]);
      await publicClient.waitForTransactionReceipt({ hash, timeout: 60_000 });
      await refreshBalance();
      const res = await post<{ passed: boolean; reason: string; receipt?: Receipt }>("/api/verify/3", { address: wallet.address, txHash: hash });
      setMessage(`${res.passed ? "✅" : "❌"} ${res.reason}${res.passed ? "" : " Ask the coach what happened to your transaction."}`);
      addReceipt(res.receipt);
    });

  // ---------- Mission 4: fee ----------
  const [feeAnswer, setFeeAnswer] = useState("");
  const check4 = () =>
    run("check4", async () => {
      if (!wallet) throw new Error("Connect a wallet first.");
      const res = await post<{ passed: boolean; reason: string; receipt?: Receipt }>("/api/verify/4", {
        address: wallet.address,
        answerAvax: Number(feeAnswer),
        receipts,
      });
      setMessage(`${res.passed ? "✅" : "❌"} ${res.reason}`);
      addReceipt(res.receipt);
    });

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
      const text = (q ?? question).trim();
      if (!text) return;
      setSteps([]);
      setAnswer("");
      const res = await post<{ answer: string; steps: Step[] }>("/api/coach", {
        question: text,
        address: wallet?.address,
        txHashes,
        missionId: ["1", "2", "3", "4"].find((id) => !passed(id)) ?? "done",
        lang,
      });
      setSteps(res.steps);
      setAnswer(res.answer);
    });

  const ready = passed("1") && passed("2") && passed("3") && passed("4");

  return (
    <div className="w-full">
      {/* Hero Section - Avalanche Style */}
      <section className="relative overflow-hidden border-b border-[var(--border-subtle)] bg-white dark:bg-zinc-950">
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32 lg:py-40">
          <div className="mb-8">
            <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
              Avalanche Fuji testnet · no real money
            </span>
          </div>

          <AnimatedHeadline />

          <div className="mt-8 max-w-3xl space-y-6">
            <p className="text-xl leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-2xl">
              Practice the costliest crypto mistakes in a safe environment. AI coaches you, scams you, and reads your real transactions on testnet.
            </p>
          </div>

          <div className="mt-12 flex items-center gap-3">
            <p className="text-sm text-[var(--text-muted)]">AI language:</p>
            <select 
              className="rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium transition-colors hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900" 
              value={lang} 
              onChange={(e) => setLang(e.target.value as Lang)} 
              aria-label="AI language"
            >
              <option value="en">English</option>
              <option value="th">ไทย</option>
            </select>
          </div>
        </div>

        {/* Decorative scroll indicator */}
        <div className="relative z-10 absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="h-6 w-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_400px] lg:gap-16">
          <div className="space-y-12">
            {message && (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-sm leading-relaxed dark:border-zinc-800 dark:bg-zinc-900">
                {message}
              </div>
            )}

            {/* Wallet Connection Section */}
            <section className="rounded-3xl border border-[var(--border-subtle)] bg-gradient-to-br from-white to-zinc-50 p-8 shadow-sm dark:from-zinc-950 dark:to-zinc-900">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--avalanche-red)]">
                  <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Your wallet</h2>
                  <p className="text-sm text-[var(--text-muted)]">Connect to start missions</p>
                </div>
              </div>

              {wallet ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[var(--border-subtle)] bg-white p-4 dark:bg-zinc-950">
                    <div className="flex-1">
                      <div className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                        {wallet.kind === "guest" ? "Guest wallet" : "Connected wallet"}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <a 
                          className="font-mono text-sm font-medium underline decoration-dotted underline-offset-2 transition-colors hover:text-[var(--avalanche-red)]" 
                          href={addressUrl(wallet.address)} 
                          target="_blank" 
                          rel="noreferrer"
                        >
                          {short(wallet.address)}
                        </a>
                        <span className="text-sm font-semibold">{balance ? `${Number(balance).toFixed(4)} AVAX` : "…"}</span>
                      </div>
                    </div>
                    <button 
                      className="rounded-xl border border-zinc-300 p-2.5 transition-all hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-600" 
                      onClick={() => void refreshBalance()}
                      aria-label="Refresh balance"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                  
                  {wallet.kind === "guest" && (
                    <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm dark:bg-amber-950/50">
                      <div className="flex items-start gap-2">
                        <span className="text-amber-600 dark:text-amber-400">⚠️</span>
                        <p className="text-amber-900 dark:text-amber-100">
                          Testnet only. Never send real funds to this wallet.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    Connect a wallet or use a guest wallet to start practicing safety missions on Avalanche Fuji testnet.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button 
                      className={btn} 
                      disabled={!!busy || !hasInjectedWallet()} 
                      onClick={() => run("connect", async () => setWallet(await connectInjected()))}
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Connect Core / MetaMask
                    </button>
                    <button 
                      className={btnGhost} 
                      disabled={!!busy} 
                      onClick={() => setWallet(loadOrCreateGuest())}
                    >
                      Try with a guest wallet
                    </button>
                  </div>
                </div>
              )}
            </section>

            <Card n="1" title={m1.title} done={passed("1")}>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{m1.lesson}</p>
              <div className="rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-900">
                <p className="text-sm font-semibold">{m1.task}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <select className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-medium dark:border-zinc-700 dark:bg-zinc-900" value={personaId} onChange={(e) => setPersonaId(e.target.value)} aria-label="Caller">
                  <option value="wallet-support">Wallet support call</option>
                  <option value="airdrop-friend">Community airdrop</option>
                </select>
                <button className={btn} disabled={!wallet || !!busy} onClick={startCall}>
                  {turns.length ? "Restart call" : "Answer the call"}
                </button>
                {turns.length > 1 && (
                  <button className={btnRed} disabled={!!busy} onClick={endCall}>
                    End call &amp; get feedback
                  </button>
                )}
              </div>
              {turns.length > 0 && (
                <div className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                    <span className="flex h-2 w-2 animate-pulse rounded-full bg-red-500"></span>
                    Practice call — AI scammer
                  </div>
                  <div className="space-y-3">
                    {turns.map((t, i) => (
                      <div key={i} className={`flex ${t.role === "learner" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${t.role === "scammer" ? "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100" : "bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"}`}>
                          <div className="mb-0.5 text-xs font-semibold opacity-70">
                            {t.role === "scammer" ? "Scammer" : "You"}
                          </div>
                          {t.text}
                        </div>
                      </div>
                    ))}
                  </div>
                  {!callDone && (
                    <div className="flex gap-2 pt-2">
                      <input 
                        className={input} 
                        value={reply} 
                        onChange={(e) => setReply(e.target.value)} 
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendReply()} 
                        placeholder="Type your reply…" 
                      />
                      <button className={btn} disabled={!!busy} onClick={sendReply}>
                        Send
                      </button>
                    </div>
                  )}
                </div>
              )}
              {feedback && (
                <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm leading-relaxed dark:border-zinc-800 dark:bg-zinc-950">
                  {feedback}
                </div>
              )}
            </Card>

            <Card n="2" title={m2.title} done={passed("2")}>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{m2.lesson}</p>
              <div className="rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-900">
                <p className="text-sm font-semibold">{m2.task}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {wallet?.kind === "guest" ? (
                  <button className={btn} disabled={!!busy} onClick={topUp}>
                    {busy === "topup" ? "Sending…" : "Top up guest wallet"}
                  </button>
                ) : (
                  <a className={btn} href={FAUCET_URL} target="_blank" rel="noreferrer">
                    Open Avalanche faucet
                  </a>
                )}
                <button className={btnGhost} disabled={!wallet || !!busy} onClick={check2}>
                  Check my balance
                </button>
              </div>
            </Card>

            <Card n="3" title={m3.title} done={passed("3")}>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{m3.lesson}</p>
              <div className="rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-900">
                <p className="text-sm font-semibold">{m3.task}</p>
              </div>
              {!addresses.tutor && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-900 dark:bg-red-950 dark:text-red-100">
                  ⚠️ Tutor address is not configured (NEXT_PUBLIC_TUTOR_ADDRESS).
                </div>
              )}
              <div className="space-y-2">
                {choices.map((c) => (
                  <label 
                    key={c} 
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 font-mono text-xs transition-all ${picked === c ? "border-[var(--avalanche-red)] bg-red-50 dark:bg-red-950/30" : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"}`}
                  >
                    <input 
                      type="radio" 
                      name="tutor" 
                      checked={picked === c} 
                      onChange={() => setPicked(c)}
                      className="h-4 w-4 accent-[var(--avalanche-red)]"
                    />
                    {c}
                  </label>
                ))}
              </div>
              {wallet && addresses.tutor && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
                  <p className="font-semibold text-amber-900 dark:text-amber-100">Message from your tutor:</p>
                  <p className="mt-1 text-amber-900 dark:text-amber-100">
                    &quot;Please send 0.01 AVAX to <span className="font-mono font-bold">{addresses.tutor}</span>&quot;
                  </p>
                  <p className="mt-2 text-xs text-amber-800 dark:text-amber-200">
                    The addresses above are from your wallet history. Which one is really your tutor&apos;s?
                  </p>
                </div>
              )}
              <button className={btn} disabled={!wallet || !picked || !!busy} onClick={send3}>
                {busy === "send3" ? "Sending…" : "Send 0.01 AVAX"}
              </button>
            </Card>

            <Card n="4" title={m4.title} done={passed("4")}>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{m4.lesson}</p>
              <div className="rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-900">
                <p className="text-sm font-semibold">{m4.task}</p>
              </div>
              {m3Receipt ? (
                <a 
                  className="inline-flex items-center gap-1 text-sm font-medium text-[var(--avalanche-red)] underline decoration-dotted underline-offset-2 transition-opacity hover:opacity-80" 
                  href={txUrl(m3Receipt.evidence)} 
                  target="_blank" 
                  rel="noreferrer"
                >
                  Open my mission 3 transaction
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">Finish mission 3 first.</p>
              )}
              <div className="flex gap-2">
                <input 
                  className={input} 
                  value={feeAnswer} 
                  onChange={(e) => setFeeAnswer(e.target.value)} 
                  placeholder="Fee in AVAX, e.g. 0.0000525" 
                  inputMode="decimal" 
                />
                <button className={btn} disabled={!m3Receipt || !feeAnswer || !!busy} onClick={check4}>
                  Check
                </button>
              </div>
            </Card>

            <section className="rounded-3xl border border-[var(--border-subtle)] bg-gradient-to-br from-emerald-50 to-white p-8 dark:from-emerald-950/20 dark:to-zinc-950">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-3xl text-white">
                  🎓
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Certificate</h2>
                  <p className="text-sm text-[var(--text-muted)]">Proof you passed</p>
                </div>
              </div>
              {certTx ? (
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed">
                    🎉 Certificate minted on Fuji! Your completion is now recorded on-chain.
                  </p>
                  <a 
                    className="inline-flex items-center gap-1 text-sm font-medium text-[var(--avalanche-red)] underline decoration-dotted underline-offset-2 transition-opacity hover:opacity-80" 
                    href={txUrl(certTx)} 
                    target="_blank" 
                    rel="noreferrer"
                  >
                    View transaction
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-[var(--text-muted)]">
                    {ready ? "You've completed all missions! Mint your certificate." : "Complete missions 1–4 to unlock your certificate."}
                  </p>
                  <button className={ready ? btnRed : btn} disabled={!ready || !!busy} onClick={mint}>
                    {busy === "mint" ? "Minting…" : ready ? "Mint my certificate" : "Complete missions to unlock"}
                  </button>
                </div>
              )}
            </section>
          </div>

          <aside className="h-fit space-y-5 rounded-3xl border border-[var(--border-subtle)] bg-white p-6 shadow-sm dark:bg-zinc-950 lg:sticky lg:top-24">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--avalanche-red)] text-white">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold">AI coach</h2>
                  <p className="text-xs text-[var(--text-muted)]">Reads your transactions</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {["Why did my mission 3 fail?", "How much gas did I pay?", "What is in my wallet?"].map((q) => (
                <button 
                  key={q} 
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium transition-all hover:border-zinc-300 disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700" 
                  disabled={!!busy} 
                  onClick={() => { setQuestion(q); void ask(q); }}
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <textarea 
                className={`${input} min-h-[80px] resize-none`}
                rows={3} 
                value={question} 
                onChange={(e) => setQuestion(e.target.value)} 
                placeholder="Ask about your wallet or a transaction…" 
              />
              <button className={btn} disabled={!!busy || !question.trim()} onClick={() => ask()}>
                {busy === "coach" ? "Thinking…" : "Ask coach"}
              </button>
            </div>

            {steps.length > 0 && (
              <div className="space-y-1 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900">
                <div className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  Tools used
                </div>
                <ol className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                  {steps.map((s, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="mt-0.5">{s.ok ? "✓" : "⚠️"}</span>
                      <span className="flex-1 font-mono">
                        {s.tool}({Object.values(s.args).map(String).map((v) => (v.length > 14 ? short(v) : v)).join(", ")})
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {answer && (
              <div className="rounded-xl border border-[var(--avalanche-red)]/20 bg-red-50 p-4 dark:bg-red-950/20">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--avalanche-red)]">
                  Coach answer
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{answer}</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
