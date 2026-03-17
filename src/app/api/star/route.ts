import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { buildStarPrompt } from "@/lib/prompts";

export async function POST(req: Request) {
  const { question, answer, role } = await req.json();

  const result = streamText({
    model: openai.chat("gpt-4o-mini"),
    system: buildStarPrompt(role),
    prompt: `## 面试问题
${question}

## 候选人原始回答
${answer}

请将上述回答用 STAR 法则重新组织。`,
  });

  return result.toTextStreamResponse();
}
