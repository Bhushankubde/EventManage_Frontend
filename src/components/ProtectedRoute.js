import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user?.role !== 'ADMIN' && user?.role !== 'ROLE_ADMIN') {
    return <Navigate to="/login" state={{ from: location, error: 'Admin access required. Please log in with an admin account.' }} replace />;
  }


  return children;
};
