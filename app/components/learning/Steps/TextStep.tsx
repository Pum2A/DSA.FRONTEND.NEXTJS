import { Step } from "@/app/types";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { LoadingButton } from "../../ui/LoadingButton";

interface TextStepProps {
  step: Step;
  onComplete: () => void;
  isLoading?: boolean;
}

export default function TextStep({
  step,
  onComplete,
  isLoading = false,
}: TextStepProps) {
  const [readConfirmed, setReadConfirmed] = useState(false);

  return (
    <div className="text-step">
      <h2 className="text-xl font-semibold mb-4">{step.title}</h2>

      <div className="prose max-w-none mb-6">
        <ReactMarkdown>{step.content || ""}</ReactMarkdown>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={readConfirmed}
            onChange={() => setReadConfirmed(!readConfirmed)}
            className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>Przeczytałem i zrozumiałem</span>
        </label>

        <LoadingButton
          onClick={onComplete}
          disabled={!readConfirmed}
          isLoading={isLoading}
          variant={readConfirmed ? "default" : "secondary"}
        >
          Kontynuuj
        </LoadingButton>
      </div>
    </div>
  );
}
