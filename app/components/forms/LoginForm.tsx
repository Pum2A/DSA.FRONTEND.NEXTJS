"use client";

import { useNotificationStore } from "@/app/store/notificationStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuthStore } from "../../store/authStore";
import { LoadingButton } from "../ui/LoadingButton";

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
  const setNotification = useNotificationStore((s) => s.setNotification);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  useEffect(() => {
    if (isAuthenticated) {
      setNotification({
        type: "success",
        message: "Zalogowano pomyślnie!",
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
    }
  }, [error, setNotification]);

  const onSubmit = async (data: LoginFormValues) => {
    clearError();
    await login(data.email, data.password);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border dark:border-gray-700">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Zaloguj się</CardTitle>
        <CardDescription>Kontynuuj swoją podróż z DSA Learning</CardDescription>
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
          {/* Remember Me i link do resetu */}
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
          {/* Przycisk logowania */}
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
