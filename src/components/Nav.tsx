"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Dashboard", icon: "▣" },
  { href: "/dsa", label: "DSA", icon: "◆" },
  { href: "/tasks", label: "Tasks", icon: "✓" },
  { href: "/health", label: "Health", icon: "♥" },
  { href: "/build-in-public", label: "Build in Public", icon: "✦" },
  { href: "/guide", label: "Guide", icon: "?" },
  { href: "/downloads", label: "Get", icon: "↓" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm">
      {NAV.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-all ${
              active
                ? "bg-accent/10 text-accent shadow-glow-sm"
                : "text-muted hover:bg-ink-700 hover:text-gray-100"
            }`}
          >
            <span className={`text-xs ${active ? "text-accent" : "text-ink-500"}`}>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
