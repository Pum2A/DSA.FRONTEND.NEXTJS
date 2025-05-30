import apiService from "../lib/api";

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (error: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token as string);
    }
  });
  
  failedQueue = [];
};

export const refreshAuthToken = () => {
  const currentRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
  
  if (!currentRefreshToken) {
    return Promise.reject(new Error('No refresh token available'));
  }

  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  return new Promise<string>((resolve, reject) => {
    apiService.auth.refreshToken({ refreshToken: currentRefreshToken })
      .then(response => {
        isRefreshing = false;
        
        if (response.success && response.token) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', response.token);
            if (response.refreshToken) {
              localStorage.setItem('refreshToken', response.refreshToken);
            }
          }
          
          processQueue(null, response.token);
          resolve(response.token);
        } else {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
          }
          processQueue(new Error('Failed to refresh token'));
          reject(new Error('Failed to refresh token'));
          
          // Redirect to login page
          if (typeof window !== 'undefined') {
            window.location.href = '/login?expired=true';
          }
        }
      })
      .catch(error => {
        isRefreshing = false;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        }
        processQueue(error);
        reject(error);
        
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login?expired=true';
        }
      });
  });
};