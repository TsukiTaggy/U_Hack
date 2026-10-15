"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { primaryNavigation } from "@/lib/site-navigation";

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-black/95 text-white backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 sm:px-8">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Image src="/img/SafeStart-logo.svg" alt="" width={32} height={32} />
          <span className="font-semibold tracking-tight">SafeStart</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {primaryNavigation.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-zinc-300 transition-colors hover:text-white">
              {item.label}
            </Link>
          ))}
        </div>

        <button
          className="text-zinc-300 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-zinc-800/50 bg-black/60 backdrop-blur-xl px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {primaryNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-zinc-300 transition-colors hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
