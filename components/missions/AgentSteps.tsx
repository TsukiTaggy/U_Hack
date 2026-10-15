import type { Step } from "./types";

const shorten = (v: string) => (v.length > 14 ? `${v.slice(0, 6)}…${v.slice(-4)}` : v);

const labels: Record<string, string> = {
  get_balance: "Read wallet balance",
  get_transaction: "Read transaction on Fuji",
  get_recent_transactions: "Listed this session's transactions",
  get_allowance: "Checked token approval",
  decode_call: "Decoded transaction data",
  get_mission_status: "Checked mission progress",
};

/** The coach agent's tool calls, shown so learners (and judges) can see it reading real chain data. */
export function AgentSteps({ steps }: { steps: Step[] }) {
  if (!steps.length) return null;
  return (
    <ol className="space-y-1.5 rounded-2xl bg-zinc-50 p-3 text-xs dark:bg-zinc-900/40" aria-label="Coach agent steps">
      {steps.map((s, i) => (
        <li key={i} className="flex gap-2">
          <span className={s.ok ? "text-[var(--success)]" : "text-[var(--warning)]"} aria-hidden="true">
            {s.ok ? "✓" : "!"}
          </span>
          <span className="min-w-0">
            <span className="font-medium">{labels[s.tool] ?? s.tool}</span>{" "}
            <span className="font-mono text-[var(--text-muted)]">{Object.values(s.args).map(String).map(shorten).join(", ")}</span>
            {!s.ok && <span className="block text-[var(--text-muted)]">This read failed.</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}
