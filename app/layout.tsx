import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

// System fonts only: no build-time font download, so builds work offline and on venue Wi-Fi.

export const metadata: Metadata = {
  title: "SafeStart · AI crypto safety coach",
  description: "Practise crypto safety on Avalanche Fuji testnet with an AI coach, an AI scam simulator and real transactions.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  );
}
