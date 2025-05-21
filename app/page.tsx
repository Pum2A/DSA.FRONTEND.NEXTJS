"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDemoStore } from "./store/demoStore";

export default function Home() {
  const router = useRouter();
  const setDemo = useDemoStore((s) => s.setDemo);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Witaj w DSA Duolingo!</h1>
      <p className="text-lg mb-6">
        Rozpocznij naukę algorytmów i struktur danych.
      </p>
      <div className="my-4">
        <button
          className="mt-8 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold shadow hover:bg-indigo-700 transition cursor-pointer"
          onClick={() => {
            setDemo(true);
            router.push("/learning");
          }}
        >
          Wypróbuj demo bez rejestracji
        </button>
      </div>
      <div className="space-x-4">
        <Link
          href="/login"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
        >
          Zaloguj się
        </Link>
        <Link
          href="/register"
          className="px-6 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600"
        >
          Zarejestruj się
        </Link>
      </div>
    </div>
  );
}
