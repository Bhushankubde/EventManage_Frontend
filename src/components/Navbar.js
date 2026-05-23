import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  
  return (
    <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-8 py-4 bg-black/60 backdrop-blur-md border-b border-white/10 z-50">
      <Link to="/">
        <img src="/images/logo.png" alt="EventDeco Logo" className="h-24 w-auto object-contain" />
      </Link>
      <div className="flex items-center space-x-8">
        <Link to="/catalog" className="text-white hover:text-amber-400 text-lg font-medium transition-colors">Browse Items</Link>
        <Link to="/admin" className="flex items-center text-white hover:text-amber-400 text-lg font-medium transition-colors">Admin</Link>
        <Link to="/offline-sales" className="text-white hover:text-amber-400 text-lg font-medium transition-colors">Offline Sales</Link>
        
        {!isAuthenticated ? (
          <>
            <Link to="/login" className="text-white hover:text-amber-400 text-lg font-medium transition-colors">Login</Link>
            <Link to="/signup" className="bg-amber-500 text-black hover:bg-amber-400 px-4 py-2 rounded-lg text-lg font-medium transition-colors">Sign Up</Link>
          </>
        ) : (
          <button onClick={logout} className="flex items-center text-white hover:text-red-400 text-lg font-medium transition-colors">
            <LogOut className="w-5 h-5 mr-1" /> Logout
          </button>
        )}

        <Link to="/cart" className="flex items-center text-white hover:text-amber-400 text-lg font-medium transition-colors">
          <ShoppingCart className="w-6 h-6" />
        </Link>
      </div>
    </div>
  );
};
