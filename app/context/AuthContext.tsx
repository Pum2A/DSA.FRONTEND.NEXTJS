'use client';

import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useState } from 'react';
import apiService from '../lib/api';
import { UserDto } from '../types/auth';
import { UserProfileDto } from '../types/user';

interface AuthContextProps {
  user: UserProfileDto | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  error: null
});

export const useAuth = () => useContext(AuthContext);

// Helper function to convert UserDto to UserProfileDto
const convertToUserProfileDto = (userDto: UserDto): UserProfileDto => {
  return {
    ...userDto,
    createdAt: userDto.lastActivityDate || new Date().toISOString(),
    stats: {
      completedLessons: 0,
      completedModules: 0,
      completedQuizzes: 0,
      averageQuizScore: 0,
      ranking: 0
    }
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is authenticated on initial load and restore session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        // Try to get authenticated state and user from API (cookie-based session)
        const result = await apiService.auth.checkAuthStatus();
        if (result.isAuthenticated && result.user) {
          setUser(result.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        // Optionally: try to refresh token here if you have silent refresh endpoint
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const response = await apiService.auth.login({ email, password });
      if (response.success && response.token) {
        // Store JWT for session continuity (if used)
        localStorage.setItem('token', response.token);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
        if (response.user) {
          setUser(convertToUserProfileDto(response.user));
          try {
            const userProfile = await apiService.user.getProfile();
            setUser(userProfile);
          } catch (profileError) {
            // fallback: limited user data only
          }
        } else {
          try {
            const userProfile = await apiService.user.getProfile();
            setUser(userProfile);
          } catch (profileError) {
            setError('Logged in, but failed to fetch your profile data');
            return false;
          }
        }
        return true;
      } else {
        setError(response.message || 'Login failed');
        return false;
      }
    } catch (error: any) {
      setError(error?.response?.data?.message || 'Login failed. Please try again.');
      return false;
    }
  };

  // Register function
  const register = async (email: string, username: string, password: string) => {
    setError(null);
    try {
      const response = await apiService.auth.register({
        email,
        username,
        password,
        confirmPassword: password
      });

      if (response.success) {
        if (response.token) {
          localStorage.setItem('token', response.token);
          if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
          }
          if (response.user) {
            setUser(convertToUserProfileDto(response.user));
            try {
              const userProfile = await apiService.user.getProfile();
              setUser(userProfile);
            } catch (profileError) {
              // fallback: limited user data only
            }
          }
          return true;
        } else {
          router.push('/login?registered=true');
          return true;
        }
      } else {
        setError(response.message || 'Registration failed');
        return false;
      }
    } catch (error: any) {
      setError(error?.response?.data?.message || 'Registration failed. Please try again.');
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await apiService.auth.logout();
    } catch (error) {
      // ignore
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setUser(null);
      router.push('/login');
    }
  };

  const contextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    error
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};