import React, { Suspense, lazy } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Lazy load pages for performance optimization
const HomePage = lazy(() => import('./pages/HomePage'));
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const OfflineSalesPage = lazy(() => import('./pages/OfflineSalesPage'));
const BookingsPage = lazy(() => import('./pages/BookingsPage'));
const CartPage = lazy(() => import('./pages/CartPage'));

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Navbar />


      <main className={`flex-1 relative z-0 ${!isHomePage ? 'pt-32' : ''}`}>
        <Suspense fallback={<LoadingSpinner />}>
          {children}
        </Suspense>
      </main>

      <footer className="bg-card border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <span className="font-bold text-2xl tracking-tight flex items-center gap-2 mb-4">
                <img
                  src="/images/logo.png"
                  alt="EventDeco Logo"
                  className="h-40 w-auto object-contain"
                />
              </span>
              <p className="text-muted-foreground text-sm max-w-xs">
                Premium event decoration rentals with industrial-grade reliability. From online bookings to walk-in fulfillment.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Support</h3>
              <ul className="space-y-2">
                <li><button className="text-sm text-muted-foreground hover:text-primary cursor-pointer text-left w-full">Contact Us</button></li>
                <li><button className="text-sm text-muted-foreground hover:text-primary cursor-pointer text-left w-full">FAQ</button></li>
                <li><button className="text-sm text-muted-foreground hover:text-primary cursor-pointer text-left w-full">Return Policy</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Company</h3>
              <ul className="space-y-2">
                <li><button className="text-sm text-muted-foreground hover:text-primary cursor-pointer text-left w-full">About</button></li>
                <li><button className="text-sm text-muted-foreground hover:text-primary cursor-pointer text-left w-full">Blog</button></li>
                <li><Link to="/admin" className="text-sm text-muted-foreground hover:text-primary font-medium">Admin Login</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-8 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">&copy; 2026 EventDeco Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/offline-sales" element={<ProtectedRoute requireAdmin={true}><OfflineSalesPage /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
        <Route path="*" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">404 - Page Not Found</h1></div>} />
      </Routes>
    </Layout>
  );
}

