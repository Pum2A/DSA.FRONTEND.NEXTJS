"use client";



import Navbar from "@/app/components/Navbar";
import { QuestionType, QuizAnswerRequest, QuizDetailsDto, QuizOptionDto, QuizQuestionDto, QuizResultResponse, SubmitQuizRequest } from "@/app/types/api/quizTypes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronLeft, Clock } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function QuizPage() {
  const { quizId } = useParams() as { quizId: string };
  const router = useRouter();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});
  const [startTime, setStartTime] = useState(new Date());
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch quiz details
  const { data: quiz, isLoading } = useQuery<QuizDetailsDto>({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/Quiz/${quizId}`, {
          credentials: "include",
        });
        
        if (!response.ok) throw new Error("Failed to fetch quiz");
        return response.json();
      } catch (error) {
        console.error("Error fetching quiz:", error);
        throw error;
      }
    },
  });

  // Set timer when quiz data is loaded
  useEffect(() => {
    if (quiz?.timeLimit && !timeRemaining) {
      setTimeRemaining(quiz.timeLimit); // Time limit is in seconds
      setStartTime(new Date());
    }
  }, [quiz, timeRemaining]);

  // Timer countdown
  useEffect(() => {
    if (!timeRemaining) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev && prev > 0) {
          return prev - 1;
        } else {
          // Auto-submit when time runs out
          clearInterval(timer);
          toast.warning("Czas upłynął! Automatyczne przesłanie odpowiedzi.");
          handleSubmitQuiz();
          return 0;
        }
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Submit quiz mutation
  const submitQuizMutation = useMutation<QuizResultResponse, Error, SubmitQuizRequest>({
    mutationFn: async (submitData) => {
      setIsSubmitting(true);
      try {
        const response = await fetch(`/api/Quiz/${quizId}/submit`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submitData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to submit quiz");
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error submitting quiz:", error);
        throw error instanceof Error ? error : new Error("Unknown error");
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: (data) => {
      toast.success("Quiz ukończony!");
      // Navigate to results page
      router.push(`/quiz/${quizId}/results`);
    },
    onError: (error) => {
      toast.error("Nie udało się przesłać odpowiedzi", {
        description: error.message,
      });
    },
  });

  // Format time remaining as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSingleAnswer = (questionId: string, optionId: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: [optionId],
    }));
  };

  const handleMultiAnswer = (questionId: string, optionId: string, isChecked: boolean) => {
    setUserAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      
      if (isChecked) {
        return {
          ...prev,
          [questionId]: [...currentAnswers, optionId],
        };
      } else {
        return {
          ...prev,
          [questionId]: currentAnswers.filter(id => id !== optionId),
        };
      }
    });
  };

  const handleTrueFalseAnswer = (questionId: string, value: "true" | "false") => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: [value],
    }));
  };

  const isQuestionAnswered = (questionId: string) => {
    const answer = userAnswers[questionId];
    return answer !== undefined && answer.length > 0;
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    // Check if all questions are answered
    const answeredCount = quiz?.questions ? 
      quiz.questions.filter(q => isQuestionAnswered(q.id)).length : 0;
    
    // If not all questions are answered, show confirmation
    if (answeredCount < (quiz?.questions.length || 0)) {
      if (!confirm(`Nie odpowiedziałeś na wszystkie pytania (${answeredCount}/${quiz?.questions.length}). Czy na pewno chcesz zakończyć quiz?`)) {
        return;
      }
    }
    
    // Prepare answers in the format expected by the API
    const answers: QuizAnswerRequest[] = [];
    
    quiz?.questions.forEach(question => {
      const selectedOptions = userAnswers[question.id] || [];
      answers.push({
        questionId: question.id,
        selectedOptionIds: selectedOptions,
      });
    });
    
    // Submit the quiz
    submitQuizMutation.mutate({
      quizId,
      startedAt: startTime.toISOString(),
      answers,
    });
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
            <div className="flex justify-between">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz?.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-4 -ml-2 text-muted-foreground">
              <Link href={`/modules/${quiz?.moduleId}`}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Powrót do modułu
              </Link>
            </Button>

            <h1 className="text-3xl font-bold">{quiz?.title}</h1>
            {quiz?.description && (
              <p className="text-muted-foreground mt-2">{quiz.description}</p>
            )}
          </div>

          {/* Quiz progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm">
                Pytanie {currentQuestionIndex + 1} z {quiz?.questions.length}
              </div>
              
              {timeRemaining !== null && (
                <div className={`flex items-center gap-1.5 font-medium ${
                  timeRemaining < 60 ? "text-red-500" : "text-muted-foreground"
                }`}>
                  <Clock size={16} />
                  {formatTime(timeRemaining)}
                </div>
              )}
            </div>
            <Progress 
              value={((currentQuestionIndex + 1) / (quiz?.questions.length || 1)) * 100} 
              className="h-2" 
            />
          </div>

          {/* Quiz question */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>
                  <span className="text-muted-foreground mr-2">
                    {currentQuestionIndex + 1}.
                  </span>
                  {currentQuestion?.questionText}
                </CardTitle>
                {currentQuestion?.type === QuestionType.MultipleChoice && (
                  <Badge variant="outline" className="ml-2">
                    Wielokrotny wybór
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Code snippet if exists */}
              {currentQuestion?.codeSnippet && (
                <div className="bg-gray-900 text-gray-100 p-4 rounded-md mb-4 overflow-x-auto">
                  <pre>
                    <code>{currentQuestion.codeSnippet}</code>
                  </pre>
                </div>
              )}

              {/* Question options */}
              {currentQuestion?.type === QuestionType.MultipleChoice ? (
                <div className="space-y-3">
                  {currentQuestion.options.map((option: QuizOptionDto) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={option.id}
                        checked={
                          userAnswers[currentQuestion.id]?.includes(option.id) || false
                        }
                        onCheckedChange={(checked) => {
                          handleMultiAnswer(currentQuestion.id, option.id, !!checked);
                        }}
                      />
                      <Label
                        htmlFor={option.id}
                        className="text-base"
                      >
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : currentQuestion?.type === QuestionType.TrueFalse ? (
                <RadioGroup
                  value={userAnswers[currentQuestion?.id || ""]?.[0]}
                  onValueChange={(value) => 
                    handleTrueFalseAnswer(currentQuestion?.id, value as "true" | "false")
                  }
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="true" />
                    <Label htmlFor="true" className="text-base">Prawda</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="false" />
                    <Label htmlFor="false" className="text-base">Fałsz</Label>
                  </div>
                </RadioGroup>
              ) : (
                // Default: Single choice
                <RadioGroup
                  value={userAnswers[currentQuestion?.id || ""]?.[0]}
                  onValueChange={(value) => 
                    currentQuestion?.id && handleSingleAnswer(currentQuestion.id, value)
                  }
                >
                  <div className="space-y-3">
                    {currentQuestion?.options.map((option: QuizOptionDto) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.id} id={option.id} />
                        <Label htmlFor={option.id} className="text-base">
                          {option.text}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}
            </CardContent>
          </Card>

          {/* Question navigation */}
          <div className="mb-12">
            <div className="flex flex-wrap gap-2 mb-6">
              {quiz?.questions.map((question: QuizQuestionDto, index: number) => (
                <button
                  key={question.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${
                    index === currentQuestionIndex 
                      ? "bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300 font-medium"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  } ${
                    isQuestionAnswered(question.id)
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 dark:bg-gray-800 text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Poprzednie
              </Button>

              {currentQuestionIndex === (quiz?.questions?.length || 0) - 1 ? (
                <Button 
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? "Przesyłanie..." : "Zakończ quiz"}
                </Button>
              ) : (
                <Button onClick={handleNextQuestion}>
                  Następne <ChevronLeft className="ml-2 h-4 w-4 rotate-180" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}