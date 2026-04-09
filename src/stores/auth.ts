import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: string | null;
  userId: number | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

/** Cookie session 与 persist 的 isAuthenticated 可能不一致（过期、清 cookie 等），遇 401 时调用以回到登录页 */
export function clearSessionAndRedirectToLogin() {
  useAuthStore.getState().logout();
  if (typeof window !== "undefined") {
    window.location.assign("/login");
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      userId: null,
      isAuthenticated: false,

      login: async (username, password) => {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        if (!res.ok) return false;
        const data = await res.json();
        set({ user: data.user, userId: data.userId, isAuthenticated: true });
        return true;
      },

      logout: () => {
        document.cookie =
          "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        localStorage.removeItem("interview-copilot-auth");
        set({ user: null, userId: null, isAuthenticated: false });
      },
    }),
    { name: "interview-copilot-auth" },
  ),
);
