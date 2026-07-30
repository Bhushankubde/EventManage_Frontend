import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Guard for Admin/Staff pages
export const AdminRouteGuard = ({ children, publicOnly = false }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // If unauthenticated:
  if (!isAuthenticated) {
    if (publicOnly) {
      return children; // Accessing /admin/login is allowed
    }
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If authenticated:
  const isUserAdmin = user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN';

  if (!isUserAdmin) {
    // Normal user trying to access admin page: redirect to user app catalog
    return <Navigate to="/catalog" replace />;
  }

  if (publicOnly) {
    // Admin trying to access /admin/login: redirect to dashboard
    return <Navigate to="/admin" replace />;
  }

  return children;
};

// Guard for User pages
export const UserRouteGuard = ({ children, public: isPublic = false, publicOnly = false, protected: isProtected = false }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Check if an admin token exists globally
  const adminToken = localStorage.getItem('eventdeco_admin_token');
  if (adminToken) {
    // Admin must not access User-only paths, redirect them back to Admin dashboard
    return <Navigate to="/admin" replace />;
  }

  if (isProtected && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (publicOnly && isAuthenticated) {
    // Logged in user trying to access /login or /signup, redirect to catalog
    return <Navigate to="/catalog" replace />;
  }

  return children;
};

// Keep legacy ProtectedRoute fallback in case of direct reference
export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  if (requireAdmin) {
    return <AdminRouteGuard>{children}</AdminRouteGuard>;
  }
  return <UserRouteGuard protected={true}>{children}</UserRouteGuard>;
};
