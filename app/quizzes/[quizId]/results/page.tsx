"use client";

import Navbar from "@/app/components/Navbar";
import { QuizAnswerResultDto, QuizResultResponse } from "@/app/types/api/quizTypes";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, ChevronLeft, Star, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function QuizResultsPage() {
  const { quizId } = useParams() as { quizId: string };
  const router = useRouter();
  
  // Fetch quiz details first to get the moduleId
  const { data: quiz } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/Quiz/${quizId}`, {
          credentials: "include",
        });
        
        if (!response.ok) throw new Error("Failed to fetch quiz details");
        return response.json();
      } catch (error) {
        console.error("Error fetching quiz details:", error);
        throw error;
      }
    },
  });

  // Fetch quiz results
  const { data: results, isLoading } = useQuery<QuizResultResponse>({
    queryKey: ["quizResults", quizId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/Quiz/${quizId}/results`, {
          credentials: "include",
        });
        
        if (!response.ok) throw new Error("Failed to fetch quiz results");
        return response.json();
      } catch (error) {
        console.error("Error fetching quiz results:", error);
        throw error;
      }
    },
  });

  // Get message based on score
  const getScoreMessage = (score: number) => {
    if (score >= 90) return "Znakomicie! Doskonale opanowałeś ten materiał!";
    if (score >= 80) return "Bardzo dobrze! Masz solidną wiedzę na ten temat.";
    if (score >= 70) return "Dobrze! Opanowałeś większość materiału.";
    if (score >= 60) return "Nieźle! Warto jednak powtórzyć niektóre zagadnienia.";
    return "Musisz jeszcze popracować nad tym tematem.";
  };

  if (isLoading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <div className="animate-pulse space-y-6 max-w-3xl mx-auto">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-60 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate incorrect answers
  const incorrectAnswers = results ? results.totalQuestions - results.correctAnswers : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-4 -ml-2 text-muted-foreground">
              <Link href={quiz ? `/modules/${quiz.moduleId}` : "/dashboard"}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                {quiz ? "Powrót do modułu" : "Powrót do dashboardu"}
              </Link>
            </Button>

            <h1 className="text-3xl font-bold">Wyniki quizu</h1>
            <p className="text-muted-foreground mt-2">{quiz?.title || "Quiz"}</p>
          </div>

          {/* Score overview */}
          <Card className="mb-8 overflow-hidden">
            <div className={`p-6 text-white ${
              results && results.score >= 70 
                ? "bg-gradient-to-r from-green-600 to-green-700" 
                : results && results.score >= 50 
                  ? "bg-gradient-to-r from-amber-500 to-amber-600"
                  : "bg-gradient-to-r from-red-600 to-red-700"
            }`}>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-white text-2xl font-bold">Twój wynik</h2>
                  <p className="text-white/80 mt-1">
                    {results ? getScoreMessage(results.score) : ""}
                  </p>
                </div>
                <div className="text-4xl font-bold">{results?.score || 0}%</div>
              </div>
            </div>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {results?.correctAnswers || 0}
                  </div>
                  <div className="text-sm text-green-800 dark:text-green-300">Poprawne</div>
                </div>
                <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                    {incorrectAnswers}
                  </div>
                  <div className="text-sm text-red-800 dark:text-red-300">Błędne</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 text-amber-600 dark:text-amber-400">
                <Star className="h-5 w-5" />
                <span className="text-lg font-medium">+{results?.xpEarned || 0} XP zdobyto</span>
              </div>
            </CardContent>
          </Card>

          {/* Question review */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Przegląd pytań</h2>
            
            <div className="space-y-6">
              {results?.answerResults?.map((question: QuizAnswerResultDto, index: number) => (
                <Card key={question.questionId} className={`border-l-4 ${
                  question.isCorrect 
                    ? "border-l-green-600 dark:border-l-green-500" 
                    : "border-l-red-600 dark:border-l-red-500"
                }`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base font-medium">
                        <span className="text-muted-foreground mr-2">
                          {index + 1}.
                        </span>
                        {question.questionText}
                      </CardTitle>
                      {question.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-500" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* We need to modify how we show options since we don't have direct access to all options */}
                    <div className="space-y-2">
                      {/* User selected answers */}
                      {question.selectedOptionIds.map((optionId: string) => {
                        const isCorrect = question.correctOptionIds.includes(optionId);
                        
                        return (
                          <div key={optionId} className={`flex items-center space-x-2 p-2 rounded ${
                            isCorrect
                              ? "bg-green-100 dark:bg-green-900/20"
                              : "bg-red-100 dark:bg-red-900/20"
                          }`}>
                            {isCorrect ? (
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600 dark:text-red-500" />
                            )}
                            <span>
                              {/* We don't have direct access to option text from the results */}
                              {/* Display option ID instead or implement a lookup */}
                              Wybrana odpowiedź {isCorrect ? "(poprawna)" : "(niepoprawna)"}
                            </span>
                          </div>
                        );
                      })}
                      
                      {/* Show correct answers that were not selected */}
                      {question.correctOptionIds
                        .filter(id => !question.selectedOptionIds.includes(id))
                        .map((optionId: string) => (
                          <div key={optionId} className="flex items-center space-x-2 p-2 rounded bg-blue-100 dark:bg-blue-900/20">
                            <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                            <span>
                              <span className="font-medium">Prawidłowa odpowiedź</span>
                            </span>
                          </div>
                        ))}
                    </div>
                    
                    {question.explanation && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Wyjaśnienie: </span>
                          {question.explanation}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between gap-4">
            {/* Pass to next module if available and score is good */}
            {results && results.score >= 70 && quiz?.moduleId && (
              <Button asChild>
                <Link href={`/modules/${quiz.moduleId}`}>
                  Wróć do modułu
                </Link>
              </Button>
            )}
            
            {/* Retry quiz button */}
            <Button 
              variant={results && results.score >= 70 ? "outline" : "default"} 
              asChild
            >
              <Link href={`/quiz/${quizId}`}>
                {results && results.score >= 70 ? "Spróbuj ponownie" : "Powtórz quiz"}
              </Link>
            </Button>
            
            {/* Back to module button */}
            <Button 
              variant="outline" 
              asChild
            >
              <Link href={quiz ? `/modules/${quiz.moduleId}` : "/dashboard"}>
                {quiz ? "Powrót do modułu" : "Powrót do dashboardu"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}