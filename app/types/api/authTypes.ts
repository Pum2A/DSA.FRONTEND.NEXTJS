import { UserDto } from "./userTypes";

export interface LoginRequest {
  email: string;
  password: string;
}

// Ten typ jest używany przez formularz rejestracji na froncie
export interface RegisterFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

// Ten typ jest wysyłany do API (bez confirmPassword)
export interface ApiRegisterRequest {
  email: string;
  username: string;
  password: string;
  confirmPassword: string; // Opcjonalne, jeśli nie jest wymagane przez API
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  refreshToken?: string;
  user?: UserDto;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
