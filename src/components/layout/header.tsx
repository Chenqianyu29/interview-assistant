"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { BotMessageSquare, LogOut, User } from "lucide-react";
import { Popover } from "@base-ui/react/popover";
import { useRoleStore } from "@/stores/role";
import { useAuthStore } from "@/stores/auth";
import { formatRole } from "@/types/role";
import { RoleSelectorPanel } from "@/components/role-selector";

const navItems = [
  { href: "/", label: "问答" },
  { href: "/practice", label: "练习", disabled: true },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const globalRole = useRoleStore((s) => s.globalRole);
  const setGlobalRole = useRoleStore((s) => s.setGlobalRole);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <BotMessageSquare className="h-5 w-5" />
        <span className="text-sm">InterviewCopilot</span>
      </Link>

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

      <div className="flex items-center gap-3">
        <Popover.Root>
          <Popover.Trigger
            className="flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent"
          >
            <span>{formatRole(globalRole)}</span>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner side="bottom" align="end" sideOffset={8}>
              <Popover.Popup className="z-50 w-64 rounded-lg border bg-popover shadow-md outline-none">
                <div className="border-b px-3 pt-2.5 pb-2">
                  <p className="text-xs font-medium">全局角色设置</p>
                </div>
                <RoleSelectorPanel
                  value={globalRole}
                  onChange={setGlobalRole}
                />
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>

        {user ? (
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-muted-foreground">{user}</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <User className="h-4 w-4" />
            </div>
            <button
              onClick={handleLogout}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title="退出登录"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-md border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            登录
          </Link>
        )}
      </div>
    </header>
  );
}
