"use client";

import Navbar from "@/app/components/Navbar";
import { LessonDetailsDto, LessonProgressDto, LessonStepDto, StepProgressResponse } from "@/app/types/api/lessonTypes";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

// Code Block component for displaying code examples
const CodeBlock = ({ code, language = "javascript" }: { code: string, language?: string }) => {
  return (
    <div className="relative rounded-md bg-gray-900 dark:bg-gray-950 text-gray-50">
      <div className="absolute right-2 top-2">
        <button
          onClick={() => navigator.clipboard.writeText(code)}
          className="text-xs bg-gray-800 hover:bg-gray-700 rounded px-2 py-1"
        >
          Kopiuj
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default function LessonPage() {
  const { lessonId } = useParams() as { lessonId: string };
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Fetch lesson details
  const { data: lesson, isLoading: lessonLoading } = useQuery<LessonDetailsDto>({
    queryKey: ["lesson", lessonId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/Lessons/${lessonId}`, {
          credentials: "include",
        });
        
        if (!response.ok) throw new Error("Failed to fetch lesson");
        return response.json();
      } catch (error) {
        console.error("Error fetching lesson:", error);
        throw error;
      }
    },
  });

  // Fetch lesson progress
  const { data: progress, isLoading: progressLoading } = useQuery<LessonProgressDto>({
    queryKey: ["lessonProgress", lessonId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/Lessons/${lessonId}/progress`, {
          credentials: "include",
        });
        
        if (!response.ok) throw new Error("Failed to fetch lesson progress");
        return response.json();
      } catch (error) {
        console.error("Error fetching lesson progress:", error);
        throw error;
      }
    },
    enabled: !!lessonId,
  });

  // Complete step mutation
  const completeStepMutation = useMutation<StepProgressResponse, Error, string>({
    mutationFn: async (stepId: string) => {
      try {
        const response = await fetch(`/api/Lessons/${lessonId}/steps/${stepId}/complete`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ lessonId, stepId }),
        });
        
        if (!response.ok) throw new Error("Failed to mark step as complete");
        return await response.json();
      } catch (error) {
        console.error("Error completing step:", error);
        throw error instanceof Error ? error : new Error("Unknown error");
      }
    },
    onSuccess: (data) => {
      if (data.xpEarned > 0) {
        toast.success(`+${data.xpEarned} XP!`);
      }
      queryClient.invalidateQueries({ queryKey: ["lessonProgress", lessonId] });
    },
  });

  // Complete lesson mutation
  const completeLessonMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch(`/api/Lessons/${lessonId}/complete`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) throw new Error("Failed to complete lesson");
        return await response.json();
      } catch (error) {
        console.error("Error completing lesson:", error);
        throw error instanceof Error ? error : new Error("Unknown error");
      }
    },
    onSuccess: (data: any) => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["lessonProgress", lessonId] });
      queryClient.invalidateQueries({ queryKey: ["userProgress"] });
      
      toast.success("Lekcja ukończona!", {
        description: `Zdobyłeś ${data.xpEarned || data.xpGained || 0} punktów XP.`,
      });
      
      // If there's a next lesson, ask if they want to continue
      if (data.nextLessonId) {
        setTimeout(() => {
          if (confirm("Chcesz przejść do następnej lekcji?")) {
            router.push(`/lessons/${data.nextLessonId}`);
          } else {
            router.push("/dashboard");
          }
        }, 1500);
      } else {
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    },
    onError: (error: Error) => {
      toast.error("Nie udało się ukończyć lekcji", {
        description: error.message,
      });
    }
  });

  const steps = lesson?.steps || [];
  const currentStep = steps[currentStepIndex] || null;
  const isLastStep = currentStepIndex === (steps?.length || 0) - 1;
  
  // Check if step is completed
  const isStepCompleted = (stepId: string) => {
    if (!progress) return false;
    return progress.completedSteps >= parseInt(stepId) + 1;
  };

  const handleNextStep = () => {
    if (currentStep && !isStepCompleted(currentStep.id)) {
      completeStepMutation.mutate(currentStep.id);
    }
    
    if (isLastStep) {
      completeLessonMutation.mutate();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStepIndex(prev => Math.max(0, prev - 1));
  };

  const isLoading = lessonLoading || progressLoading;

  if (isLoading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <div className="animate-pulse space-y-6 max-w-4xl mx-auto">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="flex justify-between">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumbs & Back Link */}
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-4 -ml-2 text-muted-foreground">
              <Link href={`/modules/${lesson?.moduleId}`}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Powrót do modułu
              </Link>
            </Button>

            <h1 className="text-3xl font-bold">{lesson?.title}</h1>
            {lesson?.description && (
              <p className="text-muted-foreground mt-2">{lesson.description}</p>
            )}

            {/* Progress bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Postęp lekcji</span>
                <span>
                  {progress?.completedSteps || 0} / {steps?.length || 0} kroków
                </span>
              </div>
              <Progress 
                value={steps?.length ? ((progress?.completedSteps || 0) / steps.length) * 100 : 0} 
                className="h-2" 
              />
            </div>
          </div>

          {/* Step navigation */}
          <div className="flex overflow-x-auto py-2 mb-6 gap-2">
            {steps?.map((step: LessonStepDto, index: number) => (
              <button
                key={step.id}
                onClick={() => setCurrentStepIndex(index)}
                className={`px-3 py-1.5 rounded-full text-sm flex items-center shrink-0 ${
                  index === currentStepIndex 
                    ? "bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300 font-medium"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                } ${
                  isStepCompleted(step.id) 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-muted-foreground"
                }`}
              >
                {isStepCompleted(step.id) && <Check className="h-3.5 w-3.5 mr-1.5" />}
                {index + 1}
              </button>
            ))}
          </div>

          {/* Current step content */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{currentStep?.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: currentStep?.content || "" }} />

                {currentStep?.codeExample && (
                  <div className="my-6">
                    <CodeBlock 
                      code={currentStep.codeExample} 
                      language="javascript"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation buttons */}
          <div className="flex justify-between mb-12">
            <Button 
              variant="outline" 
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Poprzedni
            </Button>

            <Button 
              onClick={handleNextStep}
              disabled={completeLessonMutation.isPending}
            >
              {isLastStep ? (
                completeLessonMutation.isPending ? "Kończenie..." : "Zakończ lekcję"
              ) : (
                <>Dalej <ChevronRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}