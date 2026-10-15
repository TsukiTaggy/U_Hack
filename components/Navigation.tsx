"use client";

import Link from "next/link";
import { useState } from "react";

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800/50 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center px-6 py-3 sm:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center">
            <svg className="h-6 w-6 text-[var(--avalanche-red)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 19.5h20L12 2zm0 4l7 13H5l7-13z"/>
            </svg>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden items-center gap-8 ml-8 md:flex">
          <Link href="/" className="text-sm font-medium text-zinc-300 transition-colors hover:text-white">
            Home
          </Link>
          <Link href="/play" className="text-sm font-medium text-zinc-300 transition-colors hover:text-white">
            Missions
          </Link>
        </div>

        {/* Right Side - Search & Actions */}
        <div className="hidden items-center gap-4 ml-auto md:flex">
          {/* Search Bar */}
          <div className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/50 px-3 py-1.5 text-sm">
            <svg className="h-4 w-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-zinc-500">SEARCH</span>
            <kbd className="ml-4 rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400">CTRL</kbd>
            <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400">K</kbd>
          </div>

          {/* Theme Toggle */}
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900/50 text-zinc-400 transition-colors hover:text-white">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </button>

          {/* User Avatar */}
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500"></div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-zinc-300"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-zinc-800/50 bg-black/60 backdrop-blur-xl px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-zinc-300 transition-colors hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/play"
              className="text-sm font-medium text-zinc-300 transition-colors hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Missions
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
