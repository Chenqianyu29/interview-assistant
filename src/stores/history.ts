import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "@/types/role";

export interface QuestionRecord {
  id: number;
  question: string;
  roleSnapshot: Role;
  answer: string;
  starAnswer: string;
  followUps: string[];
  parentId: number | null;
  isFavorite: boolean;
  category: string;
  createdAt: number;
}

interface HistoryState {
  records: QuestionRecord[];

  addRecord: (record: QuestionRecord) => void;
  updateRecord: (id: number, patch: Partial<QuestionRecord>) => void;
  removeRecord: (id: number) => void;
  toggleFavorite: (id: number) => void;
  setCategory: (id: number, category: string) => void;
  getRecord: (id: number) => QuestionRecord | undefined;
  clearAll: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      records: [],

      addRecord: (record) =>
        set((s) => ({ records: [record, ...s.records] })),

      updateRecord: (id, patch) =>
        set((s) => ({
          records: s.records.map((r) =>
            r.id === id ? { ...r, ...patch } : r,
          ),
        })),

      removeRecord: (id) =>
        set((s) => ({
          records: s.records.filter((r) => r.id !== id),
        })),

      toggleFavorite: (id) =>
        set((s) => ({
          records: s.records.map((r) =>
            r.id === id ? { ...r, isFavorite: !r.isFavorite } : r,
          ),
        })),

      setCategory: (id, category) =>
        set((s) => ({
          records: s.records.map((r) =>
            r.id === id ? { ...r, category } : r,
          ),
        })),

      getRecord: (id) => get().records.find((r) => r.id === id),

      clearAll: () => set({ records: [] }),
    }),
    { name: "interview-copilot-history" },
  ),
);
