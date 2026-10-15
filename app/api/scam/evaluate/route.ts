import { errorMessage, fail, readJson } from "@/lib/api";
import { chatJSON, untrusted } from "@/lib/llm";
import { signReceipt } from "@/lib/receipt";
import { evaluatorSystemPrompt, parseTranscript, transcriptText } from "@/lib/scam";
import { checkMission1, parseAddress, scamEvaluationSchema } from "@/lib/verify";
import { FUJI_CHAIN_ID } from "@/lib/config";

// Mission 1: an AI evaluator scores the practice call; deterministic code decides the pass.

export async function POST(request: Request) {
  const body = await readJson(request);
  const address = parseAddress(body.address);
  const transcript = parseTranscript(body.transcript);
  if (!address) return fail(400, "Connect a wallet first.");
  if (!transcript || !transcript.some((t) => t.role === "learner")) return fail(400, "Talk to the caller first.");
  if (Number(body.chainId) !== FUJI_CHAIN_ID) {
    return Response.json({ passed: false, reason: "Switch your wallet to Avalanche Fuji (chain ID 43113) first." });
  }

  try {
    const { data: evaluation } = await chatJSON(
      [
        { role: "system", content: evaluatorSystemPrompt() },
        { role: "user", content: untrusted("transcript", transcriptText(transcript)) },
      ],
      scamEvaluationSchema,
    );
    const learnerMessages = transcript.filter((t) => t.role === "learner").map((t) => t.text);
    const result = checkMission1(evaluation, learnerMessages);
    return Response.json({ ...result, evaluation, receipt: result.passed ? signReceipt(address, "1") : undefined });
  } catch (err) {
    // Fail closed: no evaluation means no pass.
    return fail(503, `Could not evaluate the call. Please try again. (${errorMessage(err)})`);
  }
}
