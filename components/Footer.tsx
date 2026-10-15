import Image from "next/image";
import Link from "next/link";
import { primaryNavigation } from "@/lib/site-navigation";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--border-subtle)] bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Image src="/img/SafeStart-logo.svg" alt="" width={32} height={32} />
              <span className="text-lg font-bold">SafeStart</span>
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
              {primaryNavigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-[var(--text-muted)] transition-colors hover:text-[var(--avalanche-red)]">
                    {item.label}
                  </Link>
                </li>
              ))}
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
          <p>© 2026 SafeStart. U-Hackathon 2026 · AI Track</p>
        </div>
      </div>
    </footer>
  );
}
