import { create } from "zustand";
import type { Role } from "@/types/role";

export interface FavoriteFolder {
  id: number;
  name: string;
  createdAt: string;
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
  createdAt: string;
}

interface DbRecord {
  id: number;
  question: string;
  roleIdentity: string;
  roleExperience: string | null;
  roleScenario: string;
  answer: string;
  starAnswer: string;
  followUps: string[];
  parentId: number | null;
  folderId: number | null;
  category: string;
  createdAt: string;
}

function toRecord(r: DbRecord): QuestionRecord {
  return {
    id: r.id,
    question: r.question,
    roleSnapshot: {
      identity: r.roleIdentity as Role["identity"],
      experience: (r.roleExperience as Role["experience"]) ?? undefined,
      scenario: r.roleScenario as Role["scenario"],
    },
    answer: r.answer,
    starAnswer: r.starAnswer,
    followUps: r.followUps ?? [],
    parentId: r.parentId,
    folderId: r.folderId,
    category: r.category,
    createdAt: r.createdAt,
  };
}

interface HistoryState {
  records: QuestionRecord[];
  folders: FavoriteFolder[];
  loaded: boolean;

  fetchAll: () => Promise<void>;

  addRecord: (
    data: Omit<QuestionRecord, "id" | "createdAt">,
  ) => Promise<QuestionRecord>;
  updateRecord: (id: number, patch: Partial<QuestionRecord>) => Promise<void>;
  removeRecord: (id: number) => Promise<void>;
  setFavoriteFolder: (recordId: number, folderId: number | null) => Promise<void>;
  setCategory: (id: number, category: string) => Promise<void>;
  getRecord: (id: number) => QuestionRecord | undefined;

  addFolder: (name: string) => Promise<number>;
  renameFolder: (id: number, name: string) => Promise<void>;
  removeFolder: (id: number) => Promise<boolean>;
}

export const useHistoryStore = create<HistoryState>()((set, get) => ({
  records: [],
  folders: [],
  loaded: false,

  fetchAll: async () => {
    const [recordsRes, foldersRes] = await Promise.all([
      fetch("/api/records"),
      fetch("/api/folders"),
    ]);
    const rawRecords: DbRecord[] = recordsRes.ok ? await recordsRes.json() : [];
    const folders: FavoriteFolder[] = foldersRes.ok ? await foldersRes.json() : [];
    set({
      records: rawRecords.map(toRecord),
      folders,
      loaded: true,
    });
  },

  addRecord: async (data) => {
    const res = await fetch("/api/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: data.question,
        roleSnapshot: data.roleSnapshot,
        answer: data.answer,
        starAnswer: data.starAnswer,
        followUps: data.followUps,
        parentId: data.parentId,
        folderId: data.folderId,
        category: data.category,
      }),
    });
    const raw: DbRecord = await res.json();
    const record = toRecord(raw);
    set((s) => ({ records: [record, ...s.records] }));
    return record;
  },

  updateRecord: async (id, patch) => {
    const apiPatch: Record<string, unknown> = {};
    if (patch.answer !== undefined) apiPatch.answer = patch.answer;
    if (patch.starAnswer !== undefined) apiPatch.starAnswer = patch.starAnswer;
    if (patch.followUps !== undefined) apiPatch.followUps = patch.followUps;
    if (patch.folderId !== undefined) apiPatch.folderId = patch.folderId;
    if (patch.category !== undefined) apiPatch.category = patch.category;

    set((s) => ({
      records: s.records.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));

    await fetch(`/api/records/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(apiPatch),
    });
  },

  removeRecord: async (id) => {
    set((s) => ({ records: s.records.filter((r) => r.id !== id) }));
    await fetch(`/api/records/${id}`, { method: "DELETE" });
  },

  setFavoriteFolder: async (recordId, folderId) => {
    set((s) => ({
      records: s.records.map((r) =>
        r.id === recordId ? { ...r, folderId } : r,
      ),
    }));
    await fetch(`/api/records/${recordId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderId }),
    });
  },

  setCategory: async (id, category) => {
    set((s) => ({
      records: s.records.map((r) => (r.id === id ? { ...r, category } : r)),
    }));
    await fetch(`/api/records/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category }),
    });
  },

  getRecord: (id) => get().records.find((r) => r.id === id),

  addFolder: async (name) => {
    const res = await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const folder: FavoriteFolder = await res.json();
    set((s) => ({ folders: [...s.folders, folder] }));
    return folder.id;
  },

  renameFolder: async (id, name) => {
    set((s) => ({
      folders: s.folders.map((f) => (f.id === id ? { ...f, name } : f)),
    }));
    await fetch(`/api/folders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
  },

  removeFolder: async (id) => {
    const hasRecords = get().records.some((r) => r.folderId === id);
    if (hasRecords) return false;
    set((s) => ({ folders: s.folders.filter((f) => f.id !== id) }));
    await fetch(`/api/folders/${id}`, { method: "DELETE" });
    return true;
  },
}));
