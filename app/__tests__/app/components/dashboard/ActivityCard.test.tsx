import { mockActivities } from "@/app/__tests__/mocks/test-data";
import ActivityCard from "@/app/components/dashboard/ActivityCard";
import { render, screen } from "@testing-library/react";

// Mock dla Lucide React icons
jest.mock("lucide-react", () => ({
  Activity: () => <div data-testid="activity-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
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
  CardContent: ({ children }: any) => (
    <div data-testid="card-content">{children}</div>
  ),
}));

jest.mock("@/components/ui/skeleton", () => ({
  Skeleton: ({ className }: any) => (
    <div className={className} data-testid="skeleton" />
  ),
}));

describe("ActivityCard", () => {
  test("renderuje aktywności", () => {
    render(
      <ActivityCard
        activities={mockActivities}
        isLoading={false}
        isRefreshing={false}
      />
    );

    // Sprawdź tytuł karty
    expect(screen.getByText("Ostatnia aktywność")).toBeInTheDocument();

    // Sprawdź czy wszystkie aktywności są wyświetlane
    mockActivities.forEach((activity) => {
      expect(screen.getByText(activity.title)).toBeInTheDocument();
      expect(screen.getByText(activity.description)).toBeInTheDocument();
      expect(screen.getByText(activity.date)).toBeInTheDocument();
    });
  });

  test("wyświetla skeleton podczas ładowania", () => {
    render(
      <ActivityCard activities={[]} isLoading={true} isRefreshing={false} />
    );

    // Powinny być wyświetlone 3 skeletony dla aktywności
    const skeletons = screen.getAllByTestId("skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  test("wyświetla skeleton podczas odświeżania", () => {
    render(
      <ActivityCard activities={[]} isLoading={false} isRefreshing={true} />
    );

    const skeletons = screen.getAllByTestId("skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  test("wyświetla komunikat o braku aktywności", () => {
    render(
      <ActivityCard activities={[]} isLoading={false} isRefreshing={false} />
    );

    expect(screen.getByText("Brak aktywności.")).toBeInTheDocument();
  });
});
