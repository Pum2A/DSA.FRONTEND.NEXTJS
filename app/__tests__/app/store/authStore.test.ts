import { apiService } from "@/app/lib/api";
import { useAuthStore } from "@/app/store/authStore";
// Najpierw poprawmy import - użyjmy typu User z auth.ts, nie z index.ts
import { User } from "@/app/types/auth";
import { act, renderHook } from "@testing-library/react";

// Mock dla API
jest.mock("@/app/lib/api", () => ({
  apiService: {
    auth: {
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      checkStatus: jest.fn(),
    },
    put: jest.fn(),
  },
}));

describe("useAuthStore", () => {
  // Poprawmy mockUser, aby zawierał wszystkie wymagane pola z User w auth.ts
  const mockUser: User = {
    id: "test-user-123",
    userName: "testuser",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    roles: ["user"],
    experiencePoints: 250, // Wymagane pole
    level: 3, // Wymagane pole
    joinedAt: "2025-05-04T22:40:04Z", // Aktualna data
  };

  beforeEach(() => {
    jest.resetAllMocks();

    // Reset store do stanu początkowego
    act(() => {
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
      });
    });
  });

  // Testy login, register, logout i checkAuthStatus bez zmian

  describe("updateUser", () => {
    test("powinien zaktualizować dane użytkownika", async () => {
      // Najpierw zaloguj użytkownika
      act(() => {
        useAuthStore.setState({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      });

      // Ważne: tworzymy pełny obiekt User dla aktualizacji, zgodny z typem
      const updatedUser: User = {
        ...mockUser,
        firstName: "Updated",
        lastName: "Name",
      };

      // Mock dla put
      (apiService.put as jest.Mock).mockResolvedValue(updatedUser);

      const { result } = renderHook(() => useAuthStore());

      let success;
      await act(async () => {
        // Przekazujemy pełny obiekt User, by spełnić wymagania typu
        success = await result.current.updateUser(updatedUser);
      });

      // Sprawdź, czy put został wywołany z poprawnymi parametrami
      expect(apiService.put).toHaveBeenCalledWith("Auth/user", updatedUser);

      // Sprawdź stan po aktualizacji
      expect(success).toBe(true);
      expect(result.current.user).toEqual(updatedUser);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    test("powinien zwrócić false gdy użytkownik nie jest zalogowany", async () => {
      const { result } = renderHook(() => useAuthStore());

      let success;
      await act(async () => {
        // Przekazujemy pełny obiekt User, by spełnić wymagania typu
        success = await result.current.updateUser({
          id: "dummy-id",
          userName: "testuser",
          email: "test@example.com",
          experiencePoints: 0,
          level: 1,
        });
      });

      expect(success).toBe(false);
      expect(apiService.put).not.toHaveBeenCalled();
    });

    test("powinien ustawić error przy niepowodzeniu aktualizacji", async () => {
      // Najpierw zaloguj użytkownika
      act(() => {
        useAuthStore.setState({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      });

      // Mock dla put rzucający błąd
      (apiService.put as jest.Mock).mockRejectedValue(
        new Error("Update failed")
      );

      const { result } = renderHook(() => useAuthStore());

      let success;
      await act(async () => {
        // Przekazujemy pełny obiekt User zgodny z typem
        success = await result.current.updateUser({
          ...mockUser,
          firstName: "Test",
        });
      });

      expect(success).toBe(false);
      expect(result.current.error).toBeTruthy();
      expect(result.current.isLoading).toBe(false);
    });
  });

  // Test clearError bez zmian
});

describe("clearError", () => {
  test("powinien wyczyścić error", () => {
    // Ustaw error
    act(() => {
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: "Test error",
      });
    });

    const { result } = renderHook(() => useAuthStore());

    // Sprawdź, czy error jest ustawiony
    expect(result.current.error).toBe("Test error");

    act(() => {
      result.current.clearError();
    });

    // Sprawdź, czy error został wyczyszczony
    expect(result.current.error).toBeNull();
  });
});
