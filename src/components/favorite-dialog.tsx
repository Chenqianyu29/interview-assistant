"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useHistoryStore } from "@/stores/history";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Folder, FolderPlus, StarOff, Check } from "lucide-react";

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

  useEffect(() => {
    if (open && record) {
      setSelectedId(record.folderId);
      setIsCreating(false);
      setNewName("");
    }
  }, [open, record]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onOpenChange]);

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
    if (!trimmed) return;
    const id = await addFolder(trimmed);
    setSelectedId(id);
    setIsCreating(false);
    setNewName("");
  }, [newName, addFolder]);

  if (!open || !record) return null;

  const isFavorited = record.folderId !== null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
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
              onClick={() => setSelectedId(folder.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
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
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateFolder();
                  if (e.key === "Escape") setIsCreating(false);
                }}
                placeholder="收藏夹名称"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={handleCreateFolder}
                disabled={!newName.trim()}
              >
                创建
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={selectedId === null}
            >
              确认
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
