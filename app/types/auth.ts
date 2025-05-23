// auth.ts - PEŁNA ZGODNOŚĆ Z BACKEND DTO

import { User, UserUpdate } from "./user";

// NOWE - Response z backendu
export interface AuthResponse {
  succeeded: boolean;
  token: string;
  refreshToken: string;
  expiration: string;
  userId: string;
  userName: string;
  email: string;
  roles: string[];
  errors: string[];
  joinedAt: Date;
}

export interface RefreshTokenRequest {
  token: string;
  refreshToken: string;
}

// ZAKTUALIZOWANE - zgodność z backend
export interface LoginData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  userName: string;
  firstName: string;
  lastName: string;
}

// AuthState - zaktualizowany
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: UserUpdate) => Promise<boolean>;
  checkAuthStatus: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}
