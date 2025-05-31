import axiosInstance from "@/app/utils/axiosRefreshTokenInstance";
import { LoginFormData } from "./schema/loginSchema";
import { RegisterFormData } from "./schema/registerSchema";

export async function loginUser(credentials: LoginFormData) {
  const response = await axiosInstance.post("Auth/login", credentials);
  return response.data; // Zwraca dane użytkownika lub potwierdzenie
}

export async function registerUser(data: RegisterFormData) {
  const response = await axiosInstance.post("Auth/register", data);
  return response.data;
}

export async function logoutUser() {
  try {
    await axiosInstance.post("Auth/logout");
  } catch (error: any) {
    // Błąd 401 przy wylogowaniu jest oczekiwany, jeśli sesja już wygasła
    if (error.response?.status !== 401) {
      console.error("Logout error:", error);
      throw error; // Rzuć błąd dalej, jeśli to nie 401
    }
    // W przypadku 401, po prostu kontynuuj, bo backend i tak uznał sesję za nieważną
  }
}

export async function getMe() {
  const response = await axiosInstance.get("Auth/me"); // lub Users/me, zgodnie z Twoim backendem
  return response.data; // Zwraca dane zalogowanego użytkownika
}

export async function refreshToken(): Promise<string | null> {
  try {
    // Zakładamy, że backend ma endpoint /api/Auth/refresh
    // i obsługuje odświeżanie na podstawie HttpOnly refresh token cookie
    const response = await axiosInstance.post("Auth/refresh");
    // Jeśli backend zwraca nowy access token w ciele odpowiedzi (mniej typowe dla HttpOnly)
    // return response.data.accessToken;
    // Dla HttpOnly, backend sam ustawi nowe ciasteczko, więc możemy zwrócić np. null lub potwierdzenie
    return response.data?.accessToken || null; // Dostosuj do odpowiedzi Twojego API
  } catch (error) {
    console.error("Failed to refresh token in api.ts", error);
    throw error;
  }
}
