import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "LockedIn",
  description: "Personal productivity control room — DSA, habits, time, and an AI coach.",
};

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/dsa", label: "DSA" },
  { href: "/tasks", label: "Tasks" },
  { href: "/health", label: "Health" },
  { href: "/build-in-public", label: "Build in Public" },
  { href: "/guide", label: "How to use" },
  { href: "/downloads", label: "Downloads" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-20 border-b border-ink-600 bg-ink-900/90 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
              <Link href="/" className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-accent shadow-[0_0_8px_2px] shadow-accent" />
                <span className="font-mono text-sm font-semibold tracking-wide">
                  LOCKED<span className="text-accent">IN</span>
                </span>
              </Link>
              <nav className="flex flex-wrap items-center gap-1 text-sm">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-md px-2.5 py-1 text-muted transition-colors hover:bg-ink-700 hover:text-gray-100"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
          <footer className="border-t border-ink-600 px-4 py-4 text-center text-xs text-muted">
            LockedIn · local-first · built in public
          </footer>
        </div>
      </body>
    </html>
  );
}
