import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, User, Settings, Layout, LogOut, HelpCircle, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ProfileSettingsModal } from './ProfileSettingsModal';

export const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const itemRefs = useRef([]);

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'ROLE_ADMIN' || user?.role?.toUpperCase() === 'STAFF' || user?.role?.toUpperCase() === 'ROLE_STAFF';

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    setFocusedIndex(-1);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation inside dropdown
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
        return;
      }

      const menuItemsCount = dropdownItems.length;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (focusedIndex + 1) % menuItemsCount;
        setFocusedIndex(nextIndex);
        itemRefs.current[nextIndex]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = (focusedIndex - 1 + menuItemsCount) % menuItemsCount;
        setFocusedIndex(prevIndex);
        itemRefs.current[prevIndex]?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, focusedIndex]);

  if (!user) return null;

  // Compute Display Name and Initials
  const displayName = user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
  const getInitials = () => {
    if (user.firstName) {
      const f = user.firstName.charAt(0);
      const l = user.lastName ? user.lastName.charAt(0) : '';
      return (f + l).toUpperCase();
    }
    const names = displayName.split(' ');
    const f = names[0] ? names[0].charAt(0) : '';
    const l = names[1] ? names[1].charAt(0) : '';
    return (f + l).toUpperCase() || 'U';
  };

  const handleSignOut = () => {
    setIsOpen(false);
    logout();
    navigate('/');
  };

  // Dropdown Items configuration
  const dropdownItems = [
    {
      label: 'My Profile',
      icon: User,
      action: () => {
        setIsSettingsOpen(true);
        setIsOpen(false);
      }
    },
    {
      label: 'Account Settings',
      icon: Settings,
      action: () => {
        setIsSettingsOpen(true);
        setIsOpen(false);
      }
    },
    ...(isAdmin ? [{
      label: 'Admin Dashboard',
      icon: Layout,
      action: () => {
        navigate('/admin');
        setIsOpen(false);
      }
    }] : [{
      label: 'My Bookings',
      icon: Layout,
      action: () => {
        navigate('/bookings');
        setIsOpen(false);
      }
    }]),
    {
      label: 'Notifications',
      icon: Bell,
      action: () => {
        navigate(isAdmin ? '/admin' : '/bookings');
        setIsOpen(false);
      }
    },
    {
      label: 'Help & Support',
      icon: HelpCircle,
      action: () => {
        navigate('/#contact');
        setIsOpen(false);
      }
    },
    {
      label: 'Sign Out',
      icon: LogOut,
      action: handleSignOut,
      danger: true
    }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        ref={triggerRef}
        onClick={toggleDropdown}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex items-center space-x-2 sm:space-x-3 p-1.5 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
      >
        {/* Avatar */}
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-extrabold text-xs sm:text-sm border border-white/10 shadow-md overflow-hidden flex-shrink-0">
          {user.profileImage ? (
            <img src={user.profileImage} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            getInitials()
          )}
        </div>

        {/* Display Name & Chevron */}
        <div className="hidden md:flex flex-col items-start text-left pr-1 leading-tight">
          <span className="text-white text-xs sm:text-sm font-semibold max-w-[100px] truncate">
            {displayName}
          </span>
          <span className="text-[10px] text-slate-400 font-medium capitalize">
            {user.role?.replace('ROLE_', '').toLowerCase()}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-label="User menu"
          className="absolute right-0 mt-2.5 w-60 bg-[#0a0d21]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Identity Header */}
          <div className="px-4 py-2.5 flex items-center space-x-3 border-b border-white/10 mb-1.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-extrabold text-sm border border-white/10 overflow-hidden flex-shrink-0">
              {user.profileImage ? (
                <img src={user.profileImage} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                getInitials()
              )}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-white text-sm font-bold truncate leading-tight">
                {displayName}
              </span>
              <span className="text-[11px] text-slate-400 truncate">
                {user.email}
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-0.5 px-1.5">
            {dropdownItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  ref={(el) => (itemRefs.current[index] = el)}
                  role="menuitem"
                  tabIndex={isOpen ? 0 : -1}
                  onClick={item.action}
                  className={`w-full flex items-center px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all text-left focus:outline-none focus:bg-white/5 cursor-pointer ${
                    item.danger
                      ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-2.5 ${item.danger ? 'text-red-400' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Profile/Settings Edit Modal */}
      <ProfileSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
