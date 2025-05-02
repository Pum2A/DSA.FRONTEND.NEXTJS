"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "../store/authStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Import Card
import { Label } from "@/components/ui/label"; // Import Label
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"; // Import ikony
import { LoadingButton } from "./ui/LoadingButton";

const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu email."),
  password: z.string().min(1, "Hasło jest wymagane."),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login, isAuthenticated, error, isLoading, clearError } =
    useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  // Efekty (bez zmian, ale toast jest dobrym feedbackiem)
  useEffect(() => {
    if (isAuthenticated) {
      toast.success("Zalogowano pomyślnie!", {
        description: "Witamy ponownie w DSA Learning!",
      });
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Używamy alertu zamiast toast dla błędu bezpośrednio w formularzu
  // useEffect(() => {
  //   if (error) {
  //     toast.error("Błąd logowania", { description: error });
  //     // clearError(); // Nie czyść od razu, aby użytkownik widział błąd
  //   }
  // }, [error, clearError]);

  const onSubmit = async (data: LoginFormValues) => {
    clearError(); // Wyczyść stary błąd przed próbą logowania
    await login(data.email, data.password);
  };

  return (
    // Używamy Card dla spójności
    <Card className="w-full max-w-md mx-auto shadow-xl border dark:border-gray-700">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Zaloguj się</CardTitle>
        <CardDescription>Kontynuuj swoją podróż z DSA Learning</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Lepszy Alert dla błędów */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Błąd logowania</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            {/* <Button variant="link" size="sm" onClick={clearError} className="p-0 h-auto text-xs mt-1">Zamknij</Button> */}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Pole Email z ikoną */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="twoj@email.com"
                className="pl-10" // Dodaj padding dla ikony
                aria-invalid={errors.email ? "true" : "false"}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Pole Hasło z ikoną i przełącznikiem widoczności */}
          <div className="space-y-1.5">
            <Label htmlFor="password">Hasło</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="********"
                className="pl-10 pr-10" // Padding dla ikon po obu stronach
                aria-invalid={errors.password ? "true" : "false"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
              >
                {showPassword ? (
                  <EyeOff className="h-full w-full" />
                ) : (
                  <Eye className="h-full w-full" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember Me i Zapomniałeś hasła? */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox id="rememberMe" {...register("rememberMe")} />
              <Label
                htmlFor="rememberMe"
                className="text-sm font-normal cursor-pointer"
              >
                Zapamiętaj mnie
              </Label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Zapomniałeś hasła?
            </Link>
          </div>

          {/* Przycisk Logowania z LoadingButton */}
          <LoadingButton
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
            disabled={isLoading}
            isLoading={isLoading}
            size="lg"
          >
            Zaloguj się
          </LoadingButton>
        </form>
      </CardContent>
      <CardFooter className="text-center text-sm text-gray-600 dark:text-gray-400">
        Nie masz jeszcze konta?{" "}
        <Link
          href="/register"
          className="ml-1 font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Zarejestruj się
        </Link>
      </CardFooter>
    </Card>
  );
}
