import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const isInitiatedRef = useRef(false);

  useEffect(() => {
    if (isInitiatedRef.current) return;
    isInitiatedRef.current = true;

    const initAuth = async () => {
      // 1. Load User session
      const storedUser = localStorage.getItem('eventdeco_user');
      const userToken = localStorage.getItem('eventdeco_user_token');
      if (userToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {}
      }

      // 2. Load Admin session
      const storedAdmin = localStorage.getItem('eventdeco_admin_user');
      const adminToken = localStorage.getItem('eventdeco_admin_token');
      if (adminToken && storedAdmin) {
        try {
          setAdminUser(JSON.parse(storedAdmin));
        } catch (e) {}
      }

      // 3. Verify User profile with server if token exists
      if (userToken) {
        try {
          const profile = await api.getCurrentUser(userToken);
          if (profile) {
            localStorage.setItem('eventdeco_user', JSON.stringify(profile));
            setUser(profile);
          }
        } catch (e) {
          console.error("Failed to load user profile on startup:", e);
          if (e.message && (e.message.includes('expired') || e.message.includes('Unauthorized') || e.message.includes('401'))) {
            localStorage.removeItem('eventdeco_user_token');
            localStorage.removeItem('eventdeco_user_refresh_token');
            localStorage.removeItem('eventdeco_user');
            setUser(null);
          }
        }
      }

      // 4. Verify Admin profile with server if token exists
      if (adminToken) {
        try {
          const profile = await api.getCurrentUser(adminToken);
          if (profile) {
            localStorage.setItem('eventdeco_admin_user', JSON.stringify(profile));
            setAdminUser(profile);
          }
        } catch (e) {
          console.error("Failed to load admin profile on startup:", e);
          if (e.message && (e.message.includes('expired') || e.message.includes('Unauthorized') || e.message.includes('401'))) {
            localStorage.removeItem('eventdeco_admin_token');
            localStorage.removeItem('eventdeco_admin_refresh_token');
            localStorage.removeItem('eventdeco_admin_user');
            setAdminUser(null);
          }
        }
      }

      // 5. Clean up legacy keys if present
      localStorage.removeItem('eventdeco_token');
      localStorage.removeItem('eventdeco_refresh_token');
      localStorage.removeItem('eventdeco_user');

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
    const isAdminFlow = location.pathname.startsWith('/admin') || location.pathname.startsWith('/offline-sales');
    
    try {
      const response = await api.login(email, password);
      const token = response.token || response.accessToken;
      
      const decoded = parseJwt(token);
      const role = decoded.role?.toUpperCase();
      const isUserAdmin = role === 'ADMIN' || role === 'ROLE_ADMIN';
      
      // Enforce strict separation during login
      if (isAdminFlow && !isUserAdmin) {
        return { success: false, error: 'Access denied. Normal user accounts cannot access the admin portal.' };
      }
      if (!isAdminFlow && isUserAdmin) {
        return { success: false, error: 'Access denied. Admin accounts cannot access the user portal.' };
      }
      
      const tokenKey = isAdminFlow ? 'eventdeco_admin_token' : 'eventdeco_user_token';
      const refreshKey = isAdminFlow ? 'eventdeco_admin_refresh_token' : 'eventdeco_user_refresh_token';
      const userKey = isAdminFlow ? 'eventdeco_admin_user' : 'eventdeco_user';
      
      localStorage.setItem(tokenKey, token);
      if (response.refreshToken) localStorage.setItem(refreshKey, response.refreshToken);
      
      let userData = { 
        email: decoded.sub, 
        role: decoded.role, 
        firstName: decoded.firstName || (isAdminFlow ? 'Admin' : 'User'), 
        displayName: decoded.firstName || (isAdminFlow ? 'Admin' : 'User') 
      };
      
      try {
        const profile = await api.getCurrentUser(token);
        if (profile) {
          userData = profile;
        }
      } catch (err) {
        console.warn("Failed to load full user profile upon login, using JWT fallback:", err);
      }
      
      localStorage.setItem(userKey, JSON.stringify(userData));
      if (isAdminFlow) {
        setAdminUser(userData);
      } else {
        setUser(userData);
      }
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
    const isAdminFlow = location.pathname.startsWith('/admin') || location.pathname.startsWith('/offline-sales');
    if (isAdminFlow) {
      localStorage.removeItem('eventdeco_admin_token');
      localStorage.removeItem('eventdeco_admin_refresh_token');
      localStorage.removeItem('eventdeco_admin_user');
      setAdminUser(null);
    } else {
      localStorage.removeItem('eventdeco_user_token');
      localStorage.removeItem('eventdeco_user_refresh_token');
      localStorage.removeItem('eventdeco_user');
      setUser(null);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Dynamically resolve state values based on the current window path
  const isActivePathAdmin = location.pathname.startsWith('/admin') || location.pathname.startsWith('/offline-sales');
  const activeUser = isActivePathAdmin ? adminUser : user;
  const activeIsAuthenticated = isActivePathAdmin ? !!adminUser : !!user;

  return (
    <AuthContext.Provider value={{ 
      user: activeUser, 
      setUser: isActivePathAdmin ? setAdminUser : setUser, 
      login, 
      register, 
      logout, 
      isAuthenticated: activeIsAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
