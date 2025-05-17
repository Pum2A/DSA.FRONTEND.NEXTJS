import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiService } from "../lib/api";
import { AuthState, RegisterData, User } from "../types/auth";
import { extractErrorMessage } from "../utils/extractErrorMessage";

/**
 * AuthStore – centralny magazyn stanu do obsługi logowania, rejestracji, sesji i profilu usera
 * - Możesz go użyć w dowolnym miejscu przez: useAuthStore((state) => state.coś)
 * - Zawiera pełny cycle: login, register, logout, checkAuthStatus, updateUser, clearError
 * - Stan jest zapamiętywany w localStorage (persist), więc user nie jest wylogowywany po refreshu (jeśli chcesz!)
 */

// Domyślny user – dla bezpieczeństwa
const defaultUser: User = {
  id: "",
  userName: "",
  email: "",
  firstName: "",
  lastName: "",
  roles: [],
  experiencePoints: 0,
  level: 1,
  joinedAt: new Date().toISOString(),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Akcja: logowanie użytkownika
      async login(email, password) {
        set({ isLoading: true, error: null });
        try {
          await apiService.auth.login({ email, password });
          await get().checkAuthStatus(); // Pobierz dane usera po zalogowaniu
        } catch (error: any) {
          set({
            isLoading: false,
            error: extractErrorMessage(
              error,
              "Logowanie nie powiodło się. Sprawdź email i hasło."
            ),
            isAuthenticated: false,
            user: null,
          });
        }
      },

      // Akcja: rejestracja użytkownika
      async register(registerData) {
        set({ isLoading: true, error: null });
        try {
          await apiService.auth.register(registerData);
          await get().checkAuthStatus();
        } catch (error: any) {
          set({
            isLoading: false,
            error: extractErrorMessage(
              error,
              "Rejestracja nie powiodła się. Spróbuj ponownie."
            ),
            isAuthenticated: false,
            user: null,
          });
        }
      },

      // Akcja: wylogowanie użytkownika
      async logout() {
        set({ isLoading: true });
        try {
          await apiService.auth.logout();
        } catch (error) {
          // Niezależnie od błędu, czyść stan lokalny!
          // (np. utracone połączenie z backendem, backend już wylogował usera)
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      // Akcja: sprawdzanie statusu autoryzacji (np. na starcie aplikacji)
      async checkAuthStatus() {
        if (!get().isLoading) set({ isLoading: true });
        set({ error: null });
        try {
          const data = await apiService.auth.checkStatus();
          if (data && data.id) {
            set({
              user: {
                id: data.id,
                userName: data.userName,
                email: data.email,
                firstName: data.firstName || "",
                lastName: data.lastName || "",
                roles: data.roles || [],
                experiencePoints: data.experiencePoints || 0,
                level: data.level || 1,
                joinedAt: data.joinedAt || new Date().toISOString(),
              },
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        } catch (error: any) {
          // Błąd = user nie jest zalogowany (np. 401)
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      // Akcja: aktualizacja usera (np. zmiana profilu)
      async updateUser(updatedFields) {
        if (!get().user) return false;
        set({ isLoading: true, error: null });
        try {
          const updatedUserFromApi = await apiService.put<User>(
            "Auth/user",
            updatedFields
          );
          set({ user: updatedUserFromApi, isLoading: false });
          return true;
        } catch (error: any) {
          set({
            isLoading: false,
            error: extractErrorMessage(
              error,
              "Nie udało się zaktualizować profilu"
            ),
          });
          return false;
        }
      },

      // Akcja: czyść error (np. po zamknięciu okienka z błędem)
      clearError() {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage", // Klucz localStorage
      partialize: (state) => ({
        // Trzymaj tylko te pola pomiędzy odświeżeniami
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // Możesz dodać migrate, serialize/deserialize itd.
    }
  )
);
