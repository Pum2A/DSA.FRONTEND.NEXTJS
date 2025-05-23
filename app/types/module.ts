// module.ts

import { Lesson } from "./lesson";

export interface Module {
  id: number;
  externalId: string;
  title: string;
  description: string;
  order: number;
  icon: string;
  iconColor: string;
  lessons?: Lesson[];
}
