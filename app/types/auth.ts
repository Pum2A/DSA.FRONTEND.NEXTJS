export interface User {
  id: string;
  userName: string;
  email: string;
  firstName?: string;
  lastName?: string;
  experiencePoints: number;
  level: number;
  roles?: string[];
  joinedAt?: string;
  // Ponieważ updateUser oczekuje typu User, ale często aktualizujemy tylko część pól
  // możemy dodać pomocniczy typ do częściowych aktualizacji:
}

// Dodajmy typ dla aktualizacji użytkownika
export type UserUpdate = Partial<User> & { id: string };

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  // Zmieńmy typ parametru na UserUpdate, by umożliwić częściowe aktualizacje
  updateUser: (updatedUser: User) => Promise<boolean>;
  checkAuthStatus: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
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
