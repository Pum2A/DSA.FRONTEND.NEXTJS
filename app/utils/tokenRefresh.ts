import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5178';

export async function refreshToken() {
  // Załóżmy, że backend ma endpoint: /api/Auth/refresh
  const res = await axios.post(`${API_URL}Auth/refresh`, {}, { withCredentials: true });
  if (res.data && res.data.accessToken) {
    // Możesz tu zapisać accessToken do localStorage/cookie, jeśli to Twój flow
    return res.data.accessToken;
  }
  throw new Error('Token refresh failed');
}