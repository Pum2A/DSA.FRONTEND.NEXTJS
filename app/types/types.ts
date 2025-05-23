// types.ts - EKSPORT WSZYSTKICH TYPÓW

export * from "./auth";
export * from "./dashboard";
export * from "./learningPath";
export * from "./lesson";
export * from "./module";
export * from "./progress";
export * from "./user";

// NOWE eksporty dla backend compatibility
export type {
  AuthResponse,
  LoginData as LoginRequest,
  RefreshTokenRequest,
  RegisterData as RegisterRequest,
} from "./auth";

export type { Notification, UserActionType, UserActivity } from "./dashboard";
export type {
  ChallengeData,
  InteractiveData,
  LessonDto,
  LessonProgressDto,
  LessonRecommendationDto,
  QuizData,
  QuizOptionDto,
  StepCompletionData,
  StepCompletionResult,
  StepDto,
  StepVerificationResult,
  TestCaseDto,
  VideoData,
} from "./lesson";

export type { ModuleDto, ModuleProgressDto } from "./module";

export type { UserProgressDto } from "./progress";

export type {
  AuthUser,
  Player,
  User,
  User as UserDto,
  UserProfile,
  UserProfile as UserProfileDto,
  UserUpdate,
  UserUpdate as UserUpdateDto,
} from "./user";
