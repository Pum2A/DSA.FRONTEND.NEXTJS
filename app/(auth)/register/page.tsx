"use client";

import { useAuth } from "@/app/context/AuthContext";
import {
  RegisterFormData,
  registerSchema,
} from "@/app/features/auth/schema/registerSchema";
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
import { AlertCircle, AtSignIcon, EyeIcon, EyeOffIcon, LockIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function RegisterPage() {
  const {
    register: registerUser,
    isLoading,
    error: authError,
    clearError,
  } = useAuth();
  const pathname = usePathname();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    return () => {
      if (authError) clearError();
    };
  }, [authError, clearError, pathname]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
    } catch (e) {
      // Error handled in context
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
            Utwórz konto
          </CardTitle>
          <CardDescription className="text-center">
            Dołącz do naszej platformy nauki DSA!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {authError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">Nazwa użytkownika</Label>
              <div className="relative">
                <div className="absolute left-3 top-2.5 text-muted-foreground">
                  <UserIcon size={18} />
                </div>
                <Input
                  id="username"
                  className="pl-10"
                  placeholder="jankowalski"
                  autoComplete="username"
                  {...register("username")}
                />
              </div>
              {errors.username && (
                <p className="text-sm font-medium text-destructive mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <div className="absolute left-3 top-2.5 text-muted-foreground">
                  <AtSignIcon size={18} />
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
              <Label htmlFor="password" className="text-sm font-medium">Hasło</Label>
              <div className="relative">
                <div className="absolute left-3 top-2.5 text-muted-foreground">
                  <LockIcon size={18} />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                  autoComplete="new-password"
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
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Potwierdź hasło</Label>
              <div className="relative">
                <div className="absolute left-3 top-2.5 text-muted-foreground">
                  <LockIcon size={18} />
                </div>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                />
                <button 
                  type="button"
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm font-medium text-destructive mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full rounded-md font-medium mt-2"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Rejestrowanie..." : "Utwórz konto"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="pt-4 border-t flex justify-center">
          <div className="text-sm text-center">
            Masz już konto?{" "}
            <Link
              href="/login"
              className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400"
            >
              Zaloguj się
            </Link>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}