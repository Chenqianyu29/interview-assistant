"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useHistoryStore, type QuestionRecord } from "@/stores/history";
import { useQuestionStore } from "@/stores/question";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FavoriteDialog } from "@/components/favorite-dialog";
import {
  MessageSquare,
  Star,
  Trash2,
  Clock,
  Folder,
  ChevronRight,
  Pencil,
  Check,
  X,
} from "lucide-react";

type Tab = "history" | "favorites";

export function Sidebar() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("history");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [favoriteRecordId, setFavoriteRecordId] = useState<number | null>(null);
  const [expandedFolderId, setExpandedFolderId] = useState<number | null>(null);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteFolderId, setDeleteFolderId] = useState<number | null>(null);
  const [unfavoriteId, setUnfavoriteId] = useState<number | null>(null);
  const [dragRecordId, setDragRecordId] = useState<number | null>(null);
  const [dropTargetId, setDropTargetId] = useState<number | null>(null);

  const records = useHistoryStore((s) => s.records);
  const folders = useHistoryStore((s) => s.folders);
  const removeRecord = useHistoryStore((s) => s.removeRecord);
  const removeFolder = useHistoryStore((s) => s.removeFolder);
  const renameFolder = useHistoryStore((s) => s.renameFolder);
  const setFavoriteFolder = useHistoryStore((s) => s.setFavoriteFolder);

  const handleClick = (record: QuestionRecord) => {
    const store = useQuestionStore.getState();
    store.startQuestion(record.question, record.roleSnapshot, record.parentId);
    useQuestionStore.setState({ questionId: record.id });
    router.push("/result");
  };

  const handleToggleFolder = (folderId: number) => {
    setExpandedFolderId((prev) => (prev === folderId ? null : folderId));
  };

  const handleStartRename = (folderId: number, currentName: string) => {
    setRenamingId(folderId);
    setRenameValue(currentName);
  };

  const handleConfirmRename = () => {
    if (renamingId && renameValue.trim()) {
      renameFolder(renamingId, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue("");
  };

  const handleDeleteFolder = async () => {
    if (!deleteFolderId) return;
    const ok = await removeFolder(deleteFolderId);
    if (!ok) return;
    if (expandedFolderId === deleteFolderId) setExpandedFolderId(null);
  };

  const getFolderCount = (folderId: number) =>
    records.filter((r) => r.folderId === folderId).length;

  const getFolderRecords = (folderId: number) =>
    records.filter((r) => r.folderId === folderId);

  const canDeleteFolder = (folderId: number) => getFolderCount(folderId) === 0;

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
        {activeTab === "history" ? (
          /* ---- History Tab ---- */
          records.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                暂无历史记录
              </div>
            </div>
          ) : (
            <div className="grid gap-0.5">
              {records.slice(0, 50).map((record) => (
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
                      onClick={() => setFavoriteRecordId(record.id)}
                      className="rounded p-1 text-muted-foreground hover:text-amber-500"
                      title={record.folderId ? "修改收藏" : "收藏"}
                    >
                      <Star
                        className={cn(
                          "h-3.5 w-3.5",
                          record.folderId
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
          )
        ) : (
          /* ---- Favorites Tab (Folder Tree) ---- */
          folders.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4" />
                暂无收藏夹
              </div>
            </div>
          ) : (
            <div className="grid gap-0.5">
              {folders.map((folder) => {
                const isExpanded = expandedFolderId === folder.id;
                const count = getFolderCount(folder.id);
                const isRenaming = renamingId === folder.id;

                return (
                  <div key={folder.id}>
                    {/* Folder row */}
                    <div
                      className={cn(
                        "group flex min-w-0 items-center gap-1 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent",
                        dropTargetId === folder.id && "ring-2 ring-primary/50 bg-primary/5",
                      )}
                      onDragOver={(e) => {
                        if (dragRecordId === null) return;
                        e.preventDefault();
                        setDropTargetId(folder.id);
                      }}
                      onDragLeave={() => setDropTargetId(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (dragRecordId !== null) {
                          setFavoriteFolder(dragRecordId, folder.id);
                        }
                        setDragRecordId(null);
                        setDropTargetId(null);
                      }}
                    >
                      {isRenaming ? (
                        <div className="flex min-w-0 flex-1 items-center gap-1.5">
                          <Folder className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleConfirmRename();
                              if (e.key === "Escape") setRenamingId(null);
                            }}
                            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                            autoFocus
                          />
                          <button
                            onClick={handleConfirmRename}
                            className="rounded p-0.5 text-primary hover:bg-primary/10"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setRenamingId(null)}
                            className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleToggleFolder(folder.id)}
                            className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
                          >
                            <ChevronRight
                              className={cn(
                                "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
                                isExpanded && "rotate-90",
                              )}
                            />
                            <Folder className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                            <span className="truncate">{folder.name}</span>
                          </button>

                          <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() =>
                                handleStartRename(folder.id, folder.name)
                              }
                              className="rounded p-1 text-muted-foreground hover:text-foreground"
                              title="重命名"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => setDeleteFolderId(folder.id)}
                              className="rounded p-1 text-muted-foreground hover:text-destructive"
                              title="删除收藏夹"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Folder children */}
                    {isExpanded && (
                      <div className="ml-4 grid gap-0.5 border-l pl-2">
                        {getFolderRecords(folder.id).length === 0 ? (
                          <p className="px-2 py-1.5 text-xs text-muted-foreground">
                            空收藏夹
                          </p>
                        ) : (
                          getFolderRecords(folder.id).map((record) => (
                            <div
                              key={record.id}
                              draggable
                              onDragStart={() => setDragRecordId(record.id)}
                              onDragEnd={() => {
                                setDragRecordId(null);
                                setDropTargetId(null);
                              }}
                              className={cn(
                                "group/item flex min-w-0 items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent cursor-grab active:cursor-grabbing",
                                dragRecordId === record.id && "opacity-50",
                              )}
                            >
                              <button
                                onClick={() => handleClick(record)}
                                className="flex min-w-0 flex-1 items-center gap-2 text-left"
                              >
                                <MessageSquare className="h-3 w-3 shrink-0 text-muted-foreground" />
                                <span className="truncate">
                                  {record.question}
                                </span>
                              </button>
                              <button
                                onClick={() =>
                                  setUnfavoriteId(record.id)
                                }
                                className="shrink-0 rounded p-0.5 opacity-0 transition-opacity hover:text-amber-500 group-hover/item:opacity-100"
                                title="取消收藏"
                              >
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="确认删除？"
        description="删除后无法恢复，确定要删除这条历史记录吗？"
        confirmText="删除"
        variant="destructive"
        onConfirm={() => {
          if (deleteId) removeRecord(deleteId);
        }}
      />

      <ConfirmDialog
        open={deleteFolderId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteFolderId(null);
        }}
        title={
          deleteFolderId && !canDeleteFolder(deleteFolderId)
            ? "无法删除"
            : "确认删除收藏夹？"
        }
        description={
          deleteFolderId && !canDeleteFolder(deleteFolderId)
            ? "请先移除该收藏夹中的所有收藏后再删除。"
            : "删除后无法恢复，确定要删除这个收藏夹吗？"
        }
        confirmText={
          deleteFolderId && !canDeleteFolder(deleteFolderId) ? "知道了" : "删除"
        }
        variant={
          deleteFolderId && !canDeleteFolder(deleteFolderId)
            ? "default"
            : "destructive"
        }
        onConfirm={handleDeleteFolder}
      />

      <ConfirmDialog
        open={unfavoriteId !== null}
        onOpenChange={(open) => {
          if (!open) setUnfavoriteId(null);
        }}
        title="确认取消收藏？"
        description="取消后该记录将从收藏夹中移除。"
        confirmText="取消收藏"
        variant="destructive"
        onConfirm={() => {
          if (unfavoriteId) setFavoriteFolder(unfavoriteId, null);
        }}
      />

      {favoriteRecordId !== null && (
        <FavoriteDialog
          open
          onOpenChange={(open) => {
            if (!open) setFavoriteRecordId(null);
          }}
          recordId={favoriteRecordId}
        />
      )}
    </aside>
  );
}
