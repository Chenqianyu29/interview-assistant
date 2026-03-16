"use client";

import { ArrowUp, ChevronDown, X } from "lucide-react";
import { Popover } from "@base-ui/react/popover";
import { useRoleStore, selectEffectiveRole } from "@/stores/role";
import { formatRole, isRoleEqual } from "@/types/role";
import type { Role } from "@/types/role";
import { RoleSelectorPanel } from "@/components/role-selector";

export default function HomePage() {
  const globalRole = useRoleStore((s) => s.globalRole);
  const overrideRole = useRoleStore((s) => s.overrideRole);
  const setOverrideRole = useRoleStore((s) => s.setOverrideRole);
  const clearOverride = useRoleStore((s) => s.clearOverride);
  const effectiveRole = useRoleStore(selectEffectiveRole);

  const hasOverride = overrideRole !== null;

  const handleOverrideChange = (role: Role) => {
    if (isRoleEqual(role, globalRole)) {
      clearOverride();
    } else {
      setOverrideRole(role);
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <h2 className="text-lg font-medium">InterviewCopilot</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        输入面试问题，AI 帮你生成高质量回答
      </p>

      <div className="mt-8 w-full max-w-2xl">
        <div className="flex items-end gap-2 rounded-xl border px-4 py-3 shadow-sm">
          <textarea
            placeholder="请输入你的问题"
            rows={4}
            className="flex-1 resize-none bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            disabled
          />
          <button
            className="shrink-0 rounded-lg bg-primary p-1.5 text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            disabled
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 flex items-center text-xs text-muted-foreground">
          <span>当前角色：</span>
          <Popover.Root>
            <Popover.Trigger
              className={
                hasOverride
                  ? "flex items-center gap-0.5 rounded-md border border-primary/40 bg-primary/5 px-1.5 py-0.5 text-primary transition-colors hover:bg-primary/10"
                  : "flex items-center gap-0.5 transition-colors hover:text-foreground"
              }
            >
              <span>{formatRole(effectiveRole)}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Positioner side="bottom" align="start" sideOffset={8}>
                <Popover.Popup className="z-50 w-64 rounded-lg border bg-popover shadow-md outline-none">
                  <div className="flex items-center justify-between border-b px-3 pt-2.5 pb-2">
                    <p className="text-xs font-medium">本次角色</p>
                    {hasOverride && (
                      <button
                        className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                        onClick={clearOverride}
                      >
                        恢复默认
                      </button>
                    )}
                  </div>
                  <RoleSelectorPanel
                    value={effectiveRole}
                    onChange={handleOverrideChange}
                  />
                  {hasOverride && (
                    <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">
                      与全局设置不同，仅本次提问生效
                    </div>
                  )}
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover.Root>

          {hasOverride && (
            <button
              className="ml-1 text-muted-foreground transition-colors hover:text-foreground"
              onClick={clearOverride}
              title="恢复全局角色"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
