"use client";

import Navbar from "@/app/components/Navbar";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-12 px-4 max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">O projekcie DSA</h1>
        <p className="text-lg text-muted-foreground mb-8">
          <span className="font-semibold text-brand-700">DSA</span> (Data Structures & Algorithms) to platforma edukacyjna do nauki struktur danych i algorytmów, zbudowana w technologii <span className="font-semibold">Next.js</span> (frontend) oraz <span className="font-semibold">.NET</span> (backend).
        </p>
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-2">Cele projektu</h2>
            <ul className="list-disc list-inside text-base text-muted-foreground space-y-1">
              <li>Ułatwienie nauki struktur danych i algorytmów w praktyczny sposób</li>
              <li>Przygotowanie do rozmów rekrutacyjnych i konkursów programistycznych</li>
              <li>Motywowanie do systematycznej nauki przez streaki, XP i quizy</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">Technologie</h2>
            <ul className="list-disc list-inside text-base text-muted-foreground space-y-1">
              <li><span className="font-semibold">Frontend:</span> Next.js, TypeScript, React, Tailwind CSS</li>
              <li><span className="font-semibold">Backend:</span> .NET, C#, REST API</li>
              <li><span className="font-semibold">Baza danych:</span> PostgreSQL</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">Funkcjonalności</h2>
            <ul className="list-disc list-inside text-base text-muted-foreground space-y-1">
              <li>Moduły edukacyjne, lekcje z postępem i quizy</li>
              <li>Śledzenie progresu, XP, streaki i statystyki użytkownika</li>
              <li>Nowoczesny, responsywny interfejs</li>
              <li>Możliwość kontynuowania nauki od ostatniego miejsca</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">Autor</h2>
            <p className="text-base text-muted-foreground">
              Projekt stworzony przez <span className="font-semibold">Pum2A</span>.<br />
              <span className="text-sm">
                Kod źródłowy:{" "}
                <Link
                  href="https://github.com/Pum2A"
                  target="_blank"
                  className="text-brand-600 hover:underline"
                >
                  github.com/Pum2A
                </Link>
              </span>
            </p>
          </section>
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-brand-600 text-white rounded-md font-semibold hover:bg-brand-700 transition"
          >
            Wróć do strony głównej
          </Link>
        </div>
      </div>
    </div>
  );
}