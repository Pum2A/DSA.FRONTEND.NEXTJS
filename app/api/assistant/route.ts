import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Inicjalizacja Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const { question, lessonContext } = await request.json();

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [
            {
              text: `Jesteś asystentem AI na platformie DSA Learning, która uczy struktur danych i algorytmów.
          
          Kontekst aktualnej lekcji:
          Tytuł: ${lessonContext.title}
          Opis: ${lessonContext.description}
          
          Dostosuj swoje odpowiedzi do kontekstu tej lekcji. Podawaj przykłady kodu w C# gdy jest to pomocne.
          Odpowiadaj krótko i rzeczowo, w przyjazny sposób.`,
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: "Rozumiem kontekst lekcji. Jestem gotowy, aby pomóc w nauce struktur danych i algorytmów. Odpowiem na pytania dotyczące aktualnej lekcji w zwięzły i przystępny sposób, używając przykładów w C# gdy będą potrzebne.",
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 500,
      },
    });

    const result = await chat.sendMessage(question);
    const response = result.response.text();

    return NextResponse.json({ answer: response });
  } catch (error) {
    console.error("Error with Gemini API:", error);
    return NextResponse.json(
      {
        answer:
          "Przepraszam, wystąpił problem z asystentem AI. Spróbuj ponownie później.",
      },
      { status: 500 }
    );
  }
}
