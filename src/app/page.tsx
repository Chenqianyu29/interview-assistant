import { ArrowUp, ChevronDown } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <h2 className="text-lg font-medium">InterviewCopilot</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        输入面试问题，AI 帮你生成高质量回答
      </p>

      {/* Input area */}
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
          <button className="flex items-center gap-0.5 transition-colors hover:text-foreground">
            <span>职场人·1~3年·大厂</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
