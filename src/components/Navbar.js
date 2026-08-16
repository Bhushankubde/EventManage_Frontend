import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ProfileDropdown } from './ProfileDropdown';
import { toast } from 'sonner';
import { api } from '../services/api';

export const Navbar = () => {
  const { isAuthenticated, user } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const totalItemsCount = cart ? cart.length : 0;
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewNotif, setHasNewNotif] = useState(false);

  const loadUserNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.getUserNotifications();
      const notifs = res || [];
      setNotifications(notifs);

      // seen tracking
      const seenIds = JSON.parse(localStorage.getItem('eventdeco_seen_notifications') || '[]');
      const unseen = notifs.filter(n => n.id && !seenIds.includes(n.id));
      setUnreadCount(unseen.length);
      setHasNewNotif(unseen.length > 0);
    } catch (err) {
      console.error("Failed to load user notifications", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadUserNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setHasNewNotif(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleNewNotification = (e) => {
      const notif = e.detail;
      setNotifications(prev => {
        const next = [notif, ...prev];
        const seenIds = JSON.parse(localStorage.getItem('eventdeco_seen_notifications') || '[]');
        const unseen = next.filter(n => n.id && !seenIds.includes(n.id));
        setUnreadCount(unseen.length);
        setHasNewNotif(unseen.length > 0);
        return next;
      });
      
      toast.success(notif.message, {
        description: "System Alert",
        duration: 6000
      });
    };

    window.addEventListener('new-notification', handleNewNotification);
    return () => window.removeEventListener('new-notification', handleNewNotification);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsMobileMenuOpen(false);
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'ROLE_ADMIN';
  const logoRedirectPath = isAdmin ? '/admin' : '/';

  return (
    <header className="fixed top-0 left-0 right-0 w-full bg-[#070914]/95 backdrop-blur-md border-b border-white/10 z-50 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-1.5 md:py-2 gap-4">
        {/* Logo */}
        <Link to={logoRedirectPath} className="flex-shrink-0 flex items-center">
          <img src="/images/logo.png" alt="EventDeco Logo" className="h-10 sm:h-14 md:h-18 lg:h-22 w-auto object-contain transition-all duration-300 hover:scale-[1.03]" />
        </Link>

        {/* Navigation Links (Desktop) */}
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
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Search Bar (Desktop) */}
          <form onSubmit={handleSearchSubmit} className="relative hidden sm:flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search decor, DJ, chairs..."
              className="bg-white/10 border border-white/20 text-white placeholder-gray-400 text-xs sm:text-sm rounded-full pl-9 pr-4 py-1.5 focus:outline-none focus:border-amber-400 w-32 md:w-56 transition-all"
            />
          </form>

          {/* Cart */}
          <Link
            to="/cart"
            onClick={() => setIsMobileMenuOpen(false)}
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

          {/* Notifications Bell */}
          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={() => {
                  const nextShow = !showDropdown;
                  setShowDropdown(nextShow);
                  if (nextShow) {
                    const seenIds = JSON.parse(localStorage.getItem('eventdeco_seen_notifications') || '[]');
                    const currentIds = notifications.map(n => n.id).filter(Boolean);
                    const updatedSeenIds = Array.from(new Set([...seenIds, ...currentIds]));
                    localStorage.setItem('eventdeco_seen_notifications', JSON.stringify(updatedSeenIds));
                    setUnreadCount(0);
                    setHasNewNotif(false);
                  }
                }}
                className="relative flex items-center justify-center p-2 text-white hover:text-amber-400 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className={`w-4 h-4 sm:w-5 sm:h-5 ${hasNewNotif ? 'animate-pulse text-amber-400' : ''}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-black text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border border-[#070914] shadow-md animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-[#0f1224] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-white/5 bg-white/2 flex justify-between items-center">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Alerts & Notifications</h4>
                    <button
                      onClick={() => { setNotifications([]); setUnreadCount(0); setShowDropdown(false); }}
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-white/5">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">No new notifications.</p>
                    ) : (
                      notifications.map((notif, index) => (
                        <div key={index} className="p-4 hover:bg-white/2 transition-colors">
                          <p className="text-xs text-slate-200 leading-relaxed font-medium">{notif.message}</p>
                          <span className="text-[9px] text-slate-500 block mt-1">
                            {new Date(notif.createdAt || new Date()).toLocaleTimeString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

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

          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center justify-center p-2 text-white hover:text-amber-400 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#070914] border-t border-white/10 px-4 py-4 space-y-4 animate-in slide-in-from-top duration-300">
          {/* Mobile Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
            <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search decor, DJ, chairs..."
              className="bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm rounded-full pl-9 pr-4 py-2 focus:outline-none focus:border-amber-400 w-full"
            />
          </form>

          {/* Mobile Navigation Links */}
          <div className="flex flex-col space-y-3">
            <Link
              to="/catalog"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white hover:text-amber-400 text-sm font-semibold transition-colors py-1.5 border-b border-white/5"
            >
              Categories
            </Link>
            <Link
              to="/catalog"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white hover:text-amber-400 text-sm font-semibold transition-colors py-1.5 border-b border-white/5"
            >
              Gallery
            </Link>
            <Link
              to="/#about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white hover:text-amber-400 text-sm font-semibold transition-colors py-1.5 border-b border-white/5"
            >
              About
            </Link>
            <Link
              to="/#contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white hover:text-amber-400 text-sm font-semibold transition-colors py-1.5"
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
