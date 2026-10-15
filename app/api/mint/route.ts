import { errorMessage, fail, readJson } from "@/lib/api";
import { publicClient } from "@/lib/chain";
import { certAbi } from "@/lib/abi";
import { addresses, txUrl } from "@/lib/config";
import { minterClient } from "@/lib/minter";
import { findReceipt } from "@/lib/receipt";
import { parseAddress, parseHash, verifyMission2, verifyMission3 } from "@/lib/verify";

// Mints the non-transferable certificate after re-checking every mission.

export async function POST(request: Request) {
  const body = await readJson(request);
  const address = parseAddress(body.address);
  if (!address) return fail(400, "Connect a wallet first.");
  if (!addresses.cert || !addresses.tutor) return fail(500, "Contracts are not configured.");

  const r1 = findReceipt(body.receipts, address, "1");
  const r3 = findReceipt(body.receipts, address, "3");
  const r4 = findReceipt(body.receipts, address, "4");
  const r5 = findReceipt(body.receipts, address, "5");
  const missing = [!r1 && "1", !r3 && "3", !r4 && "4"].filter(Boolean);
  if (missing.length) return fail(400, `Finish mission ${missing.join(", ")} first.`);

  try {
    const m2 = await verifyMission2(address);
    if (!m2.passed) return fail(400, m2.reason);
    const hash3 = parseHash(r3!.evidence);
    if (!hash3) return fail(400, "Mission 3 receipt is invalid.");
    const m3 = await verifyMission3(address, hash3, addresses.tutor);
    if (!m3.passed) return fail(400, m3.reason);

    const owned = await publicClient.readContract({ address: addresses.cert, abi: certAbi, functionName: "balanceOf", args: [address] });
    if (owned > 0n) return fail(400, "This wallet already has a SafeStart certificate.");

    const level = r5 ? 2 : 1;
    const wallet = minterClient();
    const hash = await wallet.writeContract({ address: addresses.cert, abi: certAbi, functionName: "mint", args: [address, level] });
    await publicClient.waitForTransactionReceipt({ hash, timeout: 30_000 });
    return Response.json({ txHash: hash, explorer: txUrl(hash), level });
  } catch (err) {
    return fail(503, `Minting failed: ${errorMessage(err)}`);
  }
}
