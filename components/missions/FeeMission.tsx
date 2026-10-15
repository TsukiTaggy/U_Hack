"use client";

import { useEffect, useState } from "react";
import { formatEther, formatUnits, type Hash } from "viem";
import m4 from "@/content/missions/4.json";
import { publicClient } from "@/lib/chain";
import { txUrl } from "@/lib/config";
import { splitGasPrice } from "@/lib/send";
import type { Wallet } from "@/lib/wallet";
import { MissionCard } from "./MissionCard";
import { post, type CheckResponse, type FeeEstimate, type Receipt } from "./types";
import { btnPrimary, btnSecondary, eyebrow, inputClass, panel } from "./ui";

type ReceiptFacts = { gasUsed: bigint; effectiveGasPrice: bigint; baseFee: bigint | null; tip: bigint | null };

type Props = {
  wallet: Wallet | null;
  mission3Hash: Hash | null;
  estimate: FeeEstimate | null;
  receipts: Receipt[];
  done: boolean;
  busy: string;
  run: (label: string, fn: () => Promise<void>) => Promise<void>;
  onReceipt: (receipt?: Receipt) => void;
  askCoach: (question: string) => void;
};

const nAvax = (wei: bigint) => `${formatUnits(wei, 9)} nAVAX`;

export function FeeMission({ wallet, mission3Hash, estimate, receipts, done, busy, run, onReceipt, askCoach }: Props) {
  const [facts, setFacts] = useState<ReceiptFacts | null>(null);
  const [loadError, setLoadError] = useState("");
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<{ passed: boolean; reason: string } | null>(null);

  // Read the real receipt (and its block's base fee) of the mission 3 transaction from Fuji.
  useEffect(() => {
    if (!mission3Hash) return;
    let cancelled = false;
    void (async () => {
      try {
        const receipt = await publicClient.getTransactionReceipt({ hash: mission3Hash });
        const block = await publicClient.getBlock({ blockNumber: receipt.blockNumber }).catch(() => null);
        const split = splitGasPrice(receipt.effectiveGasPrice, block?.baseFeePerGas);
        if (!cancelled) {
          setFacts({ gasUsed: receipt.gasUsed, effectiveGasPrice: receipt.effectiveGasPrice, ...split });
          setLoadError("");
        }
      } catch {
        if (!cancelled) setLoadError("Could not read your transaction from Fuji right now. Use the explorer link instead.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mission3Hash]);

  const check = () =>
    run("check4", async () => {
      if (!wallet) throw new Error("Connect your Core wallet first.");
      const res = await post<CheckResponse>("/api/verify/4", { address: wallet.address, answerAvax: Number(answer), receipts });
      setResult({ passed: res.passed, reason: res.reason });
      onReceipt(res.receipt);
    });

  const feeWei = facts ? facts.gasUsed * facts.effectiveGasPrice : null;
  const maxFeeWei = estimate ? BigInt(estimate.maxFeeWei) : null;
  const share = feeWei !== null && maxFeeWei ? Number((feeWei * 1000n) / maxFeeWei) / 10 : null;

  return (
    <MissionCard n="4" title={m4.title} lesson={m4.lesson} task={m4.task} done={done}>
      {!mission3Hash && <p className="text-sm text-[var(--text-muted)]">Pass mission 3 first. This mission uses that real transaction.</p>}

      {mission3Hash && (
        <>
          <div className={panel}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className={eyebrow}>Your mission 3 receipt</p>
              <a className="text-xs font-medium underline" href={txUrl(mission3Hash)} target="_blank" rel="noreferrer">
                Open on explorer
              </a>
            </div>
            {facts ? (
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-[var(--text-muted)]">Gas used</dt>
                  <dd className="text-lg font-semibold tabular-nums">{facts.gasUsed.toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-[var(--text-muted)]">Effective gas price</dt>
                  <dd className="text-lg font-semibold tabular-nums">{nAvax(facts.effectiveGasPrice)}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">{loadError || "Reading your receipt from Fuji…"}</p>
            )}
            <p className="mt-3 text-xs text-[var(--text-muted)]">{m4.hint}</p>
          </div>

          {!done && (
            <div className="flex flex-wrap gap-3">
              <input
                className={`${inputClass} max-w-xs`}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Fee in AVAX"
                inputMode="decimal"
                aria-label="Fee in AVAX"
              />
              <button type="button" className={btnPrimary} disabled={!answer || !!busy} onClick={check}>
                {busy === "check4" ? "Checking…" : "Check my answer"}
              </button>
            </div>
          )}
          {result && !result.passed && <p className="text-sm text-[var(--avalanche-red)]">{result.reason}</p>}

          {done && facts && feeWei !== null && (
            <div className="space-y-4 rounded-2xl border border-[var(--border-subtle)] p-5">
              <p className={eyebrow}>How your fee was made</p>
              <p className="font-mono text-sm leading-relaxed">
                {facts.gasUsed.toLocaleString()} gas × {nAvax(facts.effectiveGasPrice)} = <strong>{formatEther(feeWei)} AVAX</strong>
              </p>
              {facts.baseFee !== null && facts.tip !== null && (
                <p className="text-sm text-[var(--text-muted)]">
                  Price per gas = base fee {nAvax(facts.baseFee)} + tip {nAvax(facts.tip)}. The base fee rises when the network is busy and falls when it is quiet.
                </p>
              )}
              {maxFeeWei !== null && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Max fee shown before signing (AVAX)</p>
                    <p className="text-2xl font-bold tabular-nums">{formatEther(maxFeeWei)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Fee you actually paid (AVAX)</p>
                    <p className="text-2xl font-bold tabular-nums">{formatEther(feeWei)}</p>
                  </div>
                  {share !== null && (
                    <p className="text-sm sm:col-span-2">
                      You paid <strong>{share}%</strong> of the maximum. The estimate is a ceiling; you only pay for gas used at the block&apos;s price.
                    </p>
                  )}
                </div>
              )}
              <button
                type="button"
                className={btnSecondary}
                disabled={!!busy}
                onClick={() =>
                  askCoach(
                    maxFeeWei !== null
                      ? `Explain the fee of my mission 3 transaction ${mission3Hash}. The wallet showed a max fee of ${formatEther(maxFeeWei)} AVAX before I signed. Why did I pay ${formatEther(feeWei)} AVAX?`
                      : `Explain the fee of my mission 3 transaction ${mission3Hash}: gas used, gas price and what I paid.`,
                  )
                }
              >
                Ask the coach to explain my fee
              </button>
            </div>
          )}
        </>
      )}
    </MissionCard>
  );
}
