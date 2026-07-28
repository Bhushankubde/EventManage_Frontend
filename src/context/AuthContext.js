import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('eventdeco_user');
      const token = localStorage.getItem('eventdeco_token');
      
      if (token) {
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {}
        }
        
        try {
          const profile = await api.getCurrentUser();
          if (profile) {
            localStorage.setItem('eventdeco_user', JSON.stringify(profile));
            setUser(profile);
          }
        } catch (e) {
          console.error("Failed to load user profile on startup:", e);
          if (e.message && (e.message.includes('expired') || e.message.includes('Unauthorized') || e.message.includes('401'))) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initAuth();
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
      let userData = { email: decoded.sub, role: decoded.role, firstName: decoded.firstName || 'User', displayName: decoded.firstName || 'User' };
      
      try {
        const profile = await api.getCurrentUser();
        if (profile) {
          userData = profile;
        }
      } catch (err) {
        console.warn("Failed to load full user profile upon login, using JWT fallback:", err);
      }
      
      localStorage.setItem('eventdeco_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (data) => {
    try {
      await api.register(data);
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
    <AuthContext.Provider value={{ user, setUser, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
