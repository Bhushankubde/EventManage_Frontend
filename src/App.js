import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Navbar } from './components/Navbar';
import { AdminRouteGuard, UserRouteGuard } from './components/ProtectedRoute';
import { Footer } from './components/Footer';

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
const ItemsPage = lazy(() => import('./pages/ItemsPage'));
const ItemDetailPage = lazy(() => import('./pages/ItemDetailPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));

const Layout = ({ children }) => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin') || location.pathname.startsWith('/offline-sales');

  if (isAdminPath) {
    return (
      <div className="min-h-screen bg-[#070914] text-white flex flex-col font-sans">
        <main className="flex-1 flex flex-col relative z-0">
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Navbar />

      <main className="flex-1 flex flex-col relative z-0">
        <Suspense fallback={<LoadingSpinner />}>
          {children}
        </Suspense>
      </main>

      <Footer />
    </div>
  );
};

export default function App() {
  useEffect(() => {
    let ws = null;
    let reconnectTimeout = null;

    const connectWebSocket = () => {
      const token = localStorage.getItem('eventdeco_user_token') || localStorage.getItem('eventdeco_admin_token') || '';
      const socketUrl = `ws://localhost:8080/ws/notifications${token ? `?token=${token}` : ''}`;
      ws = new WebSocket(socketUrl);

      ws.onopen = () => {
        console.log("Global inventory WebSocket connected");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'INVENTORY_UPDATE') {
            console.log("Global WebSocket received inventory update:", data);
            window.dispatchEvent(new CustomEvent('inventory-update', { detail: data }));
          } else if (data.type !== 'HANDSHAKE' && data.message) {
            console.log("Global WebSocket received notification:", data);
            window.dispatchEvent(new CustomEvent('new-notification', { detail: data }));
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message", err);
        }
      };

      ws.onclose = (event) => {
        console.log("Global inventory WebSocket closed. Reconnecting in 5s...", event.reason);
        reconnectTimeout = setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = (err) => {
        console.error("Global inventory WebSocket error", err);
      };
    };

    connectWebSocket();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  return (
    <Layout>
      <Routes>
        {/* User Pages (Public / Guest) */}
        <Route path="/" element={<UserRouteGuard public={true}><HomePage /></UserRouteGuard>} />
        <Route path="/catalog" element={<UserRouteGuard public={true}><CatalogPage /></UserRouteGuard>} />
        <Route path="/items" element={<UserRouteGuard public={true}><ItemsPage /></UserRouteGuard>} />
        <Route path="/items/:id" element={<UserRouteGuard public={true}><ItemDetailPage /></UserRouteGuard>} />
        
        {/* User Sign In / Registration */}
        <Route path="/login" element={<UserRouteGuard publicOnly={true}><LoginPage /></UserRouteGuard>} />
        <Route path="/signup" element={<UserRouteGuard publicOnly={true}><SignupPage /></UserRouteGuard>} />
        
        {/* User Pages (Protected) */}
        <Route path="/checkout" element={<UserRouteGuard protected={true}><CheckoutPage /></UserRouteGuard>} />
        <Route path="/cart" element={<UserRouteGuard protected={true}><CartPage /></UserRouteGuard>} />
        <Route path="/bookings" element={<UserRouteGuard protected={true}><BookingsPage /></UserRouteGuard>} />

        {/* Admin Portal (Public Login) */}
        <Route path="/admin/login" element={<AdminRouteGuard publicOnly={true}><AdminLoginPage /></AdminRouteGuard>} />
        
        {/* Admin Portal (Protected Console) */}
        <Route path="/admin" element={<AdminRouteGuard><AdminDashboard /></AdminRouteGuard>} />
        <Route path="/offline-sales" element={<AdminRouteGuard><OfflineSalesPage /></AdminRouteGuard>} />
        
        {/* 404 Route */}
        <Route path="*" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">404 - Page Not Found</h1></div>} />
      </Routes>
    </Layout>
  );
}
