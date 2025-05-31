"use client";

import { usePathname, useRouter } from "next/navigation";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
// Upewnij się, że ten import jest poprawny i plik authTypes.ts zawiera ApiRegisterRequest

import { toast } from "sonner"; // <--- ZMIANA: Import toast z sonner
import {
  getMe,
  loginUser,
  logoutUser,
  registerUser,
} from "../features/auth/api";
import {
  ApiRegisterRequest,
  AuthResponse,
  LoginRequest,
} from "../types/api/authTypes";
import { UserDto } from "../types/api/userTypes";

interface AuthContextType {
  user: UserDto | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: ApiRegisterRequest) => Promise<void>; // Używamy ApiRegisterRequest
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authApiError, setAuthApiError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  // const { toast } = useToast(); // Usunięte - używamy toast z sonner bezpośrednio

  const clearError = () => setAuthApiError(null);

  const fetchUser = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const userData = await getMe();
      setUser(userData);
      setAuthApiError(null);
    } catch (e: any) {
      setUser(null);
      if (e.response?.status !== 401) {
        setAuthApiError("Nie udało się pobrać danych użytkownika.");
        console.error("Fetch user error:", e);
        // Możesz dodać toast.error tutaj, jeśli chcesz
        // toast.error('Nie udało się pobrać danych użytkownika.');
      }
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []); // Usunięto toast z dependency array, bo jest importowany globalnie

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    const handleForceLogout = async () => {
      toast.error("Sesja wygasła. Zostałeś wylogowany."); // <--- ZMIANA: Użycie toast.error z sonner
      setUser(null);
      router.push("/login?expired=1&reason=session_timeout");
    };
    window.addEventListener("forceLogout", handleForceLogout);
    return () => {
      window.removeEventListener("forceLogout", handleForceLogout);
    };
  }, [router]); // Usunięto toast z dependency array

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    setAuthApiError(null);
    try {
      const response: AuthResponse = await loginUser(credentials);
      if (response.success && response.user) {
        setUser(response.user);
        router.push(
          new URLSearchParams(window.location.search).get("redirect") ||
            "/dashboard"
        );
        toast.success(response.message || `Witaj ${response.user.username}!`); // <--- ZMIANA
      } else {
        throw new Error(response.message || "Logowanie nie powiodło się.");
      }
    } catch (e: any) {
      const errorMessage =
        e.response?.data?.message ||
        e.message ||
        "Logowanie nie powiodło się. Sprawdź dane.";
      console.error("Login failed:", e);
      setAuthApiError(errorMessage);
      toast.error(errorMessage); // <--- ZMIANA
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: ApiRegisterRequest) => {
    // data jest już typu ApiRegisterRequest
    setIsLoading(true);
    setAuthApiError(null);
    try {
      const response: AuthResponse = await registerUser(data); // registerUser z api.ts oczekuje ApiRegisterRequest
      if (response.success) {
        router.push("/login?registered=1");
        toast.success(
          response.message || "Rejestracja udana! Możesz się teraz zalogować."
        ); // <--- ZMIANA
      } else {
        throw new Error(response.message || "Rejestracja nie powiodła się.");
      }
    } catch (e: any) {
      const errorMessage =
        e.response?.data?.message ||
        e.message ||
        "Rejestracja nie powiodła się.";
      console.error("Registration failed:", e);
      setAuthApiError(errorMessage);
      toast.error(errorMessage); // <--- ZMIANA
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setAuthApiError(null);
    try {
      await logoutUser();
      toast.success("Wylogowano pomyślnie."); // <--- ZMIANA (przeniesione z finally dla pewności)
    } catch (e: any) {
      if (e.response?.status !== 401) {
        console.error("Logout failed:", e);
        setAuthApiError("Wylogowanie nie powiodło się.");
        toast.error("Błąd wylogowania. Spróbuj ponownie."); // <--- ZMIANA
      } else {
        // Jeśli błąd 401, to sesja i tak była nieważna, można uznać za "sukces" wylogowania po stronie klienta
        toast.info("Zostałeś wylogowany.");
      }
    } finally {
      setUser(null);
      router.push("/login");
      setIsLoading(false);
      // if (!authApiError) toast.success("Wylogowano pomyślnie."); // Przeniesione wyżej
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isLoading,
        isAuthenticated: !!user,
        error: authApiError,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
