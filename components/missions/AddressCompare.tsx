/** Two full addresses one above the other, with the differing characters highlighted. */
export function AddressCompare({
  a,
  aLabel,
  b,
  bLabel,
  diff,
}: {
  a: string;
  aLabel: string;
  b: string;
  bLabel: string;
  diff: number[];
}) {
  const marked = new Set(diff.map((i) => i + 2)); // positions are counted after "0x"
  const row = (value: string, label: string) => (
    <div className="space-y-1">
      <p className="text-xs font-medium text-[var(--text-muted)]">{label}</p>
      <p className="break-all font-mono text-sm leading-relaxed">
        {value.toLowerCase().split("").map((ch, i) => (
          <span key={i} className={marked.has(i) ? "rounded-sm bg-[var(--danger-soft)] font-bold text-[var(--avalanche-red)]" : ""}>
            {ch}
          </span>
        ))}
      </p>
    </div>
  );

  return (
    <div className="space-y-3 rounded-2xl border border-[var(--border-subtle)] p-4">
      {row(a, aLabel)}
      {row(b, bLabel)}
      <p className="text-xs text-[var(--text-muted)]">
        {diff.length} character{diff.length === 1 ? "" : "s"} differ. The first and last characters match, which is why a shortened address looks the same.
      </p>
    </div>
  );
}
