import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "@/types/role";
import { DEFAULT_ROLE } from "@/types/role";

interface RoleState {
  globalRole: Role;
  overrideRole: Role | null;
  setGlobalRole: (role: Role) => void;
  setOverrideRole: (role: Role | null) => void;
  clearOverride: () => void;
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      globalRole: DEFAULT_ROLE,
      overrideRole: null,
      setGlobalRole: (role) => set({ globalRole: role }),
      setOverrideRole: (role) => set({ overrideRole: role }),
      clearOverride: () => set({ overrideRole: null }),
    }),
    {
      name: "interview-copilot-role",
      partialize: (state) => ({ globalRole: state.globalRole }),
    },
  ),
);

export const selectEffectiveRole = (state: RoleState): Role =>
  state.overrideRole ?? state.globalRole;
