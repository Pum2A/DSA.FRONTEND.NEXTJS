import { apiService } from "@/app/lib/api";

// Mock dla fetch
global.fetch = jest.fn();

describe("apiService", () => {
  beforeEach(() => {
    // Resetuj mocki przed każdym testem
    jest.resetAllMocks();

    // Domyślna odpowiedź mocka fetch
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: "test-data", success: true }),
      status: 200,
      statusText: "OK",
    });
  });

  describe("get", () => {
    test("powinien wywołać fetch z poprawnymi parametrami", async () => {
      const endpoint = "test-endpoint";
      await apiService.get(endpoint);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(endpoint),
        expect.objectContaining({
          method: "GET",
          headers: expect.any(Object),
        })
      );
    });

    test("powinien zwrócić dane z odpowiedzi", async () => {
      const result = await apiService.get("test-endpoint");

      expect(result).toEqual("test-data");
    });

    test("powinien obsłużyć błąd HTTP", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => ({
          success: false,
          message: "Resource not found",
          errors: { key: ["error"] },
        }),
      });

      await expect(apiService.get("test-endpoint")).rejects.toThrow(
        "Resource not found"
      );
    });

    test("powinien obsłużyć wyjątek podczas fetch", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      await expect(apiService.get("test-endpoint")).rejects.toThrow(
        "Network error"
      );
    });
  });

  describe("post", () => {
    const data = { key: "value" };

    test("powinien wywołać fetch z poprawnymi parametrami", async () => {
      await apiService.post("test-endpoint", data);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("test-endpoint"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify(data),
        })
      );
    });
  });

  describe("lessons.getModuleProgress", () => {
    test("powinien wywołać odpowiedni endpoint", async () => {
      const moduleId = "test-module";
      await apiService.lessons.getModuleProgress(moduleId);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`lessons/module/${moduleId}/progress`),
        expect.any(Object)
      );
    });
  });

  describe("user.getStreak", () => {
    test("powinien wywołać odpowiedni endpoint i zwrócić dane streak", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: { Streak: 7 }, success: true }),
        status: 200,
      });

      const result = await apiService.user.getStreak();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("user/streak"),
        expect.any(Object)
      );
      expect(result).toEqual({ Streak: 7 });
    });
  });
});
