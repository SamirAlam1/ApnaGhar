/**
 * frontend/src/context/AuthContext.jsx
 *
 * Provides: user, loading, login, register, logout,
 *           resendVerification, forgotPassword, resetPassword
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ag_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalise API errors — expose field-level errors if present
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const data    = err.response?.data;
    const message = data?.message || 'An unexpected error occurred';
    const errors  = data?.errors  || null;
    const error   = new Error(message);
    error.errors  = errors;
    error.status  = err.response?.status;
    return Promise.reject(error);
  }
);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('ag_token');
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.data.user);
    } catch {
      localStorage.removeItem('ag_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // ── Login ──
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('ag_token', data.data.token);
    setUser(data.data.user);
    return data;
  };

  // ── Register ──
  const register = async (payload) => {
    const { data } = await api.post('/auth/register', {
      name:     payload.name,
      email:    payload.email,
      password: payload.password,
      phone:    payload.phone || '',
      role:     payload.role  || 'buyer',
    });
    // Only store token + set user if email verification is not required
    if (!data.data?.emailVerificationRequired) {
      localStorage.setItem('ag_token', data.data.token);
      setUser(data.data.user);
    }
    return data;
  };

  // ── Logout ──
  const logout = () => {
    localStorage.removeItem('ag_token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  // ── Resend verification email ──
  const resendVerification = async (email) => {
    const { data } = await api.post('/auth/resend-verification', { email });
    return data;
  };

  // ── Forgot password ──
  const forgotPassword = async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  };

  // ── Reset password ──
  const resetPassword = async (token, password) => {
    const { data } = await api.post(`/auth/reset-password/${token}`, { password });
    if (data.data?.token) {
      localStorage.setItem('ag_token', data.data.token);
      setUser(data.data.user);
    }
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        resendVerification,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};