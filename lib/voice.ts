export type VoiceTurn = { role: "scammer" | "learner"; text: string };
export type VoiceMessage = { source?: string; message?: string };

export function appendVoiceMessage(turns: VoiceTurn[], event: VoiceMessage): VoiceTurn[] {
  const role = event.source === "user" ? "learner" : event.source === "ai" ? "scammer" : undefined;
  const text = event.message?.trim();
  if (!role || !text) return turns;

  const last = turns.at(-1);
  if (last?.role === role && last.text === text) return turns;
  return [...turns, { role, text }];
}
