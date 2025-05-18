"use client";

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
import { LoadingButton } from "../ui/LoadingButton";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "../../store/authStore";
import { useNotificationStore } from "@/app/store/notificationStore";
import { clear } from "console";
import { RegisterData } from "../../types/auth";

const registerSchema = z
  .object({
    email: z.string().email("Podaj prawidłowy adres email."),
    userName: z
      .string()
      .min(3, "Minimum 3 znaki.")
      .max(30, "Maksimum 30 znaków.")
      .regex(/^[a-zA-Z0-9_]+$/, "Tylko litery, cyfry i podkreślnik."),
    firstName: z
      .string()
      .min(1, "Imię jest wymagane.")
      .max(50, "Maksimum 50 znaków."),
    lastName: z
      .string()
      .min(1, "Nazwisko jest wymagane.")
      .max(50, "Maksimum 50 znaków."),
    password: z
      .string()
      .min(8, "Minimum 8 znaków.")
      .regex(/[A-Z]/, "Wymagana duża litera.")
      .regex(/[a-z]/, "Wymagana mała litera.")
      .regex(/[0-9]/, "Wymagana cyfra.")
      .regex(/[^A-Za-z0-9]/, "Wymagany znak specjalny."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła muszą być identyczne.",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const registerUser = useAuthStore((s) => s.register);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const error = useAuthStore((s) => s.error);
  const isLoading = useAuthStore((s) => s.isLoading);
  const clearError = useAuthStore((s) => s.clearError);
  const setNotification = useNotificationStore((s) => s.setNotification);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      userName: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { reset } = useForm<RegisterFormValues>();
  useEffect(() => {
    if (isAuthenticated) {
      reset();
      setNotification({
        type: "success",
        message: "Rejestracja zakończona sukcesem!",
      });
      router.push("/dashboard");
    }
  }, [isAuthenticated, router, setNotification]);

  useEffect(() => {
    if (error) {
      setNotification({
        type: "error",
        message: error,
      });
      clearError();
    }
  }, [error, setNotification, clearError]);

  const onSubmit = async (data: RegisterFormValues) => {
    clearError();
    const { confirmPassword, ...userData } = data;
    // Przekazujemy tylko dane użytkownika do rejestracji
    await registerUser(data);
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl border dark:border-gray-700">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Stwórz konto</CardTitle>
        <CardDescription>
          Rozpocznij swoją przygodę z DSA Learning
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="twoj@email.com"
                className="pl-10"
                aria-invalid={errors.email ? "true" : "false"}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          {/* Nazwa użytkownika */}
          <div className="space-y-1.5">
            <Label htmlFor="userName">Nazwa użytkownika</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="userName"
                type="text"
                {...register("userName")}
                placeholder="jankowalski123"
                className="pl-10"
                aria-invalid={errors.userName ? "true" : "false"}
              />
            </div>
            {errors.userName && (
              <p className="text-sm text-destructive">
                {errors.userName.message}
              </p>
            )}
          </div>
          {/* Imię i nazwisko */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">Imię</Label>
              <Input
                id="firstName"
                type="text"
                {...register("firstName")}
                placeholder="Jan"
                aria-invalid={errors.firstName ? "true" : "false"}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Nazwisko</Label>
              <Input
                id="lastName"
                type="text"
                {...register("lastName")}
                placeholder="Kowalski"
                aria-invalid={errors.lastName ? "true" : "false"}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>
          {/* Hasło */}
          <div className="space-y-1.5">
            <Label htmlFor="password">Hasło</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="********"
                className="pl-10 pr-10"
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
          {/* Potwierdź hasło */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                placeholder="********"
                className="pl-10 pr-10"
                aria-invalid={errors.confirmPassword ? "true" : "false"}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label={showConfirmPassword ? "Ukryj hasło" : "Pokaż hasło"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-full w-full" />
                ) : (
                  <Eye className="h-full w-full" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          {/* Przycisk rejestracji */}
          <LoadingButton
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
            disabled={isLoading}
            isLoading={isLoading}
            size="lg"
          >
            Zarejestruj się
          </LoadingButton>
        </form>
      </CardContent>
      <CardFooter className="text-center text-sm text-gray-600 dark:text-gray-400">
        Masz już konto?{" "}
        <Link
          href="/login"
          className="ml-1 font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Zaloguj się
        </Link>
      </CardFooter>
    </Card>
  );
}
