import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

export const Navbar = () => {
  return (
    <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-4 bg-black/60 z-40">
      <Link to="/">
        <img src="/images/logo.png" alt="EventDeco Logo" className="h-24 w-auto object-contain" />
      </Link>
      <div className="flex items-center space-x-8">
        <Link to="/catalog" className="text-white hover:text-amber-400 text-lg font-medium transition-colors">Browse Items</Link>
        <Link to="/admin" className="flex items-center text-white hover:text-amber-400 text-lg font-medium transition-colors">Admin</Link>
        <Link to="/offline-sales" className="text-white hover:text-amber-400 text-lg font-medium transition-colors">Offline Sales</Link>
        <Link to="/cart" className="flex items-center text-white hover:text-amber-400 text-lg font-medium transition-colors">
          <ShoppingCart className="w-6 h-6" />
        </Link>
      </div>
    </div>
  );
};
