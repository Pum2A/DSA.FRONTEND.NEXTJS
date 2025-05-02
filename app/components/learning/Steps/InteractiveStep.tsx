"use client";

import { Step } from "@/app/types";
import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Lightbulb,
  Play,
  Check,
} from "lucide-react";
// Zakładamy istnienie runCodeTests i TestResult
import { runCodeTests, TestResult } from "../../../lib/codeRunner";
import { LoadingButton } from "../../ui/LoadingButton";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

// Dynamiczne ładowanie edytora Monaco (bez zmian)
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-gray-500 dark:text-gray-400">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Ładowanie edytora
      kodu...
    </div>
  ),
});

// Zaktualizowane propsy
interface InteractiveStepProps {
  step: Step;
  onComplete: (isCorrect: boolean) => void; // Wymaga boolean
  isLoading?: boolean; // Globalny isLoading z LessonPage
}

export default function InteractiveStep({
  step,
  onComplete,
  isLoading = false,
}: InteractiveStepProps) {
  // Poprawiona walidacja kroku
  const isStepValid =
    step.stepType === "interactive" &&
    Array.isArray(step.testCases) &&
    step.testCases.length > 0;

  const [userCode, setUserCode] = useState<string>("");
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false); // Wewnętrzny stan ładowania testów
  const [allTestsPassed, setAllTestsPassed] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Inicjalizacja/Reset (bez zmian, ale dodano czyszczenie generalError)
  useEffect(() => {
    if (isStepValid) {
      setUserCode(step.initialCode || step.code || "");
      setTestResults([]);
      setAllTestsPassed(false);
      setIsRunningTests(false);
      setGeneralError(null);
    } else {
      setUserCode("");
      setTestResults([]);
      setAllTestsPassed(false);
      setIsRunningTests(false);
      setGeneralError(null);
      if (step.stepType === "interactive") {
        console.warn(
          "InteractiveStep: Krok interaktywny bez poprawnych testCases.",
          step
        );
      }
    }
  }, [step, isStepValid]); // Dodano isStepValid do zależności

  // Handler zmiany kodu (bez zmian)
  const handleCodeChange = useCallback(
    (value: string | undefined) => {
      setUserCode(value || "");
      if (testResults.length > 0 || allTestsPassed) {
        setTestResults([]);
        setAllTestsPassed(false);
        setGeneralError(null);
      }
    },
    [testResults.length, allTestsPassed]
  );

  // Handler uruchamiania testów
  const handleRunTests = useCallback(async () => {
    if (!isStepValid || !step.testCases) {
      // Ponowna weryfikacja
      setGeneralError(
        "Nie można uruchomić testów - krok jest nieprawidłowo skonfigurowany."
      );
      return;
    }
    setIsRunningTests(true);
    setTestResults([]);
    setAllTestsPassed(false);
    setGeneralError(null);
    try {
      const results = await runCodeTests(
        userCode,
        step.testCases,
        step.language || "javascript",
        5000
      ); // Zwiększony timeout
      setTestResults(results);
      const allPassed = results.every((result) => result.status === "pass");
      setAllTestsPassed(allPassed);

      if (!allPassed && results.length === 0) {
        // Jeśli nie ma wyników, a miały być
        setGeneralError(
          `Nie udało się uruchomić testów. Sprawdź kod pod kątem błędów składni.`
        );
      }
      // Nie wywołujemy onComplete tutaj
    } catch (err: any) {
      console.error("Błąd podczas wywołania runCodeTests:", err);
      setGeneralError(
        `Wystąpił błąd systemowy: ${err.message || "Nieznany błąd"}`
      );
      setTestResults([]);
      setAllTestsPassed(false);
    } finally {
      setIsRunningTests(false);
    }
  }, [userCode, step, isStepValid]); // Dodano isStepValid

  // Handler dla przycisku "Kontynuuj" (wywoływany tylko po zaliczeniu testów)
  const handleContinue = () => {
    if (allTestsPassed) {
      onComplete(true); // Sygnalizuj sukces do LessonPage
    }
  };

  // --- Renderowanie ---

  // Obsługa nieprawidłowo skonfigurowanego kroku
  if (step.stepType === "interactive" && !isStepValid) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Błąd Konfiguracji Kroku</AlertTitle>
        <AlertDescription>
          Ten krok interaktywny jest nieprawidłowo skonfigurowany (brak
          `testCases`).
          {/* Przycisk "Pomiń" wywołuje onComplete(true), aby pozwolić przejść dalej mimo błędu konfiguracji */}
          <Button
            onClick={() => onComplete(true)}
            variant="outline"
            size="sm"
            className="ml-4 mt-2 sm:mt-0"
          >
            Pomiń Krok
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  // Obsługa kroku, który nie jest interaktywny
  if (step.stepType !== "interactive") {
    return (
      <div className="p-4 text-gray-500">
        Krok nie jest typu interaktywnego.
      </div>
    );
  }

  // Główna część renderująca dla POPRAWNEGO kroku interaktywnego
  return (
    <div className="interactive-step space-y-6">
      {/* Tytuł i treść (bez zmian) */}
      {step.title && (
        <h2 className="text-2xl font-semibold border-b pb-2 dark:border-gray-700">
          {step.title}
        </h2>
      )}
      {step.content && (
        <div
          className="prose prose-lg dark:prose-invert max-w-none text-gray-800 dark:text-gray-200"
          dangerouslySetInnerHTML={{ __html: step.content }}
        />
      )}

      {/* Edytor Monaco */}
      <div className="border rounded-lg overflow-hidden shadow-sm dark:border-gray-700">
        <MonacoEditor
          height="400px"
          language={step.language || "javascript"}
          theme="vs-dark"
          value={userCode}
          onChange={handleCodeChange}
          options={
            {
              /* opcje bez zmian */
            }
          }
        />
      </div>

      {/* Wskazówka (bez zmian) */}
      {step.hint && (
        <details className="p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/30 dark:border-blue-800 shadow-sm">
          <summary className="cursor-pointer font-medium text-blue-800 dark:text-blue-300 flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-blue-500" /> Wskazówka
          </summary>
          <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
            {step.hint}
          </p>
        </details>
      )}

      {/* Przyciski Akcji */}
      <div className="flex flex-wrap gap-4 items-center border-t dark:border-gray-700 pt-6">
        <LoadingButton
          onClick={handleRunTests}
          isLoading={isRunningTests}
          disabled={userCode.trim() === "" || isRunningTests || isLoading}
          variant="secondary"
          size="lg"
        >
          <Play className="mr-2 h-5 w-5" />
          {isRunningTests ? "Uruchamianie..." : "Uruchom Testy"}
        </LoadingButton>
        {/* Przycisk Kontynuuj pojawia się tylko po sukcesie */}
        {allTestsPassed && !isRunningTests && (
          <LoadingButton
            onClick={handleContinue}
            isLoading={isLoading} // Użyj globalnego isLoading dla tego przycisku
            disabled={isLoading || isRunningTests}
            size="lg"
            className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white"
          >
            <Check className="mr-2 h-5 w-5" /> Kontynuuj
          </LoadingButton>
        )}
      </div>

      {/* Wyświetlanie błędów ogólnych lub sukcesu (bez zmian, ale poprawiono klasę Alert) */}
      {generalError && !isRunningTests && (
        <Alert variant="destructive">...</Alert>
      )}
      {allTestsPassed && !isRunningTests && (
        <Alert
          variant="default"
          className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 text-green-800 dark:text-green-300"
        >
          ...
        </Alert>
      )}

      {/* Wyświetlanie wyników testów (ulepszony wygląd) */}
      {testResults.length > 0 && !isRunningTests && (
        <div className="space-y-3 pt-4">
          <h3 className="text-lg font-semibold">Wyniki Testów:</h3>
          {testResults.map((result, index) => (
            <Alert
              key={result.id || index}
              variant={result.status === "pass" ? "default" : "destructive"}
              className={cn(
                result.status === "pass"
                  ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                  : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
              )}
            >
              <div className="flex items-start">
                {result.status === "pass" ? (
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                )}
                <div className="ml-3 flex-grow">
                  <AlertTitle
                    className={cn(
                      "font-medium",
                      result.status === "pass"
                        ? "text-green-900 dark:text-green-200"
                        : "text-red-900 dark:text-red-200"
                    )}
                  >
                    Test #{index + 1}{" "}
                    {step.testCases?.[index]?.description
                      ? `- ${step.testCases[index].description}`
                      : ""}
                    :{" "}
                    {result.status === "pass"
                      ? "Zaliczony"
                      : result.status === "fail"
                      ? "Niepowodzenie"
                      : "Błąd"}
                  </AlertTitle>
                  <AlertDescription className="mt-1 text-xs space-y-1 font-mono">
                    <div className="flex">
                      <span className="w-20 font-semibold flex-shrink-0">
                        Wejście:
                      </span>
                      <code className="ml-2 break-all text-gray-700 dark:text-gray-300">
                        {result.inputDisplay || "brak"}
                      </code>
                    </div>
                    <div className="flex">
                      <span className="w-20 font-semibold flex-shrink-0">
                        Oczekiwane:
                      </span>
                      <code className="ml-2 break-all text-gray-700 dark:text-gray-300">
                        {result.expectedOutputDisplay || "brak"}
                      </code>
                    </div>
                    {result.status !== "pass" && (
                      <div className="flex">
                        <span
                          className={cn(
                            "w-20 font-semibold flex-shrink-0",
                            result.status === "fail"
                              ? "text-red-600 dark:text-red-400"
                              : "text-orange-600 dark:text-orange-400"
                          )}
                        >
                          Otrzymane:
                        </span>
                        <code className="ml-2 break-all text-red-800 dark:text-red-300">
                          {result.actualOutputDisplay ??
                            result.error ??
                            "Brak wyniku"}
                        </code>
                      </div>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* Rozwiązanie (Solution) - Użyj Accordion dla spójności */}
      {step.solution && (
        <Accordion type="single" collapsible className="w-full pt-4">
          <AccordionItem
            value="solution"
            className="border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 shadow-sm overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-3 text-left hover:no-underline font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50">
              Pokaż Rozwiązanie
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-0 border-t dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="mt-3 overflow-x-auto">
                <pre className="font-mono text-sm text-gray-800 dark:text-gray-200">
                  <code>{step.solution}</code>
                </pre>
                {/* Można też użyć SyntaxHighlighter tutaj */}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
