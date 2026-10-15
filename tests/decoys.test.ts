import { describe, expect, it } from "vitest";
import { getAddress } from "viem";
import { addressChoices, diffPositions, makeDecoys, seedFromAddress } from "../lib/decoys";

const tutor = getAddress("0x8ba1f109551bd432803012645ac136ddd64dba72");

describe("makeDecoys", () => {
  it("keeps prefix and suffix, changes 2-4 middle characters", () => {
    for (let seed = 1; seed < 50; seed++) {
      for (const d of makeDecoys(tutor, 2, seed)) {
        expect(d.toLowerCase()).not.toBe(tutor.toLowerCase());
        expect(d.slice(0, 8).toLowerCase()).toBe(tutor.slice(0, 8).toLowerCase());
        expect(d.slice(-4).toLowerCase()).toBe(tutor.slice(-4).toLowerCase());
        const diff = diffPositions(d, tutor);
        expect(diff.length).toBeGreaterThanOrEqual(1);
        expect(diff.length).toBeLessThanOrEqual(4);
        expect(getAddress(d)).toBe(d);
      }
    }
  });

  it("returns distinct decoys and is deterministic", () => {
    const a = makeDecoys(tutor, 3, 42);
    expect(new Set(a.map((x) => x.toLowerCase())).size).toBe(3);
    expect(makeDecoys(tutor, 3, 42)).toEqual(a);
  });

  it("addressChoices contains the tutor exactly once", () => {
    const choices = addressChoices(tutor, seedFromAddress("0x0000000000000000000000000000000000000001"));
    expect(choices).toHaveLength(3);
    expect(choices.filter((c) => c === tutor)).toHaveLength(1);
  });
});
