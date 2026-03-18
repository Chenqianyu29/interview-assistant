import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { buildFollowUpPrompt } from "@/lib/prompts";

export async function POST(req: Request) {
  const { question, answer, role } = await req.json();

  const { text } = await generateText({
    model: openai.chat("gpt-4o-mini"),
    system: buildFollowUpPrompt(role),
    prompt: `## 面试问题\n${question}\n\n## 候选人回答\n${answer}`,
  });

  let questions: string[];
  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed) || parsed.length < 1) throw new Error();
    questions = parsed.slice(0, 3).map(String);
  } catch {
    questions = text
      .split("\n")
      .map((l) => l.replace(/^\d+[.、]\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 3);
  }

  return Response.json({ questions });
}
