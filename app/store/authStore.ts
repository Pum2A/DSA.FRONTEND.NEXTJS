import { create } from "zustand";
import api from "../lib/api";
import { AuthState, RegisterData } from "../types/auth";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data } = await api.post("/auth/login", { email, password });

      if (data.succeeded) {
        set({
          user: {
            id: data.userId,
            userName: data.userName,
            email: data.email,
            roles: data.roles || [],
            experiencePoints: 0,
            level: 1,
          },
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: data.errors?.[0] || "Login failed",
        });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error:
          error.response?.data?.errors?.[0] || error.message || "Login failed",
      });
    }
  },

  register: async (registerData: RegisterData) => {
    set({ isLoading: true, error: null });

    try {
      const { data } = await api.post("/auth/register", registerData);

      if (data.succeeded) {
        set({
          user: {
            id: data.userId,
            userName: data.userName,
            email: data.email,
            roles: data.roles || [],
            experiencePoints: 0,
            level: 1,
          },
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: data.errors?.[0] || "Registration failed",
        });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error:
          error.response?.data?.errors?.[0] ||
          error.message ||
          "Registration failed",
      });
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Error during logout:", error);
    }

    set({
      user: null,
      isAuthenticated: false,
    });
  },

  checkAuthStatus: async () => {
    set({ isLoading: true });

    try {
      const { data } = await api.get("/auth/user");

      if (data) {
        set({
          user: data,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error) {
      // Użytkownik nie jest zalogowany
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
