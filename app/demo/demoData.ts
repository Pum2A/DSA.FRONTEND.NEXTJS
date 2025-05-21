import { Lesson, LessonProgress, Module, QuizOption, Step } from "../types";

export const demoModules: Module[] = [
  {
    id: 1,
    externalId: "demo-algorytmy",
    title: "Algorytmy Demo",
    description: "Przykładowy moduł demonstracyjny dla nowych użytkowników.",
    order: 1,
    icon: "book",
    iconColor: "#6D28D9",
    prerequisites: [], // Dodane puste prerequisites, które są wymagane w nowym typie
    lessons: [
      {
        id: 101,
        externalId: "demo-lekcja-1",
        title: "Wprowadzenie do Algorytmów",
        description: "Dowiedz się, czym są algorytmy i do czego służą.",
        estimatedTime: "8 min",
        xpReward: 10,
        moduleId: 1,
        requiredSkills: [], // Dodane puste requiredSkills, które są wymagane w nowym typie
        steps: [
          {
            id: 1,
            type: "text",
            title: "Czym są algorytmy?",
            content:
              "Algorytm to zestaw kroków prowadzących do rozwiązania danego problemu.",
            order: 1,
            lessonId: 101,
          },
          {
            id: 2,
            type: "list",
            title: "Przykłady algorytmów w życiu codziennym",
            content: "Algorytmy spotykasz codziennie! Oto kilka przykładów:",
            items: [
              {
                id: "1",
                text: "Przepis na ciasto",
                description: "Krok po kroku jak upiec ciasto.",
              },
              {
                id: "2",
                text: "Instrukcja obsługi pralki",
                description: "Jak nastawić pranie.",
              },
              {
                id: "3",
                text: "Nawigacja GPS",
                description: "Wyznaczanie najkrótszej trasy.",
              },
            ],
            order: 2,
            lessonId: 101,
          },
          {
            id: 3,
            type: "quiz",
            title: "Quiz: Czym NIE jest algorytm?",
            content: "",
            question: "Które z poniższych NIE jest algorytmem?",
            options: [
              { id: "a", text: "Przepis na zupę", isCorrect: false },
              { id: "b", text: "Lista zakupów", isCorrect: true }, // Zmienione correct na isCorrect
              { id: "c", text: "Instrukcja montażu mebli", isCorrect: false },
            ] as QuizOption[],
            correctAnswer: "b",
            explanation:
              "Lista zakupów nie jest algorytmem, bo nie zawiera instrukcji wykonania kroków.",
            order: 3,
            lessonId: 101,
          },
          {
            id: 4,
            type: "video",
            title: "Animacja: Algorytm w praktyce",
            content: "Obejrzyj krótką animację pokazującą przykład algorytmu.",
            imageUrl: "https://i.imgur.com/0y8Ftya.gif",
            videoUrl: "https://example.com/demo-algorithm.mp4", // Dodane videoUrl dla typu video
            duration: 90, // Dodany szacowany czas trwania
            order: 4,
            lessonId: 101,
          },
          {
            id: 5,
            type: "interactive",
            title: "Ułóż swój własny algorytm",
            content: "Wymyśl i opisz własny algorytm na: 'Jak zrobić herbatę'.",
            initialCode: "1. Zagotuj wodę\n2. ...",
            hint: "Pomyśl o wszystkich krokach od początku do końca.",
            testCases: [
              // Dodane przykładowe testCases dla typu interactive
              {
                id: "1",
                input: "'algorytm herbaty'",
                expectedOutput: "true",
                description: "Sprawdzenie czy algorytm zawiera słowo 'herbata'",
              },
            ],
            order: 5,
            lessonId: 101,
          },
          {
            id: 6,
            type: "quiz",
            title: "Quiz: Jakie cechy powinien mieć dobry algorytm?",
            content: "",
            question: "Które z poniższych jest cechą dobrego algorytmu?",
            options: [
              { id: "a", text: "Niejasność", isCorrect: false },
              { id: "b", text: "Precyzyjność", isCorrect: true }, // Zmienione correct na isCorrect
              { id: "c", text: "Długość", isCorrect: false },
            ] as QuizOption[],
            correctAnswer: "b",
            explanation: "Algorytm powinien być precyzyjny i jednoznaczny.",
            order: 6,
            lessonId: 101,
          },
        ] as Step[],
      } as Lesson,
      {
        id: 102,
        externalId: "demo-lekcja-2",
        title: "Sortowanie bąbelkowe",
        description: "Poznaj prosty algorytm sortowania tablicy.",
        estimatedTime: "12 min",
        xpReward: 15,
        moduleId: 1,
        requiredSkills: [], // Dodane puste requiredSkills
        steps: [
          {
            id: 1,
            type: "text",
            title: "Czym jest sortowanie bąbelkowe?",
            content:
              "Sortowanie bąbelkowe polega na wielokrotnym przechodzeniu przez tablicę i zamianie miejscami sąsiednich elementów, jeśli są w złej kolejności.",
            order: 1,
            lessonId: 102,
          },
          {
            id: 2,
            type: "video",
            title: "Zobacz sortowanie bąbelkowe w akcji",
            content: "Krótka animacja działania algorytmu.",
            imageUrl:
              "https://upload.wikimedia.org/wikipedia/commons/c/c8/Bubble-sort-example-300px.gif",
            videoUrl: "https://example.com/bubble-sort.mp4", // Dodane videoUrl
            duration: 120, // Dodany czas trwania
            order: 2,
            lessonId: 102,
          },
          {
            id: 3,
            type: "quiz",
            title: "Quiz: Główna zasada sortowania bąbelkowego",
            content: "",
            question:
              "Co robimy, jeśli element po lewej jest większy od elementu po prawej?",
            options: [
              { id: "a", text: "Nic nie robimy", isCorrect: false },
              { id: "b", text: "Zamieniamy je miejscami", isCorrect: true }, // Zmienione correct na isCorrect
              { id: "c", text: "Usuwamy oba elementy", isCorrect: false },
            ] as QuizOption[],
            correctAnswer: "b",
            explanation:
              "W sortowaniu bąbelkowym zamieniamy sąsiadujące elementy, jeśli są w złej kolejności.",
            order: 3,
            lessonId: 102,
          },
          {
            id: 4,
            type: "interactive",
            title: "Wypróbuj kod sortowania bąbelkowego",
            content:
              "Napisz funkcję, która posortuje tablicę liczb rosnąco używając sortowania bąbelkowego.",
            initialCode: `function bubbleSort(arr) {
  // TODO: zaimplementuj algorytm sortowania bąbelkowego
  return arr;
}`,
            hint: "Porównuj sąsiednie elementy i zamieniaj je miejscami, jeśli są w złej kolejności.",
            order: 4,
            lessonId: 102,
            testCases: [
              {
                id: "tc1",
                input: "[5, 1, 4, 2, 3]",
                expectedOutput: "[1, 2, 3, 4, 5]",
                description: "Przykładowa tablica do posortowania.",
              },
              {
                id: "tc2",
                input: "[10, 7, 8]",
                expectedOutput: "[7, 8, 10]",
                description: "Tablica z trzema elementami.",
              },
            ],
            language: "javascript", // Dodane pole language
          },
          {
            id: 5,
            type: "quiz",
            title: "Quiz: Ile razy przechodzimy przez tablicę?",
            content: "",
            question:
              "Ile razy maksymalnie musimy przejść przez tablicę o n elementach?",
            options: [
              { id: "a", text: "n-1 razy", isCorrect: true }, // Zmienione correct na isCorrect
              { id: "b", text: "1 raz", isCorrect: false },
              { id: "c", text: "n razy", isCorrect: false },
            ] as QuizOption[],
            correctAnswer: "a",
            explanation:
              "W najgorszym przypadku musimy przejść przez tablicę n-1 razy.",
            order: 5,
            lessonId: 102,
          },
        ] as Step[],
      } as Lesson,
      {
        id: 103,
        externalId: "demo-lekcja-3",
        title: "Wyszukiwanie binarne",
        description:
          "Dowiedz się, jak szybko znaleźć element w posortowanej tablicy.",
        estimatedTime: "10 min",
        xpReward: 20,
        moduleId: 1,
        requiredSkills: [], // Dodane puste requiredSkills
        steps: [
          {
            id: 1,
            type: "text",
            title: "Co to jest wyszukiwanie binarne?",
            content:
              "Wyszukiwanie binarne pozwala znaleźć element w posortowanej tablicy w czasie logarytmicznym.",
            order: 1,
            lessonId: 103,
          },
          {
            id: 2,
            type: "list",
            title: "Kroki wyszukiwania binarnego",
            content: "Aby znaleźć element:",
            items: [
              { id: "1", text: "Wybierz środkowy element tablicy" },
              { id: "2", text: "Jeśli to szukany element — zakończ" },
              {
                id: "3",
                text: "Jeśli szukany < środkowy — przeszukaj lewą część",
              },
              {
                id: "4",
                text: "Jeśli szukany > środkowy — przeszukaj prawą część",
              },
            ],
            order: 2,
            lessonId: 103,
          },
          {
            id: 3,
            type: "quiz",
            title: "Quiz: Kiedy działa wyszukiwanie binarne?",
            content: "",
            question: "Kiedy można zastosować wyszukiwanie binarne?",
            options: [
              {
                id: "a",
                text: "Gdy tablica jest posortowana",
                isCorrect: true,
              },
              { id: "b", text: "Zawsze", isCorrect: false },
              {
                id: "c",
                text: "Gdy tablica ma tylko dwa elementy",
                isCorrect: false,
              },
            ] as QuizOption[],
            correctAnswer: "a",
            explanation:
              "Wyszukiwanie binarne działa tylko na posortowanych tablicach.",
            order: 3,
            lessonId: 103,
          },
          {
            id: 4,
            type: "interactive",
            title: "Zaimplementuj wyszukiwanie binarne",
            content:
              "Napisz funkcję, która sprawdzi, czy liczba x jest w posortowanej tablicy.",
            initialCode: `function binarySearch(arr, x) {
  // TODO: Zaimplementuj wyszukiwanie binarne
  return false;
}`,
            hint: "Użyj indeksów left i right. Sprawdzaj środkowy element.",
            order: 4,
            lessonId: 103,
            language: "javascript", // Dodane pole language
            testCases: [
              {
                id: "tc1",
                input: "[1,2,3,4,5], 3",
                expectedOutput: "true",
                description: "Liczba 3 jest w tablicy",
              },
              {
                id: "tc2",
                input: "[1,2,3,4,5], 9",
                expectedOutput: "false",
                description: "Liczba 9 nie jest w tablicy",
              },
            ],
          },
          {
            id: 5,
            type: "quiz",
            title: "Quiz: Złożoność czasowa",
            content: "",
            question: "Jaka jest złożoność czasowa wyszukiwania binarnego?",
            options: [
              { id: "a", text: "O(n)", isCorrect: false },
              { id: "b", text: "O(log n)", isCorrect: true },
              { id: "c", text: "O(n^2)", isCorrect: false },
            ] as QuizOption[],
            correctAnswer: "b",
            explanation: "Wyszukiwanie binarne działa w czasie logarytmicznym.",
            order: 5,
            lessonId: 103,
          },
        ] as Step[],
      } as Lesson,
    ],
  },
];

// Przykładowy postęp użytkownika z nowymi polami zgodnie z typem LessonProgress
// Przykładowy postęp użytkownika – LessonProgress NIE MA currentStepIndex!
export const demoProgress: Record<string, LessonProgress> = {
  "demo-lekcja-1": {
    lessonId: "demo-lekcja-1",
    isCompleted: true,
    completedSteps: 6,
    totalSteps: 6,
    lastActivityDate: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    completionPercentage: 100,
    earnedXP: 10,
  },
  "demo-lekcja-2": {
    lessonId: "demo-lekcja-2",
    isCompleted: false,
    completedSteps: 3,
    totalSteps: 5,
    lastActivityDate: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    completionPercentage: 60,
    earnedXP: 5,
  },
  "demo-lekcja-3": {
    lessonId: "demo-lekcja-3",
    isCompleted: false,
    completedSteps: 2,
    totalSteps: 5,
    lastActivityDate: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    completionPercentage: 40,
    earnedXP: 0,
  },
};

export const demoCurrentStepIndex: Record<string, number> = {
  "demo-lekcja-1": 6,
  "demo-lekcja-2": 3,
  "demo-lekcja-3": 2,
};
