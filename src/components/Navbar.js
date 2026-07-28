import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ProfileDropdown } from './ProfileDropdown';

export const Navbar = () => {
  const { isAuthenticated, user } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const totalItemsCount = cart ? cart.length : 0;
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'ROLE_ADMIN';
  const logoRedirectPath = isAdmin ? '/admin' : '/';

  return (
    <header className="fixed top-0 left-0 right-0 w-full bg-[#070914]/90 backdrop-blur-md border-b border-white/10 z-50 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-2 gap-4">
        {/* Logo */}
        <Link to={logoRedirectPath} className="flex-shrink-0 flex items-center">
          <img src="/images/logo.png" alt="EventDeco Logo" className="h-16 sm:h-20 lg:h-24 w-auto object-contain transition-all duration-300 hover:scale-[1.03]" />
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
            className="relative flex items-center justify-center p-2 text-white hover:text-amber-400 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-colors"
            title="Cart"
          >
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-black text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border border-[#070914] shadow-md animate-in zoom-in duration-300">
                {totalItemsCount}
              </span>
            )}
          </Link>

          {/* Login / Profile Dropdown */}
          {!isAuthenticated ? (
            <Link
              to="/login"
              className="text-white hover:text-amber-400 border border-white/30 hover:border-amber-400 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors"
            >
              Login
            </Link>
          ) : (
            <ProfileDropdown />
          )}
        </div>
      </div>
    </header>
  );
};
