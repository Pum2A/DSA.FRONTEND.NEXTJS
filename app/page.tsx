import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Witaj w DSA Duolingo!</h1>
      <p className="text-lg mb-6">
        Rozpocznij naukę algorytmów i struktur danych.
      </p>
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
