import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { buildSystemPrompt } from "@/lib/prompts";

export async function POST(req: Request) {
  const { messages, role } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: buildSystemPrompt(role),
    messages,
  });

  return result.toDataStreamResponse();
}
