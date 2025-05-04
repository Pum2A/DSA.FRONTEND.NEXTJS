import {
  mockLearningPaths,
  mockStats,
  mockUser,
} from "@/app/__tests__/mocks/test-data";
import ProgressCard from "@/app/components/dashboard/ProgressCard";
import { render, screen } from "@testing-library/react";

// Mock dla ikon
jest.mock("lucide-react", () => ({
  BarChart3: () => <div data-testid="chart-icon" />,
  Lightbulb: () => <div data-testid="lightbulb-icon" />,
  Star: () => <div data-testid="star-icon" />,
  BookOpen: () => <div data-testid="book-icon" />,
}));

// Mock dla komponentów UI
jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
  CardHeader: ({ children }: any) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children, className }: any) => (
    <div className={className} data-testid="card-title">
      {children}
    </div>
  ),
  CardDescription: ({ children }: any) => (
    <div data-testid="card-description">{children}</div>
  ),
  CardContent: ({ children, className }: any) => (
    <div className={className} data-testid="card-content">
      {children}
    </div>
  ),
  CardFooter: ({ children, className }: any) => (
    <div className={className} data-testid="card-footer">
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/progress", () => ({
  Progress: ({ value, className }: any) => (
    <div className={className} data-testid="progress" data-value={value} />
  ),
}));

jest.mock("@/components/ui/skeleton", () => ({
  Skeleton: ({ className }: any) => (
    <div className={className} data-testid="skeleton" />
  ),
}));

// Mock dla RecommendedModule
jest.mock("@/app/components/dashboard/RecommendedModule", () => {
  return ({ path }: any) => (
    <div data-testid="recommended-module" data-path-id={path.id}>
      {path.title}
    </div>
  );
});

describe("ProgressCard", () => {
  const recommendedPath = mockLearningPaths.find(
    (p) => p.progress > 0 && p.progress < 100
  );

  test("renderuje kartę z postępem i statystykami użytkownika", () => {
    render(
      <ProgressCard
        stats={mockStats}
        user={mockUser}
        overallProgress={40}
        isLoading={false}
        isRefreshing={false}
        recommendedPath={recommendedPath}
      />
    );

    // Sprawdź tytuł karty
    expect(screen.getByText("Postęp nauki")).toBeInTheDocument();

    // Sprawdź wartości statystyk
    expect(
      screen.getByText(
        `${mockStats.completedLessonsCount}/${mockStats.totalLessonsCount}`
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText((mockUser.level ?? 1).toString())
    ).toBeInTheDocument();
    expect(
      screen.getByText((mockUser.experiencePoints ?? 0).toString())
    ).toBeInTheDocument();

    // Sprawdź pasek postępu
    const progress = screen.getByTestId("progress");
    expect(progress).toHaveAttribute("data-value", "40");

    // Sprawdź czy rekomendowany moduł jest wyświetlany
    if (recommendedPath) {
      expect(screen.getByTestId("recommended-module")).toBeInTheDocument();
      expect(screen.getByText(recommendedPath.title)).toBeInTheDocument();
    }
  });

  test("wyświetla skeletony podczas ładowania", () => {
    render(
      <ProgressCard
        stats={null}
        user={null}
        overallProgress={0}
        isLoading={true}
        isRefreshing={false}
        recommendedPath={undefined}
      />
    );

    // Powinny być wyświetlone skeletony
    const skeletons = screen.getAllByTestId("skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  test("wyświetla skeletony podczas odświeżania", () => {
    render(
      <ProgressCard
        stats={null}
        user={null}
        overallProgress={0}
        isLoading={false}
        isRefreshing={true}
        recommendedPath={undefined}
      />
    );

    const skeletons = screen.getAllByTestId("skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  test("nie wyświetla rekomendowanego modułu gdy nie jest dostępny", () => {
    render(
      <ProgressCard
        stats={mockStats}
        user={mockUser}
        overallProgress={40}
        isLoading={false}
        isRefreshing={false}
        recommendedPath={undefined}
      />
    );

    expect(screen.queryByTestId("recommended-module")).not.toBeInTheDocument();
  });

  test("obsługuje brak danych stats i user", () => {
    render(
      <ProgressCard
        stats={null}
        user={null}
        overallProgress={40}
        isLoading={false}
        isRefreshing={false}
        recommendedPath={undefined}
      />
    );

    // Powinien wyświetlać wartości domyślne
    expect(screen.getByText("0/0")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument(); // Domyślny level
    expect(screen.getByText("0")).toBeInTheDocument(); // Domyślne XP
  });
});
