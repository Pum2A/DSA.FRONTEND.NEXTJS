import { AuthResponse } from "@/app/types/api/authTypes";
import { UserDto } from "@/app/types/api/userTypes";
import axiosInstance from "@/app/utils/axiosRefreshTokenInstance";
import { LoginFormData } from "./schema/loginSchema";
import { RegisterFormData } from "./schema/registerSchema";

/** Log in the user and set cookies via backend */
export async function loginUser(credentials: LoginFormData): Promise<AuthResponse> {
  const response = await axiosInstance.post<AuthResponse>("/api/Auth/login", credentials);
  return response.data;
}

/** Register a new user */
export async function registerUser(data: RegisterFormData): Promise<AuthResponse> {
  const response = await axiosInstance.post<AuthResponse>("/api/Auth/register", data);
  return response.data;
}

/** Log out the current user */
export async function logoutUser(): Promise<void> {
  try {
    await axiosInstance.post("/api/Auth/logout");
  } catch (error: any) {
    if (error.response?.status !== 401) {
      console.error("Logout error:", error);
      throw error;
    }
  }
}

/** Get the currently logged-in user */
export async function getMe(): Promise<UserDto> {
  const response = await axiosInstance.get<UserDto>("/api/Auth/me");
  return response.data;
}

// Endpoint for changing password

export async function changePassword(): Promise<void>{
  const response = await axiosInstance.post("/api/Auth/changePassword");
  return response.data;
}

// Endpoint for forgot password functionality

export async function forgotPassword(): Promise<void>{
  const response = await axiosInstance.post("/api/Auth/forgotPassword");
  return response.data;
}

//Endpoint for resetting password after forgot password

export async function resetPassword(): Promise<void>{
  const response = await axiosInstance.post("/api/Auth/resetPassword");
  return response.data;
}

// Endpoint for verifying email after registration

export async function verifyEmail(): Promise<void>{
  const response = await axiosInstance.post("/api/Auth/verifyEmail");
  return response.data;
}

// Endpoint for checking the status of the authentication (e.g., if the user is logged in)

export async function status(): Promise<void>{
  const response = await axiosInstance.post("/api/Auth/status");
  return response.data;
}
 
/** Request backend to refresh the JWT (sets a new HttpOnly cookie) */
export async function refreshToken(): Promise<void> {
  try {
    await axiosInstance.post("/api/Auth/refresh");
    // For HttpOnly, nothing to do, cookies are set server-side.
  } catch (error) {
    console.error("Failed to refresh token in api.ts", error);
    throw error;
  }
}