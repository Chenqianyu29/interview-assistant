"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useHistoryStore } from "@/stores/history";
import { useQuestionStore } from "@/stores/question";
import { LeaveResultDialog, type LeaveResultKind } from "./leave-result-dialog";

function getLeaveResultKind(): LeaveResultKind | null {
  const q = useQuestionStore.getState();
  if (!q.question || !q.roleSnapshot) return null;
  if (q.mainAnswerStreaming) return "streaming";
  if (q.saveStatus === "unsaved" && q.mainAnswerDraft.length > 0) {
    return "unsaved";
  }
  return null;
}

const TryNavigateContext = createContext<(fn: () => void) => void>((fn) => fn());

export function useTryNavigate() {
  return useContext(TryNavigateContext);
}

export function NavigationGuardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [leaveKind, setLeaveKind] = useState<LeaveResultKind | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const pendingRef = useRef<(() => void) | null>(null);
  const dialogOpenRef = useRef(false);
  dialogOpenRef.current = dialogOpen;

  const tryNavigate = useCallback(
    (action: () => void) => {
      if (pathname !== "/result") {
        action();
        return;
      }
      const kind = getLeaveResultKind();
      if (!kind) {
        action();
        return;
      }
      pendingRef.current = action;
      setLeaveKind(kind);
      setDialogOpen(true);
    },
    [pathname],
  );

  const tryNavigateRef = useRef(tryNavigate);
  tryNavigateRef.current = tryNavigate;

  const flushPending = useCallback(() => {
    useQuestionStore.getState().resetQuestionSession();
    setDialogOpen(false);
    setLeaveKind(null);
    const fn = pendingRef.current;
    pendingRef.current = null;
    fn?.();
  }, []);

  const handleConfirmLeave = useCallback(() => {
    flushPending();
  }, [flushPending]);

  const handleSaveAndLeave = useCallback(async () => {
    const q = useQuestionStore.getState();
    if (!q.question || !q.roleSnapshot) return;
    setSaveLoading(true);
    try {
      const record = await useHistoryStore.getState().addRecord({
        question: q.question,
        roleSnapshot: q.roleSnapshot,
        answer: q.mainAnswerDraft,
        starAnswer: "",
        followUps: [],
        parentId: q.parentId,
        folderId: null,
        category: "",
      });
      useQuestionStore.setState({
        questionId: record.id,
        saveStatus: "saved",
      });
      useQuestionStore.getState().resetQuestionSession();
      setDialogOpen(false);
      setLeaveKind(null);
      const fn = pendingRef.current;
      pendingRef.current = null;
      fn?.();
    } finally {
      setSaveLoading(false);
    }
  }, []);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pathname !== "/result") return;
      if (getLeaveResultKind()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [pathname]);

  useEffect(() => {
    const onClickCapture = (e: MouseEvent) => {
      if (dialogOpenRef.current) return;
      if (pathname !== "/result") return;
      if (getLeaveResultKind() === null) return;
      const el = (e.target as Element | null)?.closest?.("a[href]");
      if (!el) return;
      const a = el as HTMLAnchorElement;
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (
        url.pathname === pathname &&
        url.search === window.location.search
      ) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      tryNavigateRef.current(() => {
        router.push(url.pathname + url.search + url.hash);
      });
    };
    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [pathname, router]);

  return (
    <TryNavigateContext.Provider value={tryNavigate}>
      {children}
      <LeaveResultDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open && !saveLoading) {
            setDialogOpen(false);
            setLeaveKind(null);
            pendingRef.current = null;
          }
        }}
        kind={leaveKind}
        saveLoading={saveLoading}
        onConfirmLeave={handleConfirmLeave}
        onSaveAndLeave={handleSaveAndLeave}
      />
    </TryNavigateContext.Provider>
  );
}
