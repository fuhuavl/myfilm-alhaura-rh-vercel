import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/api";
import type { User } from "@/types";

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      setAuth: (user, token) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("token", token);
          document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        }
        set({ user, token });
      },
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        set({ user: null, token: null });
      },
      fetchMe: async () => {
        const token = get().token;
        if (!token) return;
        set({ isLoading: true });
        try {
          const { data } = await api.get("/auth/me");
set({ user: data.data?.personal_info ?? data.data ?? data });
          // const { data } = await api.get("/auth/me");
          // set({ user: data.data ?? data });
        } catch {
          set({ user: null, token: null });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      // partialize: (s) => ({ token: s.token }),
      partialize: (s) => ({ token: s.token, user: s.user }),
    }
  )
);
