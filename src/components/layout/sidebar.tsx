"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useHistoryStore, type QuestionRecord } from "@/stores/history";
import { useQuestionStore } from "@/stores/question";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MessageSquare, Star, Trash2, Clock } from "lucide-react";

type Tab = "history" | "favorites";

export function Sidebar() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("history");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const records = useHistoryStore((s) => s.records);
  const toggleFavorite = useHistoryStore((s) => s.toggleFavorite);
  const removeRecord = useHistoryStore((s) => s.removeRecord);

  const filtered =
    activeTab === "favorites"
      ? records.filter((r) => r.isFavorite)
      : records;

  const handleClick = (record: QuestionRecord) => {
    const store = useQuestionStore.getState();
    store.startQuestion(record.question, record.roleSnapshot, record.parentId);
    useQuestionStore.setState({ questionId: record.id });
    router.push("/result");
  };

  return (
    <aside className="hidden w-72 shrink-0 overflow-hidden border-r md:flex md:flex-col">
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
              <div
                key={record.id}
                className="group flex min-w-0 items-center gap-4 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent"
              >
                <button
                  onClick={() => handleClick(record)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{record.question}</span>
                </button>

                <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => toggleFavorite(record.id)}
                    className="rounded p-1 text-muted-foreground hover:text-amber-500"
                    title={record.isFavorite ? "取消收藏" : "收藏"}
                  >
                    <Star
                      className={cn(
                        "h-3.5 w-3.5",
                        record.isFavorite
                          ? "fill-amber-400 text-amber-400"
                          : "",
                      )}
                    />
                  </button>
                  <button
                    onClick={() => setDeleteId(record.id)}
                    className="rounded p-1 text-muted-foreground hover:text-destructive"
                    title="删除"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="确认删除？"
        description="删除后无法恢复，确定要删除这条历史记录吗？"
        confirmText="删除"
        variant="destructive"
        onConfirm={() => { if (deleteId) removeRecord(deleteId); }}
      />
    </aside>
  );
}
