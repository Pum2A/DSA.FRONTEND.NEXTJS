"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bot, MessageCircle, X, Lightbulb, Award } from "lucide-react";

interface AIAssistantProps {
  lessonContext: any;
  onClose: () => void;
}

export default function AIAssistant({
  lessonContext,
  onClose,
}: AIAssistantProps) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Cześć! Jestem twoim asystentem w nauce o "${lessonContext.title}". W czym mogę Ci pomóc?`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Automatycznie przewijaj do najnowszej wiadomości
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Dodaj wiadomość użytkownika
    const userMessage = { role: "user", content: inputMessage };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Wywołaj API asystenta
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: inputMessage,
          lessonContext: {
            title: lessonContext.title,
            description: lessonContext.description,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Nie udało się uzyskać odpowiedzi");
      }

      const data = await response.json();

      // Dodaj odpowiedź asystenta
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Przepraszam, wystąpił problem z połączeniem. Spróbuj ponownie później.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Nagłówek asystenta */}
      <div className="border-b p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Bot size={16} className="text-blue-600" />
          </div>
          <h3 className="font-medium">Asystent DSA</h3>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
      </div>

      {/* Informacje o lekcji */}
      <div className="bg-blue-50 p-3 border-b">
        <div className="text-xs space-y-1">
          <div className="font-medium text-sm mb-1">Aktualnie uczysz się:</div>
          <div className="font-medium">{lessonContext.title}</div>
          <div className="text-gray-600">{lessonContext.description}</div>
        </div>
      </div>

      {/* Wskazówki */}
      <div className="p-3 border-b">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb size={14} className="text-yellow-500" />
          <span className="font-medium text-sm">Wskazówka</span>
        </div>
        <p className="text-xs text-gray-700">
          Możesz zapytać mnie o wyjaśnienie pojęć z lekcji, przykłady zastosowań
          lub pomoc przy rozwiązywaniu zadań.
        </p>
      </div>

      {/* Okno czatu */}
      <div
        ref={chatContainerRef}
        className="flex-1 p-3 overflow-y-auto space-y-3"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`
                max-w-[80%] p-2 rounded-lg text-sm
                ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                }
              `}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 p-2 rounded-lg text-sm rounded-bl-none">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce delay-0"></div>
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce delay-150"></div>
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce delay-300"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Formularz wiadomości */}
      <form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Zadaj pytanie..."
          className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-blue-500"
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="sm"
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          <MessageCircle size={14} />
        </Button>
      </form>
    </div>
  );
}
