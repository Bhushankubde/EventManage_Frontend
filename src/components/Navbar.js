import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const path = location.pathname;
  const attemptedPath = location.state?.from?.pathname;  //just a comment
  const isAuthPage = path === '/login' || path === '/signup';

  return (
    <div className="fixed top-4 left-4 right-4 max-w-[1600px] mx-auto flex items-center justify-between px-6 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl z-50 shadow-2xl">
      <Link to="/">
        <img src="/images/logo.png" alt="EventDeco Logo" className="h-24 w-auto object-contain" />
      </Link>
      <div className="flex items-center space-x-6">
        {path !== '/catalog' && attemptedPath !== '/catalog' && (
          <Link to="/catalog" className="text-white hover:text-amber-400 text-lg font-medium transition-colors">Browse Items</Link>
        )}

        {path !== '/admin' && attemptedPath !== '/admin' && (
          <Link to="/admin" className="flex items-center text-white hover:text-amber-400 text-lg font-medium transition-colors">Admin</Link>
        )}

        {path !== '/offline-sales' && attemptedPath !== '/offline-sales' && (
          <Link to="/offline-sales" className="text-white hover:text-amber-400 text-lg font-medium transition-colors">Offline Sales</Link>
        )}

        {path !== '/cart' && attemptedPath !== '/cart' && (
          <Link to="/cart" className="flex items-center text-white hover:text-amber-400 text-lg font-medium transition-colors">
            <ShoppingCart className="w-6 h-6 mr-1" />
            <span className="hidden sm:inline">Cart</span>
          </Link>
        )}

        {!isAuthenticated ? (
          !isAuthPage && (
            <>
              <Link to="/login" className="text-white hover:text-amber-400 text-lg font-medium transition-colors border border-transparent">Login</Link>
              <Link to="/signup" className="bg-amber-500 text-black hover:bg-amber-400 px-4 py-2 rounded-lg text-lg font-medium transition-colors">Sign Up</Link>
            </>
          )
        ) : (
          <button onClick={logout} className="flex items-center text-white hover:text-red-400 text-lg font-medium transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg border border-white/10 ml-2">
            <LogOut className="w-5 h-5 mr-2" /> Logout
          </button>
        )}
      </div>
    </div>
  );
};
