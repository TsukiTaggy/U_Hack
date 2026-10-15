import { describe, expect, it } from "vitest";
import { parseEther, type Address, type Hash } from "viem";
import { checkMission1, checkMission2, checkMission3, checkMission4, checkMission5, looksLikeSecret } from "../lib/verify";

const learner = "0x1111111111111111111111111111111111111111" as Address;
const tutor = "0x2222222222222222222222222222222222222222" as Address;
const hash = `0x${"ab".repeat(32)}` as Hash;
const okEval = { sharedSecret: false, followedLink: false, verifiedViaOfficialChannel: true, tacticsSeen: ["urgency"], feedback: "Good." };

describe("mission 1", () => {
  it("passes when no secret or link", () => {
    expect(checkMission1(okEval, ["No thanks, I'll check in the official app."]).passed).toBe(true);
  });
  it("fails when the evaluator says a secret was shared", () => {
    expect(checkMission1({ ...okEval, sharedSecret: true }, ["ok"]).passed).toBe(false);
  });
  it("fails when the evaluator says the link was followed", () => {
    expect(checkMission1({ ...okEval, followedLink: true }, ["ok"]).passed).toBe(false);
  });
  it("fails closed when the learner typed a seed phrase, even if the evaluator missed it", () => {
    const phrase = "apple river tiger cloud lemon stone paper green house music orange sugar";
    expect(checkMission1(okEval, [phrase]).passed).toBe(false);
  });
});

describe("looksLikeSecret", () => {
  it("detects 12-word phrases and private keys", () => {
    expect(looksLikeSecret("apple river tiger cloud lemon stone paper green house music orange sugar")).toBe(true);
    expect(looksLikeSecret(`my key is 0x${"a1".repeat(32)}`)).toBe(true);
  });
  it("ignores normal replies", () => {
    expect(looksLikeSecret("No, I will not share my recovery phrase with you.")).toBe(false);
    expect(looksLikeSecret("who are you")).toBe(false);
  });
});

describe("mission 2", () => {
  it("needs a positive balance", () => {
    expect(checkMission2(0n).passed).toBe(false);
    expect(checkMission2(1n).passed).toBe(true);
  });
});

describe("mission 3", () => {
  const base = { hash, from: learner, to: tutor, value: parseEther("0.01"), status: "success" as const };
  it("passes for a successful 0.01 AVAX tx to the tutor", () => {
    const r = checkMission3(base, learner, tutor);
    expect(r.passed).toBe(true);
    expect(r.evidence).toBe(hash);
  });
  it("is case-insensitive on addresses", () => {
    expect(checkMission3({ ...base, to: tutor.toLowerCase() as Address }, learner, tutor).passed).toBe(true);
  });
  it("fails for a decoy address, a different sender, a failed tx or too little value", () => {
    expect(checkMission3({ ...base, to: "0x2222222222222222222222222222222222222223" }, learner, tutor).passed).toBe(false);
    expect(checkMission3({ ...base, from: tutor }, learner, tutor).passed).toBe(false);
    expect(checkMission3({ ...base, status: "reverted" }, learner, tutor).passed).toBe(false);
    expect(checkMission3({ ...base, value: parseEther("0.009") }, learner, tutor).passed).toBe(false);
    expect(checkMission3({ ...base, to: null }, learner, tutor).passed).toBe(false);
  });
});

describe("mission 4", () => {
  const fee = 52_500_000_000_000n; // 0.0000525 AVAX
  it("accepts the exact fee and within 1%", () => {
    expect(checkMission4(0.0000525, fee).passed).toBe(true);
    expect(checkMission4(0.000053, fee).passed).toBe(true);
  });
  it("rejects wrong or invalid answers", () => {
    expect(checkMission4(0.01, fee).passed).toBe(false);
    expect(checkMission4(Number.NaN, fee).passed).toBe(false);
    expect(checkMission4(-1, fee).passed).toBe(false);
  });
});

describe("mission 5", () => {
  it("requires the trap to be started and allowance to be zero", () => {
    expect(checkMission5(false, 0n).passed).toBe(false);
    expect(checkMission5(true, 5n).passed).toBe(false);
    expect(checkMission5(true, 0n).passed).toBe(true);
  });
});
