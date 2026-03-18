"use client";

import type { AsyncStatus } from "@/stores/question";
import { Loader2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FollowUpListProps {
  items: string[];
  status: AsyncStatus;
  onSelect: (question: string) => void;
}

export function FollowUpList({ items, status, onSelect }: FollowUpListProps) {
  if (status === "idle") return null;

  return (
    <div className="grid gap-2">
      {status === "streaming" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          正在生成追问…
        </div>
      )}

      {status === "error" && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          追问生成失败，请重试
        </div>
      )}

      {items.map((q, i) => (
        <button
          key={i}
          onClick={() => onSelect(q)}
          className={cn(
            "group flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all",
            "hover:border-primary/40 hover:bg-primary/5",
          )}
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
            {i + 1}
          </span>
          <span className="flex-1">{q}</span>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
      ))}
    </div>
  );
}
