"use client";

import {
  StepCompletionData,
  StepCompletionResult,
  StepDto,
} from "@/app/types/lesson";
import { Button } from "@/components/ui/button";
import { CheckCircle, ExternalLink, Loader2, PlayCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

interface VideoStepProps {
  step: StepDto;
  onComplete?: (result: StepCompletionResult) => void;
  isLoading?: boolean;
}

export default function VideoStep({
  step,
  onComplete,
  isLoading = false,
}: VideoStepProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isWatched, setIsWatched] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);

  // Dane wideo - wsparcie zarówno dla videoData jak i bezpośrednich pól
  const videoData = step.videoData || {
    url: step.videoUrl || "",
    duration: typeof step.duration === "number" ? step.duration : 0,
    requireFullWatch: step.requireFullWatch !== false, // Domyślnie true
    chapters: Array.isArray(step.chapters) ? step.chapters : [],
  };

  // Timer dla śledzenia czasu spędzonego na kroku
  useEffect(() => {
    const startTime = Date.now();
    let interval: NodeJS.Timeout;

    // Aktualizuj czas spędzony co sekundę
    if (onComplete) {
      interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    };
  }, [onComplete]);

  // Obsługa statusu odtwarzania
  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    const handleTimeUpdate = () => {
      if (!video) return;

      // Oblicz procent postępu
      const currentProgress = Math.floor(
        (video.currentTime / video.duration) * 100
      );
      setProgress(currentProgress);

      // Oznacz jako obejrzane, jeśli dojdziemy do 95% lub video.ended
      if (currentProgress >= 95 || video.ended) {
        setIsWatched(true);
      }
    };

    const handleLoadedData = () => {
      setLoading(false);
    };

    const handleError = () => {
      setLoading(false);
      setError(
        "Nie można załadować filmu. Sprawdź połączenie internetowe lub spróbuj ponownie później."
      );
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("error", handleError);
    };
  }, [videoRef]);

  // Obsługa zakończenia oglądania
  const handleComplete = () => {
    if (!onComplete) return;

    // Uzupełnij dane ukończenia kroku
    const completionData: StepCompletionData = {
      answer: { watched: true, progress },
      isCorrect: true,
      timeSpent,
      attempts: 1,
      completionStatus: true,
    };

    // Przygotuj wynik ukończenia
    const completionResult: StepCompletionResult = {
      success: true,
      error: "",
      xpEarned: 15, // Stała wartość XP za obejrzenie wideo
      nextStepIndex: undefined,
      isLessonCompleted: false,
    };

    onComplete(completionResult);
  };

  // Sprawdź, czy URL to YouTube
  const isYouTubeUrl =
    videoData.url?.includes("youtube.com") ||
    videoData.url?.includes("youtu.be");

  // Konwertuj na osadzony URL YouTube, jeśli to potrzebne
  const getEmbedUrl = () => {
    if (!videoData.url) return "";

    if (isYouTubeUrl) {
      // Obsłuż różne formaty URL YouTube
      const youtubeRegex =
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = videoData.url.match(youtubeRegex);

      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}?enablejsapi=1`;
      }
    }

    return videoData.url;
  };

  return (
    <div className="video-step space-y-6">
      {/* Tytuł kroku */}
      {step.title && (
        <h2 className="text-2xl font-semibold border-b pb-2 dark:border-gray-700">
          {step.title}
        </h2>
      )}

      {/* Opcjonalny opis */}
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

      {/* Odtwarzacz wideo */}
      <div className="rounded-lg overflow-hidden border dark:border-gray-700 shadow-md bg-black">
        {loading && (
          <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        )}

        {error && (
          <div className="p-6 bg-red-50 dark:bg-red-900/20 text-center">
            <p className="text-red-700 dark:text-red-300">{error}</p>
            <Button
              variant="outline"
              className="mt-3"
              onClick={() => window.open(videoData.url, "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-2" /> Otwórz w nowej karcie
            </Button>
          </div>
        )}

        {isYouTubeUrl ? (
          <div className="aspect-video">
            <iframe
              src={getEmbedUrl()}
              className="w-full h-full border-0"
              allowFullScreen
              title={step.title || "Wideo"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError("Nie można załadować filmu YouTube.");
              }}
            ></iframe>
          </div>
        ) : (
          <video
            ref={videoRef}
            controls
            className="w-full aspect-video"
            poster={step.imageUrl}
            preload="metadata"
          >
            <source src={videoData.url} />
            Twoja przeglądarka nie obsługuje odtwarzania wideo.
          </video>
        )}

        {/* Pasek postępu */}
        {!error && !isYouTubeUrl && (
          <div className="h-1 bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>

      {/* Rozdziały wideo, jeśli istnieją */}
      {videoData.chapters && videoData.chapters.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Rozdziały:</h3>
          <div className="space-y-1">
            {videoData.chapters.map((chapter, index) => (
              <div
                key={index}
                className="flex items-center text-sm px-3 py-2 border-l-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer"
                onClick={() => {
                  if (videoRef.current && !isYouTubeUrl) {
                    // Tutaj możesz dodać logikę przechodzenia do konkretnego czasu rozdziału
                    // jeśli masz te informacje w danych
                  }
                }}
              >
                <span className="text-gray-500 dark:text-gray-400 mr-2">
                  {index + 1}.
                </span>
                <span className="text-gray-800 dark:text-gray-200">
                  {chapter}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Przycisk ukończenia */}
      {onComplete && (
        <div className="flex justify-end mt-6 pt-3 border-t dark:border-gray-700">
          <Button
            onClick={handleComplete}
            disabled={videoData.requireFullWatch && !isWatched}
            className={`${isWatched ? "bg-green-600 hover:bg-green-700" : ""}`}
          >
            {isWatched ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" /> Oznacz jako obejrzane
              </>
            ) : (
              <>
                <PlayCircle className="mr-2 h-4 w-4" />
                {videoData.requireFullWatch
                  ? "Obejrzyj film, aby kontynuować"
                  : "Oznacz jako obejrzane"}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
