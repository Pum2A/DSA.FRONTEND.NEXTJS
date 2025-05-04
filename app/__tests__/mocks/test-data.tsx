import {
  DashboardLearningPath,
  ProcessedActivity,
} from "@/app/components/dashboard/types";
import { Module, User, UserStats } from "@/app/types";

// Mock danych użytkownika
export const mockUser: User = {
  id: "test-user-123",
  userName: "testuser",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  experiencePoints: 250,
  level: 3,
  joinedAt: "2023-08-15T10:00:00Z",
};

// Mock statystyk
export const mockStats: UserStats = {
  totalXp: 250,
  level: 3,
  completedLessonsCount: 8,
  totalLessonsCount: 25,
};

// Mock modułów
export const mockModules: Module[] = [
  {
    id: 1,
    externalId: "algorithm-basics",
    title: "Podstawy Algorytmów",
    description: "Wprowadzenie do podstawowych algorytmów i pojęć",
    order: 1,
    icon: "code",
    iconColor: "#6366F1",
    lessons: [
      {
        id: 1,
        externalId: "intro-to-algo",
        title: "Wprowadzenie do Algorytmów",
        description: "Czym są algorytmy i dlaczego są ważne",
        estimatedTime: "10 min",
        xpReward: 10,
        moduleId: 1,
      },
    ],
  },
  {
    id: 2,
    externalId: "data-structures",
    title: "Struktury Danych",
    description: "Poznaj podstawowe struktury danych",
    order: 2,
    icon: "database",
    iconColor: "#10B981",
    lessons: [
      {
        id: 2,
        externalId: "arrays",
        title: "Tablice",
        description: "Praca z tablicami i operacje na nich",
        estimatedTime: "15 min",
        xpReward: 15,
        moduleId: 2,
      },
    ],
  },
];

// Mock ścieżek nauki
export const mockLearningPaths: DashboardLearningPath[] = [
  {
    id: "algorithm-basics",
    title: "Podstawy Algorytmów",
    description: "Wprowadzenie do podstawowych algorytmów i pojęć",
    progress: 60,
    completedLessons: 3,
    totalLessons: 5,
    icon: "code",
    iconColor: "#6366F1",
  },
  {
    id: "data-structures",
    title: "Struktury Danych",
    description: "Poznaj podstawowe struktury danych",
    progress: 0,
    completedLessons: 0,
    totalLessons: 5,
    icon: "database",
    iconColor: "#10B981",
  },
  {
    id: "sorting-algorithms",
    title: "Algorytmy Sortowania",
    description: "Różne techniki sortowania danych",
    progress: 100,
    completedLessons: 4,
    totalLessons: 4,
    icon: "sort",
    iconColor: "#EC4899",
  },
];

// Mock aktywności
export const mockActivities: ProcessedActivity[] = [
  {
    id: 1,
    type: 0, // LessonCompleted
    title: "Ukończono lekcję",
    description: "Ukończono lekcję: Wprowadzenie do Algorytmów",
    date: "01.05.2025",
    icon: <div data-testid="book-icon" />,
  },
  {
    id: 2,
    type: 1, // QuizCompleted
    title: "Ukończono quiz",
    description: "Ukończono quiz: Podstawy Algorytmów",
    date: "30.04.2025",
    icon: <div data-testid="medal-icon" />,
  },
  {
    id: 3,
    type: 2, // Login
    title: "Logowanie",
    description: "Logowanie do systemu",
    date: "29.04.2025",
    icon: <div data-testid="trend-icon" />,
  },
];

// Mock odpowiedzi API
export const mockApiResponses = {
  user: mockUser,
  stats: mockStats,
  modules: mockModules,
  streak: { Streak: 7 },
  activities: [
    {
      id: 1,
      userId: "test-user-123",
      actionType: 0,
      actionTime: "2025-05-04T10:00:00Z",
      referenceId: "intro-to-algo",
      additionalInfo: "Wprowadzenie do Algorytmów",
    },
    {
      id: 2,
      userId: "test-user-123",
      actionType: 1,
      actionTime: "2025-05-03T15:30:00Z",
      referenceId: "algorithm-basics",
      additionalInfo: "Podstawy Algorytmów",
    },
    {
      id: 3,
      userId: "test-user-123",
      actionType: 2,
      actionTime: "2025-05-02T09:15:00Z",
    },
  ],
  moduleProgress: {
    completedLessons: 3,
    totalLessons: 5,
  },
};
