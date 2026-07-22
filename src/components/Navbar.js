import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full bg-[#070914]/90 backdrop-blur-md border-b border-white/10 z-50 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-2 gap-4">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0 flex items-center">
          <img src="/images/logo.png" alt="EventDeco Logo" className="h-12 sm:h-14 w-auto object-contain" />
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/catalog" className="text-white hover:text-amber-400 text-sm sm:text-base font-medium transition-colors">
            Categories
          </Link>
          <Link to="/catalog" className="text-white hover:text-amber-400 text-sm sm:text-base font-medium transition-colors">
            Gallery
          </Link>
          <Link to="/#about" className="text-white hover:text-amber-400 text-sm sm:text-base font-medium transition-colors">
            About
          </Link>
          <Link to="/#contact" className="text-white hover:text-amber-400 text-sm sm:text-base font-medium transition-colors">
            Contact
          </Link>
        </div>

        {/* Search Bar, Login & Cart */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative hidden sm:flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search decor, DJ, chairs..."
              className="bg-white/10 border border-white/20 text-white placeholder-gray-400 text-xs sm:text-sm rounded-full pl-9 pr-4 py-1.5 focus:outline-none focus:border-amber-400 w-36 md:w-56 transition-all"
            />
          </form>

          {/* Cart */}
          <Link
            to="/cart"
            className="flex items-center justify-center p-2 text-white hover:text-amber-400 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-colors"
            title="Cart"
          >
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>

          {/* Login / Logout */}
          {!isAuthenticated ? (
            <Link
              to="/login"
              className="text-white hover:text-amber-400 border border-white/30 hover:border-amber-400 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors"
            >
              Login
            </Link>
          ) : (
            <button
              onClick={logout}
              className="flex items-center text-white hover:text-red-400 border border-white/20 hover:bg-white/10 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-1.5" /> Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
