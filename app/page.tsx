import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRightIcon, BookOpen, LightbulbIcon, TrendingUpIcon } from "lucide-react";
import Link from "next/link";
import Navbar from "./components/Navbar";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-brand-50 dark:from-gray-950 dark:to-gray-900">
      <Navbar />
      <main className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="py-16 md:py-24 flex flex-col items-center justify-center">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gradient">
              Zrozum struktury danych i&nbsp;algorytmy jak&nbsp;nigdy wcześniej
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Interaktywne lekcje, wizualizacje i testy sprawią,
              że nauka DSA będzie przystępna i przyjemna.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
              <Button asChild size="lg" className="rounded-full px-6 font-medium">
                <Link href="/lessons">
                  Rozpocznij lekcje <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-6 font-medium">
                <Link href="/dashboard">Przejdź do dashboardu</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 md:py-24">
          <h2 className="text-3xl font-bold text-center mb-12">Dlaczego warto się uczyć z nami?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BookOpen size={24} />}
              title="Interaktywne lekcje"
              description="Ucz się poprzez praktykę dzięki interaktywnym przykładom i wizualizacjom."
            />
            <FeatureCard
              icon={<TrendingUpIcon size={24} />}
              title="Śledzenie postępów"
              description="Monitoruj swój postęp i buduj nawyk regularnej nauki dzięki systemowi streak."
            />
            <FeatureCard
              icon={<LightbulbIcon size={24} />}
              title="Zrozumiałe wyjaśnienia"
              description="Skomplikowane koncepcje wyjaśnione w prosty sposób z praktycznymi przykładami."
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="card-elevation-1 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="rounded-full bg-brand-100 dark:bg-brand-900/40 w-12 h-12 flex items-center justify-center mb-4 text-brand-600 dark:text-brand-300">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}