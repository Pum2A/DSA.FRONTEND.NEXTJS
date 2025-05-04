import DailyStreakCard from "@/app/components/dashboard/DailyStreakCard";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

// Mock dla Lucide React icons
jest.mock("lucide-react", () => ({
  CalendarClock: () => <div data-testid="calendar-icon" />,
  Flame: () => <div data-testid="flame-icon" />,
}));

describe("DailyStreakCard", () => {
  test("wyświetla przekazaną wartość streak", () => {
    render(
      <DailyStreakCard
        streak={7}
        dailyGoalCompleted={false}
        isLoading={false}
        isRefreshing={false}
      />
    );

    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("Dni serii")).toBeInTheDocument();
  });

  test("wyświetla stan ładowania (skeleton) gdy isLoading=true", () => {
    render(
      <DailyStreakCard
        streak={7}
        dailyGoalCompleted={false}
        isLoading={true}
        isRefreshing={false}
      />
    );

    // Skeleton powinien być wyświetlony zamiast wartości streak
    expect(screen.queryByText("7")).not.toBeInTheDocument();
    // Skielton komponent nie ma prostego sposobu na testowanie, więc możemy sprawdzić
    // czy component renderuje się bez błędów, lub dodać data-testid do Skeleton
  });

  test("wyświetla ukończony dzienny cel", () => {
    render(
      <DailyStreakCard
        streak={7}
        dailyGoalCompleted={true}
        isLoading={false}
        isRefreshing={false}
      />
    );

    expect(screen.getByText("Osiągnięty")).toBeInTheDocument();
    expect(screen.getByText("Gratulacje!")).toBeInTheDocument();
  });

  test("wyświetla nieukończony dzienny cel", () => {
    render(
      <DailyStreakCard
        streak={7}
        dailyGoalCompleted={false}
        isLoading={false}
        isRefreshing={false}
      />
    );

    expect(screen.getByText("Do zrobienia")).toBeInTheDocument();
    expect(
      screen.getByText("Ukończ lekcję, aby zaliczyć cel.")
    ).toBeInTheDocument();
  });
});
