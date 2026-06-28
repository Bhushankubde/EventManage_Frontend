import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Users, DollarSign, Package, TrendingUp, Calendar, Box, Tag, LayoutDashboard } from 'lucide-react';
import { SEO } from '../components/SEO';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { InventoryManager } from '../components/admin/InventoryManager';
import { CategoryManager } from '../components/admin/CategoryManager';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const displayStats = stats || {
    totalRevenue: 0,
    totalBookings: 0,
    activeItems: 0,
    newCustomers: 0
  };

  const renderOverview = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-8 border border-destructive/20">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-panel p-6 rounded-2xl flex items-center border border-border">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl mr-4 border border-blue-500/20">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Revenue</p>
            <h3 className="text-2xl font-bold">${displayStats.totalRevenue.toFixed(2)}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center border border-border">
          <div className="p-3 bg-green-500/10 text-green-500 rounded-xl mr-4 border border-green-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Bookings</p>
            <h3 className="text-2xl font-bold">{displayStats.totalBookings}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center border border-border">
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl mr-4 border border-purple-500/20">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Active Items</p>
            <h3 className="text-2xl font-bold">{displayStats.activeItems}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center border border-border">
          <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl mr-4 border border-orange-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">New Customers</p>
            <h3 className="text-2xl font-bold">{displayStats.newCustomers}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-6 rounded-2xl border border-border">
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <a href="/offline-sales" className="p-6 bg-muted/30 border border-border rounded-xl text-center hover:bg-muted/60 transition-colors group">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <span className="font-medium">Record Offline Sale</span>
            </a>
            <a href="/bookings" className="p-6 bg-muted/30 border border-border rounded-xl text-center hover:bg-muted/60 transition-colors group">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <span className="font-medium">View All Bookings</span>
            </a>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-border">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="flex h-40 items-center justify-center border-2 border-dashed border-border rounded-xl">
            <p className="text-muted-foreground text-sm">Dashboard metrics visualization will be implemented here.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory / Listings', icon: Box },
    { id: 'categories', label: 'Categories', icon: Tag },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-background">
      <SEO title="Admin Dashboard" description="Manage EventDeco rentals and sales." />
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 glass-panel md:border-r border-border md:min-h-full flex-shrink-0 z-10 relative md:rounded-none">
        <div className="p-6 md:sticky md:top-20">
          <h1 className="text-2xl font-bold mb-8 hidden md:block bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">Admin Portal</h1>
          <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto pb-2 md:pb-0">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 whitespace-nowrap ${
                    isActive 
                      ? 'bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/25 scale-100' 
                      : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'opacity-100' : 'opacity-70'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 overflow-x-hidden">
        {loading && activeTab === 'overview' ? (
          <div className="h-full flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'inventory' && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <InventoryManager />
              </div>
            )}
            {activeTab === 'categories' && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <CategoryManager />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;

