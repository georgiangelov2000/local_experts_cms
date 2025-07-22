import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import config from '../config';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ✅ Custom fetcher that adds token automatically
  const fetcher = async (url) => {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  };

  // ✅ Use React Query to fetch current user
  const {
    data: user,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['me', token],
    queryFn: () => fetcher(`${config.AUTH_BASE}/me`),
    enabled: !!token // Only fetch if token exists
  });

  // ✅ Login method
  const login = async (email, password, setError) => {
    try {
      const res = await fetch(`${config.AUTH_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        queryClient.invalidateQueries(['me']); // Refetch user after login
      } else {
        setError && setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError && setError('Network error');
    }
  };

  // ✅ Logout method
  const logout = () => {
    setToken('');
    localStorage.removeItem('token');
    queryClient.removeQueries(['me']);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isLoading, isError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
