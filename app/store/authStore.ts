import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiService } from "@/app/lib/api";
import { AuthState, RegisterData, User } from "@/app/types/auth";
import { extractErrorMessage } from "@/app/utils/extractErrorMessage";

/**
 * AuthStore – zarządza logiką logowania, rejestracji, sesji i profilu użytkownika.
 * - Użycie: const { login, user, ... } = useAuthStore();
 * - Przechowuje tylko user i isAuthenticated w localStorage (persist).
 * - Stan error, loading: tylko tymczasowo, nie zapisywane.
 * - Akcje są asynchroniczne, zawsze czyść error po obsłudze!
 */

// Domyślny user (opcjonalnie, do typowania/placeholdera)
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
  // persist dodaje to wszystko potem do LocalStorage i jest jako token, przy logout sie to czysci
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      /** Logowanie użytkownika */
      async login(email: string, password: string) {
        set({ isLoading: true, error: null });
        try {
          await apiService.auth.login({ email, password });
          await get().checkAuthStatus();
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

      /** Rejestracja użytkownika */
      async register(registerData: RegisterData) {
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

      /** Wylogowanie użytkownika */
      async logout() {
        set({ isLoading: true });
        try {
          await apiService.auth.logout();
        } catch (error) {
          // Ignoruj błąd (np. backend już wylogował usera)
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      /** Sprawdzenie statusu autoryzacji (na starcie appki lub po logowaniu) */
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
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      /** Aktualizacja danych użytkownika (np. profil) */
      async updateUser(updatedFields: Partial<User>) {
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

      /** Czyści error (np. po zamknięciu powiadomienia/toasta) */
      clearError() {
        set({ error: null });
      },

      /** Resetuje CAŁY store do wartości początkowych (np. po wylogowaniu globalnym) */
      reset() {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // Możesz dodać migrate, serialize/deserialize itp.
    }
  )
);
