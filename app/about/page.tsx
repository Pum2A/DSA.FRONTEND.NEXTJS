"use client";

import {
  Book,
  Code,
  GraduationCap,
  Users,
  Award,
  Brain,
  Rocket,
  BarChart4,
  CheckCircle,
  Clock,
  Github,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-12 text-center">
        <div className="inline-block p-2 px-4 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
          O projekcie
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Platforma DSA Learning
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Interaktywna platforma do nauki struktur danych i algorytmów,
          zbudowana z myślą o efektywnej i angażującej edukacji
        </p>
      </div>

      {/* Mission Statement - kolorowa wersja */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-12 border border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
              <Rocket className="h-8 w-8 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-4 text-center text-gray-900">
            Nasza misja
          </h2>

          <p className="text-lg text-gray-600 mb-8 text-center leading-relaxed">
            Demokratyzacja wiedzy o strukturach danych i algorytmach poprzez
            stworzenie dostępnej i angażującej platformy edukacyjnej, która
            pomaga użytkownikom zrozumieć fundamentalne koncepcje DSA.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-blue-50 p-6 rounded-xl hover:shadow-md transition-shadow">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-blue-700 mb-2">
                Praktyczna nauka
              </h3>
              <p className="text-blue-600/80 text-sm">
                Ucz się przez działanie i rozwiązywanie realnych problemów
              </p>
            </div>

            <div className="text-center bg-green-50 p-6 rounded-xl hover:shadow-md transition-shadow">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-green-700 mb-2">
                Rozwój umiejętności
              </h3>
              <p className="text-green-600/80 text-sm">
                Rozwijaj kompetencje potrzebne na rynku pracy
              </p>
            </div>

            <div className="text-center bg-purple-50 p-6 rounded-xl hover:shadow-md transition-shadow">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-purple-700 mb-2">
                Społeczność
              </h3>
              <p className="text-purple-600/80 text-sm">
                Ucz się wspólnie i dziel się wiedzą z innymi
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* For whom section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Dla kogo jest DSA Learning?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Code className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Dla programistów</h3>
            <p className="text-gray-600">
              Chcesz poszerzyć swoją wiedzę o strukturach danych i algorytmach?
              Nasza platforma oferuje praktyczne podejście do nauki DSA.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <GraduationCap className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Dla studentów</h3>
            <p className="text-gray-600">
              Chcesz lepiej zrozumieć materiał z zajęć? Nasze interaktywne
              lekcje i wizualizacje pomogą Ci w nauce i przygotowaniu do
              egzaminów.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Dla mentorów</h3>
            <p className="text-gray-600">
              Szukasz narzędzia do nauczania DSA? Platforma oferuje gotowe
              materiały i śledzenie postępów, które ułatwią Ci pracę z uczniami.
            </p>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="mb-12 bg-white rounded-xl shadow-md p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Kluczowe funkcje
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Book className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">
                Interaktywne lekcje
              </h3>
              <p className="text-gray-600">
                Ucz się poprzez praktyczne przykłady i interaktywne wizualizacje
                algorytmów.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Award className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">System gamifikacji</h3>
              <p className="text-gray-600">
                Zdobywaj doświadczenie, poziomy i odznaki za ukończone lekcje i
                rozwiązane zadania.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Code className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Zadania praktyczne</h3>
              <p className="text-gray-600">
                Ćwicz swoje umiejętności rozwiązując zadania o różnym poziomie
                trudności.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <BarChart4 className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Śledzenie postępów</h3>
              <p className="text-gray-600">
                Monitoruj swoje postępy i analizuj wydajność w nauce
                poszczególnych tematów.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Certyfikaty</h3>
              <p className="text-gray-600">
                Otrzymuj certyfikaty za ukończenie ścieżek edukacyjnych i kursy
                specjalistyczne.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">
                Nauka we własnym tempie
              </h3>
              <p className="text-gray-600">
                Ucz się kiedy chcesz i jak chcesz, z dostępem do materiałów
                24/7.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team/Project Info */}
      <div className="mb-12 bg-white rounded-xl shadow-md p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          O projekcie
        </h2>
        <div className="max-w-3xl mx-auto">
          <p className="text-gray-600 mb-6 text-center">
            DSA Learning jest projektem stworzonym przez Pum2A w ramach rozwoju
            umiejętności programistycznych. Platforma łączy nowoczesne
            technologie webowe z interaktywnym podejściem do nauki algorytmów i
            struktur danych.
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-6 mt-8">
            <div className="flex items-center justify-center gap-3 bg-gray-50 p-4 rounded-lg">
              <Github className="h-5 w-5 text-gray-700" />
              <span>Ostatnia aktualizacja: 2025-04-16</span>
            </div>
            <div className="flex items-center justify-center gap-3 bg-gray-50 p-4 rounded-lg">
              <Users className="h-5 w-5 text-gray-700" />
              <span>Autor: Pum2A</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Rozpocznij naukę już dziś
        </h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Dołącz do społeczności uczących się i rozpocznij swoją przygodę z DSA
          Learning!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 text-white font-medium rounded-lg">
              Zarejestruj się
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button
              variant="outline"
              className="px-6 py-3 font-medium rounded-lg"
            >
              Przejdź do dashboardu
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
