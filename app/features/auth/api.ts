import { UserProfileDto } from '@/app/types/user';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5178/api/';

export async function getStatus(): Promise<{ isAuthenticated: boolean; user?: UserProfileDto }> {
    const res = await axios.get(`${API_BASE_URL}Auth/status`, { withCredentials: true });
    return res.data;
}

export async function login(email: string, password: string) {
    const res = await axios.post(`${API_BASE_URL}Auth/login`, { email, password }, { withCredentials: true });
    return res.data;
}

export async function register(email: string, username: string, password: string, confirmPassword: string) {
  const res = await axios.post(`${API_BASE_URL}Auth/register`, {
    Email: email,
    Username: username,
    Password: password,
    ConfirmPassword: confirmPassword,
  }, { withCredentials: true });
  return res.data;
}


export async function getProfile() {
  return axios.get(`${API_BASE_URL}Auth/me`, { withCredentials: true }).then(r => r.data);
}

export async function logout() {
  return axios.post(`${API_BASE_URL}Auth/logout`, {}, { withCredentials: true });
}

