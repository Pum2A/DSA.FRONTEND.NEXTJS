"use client";

import { Step, TestResult } from "@/app/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Check,
  CheckCircle,
  Lightbulb,
  Loader2,
  Play,
  XCircle,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { runCodeTests } from "../../../lib/codeRunner";
import { LoadingButton } from "../../ui/LoadingButton";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-gray-500 dark:text-gray-400">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Ładowanie edytora
      kodu...
    </div>
  ),
});

interface InteractiveStepProps {
  step: Step;
  onComplete: (data: {
    isCorrect: boolean;
    answer?: any;
    timeSpent?: number;
    attempts?: number;
    testsPassed?: number;
    totalTests?: number;
  }) => void;
  isLoading?: boolean;
}

export default function InteractiveStep({
  step,
  onComplete,
  isLoading = false,
}: InteractiveStepProps) {
  const interactiveData = step.interactiveData || {};
  const testCases = step.testCases || interactiveData.testCases || [];
  const hint = step.hint || interactiveData.taskDescription;

  const isStepValid =
    step.type === "interactive" &&
    Array.isArray(testCases) &&
    testCases.length > 0;

  const [userCode, setUserCode] = useState<string>("");
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [allTestsPassed, setAllTestsPassed] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const [attempts, setAttempts] = useState(0);

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
      if (step.type === "interactive") {
        console.warn(
          "InteractiveStep: Krok interaktywny bez poprawnych testCases.",
          step
        );
      }
    }
  }, [step, isStepValid]);

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

  const handleRunTests = useCallback(async () => {
    if (!isStepValid || !testCases.length) {
      setGeneralError(
        "Nie można uruchomić testów - krok jest nieprawidłowo skonfigurowany."
      );
      return;
    }

    setAttempts((prev) => prev + 1);
    setIsRunningTests(true);
    setTestResults([]);
    setAllTestsPassed(false);
    setGeneralError(null);

    try {
      const results = await runCodeTests(
        userCode,
        testCases.map((tc) => ({ ...tc, id: String(tc.id) })),
        step.language || "javascript",
        5000
      );
      setTestResults(results);
      const allPassed = results.every((result) => result.status === "pass");
      setAllTestsPassed(allPassed);

      if (!allPassed && results.length === 0) {
        setGeneralError(
          `Nie udało się uruchomić testów. Sprawdź kod pod kątem błędów składni.`
        );
      }
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
  }, [userCode, step, isStepValid, testCases]);

  const handleContinue = () => {
    if (allTestsPassed) {
      const currentTime = Math.floor((Date.now() - startTime) / 1000);
      onComplete({
        isCorrect: true,
        answer: userCode,
        timeSpent: currentTime,
        attempts: attempts,
        testsPassed: testResults.filter((t) => t.status === "pass").length,
        totalTests: testCases.length,
      });
    }
  };

  if (step.type === "interactive" && !isStepValid) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Błąd Konfiguracji Kroku</AlertTitle>
        <AlertDescription>
          Ten krok interaktywny jest nieprawidłowo skonfigurowany (brak
          `testCases`).
          <Button
            onClick={() =>
              onComplete({
                isCorrect: true,
                timeSpent: 0,
                attempts: 0,
              })
            }
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

  if (step.type !== "interactive") {
    return (
      <div className="p-4 text-gray-500">
        Krok nie jest typu interaktywnego.
      </div>
    );
  }

  return (
    <div className="interactive-step space-y-6">
      {step.title && (
        <h2 className="text-2xl font-semibold border-b pb-2 dark:border-gray-700">
          {step.title}
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

      <div className="border rounded-lg overflow-hidden shadow-sm dark:border-gray-700">
        <MonacoEditor
          height="400px"
          language={step.language || "javascript"}
          theme="vs-dark"
          value={userCode}
          onChange={handleCodeChange}
        />
      </div>

      {hint && (
        <details className="p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/30 dark:border-blue-800 shadow-sm">
          <summary className="cursor-pointer font-medium text-blue-800 dark:text-blue-300 flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-blue-500" /> Wskazówka
          </summary>
          <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
            {hint}
          </p>
        </details>
      )}

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
          className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 text-green-800 dark:text-green-300"
        >
          <CheckCircle className="h-5 w-5" />
          <AlertTitle>Sukces!</AlertTitle>
          <AlertDescription>
            Wszystkie testy przeszły pomyślnie. Możesz przejść dalej.
          </AlertDescription>
        </Alert>
      )}

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
                    {testCases?.[index]?.description
                      ? `- ${testCases[index].description}`
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
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
