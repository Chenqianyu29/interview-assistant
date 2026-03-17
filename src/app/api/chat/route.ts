import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { buildSystemPrompt } from "@/lib/prompts";

export async function POST(req: Request) {
  const { question, role } = await req.json();

  const result = streamText({
    model: openai.chat("gpt-4o-mini"),
    system: buildSystemPrompt(role),
    prompt: question,
  });

  return result.toTextStreamResponse();
}
