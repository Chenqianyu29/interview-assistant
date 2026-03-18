"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useHistoryStore, type QuestionRecord } from "@/stores/history";
import { useQuestionStore } from "@/stores/question";
import { MessageSquare, Star, Clock } from "lucide-react";

type Tab = "history" | "favorites";

export function Sidebar() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("history");
  const records = useHistoryStore((s) => s.records);

  const filtered =
    activeTab === "favorites"
      ? records.filter((r) => r.isFavorite)
      : records;

  const handleClick = (record: QuestionRecord) => {
    const store = useQuestionStore.getState();
    store.startQuestion(record.question, record.roleSnapshot, record.parentId);
    Object.assign(useQuestionStore.getState(), { questionId: record.id });
    router.push("/result?from=history");
  };

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
      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {activeTab === "history" ? (
                <>
                  <Clock className="h-4 w-4" />
                  暂无历史记录
                </>
              ) : (
                <>
                  <Star className="h-4 w-4" />
                  暂无收藏
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-0.5">
            {filtered.slice(0, 50).map((record) => (
              <button
                key={record.id}
                onClick={() => handleClick(record)}
                className="flex items-start gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-accent"
              >
                <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{record.question}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {new Date(record.createdAt).toLocaleDateString()}
                    {record.isFavorite && " ★"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
