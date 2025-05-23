import { StepDto } from "@/app/types/lesson";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

// Zaktualizowane propsy używające StepDto
interface ImageStepProps {
  step: StepDto;
}

export default function ImageStep({ step }: ImageStepProps) {
  return (
    <div className="image-step space-y-4">
      {/* Tytuł kroku, jeśli istnieje */}
      {step.title && (
        <h2 className="text-2xl font-semibold border-b pb-2 dark:border-gray-700">
          {step.title}
        </h2>
      )}

      {/* Opcjonalna treść/opis */}
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

      {/* Obrazek */}
      <div className="mt-4 flex justify-center">
        {step.imageUrl ? (
          <figure className="max-w-3xl w-full overflow-hidden rounded-lg border dark:border-gray-700 shadow-md bg-white dark:bg-gray-800">
            <Image
              src={step.imageUrl}
              alt={step.title || "Ilustracja kroku"} // Lepszy alt text
              width={1000} // Zwiększ domyślną szerokość dla jakości
              height={600} // Zwiększ domyślną wysokość
              className="object-contain w-full h-auto" // Dopasuj obrazek
              priority // Opcjonalnie, jeśli to ważny obrazek
            />
            {/* Opcjonalny podpis pod obrazkiem, jeśli istnieje */}
            {/* <figcaption className="p-2 text-center text-xs text-gray-500 dark:text-gray-400">{step.title}</figcaption> */}
          </figure>
        ) : (
          <p className="text-gray-500 italic">Brak obrazka do wyświetlenia.</p>
        )}
      </div>
    </div>
  );
}
