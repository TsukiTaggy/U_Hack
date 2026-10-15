import { clientIp, fail, rateLimited } from "@/lib/api";
import { getElevenLabsSignedUrl } from "@/lib/elevenlabs";

export async function POST(request: Request) {
  if (rateLimited(`elevenlabs:${clientIp(request)}`, 10, 60_000)) {
    return fail(429, "Too many voice session requests.");
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
  if (!apiKey || !agentId) return fail(503, "Voice practice is not configured.");

  try {
    const signedUrl = await getElevenLabsSignedUrl({ apiKey, agentId });
    return Response.json(
      { signedUrl },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return fail(503, "Voice practice is unavailable right now.");
  }
}
