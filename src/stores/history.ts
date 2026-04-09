import { create } from "zustand";
import type { Role } from "@/types/role";
import { clearSessionAndRedirectToLogin } from "@/stores/auth";

const cred: RequestCredentials = "include";

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

/** Drizzle/Neon may return `id` as number or bigint; JSON must become a finite number for React keys & UI. */
function toFavoriteFolder(raw: unknown): FavoriteFolder | null {
  if (raw === null || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const idRaw = r.id;
  let id: number;
  if (typeof idRaw === "bigint") id = Number(idRaw);
  else if (typeof idRaw === "number") id = idRaw;
  else if (typeof idRaw === "string") id = Number(idRaw);
  else return null;
  if (!Number.isFinite(id)) return null;
  const createdAt = r.createdAt;
  return {
    id,
    name: String(r.name ?? ""),
    createdAt:
      typeof createdAt === "string"
        ? createdAt
        : createdAt instanceof Date
          ? createdAt.toISOString()
          : String(createdAt ?? ""),
  };
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
      fetch("/api/records", { credentials: cred }),
      fetch("/api/folders", { credentials: cred }),
    ]);
    if (recordsRes.status === 401 || foldersRes.status === 401) {
      clearSessionAndRedirectToLogin();
      return;
    }
    const rawRecords: DbRecord[] = recordsRes.ok ? await recordsRes.json() : [];
    const rawFolders = foldersRes.ok ? await foldersRes.json() : [];
    const folders: FavoriteFolder[] = Array.isArray(rawFolders)
      ? rawFolders
          .map(toFavoriteFolder)
          .filter((f): f is FavoriteFolder => f !== null)
      : [];
    set({
      records: rawRecords.map(toRecord),
      folders,
      loaded: true,
    });
  },

  addRecord: async (data) => {
    const res = await fetch("/api/records", {
      method: "POST",
      credentials: cred,
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
      credentials: cred,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(apiPatch),
    });
  },

  removeRecord: async (id) => {
    set((s) => ({ records: s.records.filter((r) => r.id !== id) }));
    await fetch(`/api/records/${id}`, { method: "DELETE", credentials: cred });
  },

  setFavoriteFolder: async (recordId, folderId) => {
    set((s) => ({
      records: s.records.map((r) =>
        r.id === recordId ? { ...r, folderId } : r,
      ),
    }));
    await fetch(`/api/records/${recordId}`, {
      method: "PATCH",
      credentials: cred,
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
      credentials: cred,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category }),
    });
  },

  getRecord: (id) => get().records.find((r) => r.id === id),

  addFolder: async (name) => {
    const res = await fetch("/api/folders", {
      method: "POST",
      credentials: cred,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const raw: unknown = await res.json();
    if (!res.ok) {
      if (res.status === 401) {
        clearSessionAndRedirectToLogin();
        throw new Error("登录已失效，请重新登录");
      }
      const msg =
        raw &&
        typeof raw === "object" &&
        "error" in raw &&
        typeof (raw as { error: unknown }).error === "string"
          ? (raw as { error: string }).error
          : `HTTP ${res.status}`;
      throw new Error(msg);
    }
    const folder = toFavoriteFolder(raw);
    if (!folder) throw new Error("Invalid folder response");
    set((s) => ({ folders: [...s.folders, folder] }));
    return folder.id;
  },

  renameFolder: async (id, name) => {
    set((s) => ({
      folders: s.folders.map((f) => (f.id === id ? { ...f, name } : f)),
    }));
    await fetch(`/api/folders/${id}`, {
      method: "PATCH",
      credentials: cred,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
  },

  removeFolder: async (id) => {
    const hasRecords = get().records.some((r) => r.folderId === id);
    if (hasRecords) return false;
    set((s) => ({ folders: s.folders.filter((f) => f.id !== id) }));
    await fetch(`/api/folders/${id}`, { method: "DELETE", credentials: cred });
    return true;
  },
}));
