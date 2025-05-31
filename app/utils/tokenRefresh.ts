import { AuthResponse } from "../types/api/authTypes";
import axiosInstance from "./axiosRefreshTokenInstance";

/**
 * Odświeża token dostępowy użytkownika.
 * Ta funkcja powinna być wywoływana, gdy aktualny token wygasł.
 * Zwraca pełną odpowiedź AuthResponse w przypadku sukcesu.
 */
export async function refreshToken(): Promise<AuthResponse> {
  try {
    // axiosInstance ma już skonfigurowany baseURL, więc podajemy tylko endpoint.
    // W features/auth/api.ts używamy 'Auth/refresh'.
    const response = await axiosInstance.post<AuthResponse>("Auth/refresh", {});

    // Sprawdzamy, czy operacja się powiodła i czy odpowiedź zawiera dane.
    // Zgodnie z AuthResponse, nowy token jest w polu 'token'.
    if (response.data && response.data.success && response.data.token) {
      // Jeśli backend odświeża tokeny poprzez HttpOnly cookies,
      // to samo wywołanie tego endpointu może wystarczyć.
      // Zwrócenie response.data jest przydatne, jeśli chcemy np. zaktualizować dane użytkownika w AuthContext.
      console.log("Token refreshed successfully via refreshToken.ts");
      return response.data;
    } else {
      // Jeśli flaga success jest false lub brakuje danych/tokena
      throw new Error(
        response.data?.message ||
          "Token refresh failed: Invalid response from server."
      );
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred during token refresh.";
    console.error("Error in refreshToken.ts:", errorMessage);
    // Rzucamy błąd dalej, aby komponent lub interceptor, który to wywołał, mógł odpowiednio zareagować
    // (np. wylogować użytkownika).
    throw new Error(`Token refresh failed: ${errorMessage}`);
  }
}
