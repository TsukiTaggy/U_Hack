"use client";

import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { useCallback, useRef, useState } from "react";
import { appendVoiceMessage, type VoiceTurn } from "@/lib/voice";

type Props = {
  disabled: boolean;
  onActiveChange: (active: boolean) => void;
  onFallback: (message: string) => void;
  onFinish: (turns: VoiceTurn[]) => void | Promise<void>;
  onTranscriptChange: (turns: VoiceTurn[]) => void;
};

const primaryButton = "rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900";

function VoicePracticeCallInner({ disabled, onActiveChange, onFallback, onFinish, onTranscriptChange }: Props) {
  const transcript = useRef<VoiceTurn[]>([]);
  const started = useRef(false);
  const finished = useRef(false);
  const [error, setError] = useState("");

  const finish = useCallback(() => {
    if (!started.current || finished.current) return;
    finished.current = true;
    started.current = false;
    onActiveChange(false);
    if (transcript.current.length < 2) {
      onFallback("Voice call ended before enough speech was captured.");
      return;
    }
    void onFinish(transcript.current);
  }, [onActiveChange, onFallback, onFinish]);

  const conversation = useConversation({
    onMessage: (event) => {
      const next = appendVoiceMessage(transcript.current, event);
      if (next !== transcript.current) {
        transcript.current = next;
        onTranscriptChange(next);
      }
    },
    onDisconnect: finish,
    onError: (message) => {
      setError(message);
      onActiveChange(false);
      onFallback("Voice connection failed.");
    },
  });

  async function start() {
    setError("");
    transcript.current = [];
    onTranscriptChange([]);
    finished.current = false;

    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Microphone is unavailable in this browser.");
      const permission = await navigator.mediaDevices.getUserMedia({ audio: true });
      permission.getTracks().forEach((track) => track.stop());

      const response = await fetch("/api/elevenlabs/signed-url", { method: "POST" });
      const body = (await response.json().catch(() => ({}))) as { signedUrl?: string; error?: string };
      if (!response.ok || !body.signedUrl) throw new Error(body.error || "Voice practice is unavailable.");

      started.current = true;
      onActiveChange(true);
      conversation.startSession({ signedUrl: body.signedUrl, connectionType: "websocket" });
    } catch (err) {
      started.current = false;
      onActiveChange(false);
      const message = err instanceof Error ? err.message : "Voice practice is unavailable.";
      setError(message);
      onFallback(message);
    }
  }

  const active = conversation.status === "connecting" || conversation.status === "connected";
  const status = !active
    ? "Ready"
    : conversation.status === "connecting"
      ? "Connecting…"
      : conversation.isSpeaking
        ? "Caller speaking"
        : conversation.isListening
          ? "Listening"
          : "Connected";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {active ? (
          <button className={primaryButton} onClick={() => conversation.endSession()}>
            End voice call &amp; get feedback
          </button>
        ) : (
          <button className={primaryButton} disabled={disabled} onClick={() => void start()}>
            Start voice call
          </button>
        )}
        <span className="text-xs text-zinc-500">{status} · maximum 2 minutes</span>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default function VoicePracticeCall(props: Props) {
  return (
    <ConversationProvider>
      <VoicePracticeCallInner {...props} />
    </ConversationProvider>
  );
}
