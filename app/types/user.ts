// Centralna definicja User używana we wszystkich miejscach
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
  streak?: number;
}

// Eksportuj typy specyficzne dla auth
export type AuthUser = User;

// Eksportuj typy specyficzne dla player
