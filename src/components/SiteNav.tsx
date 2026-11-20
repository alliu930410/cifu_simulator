"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "赐福" },
  { href: "/jinjie", label: "进阶" },
  { href: "/dashu", label: "打书" },
];

export default function SiteNav() {
  const path = usePathname();
  return (
    <nav className="flex justify-center gap-2">
      {LINKS.map((link) => {
        const active = path === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full px-4 py-1.5 text-sm ${
              active ? "bg-amber-800 text-amber-50" : "bg-white/80 text-amber-900 ring-1 ring-amber-200 hover:bg-amber-50"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
