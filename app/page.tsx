import { Button } from "@/components/ui/button";
import Link from "next/link";
import Navbar from "./components/Navbar";

export default function HomePage() {
  return (
    <div>
      <Navbar />
      <main className="container mx-auto mt-10 p-4 text-center">
        <h1 className="text-4xl font-bold mb-6">Witaj na Platformie DSA!</h1>
        <p className="text-lg mb-8">
          Rozpocznij swoją podróż w świat struktur danych i algorytmów.
        </p>
        <div className="space-x-4">
          <Button asChild size="lg">
            <Link href="/lessons">Przeglądaj Lekcje</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard">Przejdź do Dashboardu</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
