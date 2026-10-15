import { createHmac, timingSafeEqual } from "node:crypto";

// Server only. Signed proof that a mission check passed, so the browser can hold progress
// without a database. Never import this from a client component.

export type MissionId = "1" | "2" | "3" | "4" | "5";

export type PassReceipt = {
  address: string;
  missionId: MissionId;
  passedAt: number;
  evidence: string;
  sig: string;
};

function secret(): string {
  const s = process.env.RECEIPT_SECRET;
  if (!s || s.length < 16) throw new Error("RECEIPT_SECRET is missing or too short.");
  return s;
}

function payload(r: Omit<PassReceipt, "sig">): string {
  return [r.address.toLowerCase(), r.missionId, String(r.passedAt), r.evidence].join("|");
}

export function signReceipt(address: string, missionId: MissionId, evidence = "", key = secret()): PassReceipt {
  const base = { address: address.toLowerCase(), missionId, passedAt: Date.now(), evidence };
  const sig = createHmac("sha256", key).update(payload(base)).digest("hex");
  return { ...base, sig };
}

export function verifyReceipt(r: unknown, key = secret()): r is PassReceipt {
  if (!r || typeof r !== "object") return false;
  const x = r as Record<string, unknown>;
  if (typeof x.address !== "string" || typeof x.missionId !== "string" || typeof x.passedAt !== "number" || typeof x.evidence !== "string" || typeof x.sig !== "string") {
    return false;
  }
  const expected = createHmac("sha256", key)
    .update(payload({ address: x.address, missionId: x.missionId as MissionId, passedAt: x.passedAt, evidence: x.evidence }))
    .digest();
  const given = Buffer.from(x.sig, "hex");
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/** Find a valid receipt for this address and mission. */
export function findReceipt(receipts: unknown, address: string, missionId: MissionId, key = secret()): PassReceipt | null {
  if (!Array.isArray(receipts)) return null;
  for (const r of receipts) {
    if (verifyReceipt(r, key) && r.address === address.toLowerCase() && r.missionId === missionId) return r;
  }
  return null;
}
