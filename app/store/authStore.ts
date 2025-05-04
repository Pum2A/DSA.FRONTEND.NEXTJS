import { create } from "zustand";
// Upewnij się, że importujesz poprawnie skonfigurowany apiService z poprawkami
import { apiService } from "../lib/api"; // Dostosuj ścieżkę, jeśli jest inna
import { AuthState, RegisterData, User } from "../types/auth"; // Dostosuj ścieżkę, jeśli jest inna

// Funkcja pomocnicza do ekstrakcji błędów (może być w osobnym pliku utils)
const extractErrorMessage = (error: any, defaultMessage: string): string => {
  // Dostosuj do struktury błędów zwracanych przez Twoje API (np. ProblemDetails)
  return (
    error?.response?.data?.errors?.[0] || // Standardowy błąd walidacji ASP.NET Core
    error?.response?.data?.title || // Tytuł z ProblemDetails
    error?.response?.data?.message || // Pole 'message' jeśli API je zwraca
    error?.message || // Ogólny błąd axios/fetch
    defaultMessage
  );
};

export const useAuthStore = create<AuthState>((set, get) => ({
  // Stan początkowy
  user: null,
  isAuthenticated: false,
  isLoading: true, // Zacznij jako true, bo checkAuthStatus jest wołany na starcie
  error: null,

  // Akcja logowania
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      // Wywołaj endpoint logowania używając poprawnej ścieżki względnej z apiService.auth
      await apiService.auth.login({ email, password });
      // Jeśli logowanie API się powiedzie, backend ustawił HttpOnly cookie.
      // Teraz pobierz dane użytkownika, aby zaktualizować stan.
      await get().checkAuthStatus();
      // Stan (user, isAuthenticated, isLoading) zostanie ustawiony w checkAuthStatus
    } catch (error: any) {
      console.error("Login failed:", error);
      set({
        isLoading: false,
        error: extractErrorMessage(
          error,
          "Logowanie nie powiodło się. Sprawdź email i hasło."
        ),
        isAuthenticated: false, // Upewnij się, że stan jest spójny przy błędzie
        user: null,
      });
      // Rzuć błąd dalej, jeśli komponenty potrzebują na niego zareagować
      // throw error;
    }
  },

  // Akcja rejestracji
  register: async (registerData: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      // Wywołaj endpoint rejestracji
      await apiService.auth.register(registerData);
      // Jeśli rejestracja API się powiedzie, backend prawdopodobnie zalogował użytkownika (ustawił cookie).
      // Pobierz dane użytkownika.
      await get().checkAuthStatus();
    } catch (error: any) {
      console.error("Registration failed:", error);
      set({
        isLoading: false,
        error: extractErrorMessage(
          error,
          "Rejestracja nie powiodła się. Spróbuj ponownie."
        ),
        isAuthenticated: false,
        user: null,
      });
      // throw error;
    }
  },

  // Akcja wylogowania
  logout: async () => {
    set({ isLoading: true }); // Pokaż ładowanie
    try {
      // Wywołaj endpoint wylogowania
      await apiService.auth.logout();
      // Backend powinien usunąć/unieważnić cookie
    } catch (error) {
      // Nawet jeśli API zawiedzie, czyść stan lokalny
      console.error(
        "Error during API logout, but clearing state anyway:",
        error
      );
    } finally {
      // Zawsze czyść stan lokalny po próbie wylogowania
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null, // Wyczyść błędy
      });
      // Opcjonalnie: przekieruj na stronę główną/logowania
      // if (typeof window !== 'undefined') window.location.href = '/';
    }
  },

  // Akcja sprawdzania statusu autoryzacji (np. przy ładowaniu aplikacji)
  checkAuthStatus: async () => {
    // Ustaw ładowanie tylko jeśli nie jest już ustawione
    if (!get().isLoading) set({ isLoading: true });
    set({ error: null }); // Wyczyść poprzednie błędy

    try {
      // Wywołaj endpoint sprawdzania statusu
      const data = await apiService.auth.checkStatus();

      // Sprawdź, czy odpowiedź zawiera oczekiwane dane (np. ID użytkownika)
      if (data && data.id) {
        set({
          // Mapuj pola z odpowiedzi API na stan User
          user: {
            id: data.id, // Zakładając, że API zwraca 'id'
            userName: data.userName,
            email: data.email,
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            roles: data.roles || [],
            experiencePoints: data.experiencePoints || 0,
            level: data.level || 1,
            joinedAt: data.joinedAt || new Date().toISOString(), // Upewnij się, że API zwraca joinedAt
          },
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        // API zwróciło 200 OK, ale bez danych - traktuj jako niezalogowany
        console.warn("Auth check successful but no user data received.");
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error: any) {
      // Błąd (np. 401 Unauthorized, sieciowy) jest oczekiwany, jeśli cookie jest nieważne lub go nie ma.
      // Nie traktuj tego jako globalnego błędu aplikacji, tylko jako stan "niezalogowany".
      console.log(
        "Auth check failed (expected if not logged in):",
        error?.response?.status || error.message
      );
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  // Akcja aktualizacji użytkownika (przykład)
  updateUser: async (updatedFields: User) => {
    // Typ pozostaje User na potrzeby testów
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

  // clearError bez zmian
  clearError: () => {
    set({ error: null });
  },
}));
