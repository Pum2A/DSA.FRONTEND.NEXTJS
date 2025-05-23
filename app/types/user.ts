// user.ts - ROZSZERZONE O GAMIFIKACJĘ

export interface User {
  id: string;
  userName: string;
  email: string;
  firstName?: string;
  lastName?: string;
  experiencePoints: number;
  level: number;

  // NOWE pola gamifikacji z UserProfileDto
  currentLevelMinXp: number;
  requiredXpForNextLevel: number;
  xpToNextLevel: number;

  roles?: string[];
  joinedAt?: string;
  streak?: number;
}

// NOWY - pełny profil z backend UserProfileDto
export interface UserProfile {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  experiencePoints: number;
  level: number;
  currentLevelMinXp: number;
  requiredXpForNextLevel: number;
  xpToNextLevel: number;
  roles: string[];
  joinedAt: Date;
  streak: number;
}

export type UserUpdate = Partial<User> & { id: string };
export type AuthUser = User;
export type Player = Pick<
  User,
  "id" | "firstName" | "lastName" | "userName" | "level" | "joinedAt"
> & {
  streak?: number;
};
