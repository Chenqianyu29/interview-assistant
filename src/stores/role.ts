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
  syncGlobalRole: (role: Role) => void;
  pushGlobalRole: (role: Role) => Promise<void>;
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      globalRole: DEFAULT_ROLE,
      overrideRole: null,

      setGlobalRole: (role) => {
        set({ globalRole: role });
        fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            globalIdentity: role.identity,
            globalExperience: role.experience ?? null,
            globalScenario: role.scenario,
          }),
        }).catch(() => {});
      },

      setOverrideRole: (role) => set({ overrideRole: role }),
      clearOverride: () => set({ overrideRole: null }),

      syncGlobalRole: (role) => set({ globalRole: role }),

      pushGlobalRole: async (role) => {
        set({ globalRole: role });
        await fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            globalIdentity: role.identity,
            globalExperience: role.experience ?? null,
            globalScenario: role.scenario,
          }),
        });
      },
    }),
    {
      name: "interview-copilot-role",
      partialize: (state) => ({ globalRole: state.globalRole }),
    },
  ),
);

export const selectEffectiveRole = (state: RoleState): Role =>
  state.overrideRole ?? state.globalRole;
