import { Clock } from "lucide-react";

export default function HistoryPage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center">
        <Clock className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <h2 className="mt-3 text-lg font-medium">历史记录</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          你的面试问答记录将展示在这里
        </p>
      </div>
    </div>
  );
}
