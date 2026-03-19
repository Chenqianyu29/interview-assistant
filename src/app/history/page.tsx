"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useHistoryStore, type QuestionRecord } from "@/stores/history";
import { useQuestionStore } from "@/stores/question";
import { formatRole } from "@/types/role";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import {
  Search,
  Star,
  Trash2,
  Tag,
  Clock,
  ChevronRight,
  X,
} from "lucide-react";

type Filter = "all" | "favorites";

const CATEGORY_PRESETS = ["行为面试", "技术面试", "系统设计", "项目经验", "其他"];

export default function HistoryPage() {
  const router = useRouter();
  const records = useHistoryStore((s) => s.records);
  const toggleFavorite = useHistoryStore((s) => s.toggleFavorite);
  const removeRecord = useHistoryStore((s) => s.removeRecord);
  const setCategory = useHistoryStore((s) => s.setCategory);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [taggingId, setTaggingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    let list = records;
    if (filter === "favorites") list = list.filter((r) => r.isFavorite);
    if (categoryFilter) list = list.filter((r) => r.category === categoryFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.question.toLowerCase().includes(q) ||
          r.answer.toLowerCase().includes(q),
      );
    }
    return list;
  }, [records, filter, categoryFilter, search]);

  const allCategories = useMemo(() => {
    const cats = new Set(records.map((r) => r.category).filter(Boolean));
    return Array.from(cats);
  }, [records]);

  const handleView = (record: QuestionRecord) => {
    const store = useQuestionStore.getState();
    store.startQuestion(record.question, record.roleSnapshot, record.parentId);
    useQuestionStore.setState({ questionId: record.id });
    router.push("/result");
  };

  const handleSetCategory = (id: number, cat: string) => {
    setCategory(id, cat);
    setTaggingId(null);
  };

  if (records.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <Clock className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <h2 className="mt-3 text-lg font-medium">暂无历史记录</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            保存的面试问答将展示在这里
          </p>
          <Button variant="link" onClick={() => router.push("/")}>
            去提问
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <h2 className="text-lg font-medium">历史记录</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          共 {records.length} 条记录
        </p>

        {/* Search + Filters */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索问题或回答..."
              className="w-full rounded-lg border bg-transparent py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                filter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              全部
            </button>
            <button
              onClick={() => setFilter("favorites")}
              className={cn(
                "flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                filter === "favorites"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              <Star className="h-3 w-3" />
              收藏
            </button>
          </div>
        </div>

        {/* Category chips */}
        {allCategories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {categoryFilter && (
              <button
                onClick={() => setCategoryFilter("")}
                className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
              >
                {categoryFilter}
                <X className="h-3 w-3" />
              </button>
            )}
            {allCategories
              .filter((c) => c !== categoryFilter)
              .map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  {cat}
                </button>
              ))}
          </div>
        )}

        {/* List */}
        <div className="mt-5 grid gap-3">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              没有匹配的记录
            </p>
          ) : (
            filtered.map((record) => (
              <div
                key={record.id}
                className="group relative rounded-lg border p-4 transition-all hover:border-primary/30 hover:shadow-sm"
              >
                {/* Main clickable area */}
                <button
                  className="w-full text-left"
                  onClick={() => handleView(record)}
                >
                  <p className="pr-20 text-sm font-medium leading-snug">
                    {record.question}
                  </p>
                  <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
                    {record.answer.slice(0, 120)}...
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span>{formatRole(record.roleSnapshot)}</span>
                    <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                    {record.category && (
                      <span className="rounded-full bg-muted px-2 py-0.5">
                        {record.category}
                      </span>
                    )}
                    {record.starAnswer && (
                      <span className="text-amber-500">STAR</span>
                    )}
                    {record.followUps.length > 0 && (
                      <span className="text-blue-500">
                        {record.followUps.length} 追问
                      </span>
                    )}
                  </div>
                </button>

                {/* Actions */}
                <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(record.id);
                    }}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setTaggingId(taggingId === record.id ? null : record.id);
                    }}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="分类"
                  >
                    <Tag className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(record.id);
                    }}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                    title="删除"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <ChevronRight className="ml-1 h-4 w-4 text-muted-foreground" />
                </div>

                {/* Category picker */}
                {taggingId === record.id && (
                  <div className="mt-3 flex flex-wrap gap-1.5 border-t pt-3">
                    {CATEGORY_PRESETS.map((cat) => (
                      <button
                        key={cat}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetCategory(record.id, cat);
                        }}
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs transition-colors",
                          record.category === cat
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                    {record.category && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetCategory(record.id, "");
                        }}
                        className="rounded-full px-2.5 py-1 text-xs text-destructive hover:bg-destructive/10"
                      >
                        清除分类
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
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
    </div>
  );
}
