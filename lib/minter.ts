import { createWalletClient, http, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { avalancheFuji } from "viem/chains";
import { FUJI_RPC_URL } from "./config";

// Server only. The team wallet that deploys contracts and can mint certificates.
// Testnet only — never put a key that holds real funds here.

export function minterClient() {
  const key = process.env.MINTER_PRIVATE_KEY;
  if (!key) throw new Error("MINTER_PRIVATE_KEY is not set.");
  const account = privateKeyToAccount((key.startsWith("0x") ? key : `0x${key}`) as Hex);
  return createWalletClient({ account, chain: avalancheFuji, transport: http(FUJI_RPC_URL) });
}
