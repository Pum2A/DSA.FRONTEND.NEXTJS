"use client";

import { useAuth } from "@/app/context/AuthContext";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"; // <--- ZMIANA: Import toast z sonner
import {
  LoginFormData,
  loginSchema,
} from "@/app/features/auth/schema/loginSchema";

export default function LoginPage() {
  const { login, isLoading, error: authError, clearError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  // const { toast } = useToast(); // Usunięte

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (searchParams.get("registered") === "1") {
      toast.success("Rejestracja zakończona!", {
        description: "Możesz się teraz zalogować.",
      }); // <--- ZMIANA
      router.replace("/login", { scroll: false });
    }
    if (searchParams.get("expired") === "1" && !authError) {
      toast.error("Sesja wygasła", { description: "Zaloguj się ponownie." }); // <--- ZMIANA
      router.replace("/login", { scroll: false });
    }
  }, [searchParams, router, authError]); // Usunięto toast z dependency array

  useEffect(() => {
    return () => {
      if (authError) clearError();
    };
  }, [authError, clearError, pathname]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
    } catch (e) {
      // Błąd jest już obsługiwany i wyświetlany jako toast przez AuthContext
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Zaloguj się
          </CardTitle>
          <CardDescription className="text-center">
            Witaj z powrotem! Podaj swoje dane.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Komunikat błędu z AuthContext jest już wyświetlany jako toast */}
          {/* Jeśli chcesz dodatkowy komunikat błędu bezpośrednio w formularzu: */}
          {authError && !isLoading && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-200 rounded">
              {authError}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="ty@example.com"
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Hasło</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logowanie..." : "Zaloguj się"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <div className="text-sm">
            <Link
              href="#"
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Zapomniałeś hasła?
            </Link>
          </div>
          <div className="text-sm">
            Nie masz konta?{" "}
            <Link
              href="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Zarejestruj się
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
