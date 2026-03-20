"use client";

import { usePathname } from "next/navigation";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

const BARE_ROUTES = ["/login"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (BARE_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

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
