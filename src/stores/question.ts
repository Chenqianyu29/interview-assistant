import { create } from "zustand";
import type { Role } from "@/types/role";

export type AsyncStatus = "idle" | "streaming" | "done" | "error";
export type StarStatus = AsyncStatus;

export interface StarSection {
  title: string;
  content: string;
}

interface QuestionState {
  questionId: number | null;
  question: string | null;
  roleSnapshot: Role | null;
  parentId: number | null;
  saveStatus: "unsaved" | "saved";

  starRaw: string;
  starStatus: StarStatus;
  starSections: StarSection[];

  followUps: string[];
  followUpStatus: AsyncStatus;

  startQuestion: (q: string, role: Role, parentId?: number | null) => void;
  save: () => void;
  unsave: () => void;

  setStarRaw: (raw: string) => void;
  setStarStatus: (status: StarStatus) => void;
  resetStar: () => void;

  setFollowUps: (items: string[]) => void;
  setFollowUpStatus: (status: AsyncStatus) => void;
  resetFollowUps: () => void;
}

const STAR_HEADINGS = ["Situation", "Task", "Action", "Result"] as const;

function parseStarSections(raw: string): StarSection[] {
  const sections: StarSection[] = [];
  for (const heading of STAR_HEADINGS) {
    const regex = new RegExp(`##\\s*${heading}\\s*\\n`, "i");
    const match = raw.match(regex);
    if (!match || match.index === undefined) {
      sections.push({ title: heading, content: "" });
      continue;
    }
    const start = match.index + match[0].length;
    const nextHeadingIdx = STAR_HEADINGS.filter((h) => h !== heading)
      .map((h) => {
        const r = new RegExp(`##\\s*${h}`, "i");
        const m = raw.slice(start).match(r);
        return m?.index !== undefined ? start + m.index : Infinity;
      })
      .reduce((min, v) => Math.min(min, v), Infinity);

    const content = raw.slice(start, nextHeadingIdx === Infinity ? undefined : nextHeadingIdx).trim();
    sections.push({ title: heading, content });
  }
  return sections;
}

export const useQuestionStore = create<QuestionState>()((set) => ({
  questionId: null,
  question: null,
  roleSnapshot: null,
  parentId: null,
  saveStatus: "unsaved",

  starRaw: "",
  starStatus: "idle",
  starSections: [],

  followUps: [],
  followUpStatus: "idle",

  startQuestion: (question, roleSnapshot, parentId = null) =>
    set({
      questionId: Date.now(),
      question,
      roleSnapshot,
      parentId: parentId ?? null,
      saveStatus: "unsaved",
      starRaw: "",
      starStatus: "idle",
      starSections: [],
      followUps: [],
      followUpStatus: "idle",
    }),

  save: () => set({ saveStatus: "saved" }),

  unsave: () =>
    set({
      saveStatus: "unsaved",
      starRaw: "",
      starStatus: "idle",
      starSections: [],
      followUps: [],
      followUpStatus: "idle",
    }),

  setStarRaw: (raw) =>
    set({ starRaw: raw, starSections: parseStarSections(raw) }),

  setStarStatus: (status) => set({ starStatus: status }),

  resetStar: () =>
    set({ starRaw: "", starStatus: "idle", starSections: [] }),

  setFollowUps: (items) => set({ followUps: items }),

  setFollowUpStatus: (status) => set({ followUpStatus: status }),

  resetFollowUps: () =>
    set({ followUps: [], followUpStatus: "idle" }),
}));
