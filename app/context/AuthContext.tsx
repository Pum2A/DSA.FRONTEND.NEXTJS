'use client';

import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as authApi from '../features/auth/api';
import { logout as apiLogout } from '../features/auth/api';

export interface AuthContextValue {
  user: any | null;
  error: string | null;
  setError: (e: string | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, username: string, password: string, confirmPassword: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('AuthContext not found');
  return ctx;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    authApi.getStatus()
      .then(res => setUser(res.user ?? null))
      .catch(() => setUser(null));
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const res = await authApi.login(email, password);
      if (res.success && res.user) {
        setUser(res.user);
        return true;
      }
      setError(res.message || 'Login failed');
      return false;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const register = async (
    email: string,
    username: string,
    password: string,
    confirmPassword: string
  ) => {
    setError(null);
    try {
      const res = await authApi.register(email, username, password, confirmPassword);
      if (res.success && res.user) {
        setUser(res.user);
        return true;
      }
      // obsługa błędów walidacji z .NET
      if (res.errors) {
        const firstError = Object.values(res.errors).flat()[0];
        setError(firstError || res.message || 'Registration failed');
      } else {
        setError(res.message || 'Registration failed');
      }
      return false;
    } catch (err: any) {
      // obsługa błędów walidacji z .NET
      if (err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors).flat()[0];
        setError(String(firstError) || 'Registration failed');
      } else {
        setError(err.response?.data?.message || 'Registration failed');
      }
      return false;
    }
  };

 const logout = async () => {
  try {
    await apiLogout();
  } catch (err: any) {
    // Możesz zignorować błąd 401 przy logout
    if (err?.response?.status !== 401) {
      console.error('Unexpected logout error', err);
    }
  }
  setUser(null);
  router.push('/login');
};

  return (
    <AuthContext.Provider
      value={{
        user,
        error,
        setError,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};