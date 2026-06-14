import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "LockedIn — your grind, visualized",
  description: "Personal productivity control room — DSA, habits, time, and an AI coach.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-20 border-b border-ink-600/60 bg-ink-950/70 backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
              <Link href="/" className="group flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent shadow-glow-sm" />
                </span>
                <span className="font-mono text-sm font-bold tracking-wide">
                  LOCKED<span className="bg-accent-grad bg-clip-text text-transparent">IN</span>
                </span>
              </Link>
              <Nav />
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
            <div className="enter">{children}</div>
          </main>
          <footer className="border-t border-ink-600/60 px-4 py-4 text-center text-xs text-muted">
            <span className="text-accent">●</span> LockedIn · local-first · built in public
          </footer>
        </div>
      </body>
    </html>
  );
}
