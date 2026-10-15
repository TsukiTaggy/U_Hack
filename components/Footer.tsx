"use client";

import Link from "next/link";
import { useState } from "react";

export function Footer() {
  // Set default year immediately, update on mount
  const [currentYear, setCurrentYear] = useState(() => {
    if (typeof window !== "undefined") {
      return new Date().getFullYear();
    }
    return 2026;
  });

  // Update year on mount if needed
  if (typeof window !== "undefined" && currentYear === 2026) {
    const actualYear = new Date().getFullYear();
    if (actualYear !== currentYear) {
      setCurrentYear(actualYear);
    }
  }

  return (
    <footer className="mt-auto border-t border-[var(--border-subtle)] bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2 text-lg font-bold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--avalanche-red)] text-sm font-bold text-white">
                S
              </span>
              SafeStart
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              AI crypto safety coach for beginners.
              <br />
              Built on Avalanche Fuji testnet.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-[var(--text-muted)] transition-colors hover:text-[var(--avalanche-red)]">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/play" className="text-[var(--text-muted)] transition-colors hover:text-[var(--avalanche-red)]">
                  Missions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://docs.avax.network/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--text-muted)] transition-colors hover:text-[var(--avalanche-red)]"
                >
                  Avalanche Docs
                </a>
              </li>
              <li>
                <a
                  href="https://core.app/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--text-muted)] transition-colors hover:text-[var(--avalanche-red)]"
                >
                  Core Wallet
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider">Legal</h3>
            <p className="text-xs text-[var(--text-muted)]">
              Testnet only. Educational content, not financial advice.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-[var(--border-subtle)] pt-8 text-center text-sm text-[var(--text-muted)]">
          <p>© {currentYear} SafeStart. U-Hackathon 2026 · AI Track</p>
        </div>
      </div>
    </footer>
  );
}
