import type { Address } from "viem";
import { short } from "./types";
import { btnChip, eyebrow } from "./ui";

export type HistoryItem = { id: string; direction: "in" | "out"; amount: string; address: Address; when: string };

/**
 * A simulated wallet activity list. Addresses are shortened the way real wallets show them,
 * which is exactly what address poisoning exploits.
 */
export function WalletHistory({
  items,
  onUse,
  disabled,
}: {
  items: HistoryItem[];
  onUse: (address: Address) => void;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)]">
      <div className="space-y-0.5 border-b border-[var(--border-subtle)] px-4 py-3">
        <p className={eyebrow}>Recent activity</p>
        <p className="text-xs text-[var(--text-muted)]">Practice scenario · not real transactions</p>
      </div>
      <ul className="divide-y divide-[var(--border-subtle)]">
        {items.map((item) => (
          <li key={item.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
                item.direction === "out" ? "bg-zinc-100 dark:bg-zinc-900" : "bg-[var(--success-soft)] text-[var(--success)]"
              }`}
              aria-hidden="true"
            >
              {item.direction === "out" ? "↑" : "↓"}
            </span>
            <div className="min-w-[10rem] flex-1">
              <p className="whitespace-nowrap text-sm font-medium">
                {item.direction === "out" ? "Sent" : "Received"} {item.amount}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {item.direction === "out" ? "To" : "From"} <span className="font-mono">{short(item.address.toLowerCase())}</span> · {item.when}
              </p>
            </div>
            <button type="button" className={`${btnChip} shrink-0`} disabled={disabled} onClick={() => onUse(item.address)}>
              Copy address
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
