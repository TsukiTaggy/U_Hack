import { decodeFunctionData, formatEther, formatUnits, maxUint256, type Address, type Hex } from "viem";
import type { ChatCompletionFunctionTool } from "openai/resources/chat/completions";
import { publicClient } from "./chain";
import { addresses } from "./config";
import { certAbi, fakeAirdropAbi, testUsdcAbi } from "./abi";
import { getTxFacts, parseAddress, parseHash } from "./verify";
import type { ToolHandler } from "./llm";

// Read-only tools for the AI coach agent. Nothing here can sign or send a transaction.

const fn = (name: string, description: string, properties: Record<string, unknown>, required: string[]): ChatCompletionFunctionTool => ({
  type: "function",
  function: { name, description, parameters: { type: "object", properties, required } },
});

const addressParam = { type: "string", description: "0x-prefixed wallet address" };

export const coachTools: ChatCompletionFunctionTool[] = [
  fn("get_balance", "Get the AVAX and tUSDC balance of an address on Avalanche Fuji.", { address: addressParam }, ["address"]),
  fn("get_transaction", "Get facts about one transaction: from, to, value, status and fee paid.", { hash: { type: "string", description: "0x-prefixed transaction hash" } }, ["hash"]),
  fn("get_recent_transactions", "List the transactions this learner sent in the app during this session.", {}, []),
  fn("get_allowance", "How many tUSDC a spender contract is allowed to take from an owner.", { owner: addressParam, spender: addressParam }, ["owner", "spender"]),
  fn("decode_call", "Decode transaction data into a function name and arguments, with a rule-based risk level.", { to: addressParam, data: { type: "string", description: "0x-prefixed calldata" } }, ["to", "data"]),
  fn("get_mission_status", "Get on-chain facts used by the missions for an address.", { address: addressParam }, ["address"]),
];

const fmtToken = (v: bigint) => (v === maxUint256 ? "UNLIMITED" : formatUnits(v, 18));

export type RiskLevel = "low" | "medium" | "high";

/** Rule-based risk for a decoded call. The AI explains this; it never sets it. */
export function assessCall(functionName: string, args: readonly unknown[], to: string): { risk: RiskLevel; reasons: string[] } {
  const reasons: string[] = [];
  let risk: RiskLevel = "low";
  if (functionName === "approve") {
    const amount = args[1] as bigint;
    risk = "medium";
    reasons.push("Gives another address permission to spend your tokens.");
    if (amount === maxUint256 || amount > 10n ** 30n) {
      risk = "high";
      reasons.push("The permission is unlimited.");
    }
    if (addresses.fakeAirdrop && String(args[0]).toLowerCase() === addresses.fakeAirdrop.toLowerCase()) {
      risk = "high";
      reasons.push("The spender is the known suspicious airdrop contract.");
    }
  }
  if (addresses.fakeAirdrop && to.toLowerCase() === addresses.fakeAirdrop.toLowerCase()) {
    risk = "high";
    reasons.push("You are calling the known suspicious airdrop contract.");
  }
  return { risk, reasons };
}

export function decodeCall(to: Address, data: Hex) {
  for (const abi of [testUsdcAbi, fakeAirdropAbi, certAbi]) {
    try {
      const decoded = decodeFunctionData({ abi, data });
      const args = (decoded.args ?? []) as readonly unknown[];
      return {
        function: decoded.functionName,
        args: args.map((a) => (typeof a === "bigint" ? fmtToken(a) : String(a))),
        ...assessCall(decoded.functionName, args, to),
      };
    } catch {
      // try next ABI
    }
  }
  return { function: "unknown", args: [], risk: "medium" as RiskLevel, reasons: ["Unknown function. Be careful signing calls you cannot read."] };
}

/** Handlers bound to one learner session. `sessionHashes` are tx hashes the browser says it sent. */
export function coachHandlers(sessionHashes: string[]): Record<string, ToolHandler> {
  const need = <T>(v: T | null, what: string): T => {
    if (v === null) throw new Error(`Invalid ${what}`);
    return v;
  };

  return {
    async get_balance(args) {
      const address = need(parseAddress(args.address), "address");
      const avax = await publicClient.getBalance({ address });
      const tusdc = addresses.tusdc
        ? await publicClient.readContract({ address: addresses.tusdc, abi: testUsdcAbi, functionName: "balanceOf", args: [address] })
        : null;
      return { address, avax: formatEther(avax), tusdc: tusdc === null ? "n/a" : fmtToken(tusdc) };
    },

    async get_transaction(args) {
      const hash = need(parseHash(args.hash), "transaction hash");
      const f = await getTxFacts(hash);
      return { hash, from: f.from, to: f.to, valueAvax: formatEther(f.value), status: f.status, feeAvax: formatEther(f.feeWei) };
    },

    async get_recent_transactions() {
      const hashes = sessionHashes.map(parseHash).filter((h) => h !== null).slice(-10);
      const out = [];
      for (const hash of hashes) {
        try {
          const f = await getTxFacts(hash);
          out.push({ hash, to: f.to, valueAvax: formatEther(f.value), status: f.status, feeAvax: formatEther(f.feeWei) });
        } catch {
          out.push({ hash, status: "not found yet" });
        }
      }
      return { transactions: out };
    },

    async get_allowance(args) {
      const owner = need(parseAddress(args.owner), "owner");
      const spender = need(parseAddress(args.spender), "spender");
      if (!addresses.tusdc) throw new Error("tUSDC contract not configured");
      const v = await publicClient.readContract({ address: addresses.tusdc, abi: testUsdcAbi, functionName: "allowance", args: [owner, spender] });
      return { owner, spender, allowance: fmtToken(v) };
    },

    async decode_call(args) {
      const to = need(parseAddress(args.to), "to");
      const data = typeof args.data === "string" && args.data.startsWith("0x") ? (args.data as Hex) : null;
      return decodeCall(to, need(data, "data"));
    },

    async get_mission_status(args) {
      const address = need(parseAddress(args.address), "address");
      const avax = await publicClient.getBalance({ address });
      const facts: Record<string, string> = { avax: formatEther(avax) };
      if (addresses.tusdc && addresses.fakeAirdrop) {
        const a = await publicClient.readContract({ address: addresses.tusdc, abi: testUsdcAbi, functionName: "allowance", args: [address, addresses.fakeAirdrop] });
        facts.allowanceToSuspiciousAirdrop = fmtToken(a);
      }
      if (addresses.cert) {
        const c = await publicClient.readContract({ address: addresses.cert, abi: certAbi, functionName: "balanceOf", args: [address] });
        facts.certificates = c.toString();
      }
      return facts;
    },
  };
}
