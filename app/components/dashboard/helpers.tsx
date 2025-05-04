import {
  ArrowDownUp,
  Binary,
  Code2,
  Columns,
  Gauge,
  GitFork,
  ListTree,
  Rows,
} from "lucide-react";
import { JSX } from "react";

// Formatowanie daty
export function toDateStringUTC(date: Date): string {
  return (
    date.getUTCFullYear() +
    "-" +
    String(date.getUTCMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getUTCDate()).padStart(2, "0")
  );
}

// Funkcja do wyboru ikony modułu
export function getModuleIcon(
  moduleId: string,
  moduleTitle: string
): JSX.Element {
  const lowerCaseId = moduleId.toLowerCase();
  const lowerCaseTitle = moduleTitle.toLowerCase();
  const iconProps = { className: "w-5 h-5 sm:w-6 sm:h-6 text-white" };

  if (lowerCaseId.includes("struct") || lowerCaseTitle.includes("struktur"))
    return <ListTree {...iconProps} />;
  if (lowerCaseId.includes("sort") || lowerCaseTitle.includes("sortowan"))
    return <ArrowDownUp {...iconProps} />;
  if (
    lowerCaseId.includes("bst") ||
    lowerCaseId.includes("tree") ||
    lowerCaseTitle.includes("drzew")
  )
    return <Binary {...iconProps} />;
  if (lowerCaseId.includes("complex") || lowerCaseTitle.includes("złożono"))
    return <Gauge {...iconProps} />;
  if (lowerCaseId.includes("graph") || lowerCaseTitle.includes("graf"))
    return <GitFork {...iconProps} />;
  if (lowerCaseId.includes("list") || lowerCaseTitle.includes("list"))
    return <Rows {...iconProps} />;
  if (
    lowerCaseId.includes("stack") ||
    lowerCaseId.includes("queue") ||
    lowerCaseTitle.includes("stos") ||
    lowerCaseTitle.includes("kolej")
  ) {
    return <Columns {...iconProps} />;
  }

  return <Code2 {...iconProps} />;
}

// Funkcja do wyliczania pozostałego XP do następnego poziomu
export function calculateXpToNextLevel(
  currentXp: number,
  currentLevel: number
): number {
  // Przykładowa implementacja - dostosuj do swojej logiki
  const baseXp = 100;
  const xpPerLevel = 50;
  const requiredXp = baseXp + currentLevel * xpPerLevel;
  return Math.max(0, requiredXp - currentXp);
}
