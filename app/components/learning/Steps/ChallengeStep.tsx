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
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Check,
  CheckCircle,
  Lightbulb,
  Play,
  Trophy,
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
  loading: () => <p>Ładowanie edytora...</p>,
});

interface ChallengeStepProps {
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

export default function ChallengeStep({
  step,
  onComplete,
  isLoading = false,
}: ChallengeStepProps) {
  const challengeData = step.challengeData || {};
  const testCases = step.testCases || challengeData.testCases || [];
  const hint = step.hint || challengeData.hint;
  const initialCode = step.initialCode || challengeData.initialCode || "";
  const language = step.language || challengeData.language || "javascript";
  const solution = step.solution || challengeData.solution;

  const isStepValid =
    step.type === "challenge" &&
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
      setUserCode(initialCode);
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
      if (step.type === "challenge") {
        console.warn(
          "ChallengeStep: Krok wyzwania bez poprawnych testCases.",
          step
        );
      }
    }
  }, [step, isStepValid, initialCode]);

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
      setGeneralError("Błąd konfiguracji kroku.");
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
        language,
        10000
      );

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
  }, [userCode, isStepValid, testCases, language]);

  const handleContinue = () => {
    if (allTestsPassed) {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const passingTests = testResults.filter(
        (t) => t.status === "pass"
      ).length;

      onComplete({
        isCorrect: true,
        answer: userCode,
        timeSpent: timeSpent,
        attempts: attempts,
        testsPassed: passingTests,
        totalTests: testCases.length,
      });
    }
  };

  if (step.type === "challenge" && !isStepValid) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Błąd Konfiguracji Kroku</AlertTitle>
        <AlertDescription>
          Ten krok wyzwania jest nieprawidłowo skonfigurowany (brak
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

  if (step.type !== "challenge") {
    return (
      <div className="p-4 text-gray-500">Krok nie jest typu wyzwania.</div>
    );
  }

  return (
    <div className="challenge-step space-y-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="challenge-editor" className="text-base font-medium">
            Twoje rozwiązanie:
          </Label>
          <div className="border rounded-lg overflow-hidden shadow-sm dark:border-gray-700 h-[450px]">
            <MonacoEditor
              height="100%"
              language={language}
              theme="vs-dark"
              value={userCode}
              onChange={handleCodeChange}
            />
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-base font-medium">Przypadki testowe:</h3>
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-2 border dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
            {testCases?.map((test, index) => (
              <div
                key={test.id || index}
                className="border dark:border-gray-600 rounded-md overflow-hidden text-xs bg-white dark:bg-gray-800"
              >
                <div
                  className={cn(
                    "px-3 py-2 flex justify-between items-center border-b dark:border-gray-600",
                    testResults.find((r) => String(r.id) === String(test.id))
                      ?.status === "pass"
                      ? "bg-green-100 dark:bg-green-900/30"
                      : testResults.find(
                          (r) => String(r.id) === String(test.id)
                        )?.status === "fail"
                      ? "bg-red-100 dark:bg-red-900/30"
                      : testResults.find(
                          (r) => String(r.id) === String(test.id)
                        )?.status === "error"
                      ? "bg-orange-100 dark:bg-orange-900/30"
                      : "bg-gray-50 dark:bg-gray-700/50"
                  )}
                >
                  <span className="font-medium">
                    Test #{index + 1}{" "}
                    {test.description ? `- ${test.description}` : ""}
                  </span>
                  {testResults.find((r) => String(r.id) === String(test.id))
                    ?.status === "pass" && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {testResults.find((r) => String(r.id) === String(test.id))
                    ?.status === "fail" && (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  {testResults.find((r) => String(r.id) === String(test.id))
                    ?.status === "error" && (
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
                  {testResults.find((r) => String(r.id) === String(test.id)) &&
                    testResults.find((r) => String(r.id) === String(test.id))
                      ?.status !== "pass" && (
                      <div>
                        <span className="font-semibold w-20 inline-block text-red-600 dark:text-red-400">
                          Otrzymane:
                        </span>
                        <code className="ml-1 break-all text-red-700 dark:text-red-300">
                          {testResults.find(
                            (r) => String(r.id) === String(test.id)
                          )?.actualOutputDisplay ??
                            testResults.find(
                              (r) => String(r.id) === String(test.id)
                            )?.error ??
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

      {solution && (
        <Accordion type="single" collapsible>
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
                  <code>{solution}</code>
                </pre>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
