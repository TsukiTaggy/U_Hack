type ElevenLabsConfig = { apiKey: string; agentId: string };
type Fetcher = typeof fetch;

export async function getElevenLabsSignedUrl(
  config: ElevenLabsConfig,
  fetcher: Fetcher = fetch,
): Promise<string> {
  const url = new URL("https://api.elevenlabs.io/v1/convai/conversation/get-signed-url");
  url.searchParams.set("agent_id", config.agentId);
  const response = await fetcher(url, {
    headers: { "xi-api-key": config.apiKey },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error("ElevenLabs voice session is unavailable.");

  const body = (await response.json()) as { signed_url?: unknown };
  if (typeof body.signed_url !== "string" || !body.signed_url.startsWith("wss://")) {
    throw new Error("ElevenLabs voice session is unavailable.");
  }
  return body.signed_url;
}
