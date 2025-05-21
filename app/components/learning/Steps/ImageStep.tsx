import { Step } from "@/app/types";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

interface ImageStepProps {
  step: Step;
  onComplete?: () => void;
}

export default function ImageStep({ step, onComplete }: ImageStepProps) {
  const [hasRead, setHasRead] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHasRead(true), 10000);
    return () => clearTimeout(timer);
  }, [step]);

  return (
    <div className="image-step space-y-4">
      {step.title && (
        <h2 className="text-2xl font-semibold border-b pb-2">{step.title}</h2>
      )}
      {step.content && (
        <div className="prose prose-lg max-w-none text-gray-800 dark:text-gray-200 dark:prose-invert">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {step.content}
          </ReactMarkdown>
        </div>
      )}
      <div className="mt-4 flex justify-center">
        {step.imageUrl ? (
          <figure className="max-w-3xl w-full overflow-hidden rounded-lg border shadow-md bg-white dark:bg-gray-800">
            <Image
              src={step.imageUrl}
              alt={step.title || "Ilustracja kroku"}
              width={1000}
              height={600}
              className="object-contain w-full h-auto"
              priority
            />
          </figure>
        ) : (
          <p className="text-gray-500 italic">Brak obrazka do wyświetlenia.</p>
        )}
      </div>

      {onComplete && (
        <div className="flex justify-end pt-4">
          <Button onClick={onComplete} className="mt-4" disabled={!hasRead}>
            Kontynuuj <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
