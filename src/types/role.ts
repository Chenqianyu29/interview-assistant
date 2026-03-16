export type Identity = "student" | "professional";

export type Experience = "1-3y" | "3-5y" | "5y+";

export type Scenario =
  | "big-company"
  | "medium-company"
  | "small-company"
  | "startup"
  | "foreign";

export interface Role {
  identity: Identity;
  experience?: Experience;
  scenario: Scenario;
}

export const IDENTITY_OPTIONS: { value: Identity; label: string }[] = [
  { value: "student", label: "学生" },
  { value: "professional", label: "职场人" },
];

export const EXPERIENCE_OPTIONS: { value: Experience; label: string }[] = [
  { value: "1-3y", label: "1~3年" },
  { value: "3-5y", label: "3~5年" },
  { value: "5y+", label: "5年以上" },
];

export const SCENARIO_OPTIONS: { value: Scenario; label: string }[] = [
  { value: "big-company", label: "大厂" },
  { value: "medium-company", label: "中厂" },
  { value: "small-company", label: "小厂" },
  { value: "startup", label: "创业公司" },
  { value: "foreign", label: "外企" },
];

const SCENARIO_LABEL: Record<Scenario, string> = {
  "big-company": "大厂",
  "medium-company": "中厂",
  "small-company": "小厂",
  startup: "创业公司",
  foreign: "外企",
};

const EXPERIENCE_LABEL: Record<Experience, string> = {
  "1-3y": "1~3年",
  "3-5y": "3~5年",
  "5y+": "5年以上",
};

export function formatRole(role: Role): string {
  const scenario = SCENARIO_LABEL[role.scenario];
  if (role.identity === "student") {
    return `学生·${scenario}`;
  }
  return `职场人·${EXPERIENCE_LABEL[role.experience!]}·${scenario}`;
}

export function isRoleEqual(a: Role, b: Role): boolean {
  return (
    a.identity === b.identity &&
    a.experience === b.experience &&
    a.scenario === b.scenario
  );
}

export const DEFAULT_ROLE: Role = {
  identity: "professional",
  experience: "1-3y",
  scenario: "big-company",
};
