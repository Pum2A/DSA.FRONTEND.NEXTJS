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
  Trophy,
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
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Label } from "@/components/ui/label";

// Dynamiczne ładowanie edytora Monaco (bez zmian)
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <p>Ładowanie edytora...</p>,
});

// Zaktualizowane propsy
interface ChallengeStepProps {
  step: Step;
  onComplete: (isCorrect: boolean) => void; // Wymaga boolean
  isLoading?: boolean; // Globalny isLoading
}

export default function ChallengeStep({
  step,
  onComplete,
  isLoading = false,
}: ChallengeStepProps) {
  // Walidacja kroku
  const isStepValid =
    step.stepType === "challenge" &&
    Array.isArray(step.testCases) &&
    step.testCases.length > 0;

  const [userCode, setUserCode] = useState<string>("");
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [allTestsPassed, setAllTestsPassed] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Inicjalizacja/Reset
  useEffect(() => {
    if (isStepValid) {
      setUserCode(step.initialCode || "");
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
      if (step.stepType === "challenge") {
        console.warn(
          "ChallengeStep: Krok wyzwania bez poprawnych testCases.",
          step
        );
      }
    }
  }, [step, isStepValid]);

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

  // Handler uruchamiania testów (identyczny jak w InteractiveStep)
  const handleRunTests = useCallback(async () => {
    if (!isStepValid || !step.testCases) {
      setGeneralError("Błąd konfiguracji kroku.");
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
        10000
      ); // Dłuższy timeout dla wyzwań
      setTestResults(results);
      const allPassed = results.every((result) => result.status === "pass");
      setAllTestsPassed(allPassed);
      if (!allPassed && results.length === 0) {
        setGeneralError(`Nie udało się uruchomić testów.`);
      }
    } catch (err: any) {
      console.error("Błąd runCodeTests w ChallengeStep:", err);
      setGeneralError(`Błąd systemowy: ${err.message || "Nieznany błąd"}`);
      setTestResults([]);
      setAllTestsPassed(false);
    } finally {
      setIsRunningTests(false);
    }
  }, [userCode, step, isStepValid]);

  // Handler dla przycisku "Kontynuuj"
  const handleContinue = () => {
    if (allTestsPassed) {
      onComplete(true);
    }
  };

  // --- Renderowanie ---

  // Obsługa nieprawidłowo skonfigurowanego kroku
  if (step.stepType === "challenge" && !isStepValid) {
    return <Alert variant="destructive">...</Alert> /* Jak w InteractiveStep */;
  }
  if (step.stepType !== "challenge") {
    return (
      <div className="p-4 text-gray-500">Krok nie jest typu wyzwania.</div>
    );
  }

  return (
    <div className="challenge-step space-y-6">
      {/* Tytuł i treść */}
      {step.title && (
        <h2 className="text-2xl font-semibold border-b pb-2 dark:border-gray-700 flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" /> {step.title}
        </h2>
      )}
      {step.content && (
        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {step.content}
          </ReactMarkdown>
        </div>
      )}

      {/* Layout dwukolumnowy dla edytora i testów */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lewa kolumna: Edytor */}
        <div className="space-y-2">
          <Label htmlFor="challenge-editor" className="text-base font-medium">
            Twoje rozwiązanie:
          </Label>
          <div className="border rounded-lg overflow-hidden shadow-sm dark:border-gray-700 h-[450px]">
            {" "}
            {/* Stała wysokość */}
            <MonacoEditor
              height="100%"
              language={step.language || "javascript"}
              theme="vs-dark"
              value={userCode}
              onChange={handleCodeChange}
              options={
                {
                  /* opcje */
                }
              }
            />
          </div>
        </div>

        {/* Prawa kolumna: Testy */}
        <div className="space-y-3">
          <h3 className="text-base font-medium">Przypadki testowe:</h3>
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-2 border dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
            {" "}
            {/* Scroll dla testów */}
            {step.testCases?.map((test, index) => (
              <div
                key={test.id || index}
                className="border dark:border-gray-600 rounded-md overflow-hidden text-xs bg-white dark:bg-gray-800"
              >
                <div
                  className={cn(
                    "px-3 py-2 flex justify-between items-center border-b dark:border-gray-600",
                    testResults.find((r) => r.id === test.id)?.status === "pass"
                      ? "bg-green-100 dark:bg-green-900/30"
                      : testResults.find((r) => r.id === test.id)?.status ===
                        "fail"
                      ? "bg-red-100 dark:bg-red-900/30"
                      : testResults.find((r) => r.id === test.id)?.status ===
                        "error"
                      ? "bg-orange-100 dark:bg-orange-900/30"
                      : "bg-gray-50 dark:bg-gray-700/50"
                  )}
                >
                  <span className="font-medium">
                    Test #{index + 1}{" "}
                    {test.description ? `- ${test.description}` : ""}
                  </span>
                  {testResults.find((r) => r.id === test.id)?.status ===
                    "pass" && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {testResults.find((r) => r.id === test.id)?.status ===
                    "fail" && <XCircle className="h-4 w-4 text-red-500" />}
                  {testResults.find((r) => r.id === test.id)?.status ===
                    "error" && (
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                  )}
                </div>
                <div className="p-3 space-y-1 font-mono">
                  <div>
                    <span className="font-semibold w-20 inline-block">
                      Wejście:
                    </span>
                    <code className="ml-1 break-all">
                      {test.input || "brak"}
                    </code>
                  </div>
                  <div>
                    <span className="font-semibold w-20 inline-block">
                      Oczekiwane:
                    </span>
                    <code className="ml-1 break-all">
                      {test.expectedOutput || "brak"}
                    </code>
                  </div>
                  {/* Pokaż otrzymany wynik tylko jeśli test nie przeszedł */}
                  {testResults.find((r) => r.id === test.id) &&
                    testResults.find((r) => r.id === test.id)?.status !==
                      "pass" && (
                      <div>
                        <span className="font-semibold w-20 inline-block text-red-600 dark:text-red-400">
                          Otrzymane:
                        </span>
                        <code className="ml-1 break-all text-red-700 dark:text-red-300">
                          {testResults.find((r) => r.id === test.id)
                            ?.actualOutputDisplay ??
                            testResults.find((r) => r.id === test.id)?.error ??
                            "Brak wyniku"}
                        </code>
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wskazówka (bez zmian) */}
      {step.hint && <details>...</details>}

      {/* Przyciski Akcji */}
      <div className="flex flex-wrap gap-4 items-center border-t dark:border-gray-700 pt-6">
        <LoadingButton
          onClick={handleRunTests}
          isLoading={isRunningTests}
          disabled={userCode.trim() === "" || isRunningTests || isLoading}
          variant="secondary"
          size="lg"
        >
          <Play className="mr-2 h-5 w-5" />{" "}
          {isRunningTests ? "Uruchamianie..." : "Uruchom Testy"}
        </LoadingButton>
        {allTestsPassed && !isRunningTests && (
          <LoadingButton
            onClick={handleContinue}
            isLoading={isLoading}
            disabled={isLoading || isRunningTests}
            size="lg"
            className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white"
          >
            <Check className="mr-2 h-5 w-5" /> Kontynuuj
          </LoadingButton>
        )}
      </div>

      {/* Wyniki Ogólne i Szczegółowe Testów (można użyć tej samej logiki co w InteractiveStep do wyświetlania Alertów) */}
      {generalError && !isRunningTests && (
        <Alert variant="destructive">...</Alert>
      )}
      {allTestsPassed && !isRunningTests && (
        <Alert variant="default" className="...">
          Sukces! Wszystkie testy przeszły.
        </Alert>
      )}
      {/* Można dodać szczegółowe wyniki testów jak w InteractiveStep, jeśli to potrzebne */}

      {/* Rozwiązanie (Solution) - Accordion */}
      {step.solution && (
        <Accordion type="single" collapsible>
          ...
        </Accordion> /* Jak w InteractiveStep */
      )}
    </div>
  );
}
