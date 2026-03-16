import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { buildSystemPrompt } from "@/lib/prompts";

export async function POST(req: Request) {
  try {
    const { question, role } = await req.json();

    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: buildSystemPrompt(role),
      prompt: question,
    });

    return result.toTextStreamResponse();
  } catch (err) {
    console.error("[/api/chat] Error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
