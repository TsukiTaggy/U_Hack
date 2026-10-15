import { describe, expect, it } from "vitest";
import { findReceipt, signReceipt, verifyReceipt } from "../lib/receipt";

const key = "test-secret-that-is-long-enough";
const addr = "0xAbCdEf0000000000000000000000000000000001";

describe("receipts", () => {
  it("round-trips and normalises the address", () => {
    const r = signReceipt(addr, "3", "0xhash", key);
    expect(r.address).toBe(addr.toLowerCase());
    expect(verifyReceipt(r, key)).toBe(true);
  });
  it("rejects tampering and wrong keys", () => {
    const r = signReceipt(addr, "3", "0xhash", key);
    expect(verifyReceipt({ ...r, missionId: "4" }, key)).toBe(false);
    expect(verifyReceipt({ ...r, evidence: "0xother" }, key)).toBe(false);
    expect(verifyReceipt(r, "another-secret-that-is-long")).toBe(false);
    expect(verifyReceipt({ ...r, sig: "zz" }, key)).toBe(false);
    expect(verifyReceipt(null, key)).toBe(false);
  });
  it("finds a receipt only for the matching address and mission", () => {
    const list = [signReceipt(addr, "1", "", key), signReceipt(addr, "3", "0xhash", key)];
    expect(findReceipt(list, addr, "3", key)?.evidence).toBe("0xhash");
    expect(findReceipt(list, addr, "4", key)).toBeNull();
    expect(findReceipt(list, "0x0000000000000000000000000000000000000002", "1", key)).toBeNull();
    expect(findReceipt("not an array", addr, "1", key)).toBeNull();
  });
});
