import { getAddress, type Address } from "viem";

const HEX = "0123456789abcdef";

// Small deterministic PRNG so tests (and a given learner) get stable decoys.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Look-alike addresses for mission 3 (address poisoning).
 * Keeps the first 6 and last 4 hex characters identical and changes 2–4 characters in the middle,
 * which is what real address-poisoning attacks rely on.
 */
export function makeDecoys(target: Address, count = 2, seed = 1): Address[] {
  const body = target.slice(2).toLowerCase();
  const rand = mulberry32(seed);
  const result: Address[] = [];
  const seen = new Set<string>([body]);
  let guard = 0;

  while (result.length < count && guard++ < 1000) {
    const chars = body.split("");
    const changes = 2 + Math.floor(rand() * 3); // 2..4
    for (let i = 0; i < changes; i++) {
      const pos = 6 + Math.floor(rand() * (40 - 6 - 4)); // index 6..35
      let next = chars[pos];
      while (next === chars[pos]) next = HEX[Math.floor(rand() * 16)];
      chars[pos] = next;
    }
    const candidate = chars.join("");
    if (!seen.has(candidate)) {
      seen.add(candidate);
      result.push(getAddress(`0x${candidate}`));
    }
  }
  return result;
}

/** Positions (0-based, after "0x") where two addresses differ, for the coach to point at. */
export function diffPositions(a: string, b: string): number[] {
  const x = a.slice(2).toLowerCase();
  const y = b.slice(2).toLowerCase();
  const out: number[] = [];
  for (let i = 0; i < Math.max(x.length, y.length); i++) if (x[i] !== y[i]) out.push(i);
  return out;
}

/** Shuffle the correct address in among the decoys, deterministically. */
export function addressChoices(target: Address, seed = 1): Address[] {
  const all = [getAddress(target), ...makeDecoys(target, 2, seed)];
  const rand = mulberry32(seed + 7);
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all;
}

/** Stable numeric seed from a learner address. */
export function seedFromAddress(address: string): number {
  let h = 2166136261;
  for (const c of address.toLowerCase()) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
