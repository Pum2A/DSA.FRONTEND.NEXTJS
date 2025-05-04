import { mockApiResponses } from "@/app/__tests__/mocks/test-data";
import { toDateStringUTC } from "@/app/components/dashboard/helpers";
import {
  processModuleData,
  processStreakData,
  processUserActivity,
} from "@/app/components/dashboard/utils";

// Mock dla getModuleIcon
jest.mock("@/app/components/dashboard/helpers", () => ({
  getModuleIcon: jest.fn(() => <div data-testid="mocked-icon" />),
  toDateStringUTC: jest.fn((date) => {
    const d = new Date(date);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getUTCDate()).padStart(2, "0")}`;
  }),
}));

describe("Dashboard Utils", () => {
  describe("processStreakData", () => {
    test("powinien obsługiwać obiekt z polem Streak (duża litera)", () => {
      expect(processStreakData({ Streak: 7 })).toBe(7);
    });

    test("powinien obsługiwać obiekt z polem streak (mała litera)", () => {
      expect(processStreakData({ streak: 5 })).toBe(5);
    });

    test("powinien zwracać liczbę bezpośrednio, jeśli input jest liczbą", () => {
      expect(processStreakData(3)).toBe(3);
    });

    test("powinien konwertować string na liczbę", () => {
      expect(processStreakData("4")).toBe(4);
    });

    test("powinien zwracać 0 dla NaN", () => {
      expect(processStreakData("nie-liczba")).toBe(0);
    });

    test("powinien zwracać 0 dla null", () => {
      expect(processStreakData(null)).toBe(0);
    });

    test("powinien zwracać 0 dla undefined", () => {
      expect(processStreakData(undefined)).toBe(0);
    });
  });

  describe("processUserActivity", () => {
    beforeEach(() => {
      // Ustaw dzisiejszą datę dla toDateStringUTC na "2025-05-04" aby pasowała do mockApiResponses
      (toDateStringUTC as jest.Mock).mockImplementation(() => "2025-05-04");
    });

    test("powinien poprawnie przetwarzać dane aktywności", () => {
      const result = processUserActivity(mockApiResponses.activities);

      expect(result.activity.length).toBe(mockApiResponses.activities.length);
      expect(result.activity[0].title).toBe("Ukończono lekcję");
      expect(result.activity[0].description).toContain("intro-to-algo");
    });

    test("powinien wykrywać ukończony dzienny cel", () => {
      // Ustawienie dzisiejszej daty tak, aby pasowała do daty pierwszej aktywności
      (toDateStringUTC as jest.Mock).mockImplementation(() => {
        return toDateStringUTC(
          new Date(mockApiResponses.activities[0].actionTime)
        );
      });

      const result = processUserActivity(mockApiResponses.activities);
      expect(result.dailyGoalCompleted).toBe(true);
    });

    test("powinien wykrywać nieukończony dzienny cel", () => {
      // Ustawienie dzisiejszej daty na inną niż daty aktywności
      (toDateStringUTC as jest.Mock).mockImplementation(() => "2025-05-05");

      const result = processUserActivity(mockApiResponses.activities);
      expect(result.dailyGoalCompleted).toBe(false);
    });

    test("powinien obsługiwać puste dane", () => {
      const result = processUserActivity([]);
      expect(result.activity).toEqual([]);
      expect(result.dailyGoalCompleted).toBe(false);
    });

    test("powinien obsługiwać null/undefined", () => {
      expect(() => processUserActivity(null)).not.toThrow();
      expect(() => processUserActivity(undefined)).not.toThrow();
    });
  });

  describe("processModuleData", () => {
    test("powinien przetwarzać moduły na ścieżki nauki", async () => {
      const mockFetchModuleProgress = jest.fn().mockResolvedValue({
        completedLessons: 3,
        totalLessons: 5,
      });

      const result = await processModuleData(
        mockApiResponses.modules,
        mockFetchModuleProgress
      );

      expect(result.length).toBe(mockApiResponses.modules.length);
      expect(result[0].id).toBe(mockApiResponses.modules[0].externalId);
      expect(result[0].progress).toBe(60); // (3/5) * 100
      expect(mockFetchModuleProgress).toHaveBeenCalledTimes(
        mockApiResponses.modules.length
      );
    });

    test("powinien obsługiwać puste dane", async () => {
      const mockFetchModuleProgress = jest.fn();
      const result = await processModuleData([], mockFetchModuleProgress);

      expect(result).toEqual([]);
      expect(mockFetchModuleProgress).not.toHaveBeenCalled();
    });
  });
});
