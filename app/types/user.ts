// Stwórz centralną definicję User używaną we wszystkich miejscach
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
  streak?: number; // Dodaj opcjonalnie dla kompatybilności
}

// Eksportuj typy specyficzne dla auth, ale bazujące na głównym User
export type AuthUser = User;

// Eksportuj typy specyficzne dla player, ale bazujące na głównym User
export type Player = Pick<
  User,
  "id" | "firstName" | "lastName" | "userName" | "level" | "joinedAt"
> & {
  streak?: number;
};
