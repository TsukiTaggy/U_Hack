"use client";

import { useMemo, useState } from "react";
import { formatEther, getAddress, isAddress, parseEther, type Address, type Hash } from "viem";
import m3 from "@/content/missions/3.json";
import { publicClient } from "@/lib/chain";
import { addresses, txUrl } from "@/lib/config";
import { diffPositions, makeDecoys, seedFromAddress } from "@/lib/decoys";
import { assessRecipient, checkGasReserve, type GasReserve } from "@/lib/send";
import { sendAvax, type Wallet } from "@/lib/wallet";
import { AddressCompare } from "./AddressCompare";
import { MissionCard } from "./MissionCard";
import { Bubble, PhoneFrame } from "./PhoneFrame";
import { TxPreviewCard, type ExplainResponse, type FeeQuote } from "./TxPreviewCard";
import { post, type CheckResponse, type FeeEstimate, type Lang, type Receipt } from "./types";
import { btnChip, btnPrimary, btnSecondary, inputClass } from "./ui";
import { WalletHistory, type HistoryItem } from "./WalletHistory";

type Props = {
  wallet: Wallet | null;
  balanceWei: bigint | null;
  lang: Lang;
  done: boolean;
  busy: string;
  run: (label: string, fn: () => Promise<void>) => Promise<void>;
  onSent: (hash: Hash, estimate: FeeEstimate | null) => void;
  onReceipt: (receipt?: Receipt) => void;
  refreshBalance: () => Promise<void>;
  askCoach: (question: string) => void;
};

const REQUESTED = m3.story.amountAvax;

