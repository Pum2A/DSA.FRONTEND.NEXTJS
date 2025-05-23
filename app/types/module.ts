// module.ts - ZGODNOŚĆ Z BACKEND ModuleDto

import { LessonDto } from "./lesson";

export interface ModuleDto {
  id: number;
  externalId: string;
  title: string;
  description: string;
  order: number;
  icon: string;
  iconColor: string;
  prerequisites: string[];
  lessons: LessonDto[];
  totalXP: number;
  estimatedTotalTime: string;
  difficulty: string;
}

export interface ModuleProgressDto {
  completedLessons: number;
  inProgressLessons: number;
  totalLessons: number;
  totalXPEarned: number;
  lastActivity?: Date;
  completionPercentage: number;
}

// COMPATIBILITY
export type Module = ModuleDto;
export type ModuleProgress = ModuleProgressDto;
