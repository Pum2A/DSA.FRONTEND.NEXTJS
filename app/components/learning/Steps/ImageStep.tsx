import { Step } from "@/app/types";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { LoadingButton } from "../../ui/LoadingButton";

interface ImageStepProps {
  step: Step;
  onComplete: () => void;
  isLoading?: boolean; // Dodana właściwość isLoading
}

export default function ImageStep({
  step,
  onComplete,
  isLoading = false,
}: ImageStepProps) {
  return (
    <div className="image-step">
      <h2 className="text-xl font-semibold mb-4">{step.title}</h2>

      {step.content && (
        <div className="prose max-w-none mb-6">
          <p>{step.content}</p>
        </div>
      )}

      <div className="mb-6 flex justify-center">
        {step.imageUrl && (
          <div className="relative max-w-2xl">
            <Image
              src={step.imageUrl}
              alt={step.title}
              width={800}
              height={500}
              className="rounded-md"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <LoadingButton onClick={onComplete} isLoading={isLoading}>
          Kontynuuj
        </LoadingButton>
      </div>
    </div>
  );
}
