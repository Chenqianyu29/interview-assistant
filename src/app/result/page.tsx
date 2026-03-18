"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuestionStore } from "@/stores/question";
import { formatRole } from "@/types/role";
import { Button } from "@/components/ui/button";
import { StarCard } from "@/components/star-card";
import { FollowUpList } from "@/components/follow-up-list";
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

  const followUps = useQuestionStore((s) => s.followUps);
  const followUpStatus = useQuestionStore((s) => s.followUpStatus);
  const setFollowUps = useQuestionStore((s) => s.setFollowUps);
  const setFollowUpStatus = useQuestionStore((s) => s.setFollowUpStatus);
  const resetFollowUps = useQuestionStore((s) => s.resetFollowUps);
  const startQuestion = useQuestionStore((s) => s.startQuestion);

  const [answer, setAnswer] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regenerateCount, setRegenerateCount] = useState(0);

  const starAbortRef = useRef<AbortController | null>(null);
  const followUpAbortRef = useRef<AbortController | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const autoScrollRef = useRef(true);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    });
  }, []);

  // 主答案流式生成时自动跟随滚动
  useEffect(() => {
    if (!isStreaming || !answer) return;
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      autoScrollRef.current = distanceFromBottom < 80;
    };
    el.addEventListener("scroll", handleScroll, { passive: true });

    return () => el.removeEventListener("scroll", handleScroll);
  }, [isStreaming, answer]);

  useEffect(() => {
    if (!isStreaming || !autoScrollRef.current) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [answer, isStreaming]);

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
    followUpAbortRef.current?.abort();
    unsave();
  };

  const handleStarOptimize = useCallback(async () => {
    if (!question || !roleSnapshot || !answer) return;

    starAbortRef.current?.abort();
    const controller = new AbortController();
    starAbortRef.current = controller;

    resetStar();
    setStarStatus("streaming");
    scrollToBottom();

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
      scrollToBottom();
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setStarStatus("error");
      }
    }
  }, [question, answer, roleSnapshot, resetStar, setStarRaw, setStarStatus, scrollToBottom]);

  const handleFollowUp = useCallback(async () => {
    if (!question || !roleSnapshot || !answer) return;

    followUpAbortRef.current?.abort();
    const controller = new AbortController();
    followUpAbortRef.current = controller;

    resetFollowUps();
    setFollowUpStatus("streaming");
    scrollToBottom();

    try {
      const res = await fetch("/api/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer, role: roleSnapshot }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`追问生成失败 (${res.status})`);

      const data = await res.json();
      setFollowUps(data.questions);
      setFollowUpStatus("done");
      scrollToBottom();
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setFollowUpStatus("error");
      }
    }
  }, [question, answer, roleSnapshot, resetFollowUps, setFollowUps, setFollowUpStatus, scrollToBottom]);

  const handleSelectFollowUp = useCallback(
    (followUpQuestion: string) => {
      if (!roleSnapshot || !questionId) return;
      startQuestion(followUpQuestion, roleSnapshot, questionId);
    },
    [roleSnapshot, questionId, startQuestion],
  );

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
    <div ref={scrollContainerRef} className="flex flex-1 flex-col overflow-y-auto">
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
              <Button
                variant="outline"
                disabled={!isSaved || followUpStatus === "streaming"}
                onClick={handleFollowUp}
              >
                {followUpStatus === "streaming" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <MessageSquarePlus className="h-3.5 w-3.5" />
                )}
                {followUpStatus === "done" ? "重新追问" : "模拟追问"}
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

            {/* Follow-up Section */}
            {followUpStatus !== "idle" && (
              <>
                <hr className="my-6" />

                <section>
                  <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    模拟追问
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    点击任意追问，自动进入新一轮问答
                  </p>

                  <div className="mt-3">
                    <FollowUpList
                      items={followUps}
                      status={followUpStatus}
                      onSelect={handleSelectFollowUp}
                    />
                  </div>
                </section>
              </>
            )}
          </>
        )}

        <div ref={bottomRef} className="h-24" />
      </div>
    </div>
  );
}
