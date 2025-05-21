// Definicja struktury wyniku pojedynczego testu
export interface TestResult {
  id: string; // ID z testCase
  status: "pass" | "fail" | "error"; // Status testu
  inputDisplay: string; // Oryginalny input jako string
  expectedOutputDisplay: string; // Oryginalny oczekiwany output jako string
  actualOutputDisplay: string | null; // Aktualny output jako string (lub null przy błędzie)
  error: string | null; // Komunikat błędu (jeśli status='error')
}

// Prosta funkcja do głębokiego porównywania wartości (obsługuje prymitywy, tablice, proste obiekty)
function deepCompare(a: any, b: any): boolean {
  if (a === b) return true;

  if (
    a === null ||
    typeof a !== "object" ||
    b === null ||
    typeof b !== "object"
  ) {
    if (Number.isNaN(a) && Number.isNaN(b)) return true;
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key) || !deepCompare(a[key], b[key])) {
      return false;
    }
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepCompare(a[i], b[i])) return false;
    }
  } else if (Array.isArray(a) !== Array.isArray(b)) {
    return false;
  }

  return true;
}

// Funkcja do formatowania wyniku na potrzeby wyświetlenia
function formatOutput(value: any): string {
  if (value === undefined) return "undefined";
  if (value === null) return "null";
  try {
    return JSON.stringify(value, null, 2);
  } catch (e) {
    return String(value);
  }
}

// Funkcja pomocnicza do ekstrakcji nazwy funkcji (prosta wersja)
function extractFunctionName(code: string): string | null {
  const match = code.match(/function\s+([a-zA-Z0-9_]+)\s*\(/);
  return match ? match[1] : null;
}

// Główna funkcja uruchamiająca testy
export async function runCodeTests(
  userCode: string,
  testCases: Array<{
    id: string;
    input: string;
    expectedOutput: string;
    description?: string;
  }>,
  language: string,
  timeoutMs: number = 2000
): Promise<TestResult[]> {
  if (language !== "javascript") {
    throw new Error(
      `Język '${language}' nie jest obsługiwany przez ten runner.`
    );
  }

  const results: TestResult[] = [];

  const functionName = extractFunctionName(userCode);
  if (!functionName) {
    console.error(
      "Nie można wyekstrahować nazwy funkcji z kodu użytkownika:",
      userCode
    );
    return testCases.map((tc) => ({
      id: tc.id,
      status: "error",
      inputDisplay: tc.input,
      expectedOutputDisplay: tc.expectedOutput,
      actualOutputDisplay: null,
      error:
        "Nie można zidentyfikować głównej funkcji w kodzie. Upewnij się, że jest zdefiniowana jako 'function nazwaFunkcji(...){...}'.",
    }));
  }

  for (const testCase of testCases) {
    let status: "pass" | "fail" | "error" = "error";
    let actualOutput: any = undefined;
    let actualOutputDisplay: string | null = null;
    let error: string | null = null;
    let parsedInput: any = undefined;
    let parsedExpectedOutput: any = undefined;

    try {
      try {
        parsedInput = JSON.parse(testCase.input);
      } catch (e) {
        if (testCase.input === "") {
          parsedInput = undefined;
        } else {
          parsedInput = testCase.input;
        }
      }

      try {
        parsedExpectedOutput = JSON.parse(testCase.expectedOutput);
      } catch (e) {
        parsedExpectedOutput = testCase.expectedOutput;
      }

      const executionPromise = new Promise<any>((resolve, reject) => {
        try {
          const runner = new Function(
            "inputArg",
            `
              try {
                ${userCode}
                if (typeof ${functionName} !== 'function') {
                   throw new Error("Funkcja '${functionName}' nie została zdefiniowana lub nie jest funkcją.");
                }
                return ${functionName}(inputArg === "" ? undefined : inputArg);
              } catch (err) {
                throw err;
              }
            `
          );
          const result = runner(parsedInput);
          resolve(result);
        } catch (execError: any) {
          reject(execError);
        }
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(`Przekroczono limit czasu wykonania (${timeoutMs}ms)`)
            ),
          timeoutMs
        )
      );

      actualOutput = await Promise.race([executionPromise, timeoutPromise]);
      actualOutputDisplay = formatOutput(actualOutput);

      if (deepCompare(actualOutput, parsedExpectedOutput)) {
        status = "pass";
      } else {
        status = "fail";
        error = "Otrzymany wynik różni się od oczekiwanego.";
      }
    } catch (err: any) {
      console.error(`Błąd testu #${testCase.id}:`, err);
      status = "error";
      error = err.message || "Wystąpił nieznany błąd wykonania.";
      actualOutputDisplay = null;
    }

    results.push({
      id: testCase.id,
      status: status,
      inputDisplay: testCase.input,
      expectedOutputDisplay: testCase.expectedOutput,
      actualOutputDisplay: actualOutputDisplay,
      error: error,
    });
  }

  return results;
}
