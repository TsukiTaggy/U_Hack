import { isAddress, type Address } from "viem";

// Public configuration (safe for the browser). NEXT_PUBLIC_ values are inlined at build time,
// so each one must be referenced literally.

export const FUJI_CHAIN_ID = 43113;

export const FUJI_RPC_URL =
  process.env.NEXT_PUBLIC_FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc";

export const EXPLORER_URL = "https://explorer-test.avax.network/c-chain";

function addr(value: string | undefined): Address | undefined {
  return value && isAddress(value) ? value : undefined;
}

export const addresses = {
  tusdc: addr(process.env.NEXT_PUBLIC_TUSDC_ADDRESS),
  fakeAirdrop: addr(process.env.NEXT_PUBLIC_FAKE_AIRDROP_ADDRESS),
  cert: addr(process.env.NEXT_PUBLIC_CERT_ADDRESS),
  tutor: addr(process.env.NEXT_PUBLIC_TUTOR_ADDRESS),
};

export function requireAddress(name: keyof typeof addresses): Address {
  const value = addresses[name];
  if (!value) throw new Error(`Missing or invalid address for ${name}. Check .env.local / Vercel env vars.`);
  return value;
}

export const txUrl = (hash: string) => `${EXPLORER_URL}/tx/${hash}`;
export const addressUrl = (address: string) => `${EXPLORER_URL}/address/${address}`;
