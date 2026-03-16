import { ArrowUp } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Chat area placeholder */}
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium">InterviewCopilot</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            输入面试问题，AI 帮你生成高质量回答
          </p>
        </div>
      </div>

      {/* Input area */}
      <div className="border-t p-4">
        <div className="mx-auto max-w-2xl">
          <div className="relative">
            <textarea
              placeholder="Send a message..."
              rows={1}
              className="w-full resize-none rounded-xl border bg-background px-4 py-3 pr-12 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              disabled
            />
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-primary p-1.5 text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              disabled
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <span>当前角色：职场人·1~3年·大厂</span>
            <span>∨</span>
          </div>
        </div>
      </div>
    </div>
  );
}
