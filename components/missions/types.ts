export type Receipt = { address: string; missionId: string; passedAt: number; evidence: string; sig: string };
export type Lang = "en" | "th";
export type Step = { tool: string; args: Record<string, unknown>; ok: boolean; summary: string };
export type CheckResponse = { passed: boolean; reason: string; receipt?: Receipt };

/** Fee estimate taken before signing, kept per transaction hash for mission 4. */
export type FeeEstimate = { gas: string; maxFeePerGas: string; maxFeeWei: string };

export async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  return data as T;
}

export const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
