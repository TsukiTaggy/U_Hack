import { formatEther, formatUnits, type Address } from "viem";
import type { GasReserve } from "@/lib/send";
import { AddressCompare } from "./AddressCompare";
import { btnDanger, btnPrimary, btnSecondary, eyebrow, riskStyle, type RiskLevel } from "./ui";

export type ExplainResponse = {
  function: string;
  risk: RiskLevel;
  reasons: string[];
  explanation: string;
  source?: "ai" | "rules";
  recipient?: { kind: "known" | "look-alike" | "new"; match?: Address; diff: number[] };
};

export type FeeQuote = { gas: bigint; maxFeePerGas: bigint; maxFeeWei: bigint };

/**
 * Explain-before-sign card. Rules in lib/send.ts and /api/explain-tx set the risk; the AI only
 * writes the one-line explanation. The learner decides whether to open Core.
 */
export function TxPreviewCard({
  to,
  valueWei,
  preview,
  fee,
  reserve,
  acknowledged,
  onAcknowledge,
  onConfirm,
  onCancel,
  onUseRequestedAmount,
  busy,
}: {
  to: Address;
  valueWei: bigint;
  preview: ExplainResponse;
  fee: FeeQuote | null;
  reserve: GasReserve | null;
  acknowledged: boolean;
  onAcknowledge: (value: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onUseRequestedAmount: () => void;
  busy: boolean;
}) {
  const style = riskStyle[preview.risk];
  const high = preview.risk === "high";
  const blocked = reserve !== null && !reserve.ok;
  const canSend = !busy && !blocked && (!high || acknowledged);
  // The first reason restates the transfer; the rest are the wallet checks.
  const checks = preview.function === "transfer AVAX" ? preview.reasons.slice(1) : preview.reasons;
  const fromAi = preview.source === "ai";

  return (
    <div className={`space-y-4 rounded-2xl border p-5 ${high ? "border-[var(--avalanche-red)]" : "border-[var(--border-subtle)]"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={eyebrow}>Review before signing</p>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${style.className}`}>{style.label}</span>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-[120px_1fr]">
        <dt className="text-[var(--text-muted)]">To</dt>
        <dd className="break-all font-mono">{to}</dd>
        <dt className="text-[var(--text-muted)]">Amount</dt>
        <dd>{formatEther(valueWei)} AVAX</dd>
        <dt className="text-[var(--text-muted)]">Max network fee</dt>
        <dd>
          {fee ? (
            <>
              {formatEther(fee.maxFeeWei)} AVAX{" "}
              <span className="text-[var(--text-muted)]">
                ({fee.gas.toString()} gas × up to {formatUnits(fee.maxFeePerGas, 9)} nAVAX)
              </span>
            </>
          ) : (
            <span className="text-[var(--text-muted)]">Could not estimate right now</span>
          )}
        </dd>
      </dl>

      {fromAi && (
        <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900/40">
          <p className="mb-1 text-xs font-semibold text-[var(--text-muted)]">AI explanation</p>
          <p className="leading-relaxed [overflow-wrap:anywhere]">{preview.explanation}</p>
        </div>
      )}

      {checks.length > 0 && (
        <ul className="space-y-1 text-sm [overflow-wrap:anywhere]" aria-label="Wallet checks">
          {!fromAi && <li className="text-xs font-semibold text-[var(--text-muted)]">Wallet checks (AI explanation unavailable right now)</li>}
          {checks.map((r) => (
            <li key={r} className="flex gap-2">
              <span aria-hidden="true">{high ? "⚠️" : "•"}</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      )}

      {preview.recipient?.kind === "look-alike" && preview.recipient.match && (
        <AddressCompare a={preview.recipient.match} aLabel="Address you sent to before" b={to} bLabel="Address you are about to send to" diff={preview.recipient.diff} />
      )}

      {blocked && reserve && (
        <div className="space-y-2 rounded-2xl bg-[var(--danger-soft)] p-4 text-sm">
          <p className="font-semibold text-[var(--avalanche-red)]">Not enough AVAX left for the network fee</p>
          <p>
            Sending this amount would leave nothing to pay gas. You are short by {formatEther(reserve.shortfallWei)} AVAX. Wallets need the
            amount <em>plus</em> the fee.
          </p>
          <button type="button" className={btnSecondary} onClick={onUseRequestedAmount}>
            Send the requested 0.01 AVAX instead
          </button>
        </div>
      )}

      {high && !blocked && (
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1" checked={acknowledged} onChange={(e) => onAcknowledge(e.target.checked)} />
          <span>I compared every character with the address my tutor sent, and I still want to send.</span>
        </label>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="button" className={high ? btnDanger : btnPrimary} disabled={!canSend} onClick={onConfirm}>
          {busy ? "Waiting for Core…" : high ? "Send anyway in Core" : "Confirm in Core"}
        </button>
        <button type="button" className={btnSecondary} disabled={busy} onClick={onCancel}>
          Edit
        </button>
      </div>
    </div>
  );
}
