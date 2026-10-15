import { formatEther, getAddress, isAddress, isHash, parseEther, type Address, type Hash } from "viem";
import { z } from "zod";
import { publicClient } from "./chain";
import { testUsdcAbi } from "./abi";

// The ONLY place that decides whether a mission is passed.
// Pure checks are exported separately so they can be unit-tested without a network.

export type CheckResult = { passed: boolean; reason: string; evidence?: string };

export const MISSION3_MIN_VALUE = parseEther("0.01");

// ---------- Mission 1: practice scam call ----------

export const scamEvaluationSchema = z.object({
  sharedSecret: z.boolean(),
  followedLink: z.boolean(),
  verifiedViaOfficialChannel: z.boolean(),
  tacticsSeen: z.array(z.string()),
  feedback: z.string(),
});
export type ScamEvaluation = z.infer<typeof scamEvaluationSchema>;

/** Deterministic backstop: does a learner message look like a recovery phrase or private key? */
export function looksLikeSecret(text: string): boolean {
  if (/\b(0x)?[0-9a-fA-F]{64}\b/.test(text)) return true; // private key
  const words = text.toLowerCase().match(/[a-z]+/g) ?? [];
  let run = 0;
  for (const w of words) {
    run = w.length >= 3 && w.length <= 8 ? run + 1 : 0;
    if (run >= 12) return true; // 12+ short words in a row, like a BIP-39 phrase
  }
  return false;
}

export function checkMission1(evaluation: ScamEvaluation, learnerMessages: string[]): CheckResult {
  if (learnerMessages.some(looksLikeSecret)) {
    return { passed: false, reason: "You shared something that looks like a recovery phrase or key." };
  }
  if (evaluation.sharedSecret) return { passed: false, reason: "You shared a secret with the caller." };
  if (evaluation.followedLink) return { passed: false, reason: "You agreed to open the caller's link." };
  return { passed: true, reason: "You refused to share secrets and did not follow the link." };
}

// ---------- Mission 2: get test AVAX ----------

export function checkMission2(balanceWei: bigint): CheckResult {
  return balanceWei > 0n
    ? { passed: true, reason: `Balance is ${formatEther(balanceWei)} AVAX.` }
    : { passed: false, reason: "Your wallet has no test AVAX yet." };
}

// ---------- Mission 3: send to the right address ----------

export type TxFacts = { hash: Hash; from: Address; to: Address | null; value: bigint; status: "success" | "reverted" };

export function checkMission3(tx: TxFacts, learner: Address, tutor: Address): CheckResult {
  const same = (a: string | null, b: string) => !!a && a.toLowerCase() === b.toLowerCase();
  if (tx.status !== "success") return { passed: false, reason: "The transaction failed on chain." };
  if (!same(tx.from, learner)) return { passed: false, reason: "This transaction was not sent from your wallet." };
  if (!same(tx.to, tutor)) {
    return { passed: false, reason: "The money went to a different address than the tutor's." };
  }
  if (tx.value < MISSION3_MIN_VALUE) return { passed: false, reason: "You sent less than 0.01 AVAX." };
  return { passed: true, reason: "Sent to the correct address.", evidence: tx.hash };
}

// ---------- Mission 4: read your own fee ----------

export function checkMission4(answerAvax: number, feeWei: bigint): CheckResult {
  if (!Number.isFinite(answerAvax) || answerAvax < 0) return { passed: false, reason: "Enter the fee as a number of AVAX." };
  const fee = Number(formatEther(feeWei));
  const ok = Math.abs(answerAvax - fee) <= Math.max(fee * 0.01, 1e-12);
  return ok
    ? { passed: true, reason: `Correct: the fee was ${fee} AVAX.` }
    : { passed: false, reason: "That is not the fee of your mission 3 transaction." };
}

// ---------- Mission 5: approval trap ----------

export function checkMission5(trapStarted: boolean, allowance: bigint): CheckResult {
  if (!trapStarted) return { passed: false, reason: "Start the mission first." };
  return allowance === 0n
    ? { passed: true, reason: "The suspicious contract has no permission to spend your tokens." }
    : { passed: false, reason: "The suspicious contract can still spend your tokens. Revoke the approval." };
}

// ---------- On-chain helpers (server or browser) ----------

export function parseAddress(value: unknown): Address | null {
  return typeof value === "string" && isAddress(value) ? getAddress(value) : null;
}

export function parseHash(value: unknown): Hash | null {
  return typeof value === "string" && isHash(value) ? (value as Hash) : null;
}

export async function getTxFacts(hash: Hash): Promise<TxFacts & { feeWei: bigint }> {
  const [tx, receipt] = await Promise.all([
    publicClient.getTransaction({ hash }),
    publicClient.getTransactionReceipt({ hash }),
  ]);
  return {
    hash,
    from: tx.from,
    to: tx.to ?? null,
    value: tx.value,
    status: receipt.status,
    feeWei: receipt.gasUsed * receipt.effectiveGasPrice,
  };
}

export async function verifyMission2(learner: Address): Promise<CheckResult> {
  return checkMission2(await publicClient.getBalance({ address: learner }));
}

export async function verifyMission3(learner: Address, hash: Hash, tutor: Address): Promise<CheckResult> {
  return checkMission3(await getTxFacts(hash), learner, tutor);
}

export async function verifyMission4(learner: Address, mission3Hash: Hash, answerAvax: number, tutor: Address): Promise<CheckResult> {
  const facts = await getTxFacts(mission3Hash);
  const m3 = checkMission3(facts, learner, tutor);
  if (!m3.passed) return { passed: false, reason: "Pass mission 3 first." };
  return checkMission4(answerAvax, facts.feeWei);
}

export async function verifyMission5(learner: Address, trapStarted: boolean, tusdc: Address, trap: Address): Promise<CheckResult> {
  const allowance = await publicClient.readContract({
    address: tusdc,
    abi: testUsdcAbi,
    functionName: "allowance",
    args: [learner, trap],
  });
  return checkMission5(trapStarted, allowance);
}
