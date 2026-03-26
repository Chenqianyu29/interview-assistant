import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "@/types/role";

export interface FavoriteFolder {
  id: number;
  name: string;
  createdAt: number;
}

export interface QuestionRecord {
  id: number;
  question: string;
  roleSnapshot: Role;
  answer: string;
  starAnswer: string;
  followUps: string[];
  parentId: number | null;
  folderId: number | null;
  category: string;
  createdAt: number;
}

interface HistoryState {
  records: QuestionRecord[];
  folders: FavoriteFolder[];

  addRecord: (record: QuestionRecord) => void;
  updateRecord: (id: number, patch: Partial<QuestionRecord>) => void;
  removeRecord: (id: number) => void;
  setFavoriteFolder: (recordId: number, folderId: number | null) => void;
  setCategory: (id: number, category: string) => void;
  getRecord: (id: number) => QuestionRecord | undefined;
  clearAll: () => void;

  addFolder: (name: string) => number;
  renameFolder: (id: number, name: string) => void;
  removeFolder: (id: number) => boolean;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      records: [],
      folders: [],

      addRecord: (record) =>
        set((s) => ({
          records: s.records.some((r) => r.id === record.id)
            ? s.records
            : [record, ...s.records],
        })),

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

      setFavoriteFolder: (recordId, folderId) =>
        set((s) => ({
          records: s.records.map((r) =>
            r.id === recordId ? { ...r, folderId } : r,
          ),
        })),

      setCategory: (id, category) =>
        set((s) => ({
          records: s.records.map((r) =>
            r.id === id ? { ...r, category } : r,
          ),
        })),

      getRecord: (id) => get().records.find((r) => r.id === id),

      clearAll: () => set({ records: [], folders: [] }),

      addFolder: (name) => {
        const id = Date.now();
        set((s) => ({
          folders: [...s.folders, { id, name, createdAt: id }],
        }));
        return id;
      },

      renameFolder: (id, name) =>
        set((s) => ({
          folders: s.folders.map((f) =>
            f.id === id ? { ...f, name } : f,
          ),
        })),

      removeFolder: (id) => {
        const hasRecords = get().records.some((r) => r.folderId === id);
        if (hasRecords) return false;
        set((s) => ({
          folders: s.folders.filter((f) => f.id !== id),
        }));
        return true;
      },
    }),
    {
      name: "interview-copilot-history",
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const seen = new Set<number>();
        state.records = state.records.filter((r) => {
          if (seen.has(r.id)) return false;
          seen.add(r.id);
          return true;
        });
        // migrate: isFavorite → folderId
        state.records = state.records.map((r) => {
          if (!("folderId" in r)) {
            return { ...r, folderId: null };
          }
          return r;
        });
        if (!state.folders) state.folders = [];
      },
    },
  ),
);
