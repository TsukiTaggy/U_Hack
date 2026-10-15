"use client";

import { createWalletClient, custom, http, type Address, type EIP1193Provider, type Hash, type WalletClient } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { avalancheFuji } from "viem/chains";
import { FUJI_CHAIN_ID, FUJI_RPC_URL } from "./config";

// Browser wallet layer: an injected wallet (Core / MetaMask) or a guest wallet whose key
// lives only in this browser's localStorage. Guest keys are never sent to the server.

export type WalletKind = "injected" | "guest";
export type Wallet = { kind: WalletKind; address: Address; client: WalletClient };

const GUEST_KEY = "safestart.guestKey";

declare global {
  interface Window {
    ethereum?: EIP1193Provider;
  }
}

export function hasInjectedWallet(): boolean {
  return typeof window !== "undefined" && !!window.ethereum;
}

export async function connectInjected(): Promise<Wallet> {
  if (!window.ethereum) throw new Error("No browser wallet found. Install Core or MetaMask, or use the guest wallet.");
  const client = createWalletClient({ chain: avalancheFuji, transport: custom(window.ethereum) });
  const [address] = await client.requestAddresses();
  await ensureFuji(client);
  return { kind: "injected", address, client };
}

async function ensureFuji(client: WalletClient) {
  if ((await client.getChainId()) === FUJI_CHAIN_ID) return;
  try {
    await client.switchChain({ id: FUJI_CHAIN_ID });
  } catch {
    await client.addChain({ chain: avalancheFuji });
    await client.switchChain({ id: FUJI_CHAIN_ID });
  }
}

export function loadOrCreateGuest(): Wallet {
  let key: `0x${string}` | null = null;
  try {
    const saved = localStorage.getItem(GUEST_KEY);
    if (saved && /^0x[0-9a-fA-F]{64}$/.test(saved)) key = saved as `0x${string}`;
  } catch {
    // storage unavailable: use a session-only key
  }
  if (!key) {
    key = generatePrivateKey();
    try {
      localStorage.setItem(GUEST_KEY, key);
    } catch {
      // ignore
    }
  }
  const account = privateKeyToAccount(key);
  const client = createWalletClient({ account, chain: avalancheFuji, transport: http(FUJI_RPC_URL) });
  return { kind: "guest", address: account.address, client };
}

export async function walletChainId(wallet: Wallet): Promise<number> {
  return wallet.kind === "guest" ? FUJI_CHAIN_ID : wallet.client.getChainId();
}

/** Send AVAX on Fuji only. viem throws if the wallet is on another chain. */
export async function sendAvax(wallet: Wallet, to: Address, value: bigint): Promise<Hash> {
  if ((await walletChainId(wallet)) !== FUJI_CHAIN_ID) await ensureFuji(wallet.client);
  return wallet.client.sendTransaction({
    account: wallet.client.account ?? wallet.address,
    chain: avalancheFuji,
    to,
    value,
  });
}
