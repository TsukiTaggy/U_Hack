import { describe, expect, it } from "vitest";
import { getAddress } from "viem";
import { makeDecoys } from "@/lib/decoys";
import { assessRecipient, checkGasReserve, isLookAlike, splitGasPrice } from "@/lib/send";

const tutor = getAddress("0x1234567890abcdef1234567890abcdef12345678");
const stranger = getAddress("0x9999567890abcdef1234567890abcdef12340000");

describe("isLookAlike", () => {
  it("flags decoys that keep the first and last characters", () => {
    for (const decoy of makeDecoys(tutor, 3, 42)) expect(isLookAlike(decoy, tutor)).toBe(true);
  });

  it("does not flag the same address or an unrelated one", () => {
    expect(isLookAlike(tutor, tutor.toLowerCase())).toBe(false);
    expect(isLookAlike(stranger, tutor)).toBe(false);
  });
});

describe("assessRecipient", () => {
  it("is low risk for an address sent to before, ignoring case", () => {
    const r = assessRecipient(tutor.toLowerCase(), [tutor]);
    expect(r).toMatchObject({ risk: "low", kind: "known", match: tutor, diff: [] });
  });

  it("is high risk for a look-alike and reports the differing positions", () => {
    const [decoy] = makeDecoys(tutor, 1, 7);
    const r = assessRecipient(decoy, [tutor]);
    expect(r.risk).toBe("high");
    expect(r.kind).toBe("look-alike");
    expect(r.match).toBe(tutor);
    expect(r.diff.length).toBeGreaterThanOrEqual(1);
    expect(r.diff.every((i) => i >= 4 && i < 36)).toBe(true);
  });

  it("is medium risk for a first-time address", () => {
    expect(assessRecipient(stranger, [tutor])).toMatchObject({ risk: "medium", kind: "new" });
    expect(assessRecipient(stranger, [])).toMatchObject({ risk: "medium", kind: "new" });
  });
});

describe("checkGasReserve", () => {
  it("passes when the balance covers amount plus max fee", () => {
    expect(checkGasReserve(100n, 60n, 40n)).toEqual({ ok: true, shortfallWei: 0n });
  });

  it("reports the shortfall when sending everything leaves nothing for gas", () => {
    expect(checkGasReserve(100n, 100n, 7n)).toEqual({ ok: false, shortfallWei: 7n });
  });
});

describe("splitGasPrice", () => {
  it("splits effective price into base fee and tip", () => {
    expect(splitGasPrice(30n, 25n)).toEqual({ baseFee: 25n, tip: 5n });
    expect(splitGasPrice(20n, 25n)).toEqual({ baseFee: 25n, tip: 0n });
    expect(splitGasPrice(20n, null)).toEqual({ baseFee: null, tip: null });
  });
});
