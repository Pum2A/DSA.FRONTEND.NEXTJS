import { User } from "@/app/types";

// Typowy użytkownik do testów
export const mockAuthUser: User = {
  id: "mock-user-123",
  userName: "testuser",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  level: 3,
  experiencePoints: 250,
  joinedAt: "2025-01-15T10:00:00Z",
};

// Funkcja do tworzenia różnych stanów autentykacji
export const createAuthState = (
  overrides: {
    isAuthenticated?: boolean;
    isLoading?: boolean;
    user?: User | null;
    error?: string | null;
  } = {}
) => {
  return {
    isAuthenticated: overrides.isAuthenticated ?? false,
    isLoading: overrides.isLoading ?? false,
    user: overrides.user ?? null,
    error: overrides.error ?? null,
    login: jest.fn().mockImplementation((email, password) => {
      if (email === "test@example.com" && password === "password") {
        return Promise.resolve(mockAuthUser);
      }
      return Promise.reject(new Error("Invalid credentials"));
    }),
    register: jest.fn().mockImplementation((data) => {
      if (data.email === "existing@example.com") {
        return Promise.reject(new Error("User already exists"));
      }
      return Promise.resolve(mockAuthUser);
    }),
    logout: jest.fn().mockResolvedValue(undefined),
    updateUser: jest.fn().mockImplementation((updatedUser) => {
      return Promise.resolve(true);
    }),
    checkAuthStatus: jest.fn().mockResolvedValue(undefined),
    clearError: jest.fn(),
  };
};

// Różne stany autentykacji
export const authStates = {
  authenticated: createAuthState({
    isAuthenticated: true,
    user: mockAuthUser,
  }),
  unauthenticated: createAuthState(),
  loading: createAuthState({
    isLoading: true,
  }),
  error: createAuthState({
    error: "An error occurred",
  }),
};

// Mock dla odpowiedzi z API dotyczących autentykacji
export const authApiResponses = {
  login: {
    success: {
      data: mockAuthUser,
      success: true,
      message: "Login successful",
    },
    failure: {
      success: false,
      message: "Invalid credentials",
      errors: {
        email: ["Invalid email or password"],
      },
    },
  },
  register: {
    success: {
      data: mockAuthUser,
      success: true,
      message: "Registration successful",
    },
    failure: {
      success: false,
      message: "Registration failed",
      errors: {
        email: ["Email already in use"],
        password: ["Password must be at least 8 characters"],
      },
    },
  },
  currentUser: {
    success: {
      data: mockAuthUser,
      success: true,
    },
    failure: {
      success: false,
      message: "Unauthorized",
      errors: { auth: ["Invalid token"] },
    },
  },
};
