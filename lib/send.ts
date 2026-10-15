import { getAddress, type Address } from "viem";
import { diffPositions } from "./decoys";

// Wallet-style checks shown before a learner signs a transfer. These are warnings, not mission
// checks: the learner still decides, and passes are decided only in lib/verify.ts.
// Safe for both the browser and the server.

export type RiskLevel = "low" | "medium" | "high";

export type RecipientCheck = {
  risk: RiskLevel;
  kind: "known" | "look-alike" | "new";
  reasons: string[];
  /** The previously used address this one matches or resembles. */
  match?: Address;
  /** Positions (0-based, after "0x") where the recipient differs from `match`. */
  diff: number[];
};

const EDGE = 4;

const shortAddr = (a: string) => `${a.slice(0, 2 + EDGE)}…${a.slice(-EDGE)}`;

/** Two different addresses that share the first and last 4 hex characters (address poisoning). */
export function isLookAlike(a: string, b: string): boolean {
  const x = a.slice(2).toLowerCase();
  const y = b.slice(2).toLowerCase();
  return x.length === 40 && y.length === 40 && x !== y && x.slice(0, EDGE) === y.slice(0, EDGE) && x.slice(-EDGE) === y.slice(-EDGE);
}

/**
 * Compare a recipient with addresses the learner has sent to before, the way current wallets do:
 * an exact match is low risk, a look-alike is high risk, and a first-time address is medium risk.
 */
export function assessRecipient(to: string, knownRecipients: readonly string[]): RecipientCheck {
  const target = to.toLowerCase();
  const exact = knownRecipients.find((k) => k.toLowerCase() === target);
  if (exact) {
    return { risk: "low", kind: "known", reasons: ["You have sent to this exact address before."], match: getAddress(exact), diff: [] };
  }

  const similar = knownRecipients.find((k) => isLookAlike(to, k));
  if (similar) {
    const diff = diffPositions(similar, to);
    return {
      risk: "high",
      kind: "look-alike",
      reasons: [
        `This address starts and ends like ${shortAddr(similar.toLowerCase())}, which you sent to before, but ${diff.length} characters in the middle are different. This is how address poisoning works.`,
      ],
      match: getAddress(similar),
      diff,
    };
  }

  return {
    risk: "medium",
    kind: "new",
    reasons: ["First time sending to this address. Confirm every character with the person through another channel."],
    diff: [],
  };
}

export type GasReserve = { ok: boolean; shortfallWei: bigint };

/** A transfer needs the amount plus the maximum network fee; the fee is paid in AVAX on top. */
export function checkGasReserve(balanceWei: bigint, valueWei: bigint, maxFeeWei: bigint): GasReserve {
  const need = valueWei + maxFeeWei;
  return need <= balanceWei ? { ok: true, shortfallWei: 0n } : { ok: false, shortfallWei: need - balanceWei };
}

/**
 * The most a sent transaction could pay in fees: its gas limit × the max fee per gas the wallet signed
 * (EIP-1559), or × the gas price for a legacy transaction. Null when the price is unknown.
 */
export function signedFeeCeiling(tx: { gas: bigint; maxFeePerGas?: bigint | null; gasPrice?: bigint | null }): bigint | null {
  const price = tx.maxFeePerGas ?? tx.gasPrice;
  return price == null ? null : tx.gas * price;
}

/** Split an effective gas price into base fee and priority tip (tip never below zero). */
export function splitGasPrice(effectiveGasPrice: bigint, baseFeePerGas: bigint | null | undefined) {
  if (baseFeePerGas == null) return { baseFee: null, tip: null };
  const tip = effectiveGasPrice > baseFeePerGas ? effectiveGasPrice - baseFeePerGas : 0n;
  return { baseFee: baseFeePerGas, tip };
}
