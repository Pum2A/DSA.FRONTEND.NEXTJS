"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "../store/authStore";

const loginSchema = z.object({
  email: z.string().email("Email jest wymagany"),
  password: z.string().min(1, "Hasło jest wymagane"),
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
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      toast.success("Zalogowano pomyślnie", {
        description: "Witamy ponownie w DSA Learning!",
      });
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (error) {
      toast.error("Błąd logowania", {
        description: error,
      });
      clearError();
    }
  }, [error, clearError]);

  const onSubmit = async (data: LoginFormValues) => {
    await login(data.email, data.password);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-8 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Zaloguj się</h1>
        <p className="text-gray-600 mt-2">
          Kontynuuj swoją podróż z DSA Learning
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
          <label className="text-sm font-medium" htmlFor="password">
            Hasło
          </label>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            {...register("password")}
            placeholder="********"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="rememberMe" {...register("rememberMe")} />
          <label
            htmlFor="rememberMe"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Zapamiętaj mnie
          </label>
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? "Logowanie..." : "Zaloguj się"}
        </Button>
      </form>

      <div className="text-center text-sm">
        <p>
          Nie masz jeszcze konta?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Zarejestruj się
          </Link>
        </p>
        <p className="mt-2">
          <Link
            href="/forgot-password"
            className="text-blue-600 hover:underline"
          >
            Zapomniałeś hasła?
          </Link>
        </p>
      </div>
    </div>
  );
}
