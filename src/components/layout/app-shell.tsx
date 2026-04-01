"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { useHistoryStore } from "@/stores/history";
import { useRoleStore } from "@/stores/role";
import type { Role } from "@/types/role";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

const BARE_ROUTES = ["/login"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!BARE_ROUTES.includes(pathname) && !isAuthenticated) {
      router.replace("/login");
    }
  }, [pathname, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    useHistoryStore.getState().fetchAll();

    fetch("/api/settings")
      .then(async (res) => {
        if (!res.ok) return;
        const s = await res.json();
        const role: Role = {
          identity: s.globalIdentity,
          experience: s.globalExperience ?? undefined,
          scenario: s.globalScenario,
        };
        useRoleStore.getState().syncGlobalRole(role);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  if (BARE_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
