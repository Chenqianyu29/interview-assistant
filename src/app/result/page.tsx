"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuestionStore } from "@/stores/question";
import { formatRole } from "@/types/role";
import type { Role } from "@/types/role";
import { Button } from "@/components/ui/button";
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

  const [answer, setAnswer] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async (q: string, role: Role) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setAnswer("");
    setError(null);
    setIsStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, role }),
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
      setIsStreaming(false);
    }
  }, []);

  // Auto-trigger on new question
  const lastIdRef = useRef<number | null>(null);
  useEffect(() => {
    if (questionId && questionId !== lastIdRef.current && question && roleSnapshot) {
      lastIdRef.current = questionId;
      generate(question, roleSnapshot);
    }
  }, [questionId, question, roleSnapshot, generate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const hasAnswer = answer.length > 0;
  const isSaved = saveStatus === "saved";

  const handleRegenerate = () => {
    if (!question || !roleSnapshot) return;
    unsave();
    generate(question, roleSnapshot);
  };

  const handleUnsave = () => {
    if (window.confirm("撤销保存将清空 STAR 优化和追问记录，确定要继续吗？")) {
      unsave();
    }
  };

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
            <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
              {answer}
              {isStreaming && (
                <span className="inline-block animate-pulse text-primary">▍</span>
              )}
            </div>
          )}
        </section>

        {/* Actions — after streaming completes */}
        {hasAnswer && !isStreaming && (
          <>
            <hr className="my-6" />

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleRegenerate}>
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
            </div>

            <div className="mt-3 flex flex-wrap gap-3">
              <Button variant="outline" disabled={!isSaved}>
                <Sparkles className="h-3.5 w-3.5" />
                STAR 优化
              </Button>
              <Button variant="outline" disabled={!isSaved}>
                <MessageSquarePlus className="h-3.5 w-3.5" />
                模拟追问
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
