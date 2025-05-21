import { Step } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

interface VideoStepProps {
  step: Step;
  onComplete?: (data?: {
    timeSpent: number;
    completionStatus: boolean;
  }) => void;
}

export default function VideoStep({ step, onComplete }: VideoStepProps) {
  const [isWatched, setIsWatched] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [startTime] = useState(Date.now());
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoData = step.videoData || {};
  const videoUrl = step.videoUrl || videoData.url || "";
  const requireFullWatch =
    step.requireFullWatch || videoData.requireFullWatch || false;
  const duration = step.duration || videoData.duration || 0;

  const handleVideoEnd = () => {
    setIsWatched(true);
    if (onComplete && !requireFullWatch) {
      onComplete({
        timeSpent: Math.floor((Date.now() - startTime) / 1000),
        completionStatus: true,
      });
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleCompleteStep = () => {
    if (onComplete) {
      onComplete({
        timeSpent: Math.floor((Date.now() - startTime) / 1000),
        completionStatus: true,
      });
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [videoUrl]);

  const hasWatchedEnough =
    !requireFullWatch ||
    (requireFullWatch &&
      currentTime > 0 &&
      duration > 0 &&
      currentTime >= duration * 0.9);

  return (
    <div className="video-step space-y-4">
      {step.title && <h2 className="text-2xl font-semibold">{step.title}</h2>}

      <Card className="p-4 bg-white dark:bg-gray-800">
        <div className="aspect-video overflow-hidden rounded-md">
          {videoUrl ? (
            <video
              ref={videoRef}
              className="w-full h-full"
              controls
              onEnded={handleVideoEnd}
              onTimeUpdate={handleTimeUpdate}
            >
              <source src={videoUrl} type="video/mp4" />
              Twoja przeglądarka nie obsługuje odtwarzania wideo.
            </video>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
              Nie znaleziono adresu URL wideo
            </div>
          )}
        </div>

        {hasWatchedEnough && (
          <div className="mt-4 flex justify-end">
            <Button onClick={handleCompleteStep} disabled={!hasWatchedEnough}>
              {isWatched ? "Kontynuuj" : "Oznacz jako obejrzane"}
            </Button>
          </div>
        )}

        {requireFullWatch && !hasWatchedEnough && (
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
            Aby kontynuować, obejrzyj film do końca.
          </p>
        )}
      </Card>

      {step.content && (
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {step.content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
