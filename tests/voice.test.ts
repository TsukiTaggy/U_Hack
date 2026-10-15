import { describe, expect, it } from "vitest";
import { getElevenLabsSignedUrl } from "../lib/elevenlabs";
import { appendVoiceMessage } from "../lib/voice";

describe("appendVoiceMessage", () => {
  it("maps learner and agent speech into the scam evaluator transcript", () => {
    const learner = appendVoiceMessage([], { source: "user", message: "I will verify in Core." });
    const transcript = appendVoiceMessage(learner, { source: "ai", message: "Act now." });

    expect(transcript).toEqual([
      { role: "learner", text: "I will verify in Core." },
      { role: "scammer", text: "Act now." },
    ]);
  });

  it("ignores empty, unknown, and repeated events", () => {
    const initial = [{ role: "learner" as const, text: "No." }];

    expect(appendVoiceMessage(initial, { source: "user", message: "No." })).toBe(initial);
    expect(appendVoiceMessage(initial, { source: "debug", message: "trace" })).toBe(initial);
    expect(appendVoiceMessage(initial, { source: "ai", message: "   " })).toBe(initial);
  });
});

describe("getElevenLabsSignedUrl", () => {
  it("returns a signed URL without exposing the API key to the caller", async () => {
    const signedUrl = await getElevenLabsSignedUrl(
      { apiKey: "server-secret", agentId: "agent_test" },
      async (input, init) => {
        expect(String(input)).toBe(
          "https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=agent_test",
        );
        expect(new Headers(init?.headers).get("xi-api-key")).toBe("server-secret");
        return Response.json({ signed_url: "wss://api.elevenlabs.io/conversation?signed=yes" });
      },
    );

    expect(signedUrl).toBe("wss://api.elevenlabs.io/conversation?signed=yes");
  });

  it("fails closed when ElevenLabs does not return a signed URL", async () => {
    await expect(
      getElevenLabsSignedUrl(
        { apiKey: "server-secret", agentId: "agent_test" },
        async () => Response.json({ detail: "denied" }, { status: 403 }),
      ),
    ).rejects.toThrow("ElevenLabs voice session is unavailable.");
  });
});
