import { create } from "zustand";
import { apiService } from "../lib/api";
import { AuthState, RegisterData, User } from "../types/auth";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const data = (await apiService.post("/auth/login", {
        email,
        password,
      })) as {
        succeeded: boolean;
        userId: string;
        userName: string;
        email: string;
        firstName?: string;
        lastName?: string;
        roles?: string[];
        experiencePoints?: number;
        level?: number;
        joinedAt: string;
        errors?: string[];
      };

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
        error: extractErrorMessage(error, "Login failed"),
      });
    }
  },

  register: async (registerData: RegisterData) => {
    set({ isLoading: true, error: null });

    try {
      const data = (await apiService.post("/auth/register", registerData)) as {
        succeeded: boolean;
        userId: string;
        userName: string;
        email: string;
        firstName?: string;
        lastName?: string;
        roles?: string[];
        joinedAt: string;
        errors?: string[];
      };

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
        error: extractErrorMessage(error, "Registration failed"),
      });
    }
  },

  logout: async () => {
    try {
      await apiService.post("/auth/logout");
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
      const data = (await apiService.get("/auth/user")) as {
        userId: string;
        userName: string;
        email: string;
        firstName?: string;
        lastName?: string;
        roles?: string[];
        experiencePoints?: number;
        level?: number;
        joinedAt: string;
      };

      if (data) {
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
      }
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  updateUser: async (updatedUser: User) => {
    set({ isLoading: true, error: null });

    try {
      // Send updated user details to API if needed
      // await apiService.put("/auth/profile", updatedUser);

      // Update user data locally in the store
      set((state) => ({
        ...state,
        user: updatedUser,
        isLoading: false,
      }));

      return true;
    } catch (error: any) {
      set({
        isLoading: false,
        error: extractErrorMessage(error, "Failed to update profile"),
      });

      return false;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Utility to extract error messages for consistent error handling
const extractErrorMessage = (error: any, defaultMessage: string): string => {
  return (
    error.response?.data?.errors?.[0] ||
    error.response?.data?.message ||
    error.message ||
    defaultMessage
  );
};
