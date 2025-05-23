// user.ts

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
  streak?: number; // kompatybilność z dashboardem itp.
}

// Typ dla aktualizacji użytkownika — częściowa aktualizacja wymaga id
export type UserUpdate = Partial<User> & { id: string };

// Specyficzne aliasy dla auth i player bazujące na User

export type AuthUser = User;

export type Player = Pick<
  User,
  "id" | "firstName" | "lastName" | "userName" | "level" | "joinedAt"
> & {
  streak?: number;
};
