import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import "./globals.css";

// System fonts only: no build-time font download, so builds work offline and on venue Wi-Fi.

export const metadata: Metadata = {
  title: "SafeStart · AI crypto safety coach",
  description: "Practise crypto safety on Avalanche Fuji testnet with an AI coach, an AI scam simulator and real transactions.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col">
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  );
}
