"use client";

import type { StarSection, StarStatus } from "@/stores/question";
import { Loader2 } from "lucide-react";
import Markdown from "react-markdown";
import { cn } from "@/lib/utils";

const SECTION_META: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  Situation: {
    label: "S · 情境",
    color: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-200 dark:border-blue-800",
  },
  Task: {
    label: "T · 任务",
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800",
  },
  Action: {
    label: "A · 行动",
    color: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  Result: {
    label: "R · 结果",
    color: "text-purple-700 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    border: "border-purple-200 dark:border-purple-800",
  },
};

interface StarCardProps {
  sections: StarSection[];
  status: StarStatus;
}

export function StarCard({ sections, status }: StarCardProps) {
  const isStreaming = status === "streaming";

  return (
    <div className="grid gap-3">
      {sections.map((section) => {
        const meta = SECTION_META[section.title];
        if (!meta) return null;

        const hasContent = section.content.length > 0;

        return (
          <div
            key={section.title}
            className={cn(
              "rounded-lg border p-4 transition-all",
              meta.border,
              meta.bg,
            )}
          >
            <h4 className={cn("text-sm font-semibold", meta.color)}>
              {meta.label}
            </h4>

            {hasContent ? (
              <div className="prose prose-sm prose-neutral mt-2 max-w-none leading-relaxed dark:prose-invert">
                <Markdown>{section.content}</Markdown>
              </div>
            ) : isStreaming ? (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                生成中…
              </div>
            ) : null}
          </div>
        );
      })}

      {isStreaming && (
        <span className="inline-block animate-pulse text-xs text-primary">
          ▍ STAR 生成中…
        </span>
      )}
    </div>
  );
}
