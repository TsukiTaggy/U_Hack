import { describe, expect, it } from "vitest";
import { getPersona, parseTranscript, transcriptText } from "../lib/scam";

describe("scam helpers", () => {
  it("loads personas", () => {
    expect(getPersona("wallet-support")?.name).toContain("Alex");
    expect(getPersona("nope")).toBeNull();
  });
  it("validates transcripts", () => {
    expect(parseTranscript([{ role: "scammer", text: "hi" }, { role: "learner", text: "no" }])).toHaveLength(2);
    expect(parseTranscript([{ role: "admin", text: "x" }])).toBeNull();
    expect(parseTranscript("x")).toBeNull();
    expect(parseTranscript(Array.from({ length: 41 }, () => ({ role: "learner", text: "a" })))).toBeNull();
  });
  it("labels speakers", () => {
    expect(transcriptText([{ role: "scammer", text: "hi" }, { role: "learner", text: "no" }])).toBe("CALLER: hi\nLEARNER: no");
  });
});
