"use client";

// Twoje istniejące importy
import { Step } from "@/app/types"; // PAMIĘTAJ O MODYFIKACJI TEGO TYPU!

// Nowe wymagane importy
import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Zakładamy Shadcn UI
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Lightbulb,
} from "lucide-react";
import { runCodeTests, TestResult } from "../../../lib/codeRunner"; // Zakładamy istnienie tego pliku
import { LoadingButton } from "../../ui/LoadingButton";

// Dynamiczne ładowanie edytora Monaco
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-gray-500 dark:text-gray-400">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      Ładowanie edytora kodu...
    </div>
  ),
});

// Definicja propsów komponentu
interface InteractiveStepProps {
  step: Step;
  onComplete: () => void;
  isLoading?: boolean;
}

// GŁÓWNY KOMPONENT
export default function InteractiveStep({
  step,
  onComplete,
  isLoading = false,
}: InteractiveStepProps) {
  // Sprawdzenie, czy krok jest poprawnie skonfigurowany
  // Zakładamy, że typ Step MA JUŻ stepType i testCases?
  const isStepValid =
    step.stepType === "interactive" &&
    Array.isArray(step.testCases) &&
    step.testCases.length > 0;

  // Stany komponentu
  const [userCode, setUserCode] = useState<string>("");
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [allTestsPassed, setAllTestsPassed] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Efekt do inicjalizacji/resetowania stanu przy zmianie kroku
  useEffect(() => {
    // Bezpieczne sprawdzenie stepType i testCases przed użyciem
    if (step.stepType === "interactive" && Array.isArray(step.testCases)) {
      setUserCode(step.initialCode || step.code || "");
      setTestResults([]);
      setAllTestsPassed(false);
      setIsRunningTests(false);
      setGeneralError(null);
    } else {
      // Resetuj stan, jeśli krok nie jest poprawny lub się zmienił na nieinteraktywny
      setUserCode("");
      setTestResults([]);
      setAllTestsPassed(false);
      setIsRunningTests(false);
      setGeneralError(null);
      if (step.stepType === "interactive") {
        // Loguj tylko jeśli miał być interaktywny, ale brak testCases
        console.warn(
          "InteractiveStep: Krok interaktywny bez poprawnych testCases.",
          step
        );
      }
    }
  }, [step]); // Zależność tylko od obiektu step

  // Handler zmiany kodu w edytorze
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
    // Ponowna, jawna weryfikacja dla TypeScript
    if (!isStepValid || !step.testCases) {
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
      // step.testCases jest tutaj bezpieczne wg logiki isStepValid
      const results = await runCodeTests(
        userCode,
        step.testCases,
        step.language || "javascript",
        3000 // Timeout
      );
      setTestResults(results);

      const allPassed = results.every((result) => result.status === "pass");
      setAllTestsPassed(allPassed);

      if (!allPassed && results.length === 0) {
        setGeneralError(`Nie udało się uruchomić testów. Sprawdź kod.`);
      }
    } catch (err: any) {
      console.error("Błąd podczas wywołania runCodeTests:", err);
      setGeneralError(
        `Wystąpił błąd systemowy podczas uruchamiania testów: ${
          err.message || "Nieznany błąd"
        }`
      );
      setTestResults([]);
      setAllTestsPassed(false);
    } finally {
      setIsRunningTests(false);
    }
  }, [userCode, step, isStepValid]); // Zależności

  // --- Renderowanie ---

  // Obsługa nieprawidłowo skonfigurowanego kroku interaktywnego
  if (step.stepType === "interactive" && !isStepValid) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Błąd Konfiguracji Kroku</AlertTitle>
        <AlertDescription>
          Ten krok interaktywny jest nieprawidłowo skonfigurowany
          (prawdopodobnie brak `testCases` w danych kroku). Skontaktuj się z
          administratorem.
          <LoadingButton
            onClick={onComplete}
            variant="outline"
            size="sm"
            className="ml-4 mt-2 sm:mt-0"
            isLoading={isLoading}
          >
            Pomiń Krok
          </LoadingButton>
        </AlertDescription>
      </Alert>
    );
  }
  // Obsługa kroku, który nie jest interaktywny (lub brak stepType)
  if (step.stepType !== "interactive") {
    // Zwracamy prosty komunikat i przycisk do kontynuacji
    return (
      <div className="p-4 text-gray-600 dark:text-gray-400">
        {step.title && (
          <h2 className="text-xl font-semibold mb-4">{step.title}</h2>
        )}
        {step.content && (
          <div
            className="prose dark:prose-invert max-w-none mb-6"
            dangerouslySetInnerHTML={{ __html: step.content }}
          />
        )}
        <LoadingButton
          onClick={onComplete}
          variant="default"
          isLoading={isLoading}
        >
          Kontynuuj
        </LoadingButton>
      </div>
    );
  }

  // Główna część renderująca dla POPRAWNEGO kroku interaktywnego
  return (
    <div className="interactive-step space-y-6">
      <h2 className="text-xl font-semibold mb-4">{step.title}</h2>

      {step.content && (
        <div
          className="prose dark:prose-invert max-w-none mb-6 text-gray-700 dark:text-gray-300"
          dangerouslySetInnerHTML={{ __html: step.content }}
        />
      )}

      <div className="mb-6 border rounded-md overflow-hidden shadow-sm dark:border-gray-700">
        <MonacoEditor
          height="350px"
          language={step.language || "javascript"}
          theme="vs-dark"
          value={userCode}
          onChange={handleCodeChange}
          options={{
            minimap: { enabled: true, scale: 0.6 },
            fontSize: 14,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: "on",
            padding: { top: 10 },
            tabSize: 2,
          }}
        />
      </div>

      {step.hint && (
        <details className="p-4 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/20 dark:border-blue-800/50 shadow-sm">
          <summary className="cursor-pointer font-medium text-blue-800 dark:text-blue-300 flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-blue-500" />
            Wskazówka
          </summary>
          <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
            {step.hint}
          </p>
        </details>
      )}

      <div className="flex flex-wrap gap-4 items-center">
        <LoadingButton
          onClick={handleRunTests}
          isLoading={isRunningTests}
          disabled={userCode.trim() === "" || isRunningTests}
          variant="secondary"
        >
          {isRunningTests ? "Uruchamianie..." : "Uruchom Testy"}
        </LoadingButton>
        <LoadingButton
          onClick={onComplete}
          disabled={!allTestsPassed || isRunningTests || isLoading}
          isLoading={isLoading}
          variant={allTestsPassed ? "default" : "secondary"}
        >
          {isLoading ? "Ładowanie..." : "Następny Krok"}
        </LoadingButton>
      </div>

      {/* Wyświetlanie błędów ogólnych lub sukcesu */}
      {generalError && !isRunningTests && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Błąd</AlertTitle>
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      )}
      {allTestsPassed && !isRunningTests && (
        <Alert
          variant="default"
          className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/50 text-green-800 dark:text-green-300"
        >
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-900 dark:text-green-200">
            Sukces!
          </AlertTitle>
          <AlertDescription>
            Wszystkie testy przeszły pomyślnie. Możesz przejść do następnego
            kroku.
          </AlertDescription>
        </Alert>
      )}

      {/* Wyświetlanie wyników testów */}
      {testResults.length > 0 && !isRunningTests && (
        <div className="space-y-4 pt-4 border-t dark:border-gray-700">
          <h3 className="text-lg font-medium">Wyniki Testów:</h3>
          {testResults.map((result, index) => (
            <Alert
              key={result.id || index}
              variant={result.status === "pass" ? "default" : "destructive"}
              className={
                result.status === "pass"
                  ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/50 text-green-800 dark:text-green-300"
                  : ""
              }
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  {result.status === "pass" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                </div>
                <div className="ml-3 flex-grow">
                  <AlertTitle
                    className={`mb-1 ${
                      result.status === "pass"
                        ? "text-green-900 dark:text-green-200"
                        : ""
                    }`}
                  >
                    {/* Użyto optional chaining dla bezpieczeństwa */}
                    Test #{index + 1}{" "}
                    {step.testCases?.[index]?.description
                      ? `- ${step.testCases[index].description}`
                      : ""}
                    :{" "}
                    <span className="font-semibold">
                      {result.status === "pass"
                        ? "Zaliczony"
                        : result.status === "fail"
                        ? "Niepowodzenie"
                        : "Błąd Wykonania"}
                    </span>
                  </AlertTitle>
                  <AlertDescription className="text-sm space-y-1 font-mono text-xs md:text-sm">
                    <div className="flex flex-wrap">
                      <span className="font-semibold w-24 flex-shrink-0">
                        Wejście:
                      </span>
                      <code className="ml-2 flex-grow bg-gray-100 dark:bg-gray-700 p-1 rounded break-all">
                        {result.inputDisplay || "brak"}
                      </code>
                    </div>
                    <div className="flex flex-wrap">
                      <span className="font-semibold w-24 flex-shrink-0">
                        Oczekiwane:
                      </span>
                      <code className="ml-2 flex-grow bg-gray-100 dark:bg-gray-700 p-1 rounded break-all">
                        {result.expectedOutputDisplay || "brak"}
                      </code>
                    </div>
                    {result.status !== "pass" && (
                      <div className="flex flex-wrap">
                        <span className="font-semibold w-24 flex-shrink-0 text-red-600 dark:text-red-400">
                          Otrzymane:
                        </span>
                        <code className="ml-2 flex-grow bg-red-100 dark:bg-red-900/50 p-1 rounded text-red-800 dark:text-red-300 break-all">
                          {result.actualOutputDisplay !== null
                            ? result.actualOutputDisplay
                            : result.error || "Brak wyniku"}
                        </code>
                      </div>
                    )}
                    {result.error && result.status === "error" && (
                      <p className="text-red-700 dark:text-red-400 mt-1">
                        <span className="font-semibold">Szczegóły błędu:</span>{" "}
                        {result.error}
                      </p>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* Rozwiązanie (Solution) */}
      {step.solution && (
        <details className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md dark:bg-gray-800 dark:border-gray-700 shadow-sm">
          <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white">
            Pokaż Rozwiązanie
          </summary>
          <div className="mt-3 p-3 bg-white dark:bg-gray-900 rounded border dark:border-gray-600">
            <pre className="font-mono text-sm whitespace-pre-wrap overflow-x-auto text-gray-800 dark:text-gray-200">
              <code>{step.solution}</code>
            </pre>
          </div>
        </details>
      )}
    </div>
  );
}
