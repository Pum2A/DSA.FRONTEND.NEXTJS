export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
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

export interface UserDto {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  xpPoints: number;
  currentStreak: number;
  maxStreak: number;
  lastActivityDate?: string;
  emailVerified: boolean;
}