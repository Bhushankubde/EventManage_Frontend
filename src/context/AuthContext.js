import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('eventdeco_user');
    const token = localStorage.getItem('eventdeco_token');
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('eventdeco_user');
        localStorage.removeItem('eventdeco_token');
      }
    }
    setLoading(false);
  }, []);

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.login(email, password);
      const token = response.token || response.accessToken;
      localStorage.setItem('eventdeco_token', token);
      if (response.refreshToken) localStorage.setItem('eventdeco_refresh_token', response.refreshToken);
      
      const decoded = parseJwt(token);
      const userData = { email: decoded.sub, role: decoded.role, firstName: decoded.firstName || 'User' };
      localStorage.setItem('eventdeco_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (data) => {
    try {
      const response = await api.register(data);
      const token = response.token || response.accessToken;
      localStorage.setItem('eventdeco_token', token);
      if (response.refreshToken) localStorage.setItem('eventdeco_refresh_token', response.refreshToken);
      
      const decoded = parseJwt(token);
      const userData = { email: decoded.sub, role: decoded.role, firstName: data.firstName || 'User' };
      localStorage.setItem('eventdeco_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('eventdeco_token');
    localStorage.removeItem('eventdeco_refresh_token');
    localStorage.removeItem('eventdeco_user');
    setUser(null);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
