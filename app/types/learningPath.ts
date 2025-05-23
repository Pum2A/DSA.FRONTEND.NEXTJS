import { Lesson } from "./lesson";

export interface LearningPath {
  id: string;
  title: string;
  description?: string;
  level: number;
  lessons: Lesson[];
  createdAt: string;
  updatedAt?: string;
}
