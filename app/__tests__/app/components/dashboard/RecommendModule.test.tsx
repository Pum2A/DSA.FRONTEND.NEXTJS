import RecommendedModule from "@/app/components/dashboard/RecommendedModule";
import { DashboardLearningPath } from "@/app/components/dashboard/types";
import { render, screen } from "@testing-library/react";

// Mock dla ikon
jest.mock("lucide-react", () => ({
  ArrowRight: () => <div data-testid="arrow-icon" />,
  Code2: () => <div data-testid="code-icon" />,
}));

// Mock dla komponentów UI
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, className, size }: any) => (
    <button className={className} data-testid="button" data-size={size}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/progress", () => ({
  Progress: ({ value, className }: any) => (
    <div className={className} data-testid="progress" data-value={value} />
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

describe("RecommendedModule", () => {
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

  test("renderuje rekomendowany moduł w trakcie", () => {
    render(<RecommendedModule path={mockPath} />);

    expect(screen.getByText("Test Module")).toBeInTheDocument();
    expect(screen.getByText("Rekomendowane dla Ciebie")).toBeInTheDocument();
    expect(screen.getByText("Kontynuuj naukę")).toBeInTheDocument();
    expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
    expect(screen.getByTestId("progress")).toHaveAttribute("data-value", "50");
    expect(screen.getByText("Kontynuuj")).toBeInTheDocument();
  });

  test("renderuje rekomendowany nowy moduł", () => {
    const newPath = { ...mockPath, progress: 0, completedLessons: 0 };
    render(<RecommendedModule path={newPath} />);

    expect(screen.getByText("Test Module")).toBeInTheDocument();
    expect(screen.getByText("Rozpocznij nowy moduł")).toBeInTheDocument();
    expect(screen.getByText("Rozpocznij")).toBeInTheDocument();
  });

  test("generuje poprawny link do modułu", () => {
    render(<RecommendedModule path={mockPath} />);

    const link = screen.getByTestId("next-link");
    expect(link).toHaveAttribute("href", `/learning/${mockPath.id}`);
  });

  test("obsługuje brak ikony", () => {
    const pathWithoutIcon = { ...mockPath, icon: undefined };
    render(<RecommendedModule path={pathWithoutIcon} />);

    // Powinna być wyświetlona domyślna ikona
    expect(screen.getByTestId("code-icon")).toBeInTheDocument();
  });

  test("obsługuje ikonę jako string", () => {
    const pathWithStringIcon = { ...mockPath, icon: "code" };
    render(<RecommendedModule path={pathWithStringIcon} />);

    // Powinna być wyświetlona domyślna ikona zastępująca string
    expect(screen.getByTestId("code-icon")).toBeInTheDocument();
  });
});
