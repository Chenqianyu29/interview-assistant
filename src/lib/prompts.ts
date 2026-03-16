import type { Role } from "@/types/role";

const IDENTITY_MAP: Record<string, string> = {
  student: "在校学生",
  professional: "职场人士",
};

const EXPERIENCE_MAP: Record<string, string> = {
  "1-3y": "1~3年工作经验",
  "3-5y": "3~5年工作经验",
  "5y+": "5年以上工作经验",
};

const SCENARIO_MAP: Record<string, string> = {
  "big-company": "大厂（如 BAT、字节、美团等）",
  "medium-company": "中型互联网公司",
  "small-company": "中小型公司",
  startup: "创业公司",
  foreign: "外企（如 Google、微软、亚马逊等）",
};

export function buildSystemPrompt(role: Role): string {
  const identity = IDENTITY_MAP[role.identity];
  const experience = role.experience ? EXPERIENCE_MAP[role.experience] : null;
  const scenario = SCENARIO_MAP[role.scenario];

  const profileParts = [identity];
  if (experience) profileParts.push(experience);
  const profile = profileParts.join("，");

  return `你是一位资深面试辅导专家，擅长帮助候选人准备技术和行为面试。

## 候选人背景
- 身份：${profile}
- 目标：正在准备${scenario}的面试

## 回答要求
1. 针对候选人的身份和经验水平，调整回答的深度、用词和侧重点
2. 回答应专业、结构清晰、有说服力
3. 结合${scenario}的面试风格和评估标准来组织回答
4. 适当融入具体案例或场景，增强可信度
5. 回答长度适中（300~600字），既全面又精炼
6. 使用中文回答`;
}
