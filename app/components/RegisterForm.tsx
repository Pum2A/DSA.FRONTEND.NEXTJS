"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "../store/authStore";
import { toast } from "sonner";

const registerSchema = z
  .object({
    email: z.string().email("Podaj prawidłowy adres email"),
    userName: z
      .string()
      .min(3, "Nazwa użytkownika musi mieć co najmniej 3 znaki"),
    firstName: z.string().min(1, "Imię jest wymagane"),
    lastName: z.string().min(1, "Nazwisko jest wymagane"),
    password: z
      .string()
      .min(8, "Hasło musi mieć co najmniej 8 znaków")
      .regex(/[A-Z]/, "Hasło musi zawierać co najmniej jedną dużą literę")
      .regex(/[a-z]/, "Hasło musi zawierać co najmniej jedną małą literę")
      .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę")
      .regex(
        /[^A-Za-z0-9]/,
        "Hasło musi zawierać co najmniej jeden znak specjalny"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła muszą być identyczne",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const {
    register: registerUser,
    isAuthenticated,
    error,
    isLoading,
    clearError,
  } = useAuthStore();

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

  useEffect(() => {
    if (isAuthenticated) {
      toast.success("Rejestracja zakończona sukcesem", {
        description: "Witamy w DSA Learning!",
      });
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (error) {
      toast.error("Błąd rejestracji", {
        description: error,
      });
      clearError();
    }
  }, [error, clearError]);

  const onSubmit = async (data: RegisterFormValues) => {
    await registerUser(data);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-8 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Stwórz konto</h1>
        <p className="text-gray-600 mt-2">
          Rozpocznij swoją przygodę z DSA Learning
        </p>
      </div>

      {error && (
        <div className="p-3 rounded bg-red-100 text-red-600">
          {error}
          <button onClick={clearError} className="ml-2 text-sm underline">
            Zamknij
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="twoj@email.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="userName">
            Nazwa użytkownika
          </label>
          <Input
            id="userName"
            type="text"
            {...register("userName")}
            placeholder="jankowalski"
          />
          {errors.userName && (
            <p className="text-red-500 text-sm">{errors.userName.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="firstName">
              Imię
            </label>
            <Input
              id="firstName"
              type="text"
              {...register("firstName")}
              placeholder="Jan"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="lastName">
              Nazwisko
            </label>
            <Input
              id="lastName"
              type="text"
              {...register("lastName")}
              placeholder="Kowalski"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">
            Hasło
          </label>
          <Input
            id="password"
            type="password"
            {...register("password")}
            placeholder="********"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="confirmPassword">
            Potwierdź hasło
          </label>
          <Input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
            placeholder="********"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? "Tworzenie konta..." : "Zarejestruj się"}
        </Button>
      </form>

      <div className="text-center text-sm">
        <p>
          Masz już konto?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Zaloguj się
          </Link>
        </p>
      </div>
    </div>
  );
}
