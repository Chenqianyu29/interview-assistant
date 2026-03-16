"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { MessageSquare, Star, MoreHorizontal } from "lucide-react";

type Tab = "history" | "favorites";

export function Sidebar() {
  const [activeTab, setActiveTab] = useState<Tab>("history");

  return (
    <aside className="hidden w-64 shrink-0 border-r md:flex md:flex-col">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("history")}
          className={cn(
            "flex-1 px-4 py-2.5 text-sm transition-colors",
            activeTab === "history"
              ? "border-b-2 border-primary font-medium text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          历史记录
        </button>
        <button
          onClick={() => setActiveTab("favorites")}
          className={cn(
            "flex-1 px-4 py-2.5 text-sm transition-colors",
            activeTab === "favorites"
              ? "border-b-2 border-primary font-medium text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          我的收藏
        </button>
      </div>

      {/* List */}
      <div className="flex flex-1 items-center justify-center overflow-y-auto p-2">
        {activeTab === "history" ? (
          <SidebarItem
            icon={<MessageSquare className="h-4 w-4" />}
            label="暂无历史记录"
            muted
          />
        ) : (
          <SidebarItem
            icon={<Star className="h-4 w-4" />}
            label="暂无收藏"
            muted
          />
        )}
      </div>
    </aside>
  );
}

function SidebarItem({
  icon,
  label,
  muted = false,
}: {
  icon: React.ReactNode;
  label: string;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-md px-2 py-2 text-sm",
        muted
          ? "text-muted-foreground"
          : "cursor-pointer hover:bg-accent",
      )}
    >
      <div className="flex items-center gap-2 truncate">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      {!muted && (
        <button className="shrink-0 text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