export function SendMission({ wallet, balanceWei, lang, done, busy, run, onSent, onReceipt, refreshBalance, askCoach }: Props) {
  const tutor = addresses.tutor;
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState(REQUESTED);
  const [preview, setPreview] = useState<ExplainResponse | null>(null);
  const [fee, setFee] = useState<FeeQuote | null>(null);
  const [reserve, setReserve] = useState<GasReserve | null>(null);
  const [ack, setAck] = useState(false);
  const [outcome, setOutcome] = useState<{ hash: Hash; to: Address; passed: boolean; reason: string } | null>(null);
  const [formError, setFormError] = useState("");

  // The learner has sent to the tutor before (last week), so that address is "known" to the wallet.
  const known = useMemo(() => (tutor ? [tutor] : []), [tutor]);

  // Simulated history: the real send last week, then two newer 0 AVAX "poisoning" transfers.
  const history = useMemo<HistoryItem[]>(() => {
    if (!wallet || !tutor) return [];
    const decoys = makeDecoys(tutor, 2, seedFromAddress(wallet.address));
    return [
      ...decoys.map((d, i) => ({ id: `poison-${i}`, direction: "in" as const, amount: "0 AVAX", address: d, when: m3.story.history.poison[i] ?? "Recently" })),
      { id: "sent", direction: "out" as const, amount: `${REQUESTED} AVAX`, address: tutor, when: m3.story.history.sent },
    ];
  }, [wallet, tutor]);

  const valueWei = useMemo(() => {
    try {
      return parseEther(amount || "0");
    } catch {
      return null;
    }
  }, [amount]);

  const resetPreview = () => {
    setPreview(null);
    setFee(null);
    setReserve(null);
    setAck(false);
  };

  const choose = (address: string) => {
    setTo(address);
    setFormError("");
    resetPreview();
    void navigator.clipboard?.writeText(address).catch(() => undefined);
  };

  const review = () =>
    run("review3", async () => {
      setFormError("");
      setOutcome(null);
      if (!wallet) throw new Error("Connect your Core wallet first.");
      const trimmed = to.trim();
      if (!isAddress(trimmed)) {
        setFormError("That is not a complete address. Paste all 42 characters, starting with 0x.");
        return;
      }
      if (valueWei === null || valueWei <= 0n) {
        setFormError("Enter an amount of AVAX, for example 0.01.");
        return;
      }
      const target = getAddress(trimmed);
      setTo(target);

      // Network fee ceiling, the way a wallet estimates it: gas limit × max fee per gas.
      let quote: FeeQuote | null = null;
      try {
        const [gas, fees] = await Promise.all([
          publicClient.estimateGas({ account: wallet.address, to: target, value: 0n }).catch(() => 21_000n),
          publicClient.estimateFeesPerGas(),
        ]);
        quote = { gas, maxFeePerGas: fees.maxFeePerGas, maxFeeWei: gas * fees.maxFeePerGas };
      } catch {
        quote = null;
      }
      setFee(quote);
      setReserve(quote && balanceWei !== null ? checkGasReserve(balanceWei, valueWei, quote.maxFeeWei) : null);

      try {
        setPreview(
          await post<ExplainResponse>("/api/explain-tx", {
            to: target,
            value: valueWei.toString(),
            data: "0x",
            lang,
            knownRecipients: known,
          }),
        );
      } catch {
        // API unreachable: show the same rule check computed in the browser, labelled as rules.
        const check = assessRecipient(target, known);
        setPreview({
          function: "transfer AVAX",
          risk: check.risk,
          reasons: [`Sends ${formatEther(valueWei)} AVAX to ${target}.`, ...check.reasons],
          explanation: check.reasons.join(" "),
          source: "rules",
          recipient: { kind: check.kind, match: check.match, diff: check.diff },
        });
      }
    });

  const confirm = () =>
    run("send3", async () => {
      if (!wallet || !preview || valueWei === null) return;
      const target = getAddress(to);
      const hash = await sendAvax(wallet, target, valueWei);
      onSent(hash, fee && { gas: fee.gas.toString(), maxFeePerGas: fee.maxFeePerGas.toString(), maxFeeWei: fee.maxFeeWei.toString() });
      resetPreview();
      await publicClient.waitForTransactionReceipt({ hash, timeout: 60_000 });
      await refreshBalance();
      const res = await post<CheckResponse>("/api/verify/3", { address: wallet.address, txHash: hash });
      setOutcome({ hash, to: target, passed: res.passed, reason: res.reason });
      onReceipt(res.receipt);
    });

  const tryAgain = () => {
    setOutcome(null);
    setTo("");
    setAmount(REQUESTED);
    resetPreview();
  };

  const messages = m3.story.messages[lang] ?? m3.story.messages.en;
  const wrongDiff = outcome && !outcome.passed && tutor ? diffPositions(tutor, outcome.to) : [];

  return (
    <MissionCard n="3" title={m3.title} lesson={m3.lesson} task={m3.task} done={done}>
      {!tutor && <p className="text-sm text-[var(--avalanche-red)]">Tutor address is not configured (NEXT_PUBLIC_TUTOR_ADDRESS).</p>}

      {wallet && tutor && (
        <div className="space-y-4">
          <PhoneFrame name={m3.story.contact} status={m3.story.status}>
            {messages.map((text) => (
              <Bubble key={text} from="them">
                {text}
              </Bubble>
            ))}
            <Bubble from="them">
              <span className="block break-all font-mono text-xs">{tutor}</span>
              <button type="button" className="mt-2 rounded-full border border-zinc-600 px-3 py-1 text-xs font-medium text-white hover:border-zinc-400" onClick={() => choose(tutor)}>
                Copy address
              </button>
            </Bubble>
          </PhoneFrame>
          <WalletHistory items={history} onUse={choose} disabled={!!busy} />
        </div>
      )}

      {!wallet && <p className="text-sm text-[var(--text-muted)]">Connect your Core wallet to see your tutor&apos;s message and your wallet activity.</p>}
      {wallet && done && !outcome && <p className="text-sm text-[var(--success)]">You already passed this mission. You can send again to practise.</p>}

      {wallet && tutor && !preview && !outcome && (
        <div className="space-y-3">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Send to</span>
            <input
              className={`${inputClass} font-mono`}
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                resetPreview();
              }}
              placeholder="Paste or copy an address above"
              spellCheck={false}
            />
          </label>
          <div className="flex flex-wrap items-end gap-3">
            <label className="block flex-1 space-y-1.5">
              <span className="text-sm font-medium">Amount (AVAX)</span>
              <input className={inputClass} value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" />
            </label>
            <button type="button" className={btnChip} disabled={balanceWei === null} onClick={() => balanceWei !== null && setAmount(formatEther(balanceWei))}>
              Max
            </button>
          </div>
          {amount !== REQUESTED && valueWei !== null && <p className="text-xs text-[var(--text-muted)]">Your tutor asked for {REQUESTED} AVAX.</p>}
          {formError && <p className="text-sm text-[var(--avalanche-red)]">{formError}</p>}
          <button type="button" className={btnPrimary} disabled={!!busy || !to.trim()} onClick={review}>
            {busy === "review3" ? "Checking…" : "Review transaction"}
          </button>
        </div>
      )}

      {preview && valueWei !== null && isAddress(to) && (
        <TxPreviewCard
          to={getAddress(to)}
          valueWei={valueWei}
          preview={preview}
          fee={fee}
          reserve={reserve}
          acknowledged={ack}
          onAcknowledge={setAck}
          onConfirm={confirm}
          onCancel={resetPreview}
          onUseRequestedAmount={() => {
            setAmount(REQUESTED);
            resetPreview();
          }}
          busy={busy === "send3"}
        />
      )}

      {outcome && (
        <div className={`space-y-3 rounded-2xl p-4 text-sm ${outcome.passed ? "bg-[var(--success-soft)]" : "bg-[var(--danger-soft)]"}`}>
          <p className={`font-semibold ${outcome.passed ? "text-[var(--success)]" : "text-[var(--avalanche-red)]"}`}>
            {outcome.passed ? "Sent to the right person." : "This went to the wrong address."}
          </p>
          <p>{outcome.reason}</p>
          {!outcome.passed && tutor && (
            <>
              <p>Nobody holds the key to this look-alike, so this test AVAX cannot come back. In a real attack the scammer holds the key and keeps your money.</p>
              <AddressCompare a={tutor} aLabel="Your tutor's address (from the chat)" b={outcome.to} bLabel="Where your AVAX went" diff={wrongDiff} />
            </>
          )}
          <div className="flex flex-wrap gap-3">
            <a className={btnSecondary} href={txUrl(outcome.hash)} target="_blank" rel="noreferrer">
              View on explorer
            </a>
            {!outcome.passed && (
              <>
                <button type="button" className={btnPrimary} disabled={!!busy} onClick={() => askCoach(`I sent my mission 3 transaction ${outcome.hash} to the wrong address. What happened and how do I avoid it?`)}>
                  Ask the coach what happened
                </button>
                <button type="button" className={btnSecondary} onClick={tryAgain}>
                  Try again
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </MissionCard>
  );
}
