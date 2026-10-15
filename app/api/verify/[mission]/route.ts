import { errorMessage, fail, readJson } from "@/lib/api";
import { addresses } from "@/lib/config";
import { findReceipt, signReceipt } from "@/lib/receipt";
import { parseAddress, parseHash, verifyMission2, verifyMission3, verifyMission4 } from "@/lib/verify";

// Deterministic mission checks. Returns a signed pass receipt when a mission passes.
// Mission 1 is verified by /api/scam/evaluate; mission 5 is added in a later milestone.

export async function POST(request: Request, ctx: { params: Promise<{ mission: string }> }) {
  const { mission } = await ctx.params;
  const body = await readJson(request);
  const address = parseAddress(body.address);
  if (!address) return fail(400, "Connect a wallet first.");

  try {
    if (mission === "2") {
      const result = await verifyMission2(address);
      return Response.json({ ...result, receipt: result.passed ? signReceipt(address, "2") : undefined });
    }

    if (mission === "3") {
      const hash = parseHash(body.txHash);
      if (!hash) return fail(400, "Missing transaction hash.");
      if (!addresses.tutor) return fail(500, "Tutor address is not configured.");
      const result = await verifyMission3(address, hash, addresses.tutor);
      return Response.json({ ...result, receipt: result.passed ? signReceipt(address, "3", hash) : undefined });
    }

    if (mission === "4") {
      const m3 = findReceipt(body.receipts, address, "3");
      const m3Hash = m3 ? parseHash(m3.evidence) : null;
      if (!m3 || !m3Hash) return fail(400, "Pass mission 3 first.");
      const answer = Number(body.answerAvax);
      if (!addresses.tutor) return fail(500, "Tutor address is not configured.");
      const result = await verifyMission4(address, m3Hash, answer, addresses.tutor);
      return Response.json({ ...result, receipt: result.passed ? signReceipt(address, "4", m3.evidence) : undefined });
    }

    return fail(404, `Unknown mission ${mission}.`);
  } catch (err) {
    return fail(503, `Could not check the chain right now: ${errorMessage(err)}`);
  }
}
