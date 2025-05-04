import LearningPathCard from "@/app/components/dashboard/LearningPathCard";
import { DashboardLearningPath } from "@/app/components/dashboard/types";
import { render, screen } from "@testing-library/react";

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
  CardTitle: ({ children }: any) => (
    <div data-testid="card-title">{children}</div>
  ),
  CardDescription: ({ children }: any) => (
    <div data-testid="card-description">{children}</div>
  ),
  CardContent: ({ children, className }: any) => (
    <div className={className} data-testid="card-content">
      {children}
    </div>
  ),
  CardFooter: ({ children }: any) => (
    <div data-testid="card-footer">{children}</div>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, className }: any) => (
    <button className={className} data-testid="button">
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/progress", () => ({
  Progress: ({ value }: any) => (
    <div data-testid="progress-bar" data-value={value} />
  ),
}));

// Mock dla Next.js Link
jest.mock("next/link", () => {
  return ({ children, href }: any) => {
    return (
      <a href={href} data-testid="next-link">
        {children}
      </a>
    );
  };
});

describe("LearningPathCard", () => {
  const mockPath: DashboardLearningPath = {
    id: "test-module",
    title: "Test Module",
    description: "This is a test module",
    progress: 50,
    completedLessons: 3,
    totalLessons: 6,
    icon: <div data-testid="mock-icon" />,
    iconColor: "#123456",
  };

  test("renderuje kartę z danymi ścieżki", () => {
    render(<LearningPathCard path={mockPath} variant="inProgress" />);

    expect(screen.getByText("Test Module")).toBeInTheDocument();
    expect(screen.getByText("This is a test module")).toBeInTheDocument();
    expect(screen.getByText("3/6 lekcji")).toBeInTheDocument();
    expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
    expect(screen.getByTestId("progress-bar")).toHaveAttribute(
      "data-value",
      "50"
    );
  });

  test("renderuje przycisk Kontynuuj dla ścieżki w trakcie", () => {
    render(<LearningPathCard path={mockPath} variant="inProgress" />);
    expect(screen.getByText("Kontynuuj")).toBeInTheDocument();
  });

  test("renderuje przycisk Rozpocznij dla nowej ścieżki", () => {
    render(
      <LearningPathCard
        path={{ ...mockPath, progress: 0 }}
        variant="notStarted"
      />
    );
    expect(screen.getByText("Rozpocznij")).toBeInTheDocument();
  });

  test("renderuje przycisk Powtórz dla ukończonej ścieżki", () => {
    render(
      <LearningPathCard
        path={{ ...mockPath, progress: 100 }}
        variant="completed"
      />
    );
    expect(screen.getByText("Powtórz")).toBeInTheDocument();
  });

  test("obsługuje ścieżkę bez ikony", () => {
    const pathWithoutIcon = { ...mockPath, icon: undefined };
    // Test nie powinien rzucić błędu przy braku ikony
    expect(() =>
      render(<LearningPathCard path={pathWithoutIcon} />)
    ).not.toThrow();
  });

  test("obsługuje ścieżkę z ikoną jako string", () => {
    const pathWithStringIcon = { ...mockPath, icon: "code" };
    // Test powinien renderować komponent bez błędów
    expect(() =>
      render(<LearningPathCard path={pathWithStringIcon} />)
    ).not.toThrow();
  });
});
