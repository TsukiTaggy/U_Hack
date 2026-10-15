"use client";

import { createWalletClient, custom, type Address, type EIP1193Provider, type Hash, type WalletClient } from "viem";
import { avalancheFuji } from "viem/chains";
import { FUJI_CHAIN_ID } from "./config";

// Browser wallet layer: the learner must connect an injected Core wallet on Fuji.

export type Wallet = { kind: "injected"; address: Address; client: WalletClient };

type EIP6963ProviderDetail = {
  info: { rdns: string };
  provider: EIP1193Provider;
};

export type CoreProviderTarget = {
  avalanche?: EIP1193Provider;
  addEventListener: (type: string, listener: EventListener) => void;
  removeEventListener: (type: string, listener: EventListener) => void;
  dispatchEvent: (event: Event) => boolean;
};

declare global {
  interface Window {
    avalanche?: EIP1193Provider;
    ethereum?: EIP1193Provider;
  }
}

export function detectCoreProvider(target: CoreProviderTarget = window): EIP1193Provider | undefined {
  let announced: EIP1193Provider | undefined;
  const onAnnouncement: EventListener = (event) => {
    const detail = (event as CustomEvent<EIP6963ProviderDetail>).detail;
    if (detail?.info.rdns === "app.core.extension") announced = detail.provider;
  };

  target.addEventListener("eip6963:announceProvider", onAnnouncement);
  target.dispatchEvent(new Event("eip6963:requestProvider"));
  target.removeEventListener("eip6963:announceProvider", onAnnouncement);
  return announced ?? target.avalanche;
}

export async function connectCore(): Promise<Wallet> {
  const provider = detectCoreProvider();
  if (!provider) throw new Error("No Core wallet found. Install or unlock Core Extension, then try again.");
  const client = createWalletClient({ chain: avalancheFuji, transport: custom(provider) });
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

export async function walletChainId(wallet: Wallet): Promise<number> {
  return wallet.client.getChainId();
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
