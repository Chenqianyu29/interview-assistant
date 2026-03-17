"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuestionStore } from "@/stores/question";
import { formatRole } from "@/types/role";
import { Button } from "@/components/ui/button";
import { StarCard } from "@/components/star-card";
import Markdown from "react-markdown";
import {
  ArrowLeft,
  RefreshCw,
  Save,
  Undo2,
  Sparkles,
  MessageSquarePlus,
  Loader2,
} from "lucide-react";

export default function ResultPage() {
  const router = useRouter();

  const questionId = useQuestionStore((s) => s.questionId);
  const question = useQuestionStore((s) => s.question);
  const roleSnapshot = useQuestionStore((s) => s.roleSnapshot);
  const saveStatus = useQuestionStore((s) => s.saveStatus);
  const save = useQuestionStore((s) => s.save);
  const unsave = useQuestionStore((s) => s.unsave);

  const starStatus = useQuestionStore((s) => s.starStatus);
  const starSections = useQuestionStore((s) => s.starSections);
  const setStarRaw = useQuestionStore((s) => s.setStarRaw);
  const setStarStatus = useQuestionStore((s) => s.setStarStatus);
  const resetStar = useQuestionStore((s) => s.resetStar);

  const [answer, setAnswer] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regenerateCount, setRegenerateCount] = useState(0);

  const starAbortRef = useRef<AbortController | null>(null);

  // Streaming effect — strict-mode safe
  useEffect(() => {
    if (!questionId || !question || !roleSnapshot) return;

    const controller = new AbortController();
    setAnswer("");
    setError(null);
    setIsStreaming(true);

    (async () => {
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, role: roleSnapshot }),
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`生成失败 (${res.status})`);

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          setAnswer((prev) => prev + decoder.decode(value));
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError(err instanceof Error ? err.message : "未知错误");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsStreaming(false);
        }
      }
    })();

    return () => controller.abort();
  }, [questionId, question, roleSnapshot, regenerateCount]);

  const hasAnswer = answer.length > 0;
  const isSaved = saveStatus === "saved";

  const handleRegenerate = () => {
    unsave();
    setRegenerateCount((c) => c + 1);
  };

  const handleUnsave = () => {
    starAbortRef.current?.abort();
    unsave();
  };

  const handleStarOptimize = useCallback(async () => {
    if (!question || !roleSnapshot || !answer) return;

    starAbortRef.current?.abort();
    const controller = new AbortController();
    starAbortRef.current = controller;

    resetStar();
    setStarStatus("streaming");

    try {
      const res = await fetch("/api/star", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer, role: roleSnapshot }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`STAR 生成失败 (${res.status})`);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value);
        setStarRaw(accumulated);
      }

      setStarStatus("done");
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setStarStatus("error");
      }
    }
  }, [question, answer, roleSnapshot, resetStar, setStarRaw, setStarStatus]);

  // Empty state
  if (!question || !roleSnapshot) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">暂无问题</p>
          <Button variant="link" onClick={() => router.push("/")}>
            返回提问
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        {/* Back */}
        <button
          className="mb-6 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="h-4 w-4" />
          新问题
        </button>

        {/* Question */}
        <section>
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            你的问题
          </h3>
          <p className="mt-2 text-base font-medium">{question}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            角色：{formatRole(roleSnapshot)}
          </p>
        </section>

        <hr className="my-6" />

        {/* Answer */}
        <section>
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            AI 参考回答
          </h3>

          {error && (
            <div className="mt-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {isStreaming && !hasAnswer && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              正在生成回答…
            </div>
          )}

          {hasAnswer && (
            <div className="prose prose-sm prose-neutral mt-3 max-w-none leading-relaxed dark:prose-invert">
              <Markdown>
                {answer}
              </Markdown>
              {isStreaming && (
                <span className="inline-block animate-pulse text-primary">▍</span>
              )}
            </div>
          )}
        </section>

        {/* Actions */}
        {hasAnswer && !isStreaming && (
          <>
            <hr className="my-6" />

            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={handleRegenerate}
                disabled={isSaved}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                重新生成
              </Button>

              {!isSaved ? (
                <Button onClick={save}>
                  <Save className="h-3.5 w-3.5" />
                  确认并保存
                </Button>
              ) : (
                <Button variant="outline" onClick={handleUnsave}>
                  <Undo2 className="h-3.5 w-3.5" />
                  撤销保存
                </Button>
              )}

              <Button
                variant="outline"
                disabled={!isSaved || starStatus === "streaming"}
                onClick={handleStarOptimize}
              >
                {starStatus === "streaming" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                {starStatus === "done" ? "重新 STAR" : "STAR 优化"}
              </Button>
              <Button variant="outline" disabled={!isSaved}>
                <MessageSquarePlus className="h-3.5 w-3.5" />
                模拟追问
              </Button>
            </div>

            {/* STAR Section */}
            {starStatus !== "idle" && (
              <>
                <hr className="my-6" />

                <section>
                  <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    STAR 结构化回答
                  </h3>

                  {starStatus === "error" && (
                    <div className="mt-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                      STAR 生成失败，请重试
                    </div>
                  )}

                  <div className="mt-3">
                    <StarCard sections={starSections} status={starStatus} />
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
