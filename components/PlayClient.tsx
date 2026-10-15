"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatEther, parseEther, type Address } from "viem";
import m1 from "@/content/missions/1.json";
import m2 from "@/content/missions/2.json";
import m3 from "@/content/missions/3.json";
import m4 from "@/content/missions/4.json";
import { publicClient } from "@/lib/chain";
import { addresses, addressUrl, txUrl } from "@/lib/config";
import { addressChoices, seedFromAddress } from "@/lib/decoys";
import type { VoiceTurn } from "@/lib/voice";
import { connectCore, sendAvax, walletChainId, type Wallet } from "@/lib/wallet";
import VoicePracticeCall from "@/components/VoicePracticeCall";

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

function Card({ n, title, done, children }: { n: string; title: string; done: boolean; children: React.ReactNode }) {
  return (
    <section className={`rounded-2xl border p-5 ${done ? "border-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/30" : "border-zinc-200 dark:border-zinc-800"}`}>
      <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900">{n}</span>
        {title}
        {done && <span className="ml-auto rounded-full bg-emerald-600 px-2 py-0.5 text-xs text-white">Passed</span>}
      </h2>
      {children}
    </section>
  );
}

const btn = "rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900";
const btnGhost = "rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium disabled:opacity-40 dark:border-zinc-700";
const input = "w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700";

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
  const [callMode, setCallMode] = useState<"voice" | "text">("voice");
  const [voiceActive, setVoiceActive] = useState(false);

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

  const evaluateCall = (transcript: VoiceTurn[]) =>
    run("evaluate", async () => {
      if (!wallet) throw new Error("Connect a wallet first.");
      const res = await post<{ passed: boolean; reason: string; evaluation?: { feedback: string; tacticsSeen: string[] }; receipt?: Receipt }>(
        "/api/scam/evaluate",
        { address: wallet.address, chainId: await walletChainId(wallet), transcript },
      );
      setCallDone(true);
      const tactics = res.evaluation?.tacticsSeen?.length ? ` Tactics used: ${res.evaluation.tacticsSeen.join(", ")}.` : "";
      setFeedback(`${res.passed ? "✅" : "❌"} ${res.reason}${tactics} ${res.evaluation?.feedback ?? ""}`);
      addReceipt(res.receipt);
    });

  const endCall = () => evaluateCall(turns);

  const selectCallMode = (mode: "voice" | "text") => {
    setCallMode(mode);
    setTurns([]);
    setCallDone(false);
    setFeedback("");
  };

  // ---------- Mission 2: test AVAX ----------
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
      if (!wallet) throw new Error("Connect your Core wallet first.");
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
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-5">
        <header className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">SafeStart missions</h1>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900">Avalanche Fuji testnet · no real money</span>
          <select className="ml-auto rounded-lg border border-zinc-300 bg-transparent px-2 py-1 text-sm dark:border-zinc-700" value={lang} onChange={(e) => setLang(e.target.value as Lang)} aria-label="AI language">
            <option value="en">English</option>
            <option value="th">ไทย</option>
          </select>
        </header>

        <section className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
          {wallet ? (
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="font-medium">Core wallet</span>
              <a className="font-mono underline" href={addressUrl(wallet.address)} target="_blank" rel="noreferrer">{short(wallet.address)}</a>
              <span>{balance ? `${Number(balance).toFixed(4)} AVAX` : "…"}</span>
              <button className={btnGhost} onClick={() => void refreshBalance()}>Refresh</button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <button className={btn} disabled={!!busy} onClick={() => run("connect", async () => setWallet(await connectCore()))}>
                Connect Core wallet
              </button>
              <span className="self-center text-sm text-zinc-500">Core Extension required. Enable Testnet mode before connecting.</span>
            </div>
          )}
        </section>

        {message && <p className="rounded-lg bg-zinc-100 px-4 py-3 text-sm dark:bg-zinc-900">{message}</p>}

        <Card n="1" title={m1.title} done={passed("1")}>
          <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">{m1.lesson}</p>
          <p className="mb-3 text-sm font-medium">{m1.task}</p>
          <div className="mb-3 flex flex-wrap gap-2">
            <button className={callMode === "voice" ? btn : btnGhost} disabled={voiceActive || !!busy} onClick={() => selectCallMode("voice")}>Voice</button>
            <button className={callMode === "text" ? btn : btnGhost} disabled={voiceActive || !!busy} onClick={() => selectCallMode("text")}>Text</button>
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
            <div className="mb-3 flex flex-wrap gap-2">
              <select className="rounded-lg border border-zinc-300 bg-transparent px-2 text-sm dark:border-zinc-700" value={personaId} onChange={(e) => setPersonaId(e.target.value)} aria-label="Caller">
                <option value="wallet-support">Wallet support call</option>
                <option value="airdrop-friend">Community airdrop</option>
              </select>
              <button className={btn} disabled={!wallet || !!busy} onClick={startCall}>{turns.length ? "Restart call" : "Answer the call"}</button>
              {turns.length > 1 && <button className={btnGhost} disabled={!!busy} onClick={endCall}>End call &amp; get feedback</button>}
            </div>
          )}
          {turns.length > 0 && (
            <div className="space-y-2 rounded-xl bg-zinc-50 p-3 text-sm dark:bg-zinc-900">
              <p className="text-xs text-zinc-500">Practice call — the caller is an AI playing a scammer.</p>
              {turns.map((t, i) => (
                <p key={i} className={t.role === "scammer" ? "text-red-700 dark:text-red-400" : "text-right"}>
                  <b>{t.role === "scammer" ? "Caller" : "You"}:</b> {t.text}
                </p>
              ))}
              {!callDone && callMode === "text" && (
                <div className="flex gap-2">
                  <input className={input} value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendReply()} placeholder="Your reply…" />
                  <button className={btn} disabled={!!busy} onClick={sendReply}>Send</button>
                </div>
              )}
            </div>
          )}
          {feedback && <p className="mt-3 text-sm">{feedback}</p>}
        </Card>

        <Card n="2" title={m2.title} done={passed("2")}>
          <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">{m2.lesson}</p>
          <p className="mb-3 text-sm font-medium">{m2.task}</p>
          <div className="flex flex-wrap gap-2">
            {wallet ? (
              <a className={btn} href={FAUCET_URL} target="_blank" rel="noreferrer">Open Avalanche faucet</a>
            ) : (
              <span className="self-center text-sm text-zinc-500">Connect Core wallet first.</span>
            )}
            <button className={btnGhost} disabled={!wallet || !!busy} onClick={check2}>Check my balance</button>
          </div>
        </Card>

        <Card n="3" title={m3.title} done={passed("3")}>
          <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">{m3.lesson}</p>
          <p className="mb-3 text-sm font-medium">{m3.task}</p>
          {!addresses.tutor && <p className="text-sm text-red-600">Tutor address is not configured (NEXT_PUBLIC_TUTOR_ADDRESS).</p>}
          <div className="space-y-2">
            {choices.map((c) => (
              <label key={c} className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 font-mono text-xs dark:border-zinc-800">
                <input type="radio" name="tutor" checked={picked === c} onChange={() => setPicked(c)} />
                {c}
              </label>
            ))}
          </div>
          {wallet && addresses.tutor && (
            <p className="mt-2 rounded-lg bg-zinc-50 px-3 py-2 text-xs dark:bg-zinc-900">
              Message from your tutor: &quot;Please send 0.01 AVAX to <span className="font-mono">{addresses.tutor}</span>&quot;.
              The addresses above are from your wallet history. Which one is really your tutor&apos;s?
            </p>
          )}
          <button className={`${btn} mt-3`} disabled={!wallet || !picked || !!busy} onClick={send3}>{busy === "send3" ? "Sending…" : "Send 0.01 AVAX"}</button>
        </Card>

        <Card n="4" title={m4.title} done={passed("4")}>
          <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">{m4.lesson}</p>
          <p className="mb-3 text-sm font-medium">{m4.task}</p>
          {m3Receipt ? (
            <a className="text-sm underline" href={txUrl(m3Receipt.evidence)} target="_blank" rel="noreferrer">Open my mission 3 transaction</a>
          ) : (
            <p className="text-sm text-zinc-500">Finish mission 3 first.</p>
          )}
          <div className="mt-3 flex gap-2">
            <input className={input} value={feeAnswer} onChange={(e) => setFeeAnswer(e.target.value)} placeholder="Fee in AVAX, e.g. 0.0000525" inputMode="decimal" />
            <button className={btn} disabled={!m3Receipt || !feeAnswer || !!busy} onClick={check4}>Check</button>
          </div>
        </Card>

        <section className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
          <h2 className="mb-2 text-lg font-semibold">Certificate</h2>
          {certTx ? (
            <p className="text-sm">
              🎓 Certificate minted on Fuji. <a className="underline" href={txUrl(certTx)} target="_blank" rel="noreferrer">View transaction</a>
            </p>
          ) : (
            <button className={btn} disabled={!ready || !!busy} onClick={mint}>{busy === "mint" ? "Minting…" : ready ? "Mint my certificate" : "Pass missions 1–4 to unlock"}</button>
          )}
        </section>
      </div>

      <aside className="h-fit space-y-3 rounded-2xl border border-zinc-200 p-5 lg:sticky lg:top-20 dark:border-zinc-800">
        <h2 className="text-lg font-semibold">AI coach</h2>
        <p className="text-xs text-zinc-500">The coach reads your real Fuji transactions before answering.</p>
        <div className="flex flex-wrap gap-2">
          {["Why did my mission 3 fail?", "How much gas did I pay?", "What is in my wallet?"].map((q) => (
            <button key={q} className="rounded-full border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700" disabled={!wallet || !!busy} onClick={() => { setQuestion(q); void ask(q); }}>
              {q}
            </button>
          ))}
        </div>
        <textarea className={input} rows={3} value={question} onChange={(e) => setQuestion(e.target.value)} disabled={!wallet} placeholder={wallet ? "Ask about your wallet or a transaction…" : "Connect Core wallet first…"} />
        <button className={btn} disabled={!wallet || !!busy || !question.trim()} onClick={() => ask()}>{busy === "coach" ? "Thinking…" : "Ask"}</button>
        {steps.length > 0 && (
          <ol className="space-y-1 text-xs text-zinc-500">
            {steps.map((s, i) => (
              <li key={i}>{s.ok ? "🔎" : "⚠️"} {s.tool}({Object.values(s.args).map(String).map((v) => (v.length > 14 ? short(v) : v)).join(", ")})</li>
            ))}
          </ol>
        )}
        {answer && <p className="whitespace-pre-wrap text-sm">{answer}</p>}
      </aside>
    </div>
  );
}
