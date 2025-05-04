import { processStreakData } from "@/app/components/dashboard/utils";

describe("Dashboard Utils - processStreakData", () => {
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
