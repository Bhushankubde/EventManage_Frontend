import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Users, DollarSign, Package, TrendingUp, Calendar } from 'lucide-react';
import { SEO } from '../components/SEO';
import { LoadingSpinner } from '../components/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Let's assume the API returns stats data
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  // Default fallback stats if backend doesn't provide them yet
  const displayStats = stats || {
    totalRevenue: 0,
    totalBookings: 0,
    activeItems: 0,
    newCustomers: 0
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in">
      <SEO title="Admin Dashboard" description="Manage EventDeco rentals and sales." />

      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-8">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-panel p-6 rounded-2xl flex items-center">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg mr-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Revenue</p>
            <h3 className="text-2xl font-bold">${displayStats.totalRevenue.toFixed(2)}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg mr-4">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Bookings</p>
            <h3 className="text-2xl font-bold">{displayStats.totalBookings}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg mr-4">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Active Items</p>
            <h3 className="text-2xl font-bold">{displayStats.activeItems}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-lg mr-4">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">New Customers</p>
            <h3 className="text-2xl font-bold">{displayStats.newCustomers}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <a href="/offline-sales" className="p-4 bg-muted border border-border rounded-xl text-center hover:bg-muted/80 transition-colors">
              <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
              <span className="font-medium">Record Offline Sale</span>
            </a>
            <a href="/bookings" className="p-4 bg-muted border border-border rounded-xl text-center hover:bg-muted/80 transition-colors">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
              <span className="font-medium">View All Bookings</span>
            </a>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <p className="text-muted-foreground text-sm">Dashboard metrics visualization will be implemented here.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
//more changes in this component

