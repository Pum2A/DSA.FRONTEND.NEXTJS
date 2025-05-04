import { mockAuthUser } from "./auth-mocks.";
import { mockApiResponses } from "./test-data";

// Mockowana implementacja apiService
export const mockApiService = {
  get: jest.fn().mockImplementation((endpoint) => {
    if (endpoint === "Auth/user") {
      return Promise.resolve(mockAuthUser);
    }
    return Promise.resolve(null);
  }),
  post: jest.fn().mockResolvedValue({}),
  put: jest.fn().mockResolvedValue({}),
  delete: jest.fn().mockResolvedValue({}),

  auth: {
    login: jest.fn().mockImplementation(({ email, password }) => {
      if (email === "test@example.com" && password === "password") {
        return Promise.resolve();
      }
      throw new Error("Invalid credentials");
    }),
    register: jest.fn().mockImplementation((data) => {
      if (data.email === "existing@example.com") {
        return Promise.reject(new Error("User already exists"));
      }
      return Promise.resolve();
    }),
    logout: jest.fn().mockResolvedValue(undefined),
    checkStatus: jest.fn().mockResolvedValue(mockAuthUser),
  },

  lessons: {
    getAllModules: jest.fn().mockResolvedValue(mockApiResponses.modules),
    getModuleProgress: jest.fn().mockImplementation((moduleId) => {
      return Promise.resolve(mockApiResponses.moduleProgress);
    }),
    getLessonProgress: jest.fn().mockResolvedValue({
      isCompleted: false,
      currentStepIndex: 2,
    }),
    updateLessonProgress: jest.fn().mockResolvedValue(true),
  },

  user: {
    getStats: jest.fn().mockResolvedValue(mockApiResponses.stats),
    getStreak: jest.fn().mockResolvedValue(mockApiResponses.streak),
    getActivityHistory: jest
      .fn()
      .mockResolvedValue(mockApiResponses.activities),
  },
};

// Funkcja do mockowania odpowiedzi z API dla określonych endpointów
export const setupApiMocks = () => {
  // Resetuj wszystkie mocki
  jest.resetAllMocks();

  // Domyślna implementacja fetch
  global.fetch = jest.fn().mockImplementation(async (url, options) => {
    const endpoint = url.toString();

    // Użytkownik
    if (endpoint.includes("Auth/user")) {
      return {
        ok: true,
        json: async () => ({ data: mockAuthUser, success: true }),
      };
    }

    // Logowanie
    if (endpoint.includes("auth/login")) {
      const body = JSON.parse(options?.body as string);
      if (body.email === "test@example.com" && body.password === "password") {
        return {
          ok: true,
          json: async () => ({ data: undefined, success: true }),
        };
      } else {
        return {
          ok: false,
          status: 401,
          json: async () => ({
            success: false,
            message: "Invalid credentials",
          }),
        };
      }
    }

    // Sprawdzanie statusu
    if (endpoint.includes("auth/status")) {
      return {
        ok: true,
        json: async () => ({ data: mockAuthUser, success: true }),
      };
    }

    // Moduły
    if (endpoint.includes("lessons/modules")) {
      return {
        ok: true,
        json: async () => ({ data: mockApiResponses.modules, success: true }),
      };
    }

    // Statystyki
    if (endpoint.includes("user/stats")) {
      return {
        ok: true,
        json: async () => ({ data: mockApiResponses.stats, success: true }),
      };
    }

    // Streak
    if (endpoint.includes("user/streak")) {
      return {
        ok: true,
        json: async () => ({ data: mockApiResponses.streak, success: true }),
      };
    }

    // Historia aktywności
    if (endpoint.includes("user/activity")) {
      return {
        ok: true,
        json: async () => ({
          data: mockApiResponses.activities,
          success: true,
        }),
      };
    }

    // Postęp modułu
    if (endpoint.includes("lessons/module") && endpoint.includes("progress")) {
      return {
        ok: true,
        json: async () => ({
          data: mockApiResponses.moduleProgress,
          success: true,
        }),
      };
    }

    // Domyślna odpowiedź dla niezdefiniowanych endpointów
    return {
      ok: true,
      json: async () => ({ data: {}, success: true }),
    };
  });

  return { fetch: global.fetch };
};
