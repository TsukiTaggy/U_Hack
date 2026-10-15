import { formatEther, parseEther } from "viem";
import { clientIp, errorMessage, fail, rateLimited, readJson } from "@/lib/api";
import { publicClient } from "@/lib/chain";
import { minterClient } from "@/lib/minter";
import { parseAddress } from "@/lib/verify";
import { txUrl } from "@/lib/config";

// Sends a small amount of test AVAX to a guest wallet so judges can play without a faucet sign-up.

const TOP_UP = parseEther("0.05");
const ONLY_BELOW = parseEther("0.02");

export async function POST(request: Request) {
  const body = await readJson(request);
  const address = parseAddress(body.address);
  if (!address) return fail(400, "Invalid address.");
  if (rateLimited(`topup:${clientIp(request)}`, 5, 60 * 60_000)) return fail(429, "Too many top-ups from this network. Try the Avalanche faucet.");
  if (rateLimited(`topup:${address}`, 2, 60 * 60_000)) return fail(429, "This wallet was topped up recently.");

  try {
    const balance = await publicClient.getBalance({ address });
    if (balance >= ONLY_BELOW) {
      return fail(400, `This wallet already has ${formatEther(balance)} AVAX. Top-ups are only for wallets below ${formatEther(ONLY_BELOW)}.`);
    }
    const wallet = minterClient();
    const hash = await wallet.sendTransaction({ to: address, value: TOP_UP });
    await publicClient.waitForTransactionReceipt({ hash, timeout: 30_000 });
    return Response.json({ txHash: hash, explorer: txUrl(hash), amountAvax: formatEther(TOP_UP) });
  } catch (err) {
    return fail(503, `Top-up failed: ${errorMessage(err)}`);
  }
}
