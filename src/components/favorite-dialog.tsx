"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useHistoryStore } from "@/stores/history";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Folder, FolderPlus, Loader2, StarOff, Check } from "lucide-react";

interface FavoriteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recordId: number;
}

export function FavoriteDialog({
  open,
  onOpenChange,
  recordId,
}: FavoriteDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const folders = useHistoryStore((s) => s.folders);
  const record = useHistoryStore((s) =>
    s.records.find((r) => r.id === recordId),
  );
  const setFavoriteFolder = useHistoryStore((s) => s.setFavoriteFolder);
  const addFolder = useHistoryStore((s) => s.addFolder);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [folderSubmitting, setFolderSubmitting] = useState(false);
  const folderSubmitLockRef = useRef(false);

  useEffect(() => {
    if (open && record) {
      setSelectedId(record.folderId);
      setIsCreating(false);
      setNewName("");
      setFolderSubmitting(false);
      folderSubmitLockRef.current = false;
    }
  }, [open, record]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !folderSubmitting) onOpenChange(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onOpenChange, folderSubmitting]);

  useEffect(() => {
    if (isCreating) inputRef.current?.focus();
  }, [isCreating]);

  const handleConfirm = useCallback(() => {
    if (selectedId !== null) {
      setFavoriteFolder(recordId, selectedId);
    }
    onOpenChange(false);
  }, [selectedId, recordId, setFavoriteFolder, onOpenChange]);

  const handleUnfavorite = useCallback(() => {
    setFavoriteFolder(recordId, null);
    onOpenChange(false);
  }, [recordId, setFavoriteFolder, onOpenChange]);

  const handleCreateFolder = useCallback(async () => {
    const trimmed = newName.trim();
    if (!trimmed || folderSubmitLockRef.current) return;
    folderSubmitLockRef.current = true;
    setFolderSubmitting(true);
    try {
      const id = await addFolder(trimmed);
      setSelectedId(id);
      setIsCreating(false);
      setNewName("");
    } finally {
      folderSubmitLockRef.current = false;
      setFolderSubmitting(false);
    }
  }, [newName, addFolder]);

  if (!open || !record) return null;

  const isFavorited = record.folderId !== null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (folderSubmitting) return;
        if (e.target === overlayRef.current) onOpenChange(false);
      }}
    >
      <div className="mx-4 w-full max-w-xs rounded-xl border bg-popover p-4 shadow-lg animate-in zoom-in-95 duration-150">
        <h3 className="text-sm font-semibold">
          {isFavorited ? "修改收藏夹" : "添加到收藏夹"}
        </h3>

        <div className="mt-3 max-h-48 space-y-1 overflow-y-auto">
          {folders.length === 0 && !isCreating && (
            <p className="py-3 text-center text-xs text-muted-foreground">
              暂无收藏夹，请先创建
            </p>
          )}

          {folders.map((folder) => (
            <button
              key={folder.id}
              type="button"
              disabled={folderSubmitting}
              onClick={() => setSelectedId(folder.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors disabled:pointer-events-none disabled:opacity-50",
                selectedId === folder.id
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-accent",
              )}
            >
              <Folder className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate text-left">{folder.name}</span>
              {selectedId === folder.id && (
                <Check className="h-4 w-4 shrink-0" />
              )}
            </button>
          ))}

          {isCreating ? (
            <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5">
              <FolderPlus className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={newName}
                disabled={folderSubmitting}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !folderSubmitting) void handleCreateFolder();
                  if (e.key === "Escape" && !folderSubmitting) setIsCreating(false);
                }}
                placeholder="收藏夹名称"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-6 gap-1 px-2 text-xs"
                onClick={() => void handleCreateFolder()}
                disabled={!newName.trim() || folderSubmitting}
              >
                {folderSubmitting ? (
                  <>
                    <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
                    创建中…
                  </>
                ) : (
                  "创建"
                )}
              </Button>
            </div>
          ) : (
            <button
              type="button"
              disabled={folderSubmitting}
              onClick={() => setIsCreating(true)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              <FolderPlus className="h-4 w-4" />
              新建收藏夹
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          {isFavorited && (
            <Button
              variant="ghost"
              size="sm"
              className="mr-auto text-xs text-destructive hover:text-destructive"
              disabled={folderSubmitting}
              onClick={handleUnfavorite}
            >
              <StarOff className="h-3.5 w-3.5" />
              取消收藏
            </Button>
          )}
          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={folderSubmitting}
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={selectedId === null || folderSubmitting}
            >
              确认
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
