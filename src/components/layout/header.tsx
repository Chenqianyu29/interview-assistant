"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BotMessageSquare, ChevronDown, User } from "lucide-react";

const navItems = [
  { href: "/", label: "问答" },
  { href: "/practice", label: "练习", disabled: true },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
      {/* Left: Logo */}
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <BotMessageSquare className="h-5 w-5" />
        <span className="text-sm">InterviewCopilot</span>
      </Link>

      {/* Center: Nav Tabs (练习 tab reserved for Phase 2) */}
      <nav className="hidden items-center gap-6">
        {navItems.map((item) =>
          item.disabled ? (
            <span
              key={item.href}
              className="cursor-not-allowed text-sm text-muted-foreground/50"
            >
              {item.label}
            </span>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm transition-colors hover:text-foreground",
                pathname === item.href
                  ? "font-medium text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          ),
        )}
      </nav>

      {/* Right: Role Tag + User */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent">
          <span>职场人·1~3年·大厂</span>
          <ChevronDown className="h-3 w-3" />
        </button>
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-muted-foreground">user</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <User className="h-4 w-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
