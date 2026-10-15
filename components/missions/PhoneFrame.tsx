import type { ReactNode } from "react";

/** A dark chat/call screen, styled like the landing hero, so practice scenarios read as "on your phone". */
export function PhoneFrame({ name, status, children }: { name: string; status: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-black text-white">
      <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-sm font-semibold" aria-hidden="true">
          {name.slice(0, 1)}
        </span>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="text-xs text-zinc-400">{status}</p>
        </div>
      </div>
      <div className="space-y-2 px-4 py-4">{children}</div>
    </div>
  );
}

export function Bubble({ from, children }: { from: "them" | "me"; children: ReactNode }) {
  return (
    <div className={`flex ${from === "me" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
          from === "me" ? "rounded-br-md bg-white text-zinc-900" : "rounded-bl-md bg-zinc-800 text-zinc-100"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
