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
// UWAGA: Nie obsługuje cyklicznych referencji, Map, Set, itp. W razie potrzeby użyj biblioteki jak lodash.isEqual.
function deepCompare(a: any, b: any): boolean {
  if (a === b) return true;

  if (
    a === null ||
    typeof a !== "object" ||
    b === null ||
    typeof b !== "object"
  ) {
    // Jeśli nie są obiektami/tablicami (poza ===), to są różne
    // lub porównujemy NaN === NaN, co jest false
    // Sprawdźmy NaN
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

  // Sprawdzenie dla tablic (keysA/keysB nie wystarczą dla pustych tablic lub różnej kolejności)
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepCompare(a[i], b[i])) return false;
    }
  } else if (Array.isArray(a) !== Array.isArray(b)) {
    return false; // Jedno jest tablicą, drugie nie
  }

  return true;
}

// Funkcja do formatowania wyniku na potrzeby wyświetlenia
function formatOutput(value: any): string {
  if (value === undefined) return "undefined";
  if (value === null) return "null";
  try {
    // Użyj JSON.stringify z wcięciami dla lepszej czytelności obiektów/tablic
    return JSON.stringify(value, null, 2);
  } catch (e) {
    // Jeśli JSON.stringify zawiedzie (np. cykliczne referencje), zwróć toString()
    return String(value);
  }
}

// Funkcja pomocnicza do ekstrakcji nazwy funkcji (prosta wersja)
function extractFunctionName(code: string): string | null {
  // Szuka "function nazwaFunkcji(" lub "function nazwaFunkcji ("
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
  timeoutMs: number = 2000 // Domyślny limit czasu na test w milisekundach
): Promise<TestResult[]> {
  if (language !== "javascript") {
    throw new Error(
      `Język '${language}' nie jest obsługiwany przez ten runner.`
    );
  }

  const results: TestResult[] = [];

  // Spróbuj wyekstrahować nazwę funkcji, którą użytkownik ma zaimplementować
  // Zakładamy, że jest taka sama we wszystkich testach dla danego kroku
  const functionName = extractFunctionName(userCode);
  if (!functionName) {
    console.error(
      "Nie można wyekstrahować nazwy funkcji z kodu użytkownika:",
      userCode
    );
    // Zwróć błąd dla wszystkich testów
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
    let status: "pass" | "fail" | "error" = "error"; // Domyślnie błąd
    let actualOutput: any = undefined;
    let actualOutputDisplay: string | null = null;
    let error: string | null = null;
    let parsedInput: any = undefined;
    let parsedExpectedOutput: any = undefined;

    try {
      // 1. Parsowanie Wejścia
      try {
        // Spróbuj sparsować jako JSON. Działa dla tablic, liczb, stringów w cudzysłowach, booleana.
        parsedInput = JSON.parse(testCase.input);
      } catch (e) {
        // Jeśli JSON.parse zawiedzie, potraktuj input jako zwykły string (np. dla 'O(n log n)')
        // LUB obsłuż specyficzne formaty (np. listy, drzewa) - TUTAJ UPROSZCZENIE
        if (testCase.input === "") {
          parsedInput = undefined; // Specjalna obsługa pustego inputu
        } else {
          // Na razie traktujemy nie-JSON jako string, co może być niepoprawne dla list/drzew
          // console.warn(`Nie można sparsować inputu jako JSON: "${testCase.input}". Traktowanie jako string.`);
          parsedInput = testCase.input; // UPROSZCZENIE - może wymagać poprawy
        }
      }

      // 2. Parsowanie Oczekiwanego Wyjścia
      try {
        parsedExpectedOutput = JSON.parse(testCase.expectedOutput);
      } catch (e) {
        // Jeśli JSON.parse zawiedzie, traktuj jako string
        // console.warn(`Nie można sparsować expectedOutput jako JSON: "${testCase.expectedOutput}". Traktowanie jako string.`);
        parsedExpectedOutput = testCase.expectedOutput;
      }

      // 3. Wykonanie Kodu Użytkownika z Timeoutem
      const executionPromise = new Promise<any>((resolve, reject) => {
        try {
          // Stwórz funkcję wykonującą kod użytkownika
          // Przekazujemy sparsowane wejście jako argument 'inputArg'
          // Zakładamy, że funkcja użytkownika jest dostępna globalnie w tym kontekście
          const runner = new Function(
            "inputArg",
            `
              try {
                ${userCode}
                // Sprawdź, czy funkcja istnieje przed wywołaniem
                if (typeof ${functionName} !== 'function') {
                   throw new Error("Funkcja '${functionName}' nie została zdefiniowana lub nie jest funkcją.");
                }
                // Wywołaj funkcję użytkownika z wejściem
                // Jeśli input był pusty "", przekazujemy undefined
                return ${functionName}(inputArg === "" ? undefined : inputArg);
              } catch (err) {
                // Przekaż błąd wykonania z wnętrza kodu użytkownika
                throw err;
              }
            `
          );

          // Wywołaj runnera
          const result = runner(parsedInput);
          resolve(result);
        } catch (execError: any) {
          // Złap błędy składniowe lub inne z `new Function` lub rzucone przez runnera
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

      // Czekaj na wykonanie lub timeout
      actualOutput = await Promise.race([executionPromise, timeoutPromise]);
      actualOutputDisplay = formatOutput(actualOutput);

      // 4. Porównanie Wyników
      if (deepCompare(actualOutput, parsedExpectedOutput)) {
        status = "pass";
      } else {
        status = "fail";
        error = "Otrzymany wynik różni się od oczekiwanego."; // Ogólny błąd 'fail'
      }
    } catch (err: any) {
      // Złap wszystkie błędy (parsowania, wykonania, timeout)
      console.error(`Błąd testu #${testCase.id}:`, err);
      status = "error";
      error = err.message || "Wystąpił nieznany błąd wykonania.";
      actualOutputDisplay = null; // Brak wyniku przy błędzie
    }

    // 5. Zapisanie Wyniku Testu
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
