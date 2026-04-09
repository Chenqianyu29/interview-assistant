"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export type LeaveResultKind = "streaming" | "unsaved";

interface LeaveResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: LeaveResultKind | null;
  saveLoading: boolean;
  onConfirmLeave: () => void;
  onSaveAndLeave: () => void;
}

export function LeaveResultDialog({
  open,
  onOpenChange,
  kind,
  saveLoading,
  onConfirmLeave,
  onSaveAndLeave,
}: LeaveResultDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saveLoading) onOpenChange(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onOpenChange, saveLoading]);

  if (!open || !kind) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (saveLoading) return;
        if (e.target === overlayRef.current) onOpenChange(false);
      }}
    >
      <div className="mx-4 w-full max-w-sm rounded-xl border bg-popover p-5 shadow-lg animate-in zoom-in-95 duration-150">
        {kind === "streaming" ? (
          <>
            <h3 className="text-sm font-semibold">
              答案未生成完毕，是否离开当前页面？
            </h3>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                取消
              </Button>
              <Button size="sm" onClick={onConfirmLeave}>
                确认离开
              </Button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-sm font-semibold">
              答案未保存，是否离开当前页面？
            </h3>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={saveLoading}
                onClick={() => onOpenChange(false)}
              >
                取消
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={saveLoading}
                onClick={onConfirmLeave}
              >
                直接离开
              </Button>
              <Button
                size="sm"
                disabled={saveLoading}
                className="gap-1.5"
                onClick={onSaveAndLeave}
              >
                {saveLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                    保存中…
                  </>
                ) : (
                  "保存并离开"
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
