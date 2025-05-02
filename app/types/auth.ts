export interface User {
  id: string;
  userName: string;
  email: string;
  firstName?: string;
  lastName?: string;
  experiencePoints: number;
  level: number;
  roles: string[];
  joinedAt: string; // Dodane pole
  streak: number; // Dodane pole
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: User) => Promise<boolean>; // Nowa funkcja

  checkAuthStatus: () => Promise<void>;
  clearError: () => void;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  userName: string;
}
