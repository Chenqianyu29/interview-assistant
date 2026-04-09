"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useHistoryStore } from "@/stores/history";
import { Button } from "@/components/ui/button";
import { FolderPlus, Loader2 } from "lucide-react";

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (folderId: number) => void;
}

export function CreateFolderDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateFolderDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const addFolder = useHistoryStore((s) => s.addFolder);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const submitLockRef = useRef(false);

  useEffect(() => {
    if (open) {
      setName("");
      setLoading(false);
      submitLockRef.current = false;
      queueMicrotask(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onOpenChange(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onOpenChange, loading]);

  const handleCreate = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed || submitLockRef.current) return;
    submitLockRef.current = true;
    setLoading(true);
    try {
      const id = await addFolder(trimmed);
      onCreated?.(id);
      onOpenChange(false);
    } finally {
      submitLockRef.current = false;
      setLoading(false);
    }
  }, [name, addFolder, onCreated, onOpenChange]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (loading) return;
        if (e.target === overlayRef.current) onOpenChange(false);
      }}
    >
      <div className="mx-4 w-full max-w-xs rounded-xl border bg-popover p-4 shadow-lg animate-in zoom-in-95 duration-150">
        <h3 className="text-sm font-semibold">新建收藏夹</h3>
        <div className="mt-3 flex items-center gap-2 rounded-lg border px-3 py-2">
          <FolderPlus className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={name}
            disabled={loading}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading) void handleCreate();
            }}
            placeholder="收藏夹名称"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => void handleCreate()}
            disabled={!name.trim() || loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                创建中…
              </>
            ) : (
              "创建"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
