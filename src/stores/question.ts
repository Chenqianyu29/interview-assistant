import { create } from "zustand";
import type { Role } from "@/types/role";

interface QuestionState {
  questionId: number | null;
  question: string | null;
  roleSnapshot: Role | null;
  saveStatus: "unsaved" | "saved";

  startQuestion: (q: string, role: Role) => void;
  save: () => void;
  unsave: () => void;
}

export const useQuestionStore = create<QuestionState>()((set) => ({
  questionId: null,
  question: null,
  roleSnapshot: null,
  saveStatus: "unsaved",

  startQuestion: (question, roleSnapshot) =>
    set({
      questionId: Date.now(),
      question,
      roleSnapshot,
      saveStatus: "unsaved",
    }),

  save: () => set({ saveStatus: "saved" }),

  unsave: () => set({ saveStatus: "unsaved" }),
}));
