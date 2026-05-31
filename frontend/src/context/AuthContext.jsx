import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('fraudshield_token'));
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('fraudshield_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/auth/me');
        setUser(response.data?.data?.user || response.data?.user || response.data);
        setToken(storedToken);
      } catch (err) {
        // Token invalid or expired
        localStorage.removeItem('fraudshield_token');
        localStorage.removeItem('fraudshield_user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const newToken = response.data.token;
    const userData = response.data?.data?.user || response.data?.user;
    
    localStorage.setItem('fraudshield_token', newToken);
    localStorage.setItem('fraudshield_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    const newToken = response.data.token;
    const userData = response.data?.data?.user || response.data?.user;
    
    if (newToken) {
      localStorage.setItem('fraudshield_token', newToken);
      localStorage.setItem('fraudshield_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
    }
    return response.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('fraudshield_token');
    localStorage.removeItem('fraudshield_user');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((newData) => {
    setUser((prev) => {
      const updated = { ...prev, ...newData };
      localStorage.setItem('fraudshield_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
