"use client";

import { useAuth } from "@/app/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    AlertCircle,
    Camera,
    CheckCircle,
    Key,
    Mail,
    Shield,
    User
} from "lucide-react";
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import Navbar from "../components/Navbar";

export default function ProfilePage() {
  const { user, updateUserData } = useAuth();
  const queryClient = useQueryClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  // Form fields
  const [username, setUsername] = useState(user?.username || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // Form states
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const hasProfileChanges = username !== user?.username || avatarFile !== null;

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async ({ username, avatarFile }: { username: string; avatarFile: File | null }) => {
      setProfileError(null);
      setIsUpdatingProfile(true);
      
      // Create FormData to handle file upload
      const formData = new FormData();
      formData.append("username", username);
      
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }
      
      const response = await fetch("/api/Auth/Profile", {
        method: "PUT",
        credentials: "include",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["dashboardUser"] });
      updateUserData(data);
      toast.success("Profil zaktualizowany pomyślnie");
    },
    onError: (error) => {
      setProfileError(error.message);
      toast.error("Nie udało się zaktualizować profilu", {
        description: error.message,
      });
    },
    onSettled: () => {
      setIsUpdatingProfile(false);
    }
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async ({ currentPassword, newPassword, confirmPassword }: { 
      currentPassword: string; 
      newPassword: string; 
      confirmPassword: string;
    }) => {
      setPasswordError(null);
      setIsChangingPassword(true);
      
      if (newPassword !== confirmPassword) {
        throw new Error("Nowe hasła nie są identyczne");
      }
      
      const response = await fetch("/api/Auth/ChangePassword", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to change password");
      }
      
      return response.json();
    },
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Hasło zmienione pomyślnie");
    },
    onError: (error) => {
      setPasswordError(error.message);
      toast.error("Nie udało się zmienić hasła", {
        description: error.message,
      });
    },
    onSettled: () => {
      setIsChangingPassword(false);
    }
  });

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile update
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ username, avatarFile });
  };

  // Handle password change
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    changePasswordMutation.mutate({ currentPassword, newPassword, confirmPassword });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Twój profil</h1>
          
          <Tabs defaultValue="account" className="space-y-6">
            <TabsList>
              <TabsTrigger value="account" className="gap-2">
                <User className="h-4 w-4" />
                <span>Konto</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="h-4 w-4" />
                <span>Bezpieczeństwo</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Account tab */}
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Informacje o profilu</CardTitle>
                  <CardDescription>
                    Zaktualizuj dane swojego konta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile}>
                    {profileError && (
                      <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{profileError}</AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="mb-6 flex flex-col items-center">
                      <div className="relative">
                        <Avatar className="h-24 w-24 border-2 border-border">
                          <AvatarImage 
                            src={avatarPreview || user?.avatar || undefined} 
                            alt={user?.username} 
                          />
                          <AvatarFallback className="text-3xl">
                            {user?.username?.substring(0, 2).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          type="button" 
                          variant="secondary" 
                          size="icon" 
                          className="absolute -bottom-2 -right-2 rounded-full shadow-sm"
                          onClick={() => avatarInputRef.current?.click()}
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                      </div>
                      {avatarFile && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {avatarFile.name}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Nazwa użytkownika</Label>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="username"
                            name="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            value={user?.email || ""}
                            disabled
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Adres email jest używany do logowania i nie może być zmieniony.
                        </p>
                      </div>
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    type="submit" 
                    onClick={handleUpdateProfile}
                    disabled={!hasProfileChanges || isUpdatingProfile}
                  >
                    {isUpdatingProfile ? "Aktualizowanie..." : "Aktualizuj profil"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Security tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Zmiana hasła</CardTitle>
                  <CardDescription>
                    Aktualizuj swoje hasło, aby chronić swoje konto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword}>
                    {passwordError && (
                      <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{passwordError}</AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Obecne hasło</Label>
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Nowe hasło</Label>
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Powtórz nowe hasło</Label>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    type="submit" 
                    onClick={handleChangePassword}
                    disabled={
                      !currentPassword || 
                      !newPassword || 
                      !confirmPassword || 
                      isChangingPassword
                    }
                  >
                    {isChangingPassword ? "Zmienianie hasła..." : "Zmień hasło"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}