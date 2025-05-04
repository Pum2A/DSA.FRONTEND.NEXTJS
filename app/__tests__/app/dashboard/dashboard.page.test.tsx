import DashboardPage from "@/app/dashboard/page";
import { apiService } from "@/app/lib/api";
import { useAuthStore } from "@/app/store/authStore";
import { render, screen, waitFor } from "@testing-library/react";

// Mock dla API service
jest.mock("@/app/lib/api", () => ({
  apiService: {
    get: jest.fn(),
    lessons: {
      getAllModules: jest.fn(),
      getModuleProgress: jest.fn(),
    },
    user: {
      getStats: jest.fn(),
      getStreak: jest.fn(),
      getActivityHistory: jest.fn(),
    },
  },
}));

// Mock dla auth store
jest.mock("@/app/store/authStore", () => ({
  useAuthStore: jest.fn(),
}));

// Mock dla Next.js router (App Router używa useRouter z next/navigation)
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    // Mocks dla odpowiedzi API
    (apiService.get as jest.Mock).mockResolvedValue({
      id: "test-user",
      userName: "testuser",
      firstName: "Test",
      lastName: "User",
      experiencePoints: 150,
      level: 3,
    });

    (apiService.lessons.getAllModules as jest.Mock).mockResolvedValue([
      {
        id: 1,
        externalId: "module-1",
        title: "Test Module",
        description: "Test Description",
        order: 1,
        icon: "code",
        iconColor: "#6366F1",
        lessons: [{ id: 1, title: "Lesson 1" }],
      },
    ]);

    (apiService.user.getStats as jest.Mock).mockResolvedValue({
      totalXp: 150,
      level: 3,
      completedLessonsCount: 5,
      totalLessonsCount: 10,
    });

    (apiService.user.getStreak as jest.Mock).mockResolvedValue({ Streak: 7 });

    (apiService.user.getActivityHistory as jest.Mock).mockResolvedValue([
      {
        id: 1,
        userId: "test-user",
        actionType: 0, // LessonCompleted
        actionTime: new Date().toISOString(),
        referenceId: "lesson-1",
      },
    ]);

    (apiService.lessons.getModuleProgress as jest.Mock).mockResolvedValue({
      completedLessons: 5,
      totalLessons: 10,
    });

    // Mock dla auth state
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: {
        id: "test-user",
        userName: "testuser",
        firstName: "Test",
        lastName: "User",
        experiencePoints: 150,
        level: 3,
      },
      isLoading: false,
    });
  });

  test("renderuje dashboard z danymi z API", async () => {
    render(<DashboardPage />);

    // Sprawdź, czy podstawowe elementy są renderowane podczas ładowania
    expect(screen.getByText(/witaj/i)).toBeInTheDocument();

    // Poczekaj, aż dane zostaną załadowane i wyświetlone
    await waitFor(() => {
      // Sprawdź wartości streak
      expect(screen.getByText("7")).toBeInTheDocument();
      expect(screen.getByText("Dni serii")).toBeInTheDocument();

      // Sprawdź postęp
      expect(screen.getByText("5/10")).toBeInTheDocument();

      // Sprawdź level użytkownika
      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });

  test("obsługuje błąd przy pobieraniu danych", async () => {
    // Mock błędu API
    (apiService.get as jest.Mock).mockRejectedValue(new Error("API Error"));

    render(<DashboardPage />);

    // Poczekaj na wyświetlenie komunikatu o błędzie
    await waitFor(() => {
      expect(
        screen.getByText(/nie udało się pobrać danych/i)
      ).toBeInTheDocument();
    });
  });

  test("przekierowuje niezalogowanego użytkownika", () => {
    // Mock niezalogowanego użytkownika
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });

    const mockRouter = { push: jest.fn() };
    jest
      .spyOn(require("next/navigation"), "useRouter")
      .mockReturnValue(mockRouter);

    render(<DashboardPage />);

    // Sprawdź, czy zostało wywołane przekierowanie
    expect(mockRouter.push).toHaveBeenCalledWith("/login");
  });
});
