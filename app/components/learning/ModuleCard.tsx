import Link from "next/link";
import { JSX } from "react";
import { Module } from "@/app/types"; // Upewnij się, że ścieżka jest poprawna
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Code2,
  ListTree,
  ArrowDownUp,
  Binary,
  Gauge,
  Network,
  Rows,
  Columns,
  Sigma,
  BrainCircuit,
  Package,
  Component,
  BookOpen,
} from "lucide-react"; // Importuj ikony
import { Skeleton } from "@/components/ui/skeleton";

// Funkcja pomocnicza do wybierania ikony (zintegrowana)
function getModuleIcon(module: Module): JSX.Element {
  const lowerCaseId = module.externalId?.toLowerCase() || "";
  const lowerCaseTitle = module.title.toLowerCase();
  const iconProps = { className: "w-7 h-7 text-white", strokeWidth: 1.5 };

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
    return <Network {...iconProps} />;
  if (lowerCaseId.includes("list") || lowerCaseTitle.includes("list"))
    return <Rows {...iconProps} />;
  if (
    lowerCaseId.includes("stack") ||
    lowerCaseId.includes("queue") ||
    lowerCaseTitle.includes("stos") ||
    lowerCaseTitle.includes("kolej")
  )
    return <Columns {...iconProps} />;
  if (lowerCaseId.includes("intro") || lowerCaseTitle.includes("wprowadzenie"))
    return <Sigma {...iconProps} />;
  if (lowerCaseId.includes("adv") || lowerCaseTitle.includes("zaawans"))
    return <BrainCircuit {...iconProps} />;

  const defaultIcons = [
    <Code2 {...iconProps} />,
    <Package {...iconProps} />,
    <Component {...iconProps} />,
  ];
  const hashCode =
    module.id
      ?.toString()
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
  return defaultIcons[hashCode % defaultIcons.length];
}

interface ModuleCardProps {
  module: Module;
  index?: number; // Dla potencjalnych animacji
}

export default function ModuleCard({ module, index = 0 }: ModuleCardProps) {
  const iconElement = getModuleIcon(module);
  const accentColor = module.iconColor || "#6366F1"; // Domyślny kolor (indigo)
  const lessonCount = module.lessons?.length || 0;

  return (
    // Link obejmuje całą kartę
    <Link
      href={`/learning/${module.externalId || module.id}`}
      className="block group"
      passHref
    >
      <Card
        className="flex flex-col h-full overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-xl border dark:border-gray-700 transition-all duration-300 ease-in-out hover:-translate-y-1.5"
        // style={{ animationDelay: `${index * 100}ms` }} // Opcjonalna animacja
        // className="... animate-fadeIn" // Opcjonalna animacja
      >
        {/* Górna sekcja z ikoną i tłem */}
        <div className="p-0 relative">
          {" "}
          {/* Usunięto CardHeader dla prostszej struktury */}
          {/* Tło z gradientem */}
          <div
            className="h-28 sm:h-32 flex items-center justify-center rounded-t-xl relative overflow-hidden"
            style={{
              background: `linear-gradient(145deg, ${accentColor}99, ${accentColor}ff)`,
            }}
          >
            {/* Opcjonalny wzór */}
            <div className="absolute inset-0 opacity-10 dark:opacity-5 scale-150"></div>
          </div>
          {/* Ikona wystająca */}
          <div className="absolute inset-x-0 -bottom-8 flex justify-center">
            <div className="bg-white dark:bg-gray-800 p-1.5 rounded-full shadow-lg border-2 border-white dark:border-gray-800">
              <div
                className="w-14 h-14 flex items-center justify-center rounded-full shadow-inner"
                style={{ backgroundColor: accentColor }}
              >
                {iconElement}
              </div>
            </div>
          </div>
        </div>

        {/* Treść karty */}
        <CardContent className="flex-grow px-6 pt-12 pb-4 text-center">
          {" "}
          {/* Zwiększony padding-top */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {module.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
            {" "}
            {/* Dodano mb-4 */}
            {module.description}
          </p>
          {/* Liczba lekcji - subtelnie */}
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>
              {lessonCount}{" "}
              {lessonCount === 1
                ? "lekcja"
                : lessonCount < 5
                ? "lekcje"
                : "lekcji"}
            </span>
          </div>
        </CardContent>

        {/* Stopka z informacją "Przejdź" - teraz jako wizualny wskaźnik */}
        <CardFooter className="px-6 pb-5 pt-1 flex justify-end">
          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Przejdź do modułu
            <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}

// Szkielet (pozostaje taki sam jak w poprzedniej propozycji)
export function ModuleCardSkeleton() {
  return (
    <Card className="flex flex-col h-full overflow-hidden rounded-xl bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-md">
      <div className="p-0 relative">
        {" "}
        {/* Dopasowano strukturę do karty */}
        <Skeleton className="h-28 sm:h-32 w-full rounded-t-xl" />
        <div className="absolute inset-x-0 -bottom-8 flex justify-center">
          <Skeleton className="h-16 w-16 rounded-full border-4 border-white dark:border-gray-800" />
        </div>
      </div>
      <CardContent className="flex-grow px-6 pt-12 pb-4 text-center">
        <Skeleton className="h-6 w-3/4 mx-auto mb-3" />
        <Skeleton className="h-4 w-full mb-1.5" />
        <Skeleton className="h-4 w-5/6 mx-auto mb-4" />
        <Skeleton className="h-3 w-1/4 mx-auto" />{" "}
        {/* Szkielet dla liczby lekcji */}
      </CardContent>
      <CardFooter className="px-6 pb-5 pt-1 flex justify-end">
        <Skeleton className="h-5 w-1/3" /> {/* Szkielet dla "Przejdź" */}
      </CardFooter>
    </Card>
  );
}
