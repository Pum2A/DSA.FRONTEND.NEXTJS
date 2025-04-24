import { useState } from "react";
import { LoadingButton } from "../../ui/LoadingButton";
import { Step } from "@/app/types";

interface ListStepProps {
  step: Step;
  onComplete: () => void;
  isLoading?: boolean;
}

export default function ListStep({
  step,
  onComplete,
  isLoading = false,
}: ListStepProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleItem = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Jeśli nie mamy items w kroku, używamy pustej tablicy
  const items = step.items || [];

  return (
    <div className="list-step">
      <h2 className="text-xl font-semibold mb-4">{step.title}</h2>

      {step.content && (
        <div className="prose max-w-none mb-6">
          <p>{step.content}</p>
        </div>
      )}

      <ul className="space-y-3 mb-6">
        {items.map((item) => (
          <li key={item.id} className="border rounded-md overflow-hidden">
            <div
              className="p-4 bg-gray-50 flex justify-between items-center cursor-pointer"
              onClick={() => toggleItem(item.id)}
            >
              <span className="font-medium">{item.text}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 transition-transform ${
                  expandedItems.includes(item.id) ? "transform rotate-180" : ""
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {expandedItems.includes(item.id) && item.description && (
              <div className="p-4 border-t">
                <p>{item.description}</p>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="flex justify-end">
        <LoadingButton onClick={onComplete} isLoading={isLoading}>
          Rozumiem
        </LoadingButton>
      </div>
    </div>
  );
}
