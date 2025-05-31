"use client";

import { useAuth } from "@/app/context/AuthContext";
import {
  LoginFormData,
  loginSchema,
} from "@/app/features/auth/schema/loginSchema";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function LoginPage() {
  const { login, isLoading, error: authError, clearError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [showPassword, setShowPassword] = useState(false);

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
      });
      router.replace("/login", { scroll: false });
    }
    if (searchParams.get("expired") === "1" && !authError) {
      toast.error("Sesja wygasła", { description: "Zaloguj się ponownie." });
      router.replace("/login", { scroll: false });
    }
  }, [searchParams, router, authError]);

  useEffect(() => {
    return () => {
      if (authError) clearError();
    };
  }, [authError, clearError, pathname]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
    } catch (e) {
      // Error handled in AuthContext/toast
    }
  };

  return (
    <>
      <div className="mb-6 text-center">
        <Link href="/" className="inline-block">
          <h1 className="text-2xl font-bold text-gradient">DSA Platform</h1>
        </Link>
      </div>
      
      <Card className="w-full shadow-sm border-0 dark:bg-gray-900/70">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-bold text-center">
            Zaloguj się
          </CardTitle>
          <CardDescription className="text-center">
            Witaj z powrotem! Podaj swoje dane logowania.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {authError && !isLoading && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <div className="absolute left-3 top-2.5 text-muted-foreground">
                  <MailIcon size={18} />
                </div>
                <Input
                  id="email"
                  type="email"
                  className="pl-10"
                  placeholder="jan.kowalski@example.com"
                  autoComplete="email"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm font-medium text-destructive mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Hasło</Label>
                <Link 
                  href="#" 
                  className="text-sm text-brand-600 hover:text-brand-500 dark:text-brand-400"
                >
                  Zapomniałeś hasła?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-2.5 text-muted-foreground">
                  <LockIcon size={18} />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register("password")}
                />
                <button 
                  type="button"
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(prev => !prev)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm font-medium text-destructive mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full rounded-md font-medium"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Logowanie..." : "Zaloguj się"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-center">
          <div className="text-sm text-center">
            Nie masz jeszcze konta?{" "}
            <Link
              href="/register"
              className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400"
            >
              Utwórz konto
            </Link>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}