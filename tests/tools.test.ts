import { describe, expect, it } from "vitest";
import { encodeFunctionData, maxUint256, parseUnits } from "viem";
import { testUsdcAbi } from "../lib/abi";
import { assessCall, decodeCall } from "../lib/tools";

const spender = "0x3333333333333333333333333333333333333333";
const token = "0x4444444444444444444444444444444444444444";

describe("transaction risk rules", () => {
  it("flags unlimited approvals as high risk", () => {
    const data = encodeFunctionData({ abi: testUsdcAbi, functionName: "approve", args: [spender, maxUint256] });
    const d = decodeCall(token, data);
    expect(d.function).toBe("approve");
    expect(d.risk).toBe("high");
    expect(d.args[1]).toBe("UNLIMITED");
  });
  it("rates a limited approval as medium", () => {
    expect(assessCall("approve", [spender, parseUnits("10", 18)], token).risk).toBe("medium");
  });
  it("treats unknown calldata as medium risk", () => {
    expect(decodeCall(token, "0xdeadbeef").risk).toBe("medium");
  });
});
