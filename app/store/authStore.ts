import { create } from "zustand";
import api from "../lib/api";
import { AuthState, RegisterData, User } from "../types/auth";

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
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            roles: data.roles || [],
            experiencePoints: data.experiencePoints || 0,
            level: data.level || 1,
            joinedAt: data.joinedAt,
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
            firstName: registerData.firstName || "",
            lastName: registerData.lastName || "",
            roles: data.roles || [],
            experiencePoints: 0,
            level: 1,
            joinedAt: data.joinedAt,
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

  // Nowa metoda do aktualizacji danych użytkownika
  updateUser: async (updatedUser: User) => {
    set((state) => ({
      ...state,
      isLoading: true,
      error: null,
    }));

    try {
      // Opcjonalnie - wysyłanie danych do API
      // Jeśli masz endpoint do aktualizacji profilu, można go użyć:
      // await api.put('/auth/profile', {
      //   firstName: updatedUser.firstName,
      //   lastName: updatedUser.lastName,
      //   email: updatedUser.email
      // });

      // Aktualizacja danych lokalnie
      set((state) => ({
        ...state,
        user: updatedUser,
        isLoading: false,
      }));

      return true;
    } catch (error: any) {
      set((state) => ({
        ...state,
        isLoading: false,
        error:
          error.response?.data?.message ||
          "Nie udało się zaktualizować profilu",
      }));

      return false;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
