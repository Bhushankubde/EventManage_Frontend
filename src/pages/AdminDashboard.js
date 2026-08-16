import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SEO } from '../components/SEO';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { InventoryManager } from '../components/admin/InventoryManager';
import { CategoryManager } from '../components/admin/CategoryManager';
import {
  Users, DollarSign, Package, TrendingUp, Calendar, Box, Tag,
  LayoutDashboard, ShoppingBag, Bell, FileText, Settings, Shield,
  Activity, Percent, Star, Menu, X, ChevronRight, Plus, Edit2,
  Trash2, RefreshCw, Check, AlertTriangle, Eye, CreditCard, Info, Truck,
  Phone, MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Tab State Collections
  const [usersList, setUsersList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
  const [vendorsList, setVendorsList] = useState([]);
  const [couponsList, setCouponsList] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [notificationsList, setNotificationsList] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [systemSettings, setSystemSettings] = useState([]);
  const [cmsList, setCmsList] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [offlineSalesList, setOfflineSalesList] = useState([]);

  // Form Modals / Temp States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'vendor', 'coupon', 'cms', 'setting'
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [activeTab]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const notifs = await api.getNotifications();
        setNotificationsList(notifs || []);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };
    loadNotifications();

    const token = localStorage.getItem('eventdeco_admin_token');
    if (!token) return;

    const socketUrl = `ws://localhost:8080/ws/notifications?token=${token}`;
    const ws = new WebSocket(socketUrl);

    ws.onopen = () => {
      console.log("Connected to notification WebSocket server");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'HANDSHAKE') {
          console.log("Handshake acknowledged:", data.message);
          return;
        }
        if (data.type === 'INVENTORY_UPDATE') {
          console.log("Inventory update ignored in admin notification console:", data);
          return;
        }

        setNotificationsList((prev) => [data, ...prev]);

        toast.success(data.message, {
          description: new Date(data.createdAt || new Date()).toLocaleTimeString(),
          duration: 6000
        });
      } catch (err) {
        console.error("Failed to parse WebSocket message", err);
      }
    };

    ws.onclose = (event) => {
      console.log("Notification WebSocket disconnected:", event.reason);
    };

    ws.onerror = (err) => {
      console.error("WebSocket connection error:", err);
    };

    return () => {
      ws.close();
    };
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'overview') {
        const statsData = await api.getDashboardStats();
        setStats(statsData);
      } else if (activeTab === 'users') {
        const users = await api.getAdminUsers();
        setUsersList(users || []);
      } else if (activeTab === 'orders') {
        const orders = await api.getOrders();
        setOrdersList(orders || []);
      } else if (activeTab === 'bookings') {
        const bookings = await api.getBookings();
        setBookingsList(bookings || []);
      } else if (activeTab === 'vendors') {
        const vendors = await api.getVendors();
        setVendorsList(vendors || []);
      } else if (activeTab === 'coupons') {
        const coupons = await api.getCoupons();
        setCouponsList(coupons || []);
      } else if (activeTab === 'reviews') {
        const reviews = await api.getReviews();
        setReviewsList(reviews || []);
      } else if (activeTab === 'notifications') {
        const notifs = await api.getNotifications();
        setNotificationsList(notifs || []);
      } else if (activeTab === 'cms') {
        const cms = await api.getCmsContent();
        setCmsList(cms || []);
      } else if (activeTab === 'audit') {
        const logs = await api.getActivityLogs();
        setActivityLogs(logs || []);
      } else if (activeTab === 'settings') {
        const settings = await api.getSystemSettings();
        setSystemSettings(settings || []);
      } else if (activeTab === 'reports') {
        const [items, categories, orders, offlineSales] = await Promise.all([
          api.getItems(),
          api.getCategories(),
          api.getOrders(),
          api.getOfflineSales()
        ]);
        setItemsList(items || []);
        setCategoriesList(categories || []);
        setOrdersList(orders || []);
        setOfflineSalesList(offlineSales || []);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to retrieve active tab details.');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ACTION HANDLERS
  // ==========================================
  const handleBookingStatusChange = async (bookingId, status) => {
    try {
      await api.updateBookingStatus(bookingId, status);
      toast.success(`Booking status updated to ${status}`);
      // Refresh
      const bookings = await api.getBookings();
      setBookingsList(bookings || []);
    } catch (err) {
      toast.error(err.message || 'Failed to update booking status.');
    }
  };

  const handleUserRoleChange = async (userId, role) => {
    try {
      await api.updateUserRole(userId, role);
      toast.success(`User role updated to ${role}`);
      const users = await api.getAdminUsers();
      setUsersList(users || []);
    } catch (err) {
      toast.error(err.message || 'Failed to update user role.');
    }
  };

  const handleUserDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    try {
      await api.deleteUser(userId);
      toast.success('User deleted successfully.');
      const users = await api.getAdminUsers();
      setUsersList(users || []);
    } catch (err) {
      toast.error(err.message || 'Failed to delete user.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.deleteReview(reviewId);
      toast.success('Review deleted.');
      const reviews = await api.getReviews();
      setReviewsList(reviews || []);
    } catch (err) {
      toast.error(err.message || 'Failed to delete review.');
    }
  };

  const handleMarkNotificationsRead = async () => {
    try {
      await api.markNotificationsRead();
      toast.success('All notifications marked as read.');
      const notifs = await api.getNotifications();
      setNotificationsList(notifs || []);
    } catch (err) {
      toast.error(err.message || 'Failed to update notifications.');
    }
  };

  const handleMarkSingleRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotificationsList((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readStatus: true } : n))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update notification.');
    }
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'vendor') {
        if (editItem) {
          await api.updateVendor(editItem.id, formData);
          toast.success('Vendor updated successfully.');
        } else {
          await api.createVendor(formData);
          toast.success('Vendor added successfully.');
        }
      } else if (modalType === 'coupon') {
        if (editItem) {
          await api.updateCoupon(editItem.id, formData);
          toast.success('Coupon updated successfully.');
        } else {
          await api.createCoupon(formData);
          toast.success('Coupon added successfully.');
        }
      } else if (modalType === 'cms') {
        await api.saveCmsContent(formData);
        toast.success('CMS content saved successfully.');
      } else if (modalType === 'setting') {
        await api.saveSystemSetting(formData);
        toast.success('System setting saved successfully.');
      }
      setIsModalOpen(false);
      fetchInitialData();
    } catch (err) {
      toast.error(err.message || 'Failed to save entity.');
    }
  };

  const openEditModal = (type, item = null) => {
    setModalType(type);
    setEditItem(item);
    if (item) {
      setFormData({ ...item });
    } else {
      if (type === 'vendor') {
        setFormData({ name: '', serviceType: 'DJ', email: '', phone: '', rating: 5.0, active: true });
      } else if (type === 'coupon') {
        setFormData({ code: '', discountAmount: '', discountType: 'PERCENTAGE', expiryDate: '', active: true, usageLimit: 100 });
      } else if (type === 'cms') {
        setFormData({ contentKey: '', title: '', contentHtml: '', category: 'FAQ' });
      } else if (type === 'setting') {
        setFormData({ settingKey: '', settingValue: '', description: '' });
      }
    }
    setIsModalOpen(true);
  };

  const handleDeleteEntity = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this?')) return;
    try {
      if (type === 'vendor') {
        await api.deleteVendor(id);
      } else if (type === 'coupon') {
        await api.deleteCoupon(id);
      }
      toast.success('Item deleted successfully.');
      fetchInitialData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete item.');
    }
  };

  // ==========================================
  // SIDEBAR ITEMS DEFINITIONS
  // ==========================================
  const menuGroups = [
    {
      title: 'Analytics & Core',
      items: [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'reports', label: 'Reports & Export', icon: TrendingUp },
        { id: 'audit', label: 'Activity Logs', icon: Activity },
      ]
    },
    {
      title: 'Catalog & Staging',
      items: [
        { id: 'products', label: 'Products / Items', icon: Box },
        { id: 'categories', label: 'Categories', icon: Tag },
        { id: 'vendors', label: 'Vendors / Staging', icon: Truck },
      ]
    },
    {
      title: 'Operations',
      items: [
        { id: 'bookings', label: 'Bookings / Services', icon: Calendar },
        { id: 'orders', label: 'Orders & Payments', icon: ShoppingBag },
        { id: 'payments', label: 'Transactions Ledger', icon: CreditCard },
        { id: 'coupons', label: 'Coupons / Promos', icon: Percent },
      ]
    },
    {
      title: 'Management & CMS',
      items: [
        { id: 'users', label: 'User Registry', icon: Users },
        { id: 'roles', label: 'Roles & Security', icon: Shield },
        { id: 'reviews', label: 'Review Moderation', icon: Star },
        { id: 'cms', label: 'CMS Content', icon: FileText },
        { id: 'notifications', label: 'System Alerts', icon: Bell },
        { id: 'settings', label: 'General Settings', icon: Settings },
      ]
    }
  ];

  // Helper to resolve breadcrumb titles
  const getBreadcrumbTitle = () => {
    for (const group of menuGroups) {
      const match = group.items.find(i => i.id === activeTab);
      if (match) return match.label;
    }
    return 'Admin Portal';
  };

  // ==========================================
  // RENDER DYNAMIC VIEWS
  // ==========================================

  // Tab 1: Dashboard Overview
  const renderOverview = () => {
    const displayStats = stats || {
      totalRevenue: 0,
      totalBookings: 0,
      activeItems: 0,
      newCustomers: 0
    };

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#0f1224] border border-white/5 p-6 rounded-2xl flex items-center shadow-xl">
            <div className="p-4 bg-amber-500/10 text-amber-500 rounded-xl mr-4 border border-amber-500/20">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-2xl font-extrabold text-white mt-1">₹{displayStats.totalRevenue.toLocaleString()}</h3>
            </div>
          </div>

          <div className="bg-[#0f1224] border border-white/5 p-6 rounded-2xl flex items-center shadow-xl">
            <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-xl mr-4 border border-emerald-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Bookings</p>
              <h3 className="text-2xl font-extrabold text-white mt-1">{displayStats.totalBookings}</h3>
            </div>
          </div>

          <div className="bg-[#0f1224] border border-white/5 p-6 rounded-2xl flex items-center shadow-xl">
            <div className="p-4 bg-indigo-500/10 text-indigo-500 rounded-xl mr-4 border border-indigo-500/20">
              <Box className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Active Catalog</p>
              <h3 className="text-2xl font-extrabold text-white mt-1">{displayStats.activeItems} Items</h3>
            </div>
          </div>

          <div className="bg-[#0f1224] border border-white/5 p-6 rounded-2xl flex items-center shadow-xl">
            <div className="p-4 bg-purple-500/10 text-purple-500 rounded-xl mr-4 border border-purple-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">New Customers</p>
              <h3 className="text-2xl font-extrabold text-white mt-1">{displayStats.newCustomers} Accounts</h3>
            </div>
          </div>
        </div>

        {/* Visual Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* SVG Monthly Revenue Chart */}
          <div className="lg:col-span-8 bg-[#0f1224] border border-white/5 p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Revenue Growth</h3>
                <p className="text-xs text-slate-400">Monthly gross sales overview</p>
              </div>
              <span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-xs font-semibold border border-amber-500/20">
                Live Server Data
              </span>
            </div>
            <div className="relative h-60 w-full pt-4">
              {/* Pure SVG Line Chart */}
              <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Horizontal grid lines */}
                <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <line x1="0" y1="150" x2="500" y2="150" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

                {/* Area path */}
                <path
                  d="M 0 170 C 50 160, 100 130, 150 140 C 200 150, 250 80, 300 70 C 350 60, 400 30, 450 40 C 475 45, 500 20, 500 20 L 500 190 L 0 190 Z"
                  fill="url(#gradient)"
                />

                {/* Line path */}
                <path
                  d="M 0 170 C 50 160, 100 130, 150 140 C 200 150, 250 80, 300 70 C 350 60, 400 30, 450 40 C 475 45, 500 20, 500 20"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3"
                />
              </svg>
              {/* X Axis Labels */}
              <div className="flex justify-between text-[10px] text-slate-400 pt-2 font-medium px-2">
                <span>Jan</span>
                <span>Mar</span>
                <span>May</span>
                <span>Jul</span>
                <span>Sep</span>
                <span>Nov</span>
                <span>Dec</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="lg:col-span-4 bg-[#0f1224] border border-white/5 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">Quick Actions</h3>
              <p className="text-xs text-slate-400 mb-6 font-medium">Frequent operator events</p>
            </div>
            <div className="space-y-4">
              <a href="/offline-sales" className="flex items-center p-3.5 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-amber-500/30 transition-all group">
                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center mr-3 group-hover:scale-105 transition-transform text-amber-500 border border-amber-500/20">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-sm block">Record Walk-in Sale</span>
                  <span className="text-[11px] text-slate-400">Offline cashier transaction invoice</span>
                </div>
              </a>

              <button onClick={() => setActiveTab('bookings')} className="w-full text-left flex items-center p-3.5 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-amber-500/30 transition-all group">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mr-3 group-hover:scale-105 transition-transform text-emerald-500 border border-emerald-500/20">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-sm block">Pending Reservations</span>
                  <span className="text-[11px] text-slate-400">Confirm/Transition active services</span>
                </div>
              </button>

              <button onClick={() => setActiveTab('notifications')} className="w-full text-left flex items-center p-3.5 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-amber-500/30 transition-all group">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mr-3 group-hover:scale-105 transition-transform text-purple-500 border border-purple-500/20">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-sm block">System Alerts</span>
                  <span className="text-[11px] text-slate-400">Stock shortages & order warnings</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Tab 2: User Management Registry
  const renderUsers = () => {
    return (
      <div className="bg-[#0f1224] border border-white/5 rounded-2xl overflow-hidden shadow-xl animate-in fade-in duration-300">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2">
          <div>
            <h3 className="text-lg font-bold">User Registry</h3>
            <p className="text-xs text-slate-400">Manage global system administrators, staff and customers</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-white/5">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Role Status</th>
                <th className="p-4">Creation Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {usersList.map(u => (
                <tr key={u.id} className="hover:bg-white/2 transition-colors">
                  <td className="p-4 font-bold">{u.firstName} {u.lastName}</td>
                  <td className="p-4 text-slate-300">{u.email}</td>
                  <td className="p-4 text-slate-400">{u.phone || 'N/A'}</td>
                  <td className="p-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleUserRoleChange(u.id, e.target.value)}
                      disabled={u.email === user?.email}
                      className="bg-[#070914] border border-white/10 text-white rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="STAFF">Staff</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="p-4 text-slate-400">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleUserDelete(u.id)}
                      disabled={u.email === user?.email}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Remove Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {usersList.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">No users found in database.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Tab 3: Vendor Registry
  const renderVendors = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold">Staging & Vendor Directory</h3>
            <p className="text-xs text-slate-400">Authorized event decorators, catering services and support teams</p>
          </div>
          <button
            onClick={() => openEditModal('vendor')}
            className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Register Vendor
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendorsList.map(v => (
            <div key={v.id} className="bg-[#0f1224] border border-white/5 p-6 rounded-2xl flex flex-col justify-between hover:border-amber-500/20 transition-all shadow-xl">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-lg">{v.name}</h4>
                    <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px] text-slate-300 font-semibold tracking-wide uppercase">
                      {v.serviceType}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${v.active ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    {v.active ? 'Active' : 'Suspended'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 space-y-1 pt-2">
                  <p>Email: <span className="text-slate-200">{v.email || 'N/A'}</span></p>
                  <p>Phone: <span className="text-slate-200">{v.phone || 'N/A'}</span></p>
                  <p className="flex items-center">
                    Rating: <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 mx-1" />
                    <span className="text-slate-200 font-bold">{v.rating}</span>
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-6 mt-6 border-t border-white/5">
                <button
                  onClick={() => openEditModal('vendor', v)}
                  className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg hover:text-white transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteEntity('vendor', v.id)}
                  className="p-1.5 bg-white/5 hover:bg-red-500/20 text-slate-300 hover:text-red-500 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {vendorsList.length === 0 && (
            <div className="col-span-full p-8 text-center bg-[#0f1224] border border-dashed border-white/10 rounded-2xl text-slate-400">
              No staging vendors registered yet. Add a partner to begin.
            </div>
          )}
        </div>
      </div>
    );
  };

  // Tab 4: Booking Registry
  const renderBookings = () => {
    return (
      <div className="bg-[#0f1224] border border-white/5 rounded-2xl overflow-hidden shadow-xl animate-in fade-in duration-300">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-lg font-bold">Client Booking Logs</h3>
          <p className="text-xs text-slate-400">Monitor upcoming decoration rentals, event venues, and handle order status transitions</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-white/5">
                <th className="p-4">Booking Number / ID</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Event Details</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Operational Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {bookingsList.map(b => (
                <tr key={b.id} className="hover:bg-white/2 transition-colors">
                  <td className="p-4 font-bold text-amber-500">{b.bookingNumber || `#${b.id.substring(0, 8)}`}</td>
                  <td className="p-4 text-xs">
                    <p className="font-semibold text-white text-sm">{b.fullName || `${b.user?.firstName || 'Guest'} ${b.user?.lastName || ''}`.trim()}</p>
                    <p className="text-slate-400 mt-0.5">WhatsApp: <strong className="text-emerald-400">{b.whatsAppNumber || b.user?.phone || 'N/A'}</strong></p>
                    {b.email && <p className="text-slate-500">{b.email}</p>}
                  </td>
                  <td className="p-4">
                    <p className="text-white font-medium">{new Date(b.eventDate).toLocaleDateString()} @ {b.eventTime}</p>
                    <p className="text-xs text-slate-400 truncate max-w-xs">{b.eventLocation}</p>
                  </td>
                  <td className="p-4 font-bold text-white">₹{b.totalAmount}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      b.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                      b.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      b.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-slate-500/10 text-slate-400 border-white/5'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                    {/* View Details */}
                    <button
                      onClick={() => { setSelectedBooking(b); setIsBookingModalOpen(true); }}
                      className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg border border-white/5 transition-all inline-flex items-center justify-center"
                      title="View Booking Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {/* Open WhatsApp */}
                    {(b.whatsAppNumber || b.user?.phone) && (
                      <a
                        href={`https://wa.me/${(b.whatsAppNumber || b.user?.phone).replace(/\+/g, '').replace(/[-\s]/g, '').trim()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/20 transition-all inline-flex items-center justify-center"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-emerald-400/10" />
                      </a>
                    )}

                    {/* Call Customer */}
                    {(b.whatsAppNumber || b.user?.phone) && (
                      <a
                        href={`tel:${b.whatsAppNumber || b.user?.phone}`}
                        className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg border border-white/5 transition-all inline-flex items-center justify-center"
                        title="Call Customer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {/* Quick Approve/Reject buttons if Pending */}
                    {b.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleBookingStatusChange(b.id, 'APPROVED')}
                          className="px-2.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-[10px] rounded-lg transition-all uppercase tracking-wider inline-flex items-center"
                          title="Approve Booking"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleBookingStatusChange(b.id, 'REJECTED')}
                          className="px-2.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold text-[10px] rounded-lg transition-all uppercase tracking-wider inline-flex items-center"
                          title="Reject Booking"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {bookingsList.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">No event bookings registered.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Tab 5: Orders Registry
  const renderOrders = () => {
    return (
      <div className="bg-[#0f1224] border border-white/5 rounded-2xl overflow-hidden shadow-xl animate-in fade-in duration-300">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-lg font-bold">Client Order Logs</h3>
          <p className="text-xs text-slate-400">Review online checkout invoice reports and transaction receipts</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-white/5">
                <th className="p-4">Order ID</th>
                <th className="p-4">Placed By</th>
                <th className="p-4">Payment Info</th>
                <th className="p-4">Total Price</th>
                <th className="p-4">State</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {ordersList.map(o => (
                <tr key={o.id} className="hover:bg-white/2 transition-colors">
                  <td className="p-4 font-bold text-amber-500">#{o.id.substring(0, 8)}</td>
                  <td className="p-4">
                    <p className="font-semibold text-white">{o.customerName || 'Anonymous Client'}</p>
                    <p className="text-xs text-slate-400">{o.customerEmail || 'N/A'}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-white font-medium">{o.paymentMethod || 'Stripe'}</p>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-white">₹{o.totalAmount}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${o.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        o.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {ordersList.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">No checkout orders registered yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Tab 6: Coupons
  const renderCoupons = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold">Promotions & Coupons</h3>
            <p className="text-xs text-slate-400">Manage client discount codes, Fixed and Percentage offsets</p>
          </div>
          <button
            onClick={() => openEditModal('coupon')}
            className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Create Coupon
          </button>
        </div>

        <div className="bg-[#0f1224] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-white/5">
                  <th className="p-4">Coupon Code</th>
                  <th className="p-4">Discount Magnitude</th>
                  <th className="p-4">Expiry Date</th>
                  <th className="p-4">Usage Stats</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {couponsList.map(c => (
                  <tr key={c.id} className="hover:bg-white/2 transition-colors">
                    <td className="p-4 font-extrabold text-white text-md tracking-wider">{c.code}</td>
                    <td className="p-4 text-slate-200 font-semibold">
                      {c.discountType === 'PERCENTAGE' ? `${c.discountAmount}% OFF` : `₹${c.discountAmount} Flat`}
                    </td>
                    <td className="p-4 text-slate-400">{c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : 'Never Expires'}</td>
                    <td className="p-4 text-slate-300 font-medium">
                      {c.usageCount} / {c.usageLimit} claims
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${c.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {c.active ? 'Active' : 'Expired/Paused'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => openEditModal('coupon', c)}
                        className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg hover:text-white transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEntity('coupon', c.id)}
                        className="p-1.5 bg-white/5 hover:bg-red-500/20 text-slate-300 hover:text-red-500 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {couponsList.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">No promotion coupons configured.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Tab 7: Review Moderation
  const renderReviews = () => {
    return (
      <div className="bg-[#0f1224] border border-white/5 rounded-2xl overflow-hidden shadow-xl animate-in fade-in duration-300">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-lg font-bold">Review & Quality Moderation</h3>
          <p className="text-xs text-slate-400">Examine ratings left by user accounts on inventory equipment items</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-white/5">
                <th className="p-4">Product ID / Name</th>
                <th className="p-4">User</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Comment Review</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {reviewsList.map(r => (
                <tr key={r.id} className="hover:bg-white/2 transition-colors">
                  <td className="p-4">
                    <p className="font-semibold text-white">{r.item?.name || 'Equipment Item'}</p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[150px]">ID: {r.item?.id}</p>
                  </td>
                  <td className="p-4 text-slate-300">{r.user?.email || 'Guest Client'}</td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400 mr-1" />
                      <span className="font-bold">{r.rating}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-400 italic max-w-sm">"{r.comment}"</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteReview(r.id)}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/20"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {reviewsList.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">No client reviews registered.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Tab 8: Audit Logs
  const renderAudit = () => {
    return (
      <div className="bg-[#0f1224] border border-white/5 rounded-2xl overflow-hidden shadow-xl animate-in fade-in duration-300">
        <div className="p-6 border-b border-white/5 bg-white/2">
          <h3 className="text-lg font-bold">Security & Audit Logs</h3>
          <p className="text-xs text-slate-400">Historical records of staff interactions and ledger changes</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-white/5">
                <th className="p-4">Action Event</th>
                <th className="p-4">Staff Principal</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Operation Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {activityLogs.map(l => (
                <tr key={l.id} className="hover:bg-white/2 transition-colors">
                  <td className="p-4 font-bold text-amber-400 text-xs tracking-wider">{l.action}</td>
                  <td className="p-4 text-slate-300 font-semibold">{l.userEmail}</td>
                  <td className="p-4 text-slate-400">{new Date(l.timestamp).toLocaleString()}</td>
                  <td className="p-4 text-slate-300 max-w-sm">{l.details}</td>
                </tr>
              ))}
              {activityLogs.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-400">No activity logs recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Tab 9: System Settings
  const renderSettings = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold">System Global Settings</h3>
            <p className="text-xs text-slate-400">Control payment sandboxes, support contact emails and base store parameters</p>
          </div>
          <button
            onClick={() => openEditModal('setting')}
            className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Define Setting
          </button>
        </div>

        <div className="bg-[#0f1224] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-white/5">
                  <th className="p-4">Key Configuration</th>
                  <th className="p-4">Configuration Value</th>
                  <th className="p-4">Summary description</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {systemSettings.map(s => (
                  <tr key={s.id} className="hover:bg-white/2 transition-colors">
                    <td className="p-4 font-bold text-white">{s.settingKey}</td>
                    <td className="p-4 text-amber-500 font-mono">{s.settingValue}</td>
                    <td className="p-4 text-slate-400 max-w-sm">{s.description || 'No description provided.'}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openEditModal('setting', s)}
                        className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg hover:text-white transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {systemSettings.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-400">No settings found in database. Create one to begin.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Tab 10: CMS Content Manager
  const renderCms = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold">CMS Page Editor</h3>
            <p className="text-xs text-slate-400">Manage terms of service, safety policies, or general FAQ elements</p>
          </div>
          <button
            onClick={() => openEditModal('cms')}
            className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Content Block
          </button>
        </div>

        <div className="bg-[#0f1224] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-white/5">
                  <th className="p-4">CMS Key</th>
                  <th className="p-4">Title Heading</th>
                  <th className="p-4">Category Group</th>
                  <th className="p-4">HTML Body Preview</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {cmsList.map(c => (
                  <tr key={c.id} className="hover:bg-white/2 transition-colors">
                    <td className="p-4 font-bold text-amber-500">{c.contentKey}</td>
                    <td className="p-4 text-white font-semibold">{c.title || 'N/A'}</td>
                    <td className="p-4 text-slate-300">{c.category}</td>
                    <td className="p-4 text-slate-400 truncate max-w-xs">{c.contentHtml}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openEditModal('cms', c)}
                        className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg hover:text-white transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {cmsList.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400">No CMS pages added.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Tab 11: System Alerts
  const renderNotifications = () => {
    return (
      <div className="bg-[#0f1224] border border-white/5 rounded-2xl overflow-hidden shadow-xl animate-in fade-in duration-300">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2">
          <div>
            <h3 className="text-lg font-bold">System Warning Alerts</h3>
            <p className="text-xs text-slate-400">Trigger logs for product stock outages, client claims, or payment updates</p>
          </div>
          {notificationsList.some(n => !n.readStatus) && (
            <button
              onClick={handleMarkNotificationsRead}
              className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
            >
              Mark All as Read
            </button>
          )}
        </div>
        <div className="p-6 space-y-4">
          {notificationsList.map(n => (
            <div key={n.id} className={`p-4 border rounded-xl flex justify-between items-center transition-all ${n.readStatus ? 'bg-white/2 border-white/5 opacity-60' : 'bg-amber-500/5 border-amber-500/20 shadow-md'
              }`}>
              <div className="flex items-center space-x-3">
                <Info className={`w-5 h-5 ${n.readStatus ? 'text-slate-500' : 'text-amber-500'}`} />
                <div>
                  <p className={`text-sm ${n.readStatus ? 'text-slate-300' : 'text-white font-bold'}`}>{n.message}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              </div>
              {!n.readStatus && (
                <button
                  onClick={() => handleMarkSingleRead(n.id)}
                  className="bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[10px] font-bold px-2.5 py-1 rounded-lg border border-white/5 transition-all"
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))}
          {notificationsList.length === 0 && (
            <p className="text-center text-slate-400 py-6">No notifications logs recorded.</p>
          )}
        </div>
      </div>
    );
  };

  // Tab 12: Reports & Analytics
  const renderReports = () => {
    // 1. Service Breakdown by categories
    const categoryStats = categoriesList.map(cat => {
      const catItems = itemsList.filter(item => item.categoryId === cat.id);
      const count = catItems.length;
      const percentage = itemsList.length > 0 ? Math.round((count / itemsList.length) * 100) : 0;
      return {
        name: cat.name,
        count,
        percentage
      };
    });

    // Sort by count desc
    categoryStats.sort((a, b) => b.count - a.count);

    // 2. Ledger Collections Ratio
    const onlineTotal = ordersList.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const offlineTotal = offlineSalesList.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const grandTotal = onlineTotal + offlineTotal;
    const onlinePercentage = grandTotal > 0 ? Math.round((onlineTotal / grandTotal) * 100) : 50;
    const offlinePercentage = grandTotal > 0 ? Math.round((offlineTotal / grandTotal) * 100) : 50;

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="bg-[#0f1224] border border-white/5 p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-lg font-bold">General Business Reports</h3>
          <p className="text-xs text-slate-400">Download system transaction exports in CSV format</p>
          <div className="flex space-x-4 pt-4">
            <button
              onClick={() => {
                toast.success('Simulation: Exporting Order Logs to CSV completed.');
              }}
              className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md"
            >
              Export Order Logs (CSV)
            </button>
            <button
              onClick={() => {
                toast.success('Simulation: Exporting Booking Calendar reports completed.');
              }}
              className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
            >
              Export Rental Reports (CSV)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0f1224] border border-white/5 p-6 rounded-2xl shadow-xl">
            <h4 className="font-bold text-md mb-2">Service Breakdown</h4>
            <p className="text-xs text-slate-400 mb-4">Distribution of items across categories</p>
            <div className="space-y-4 pt-2">
              {categoryStats.map((stat, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>{stat.name} ({stat.count} items)</span>
                    <span className="text-amber-500">{stat.percentage}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${stat.percentage}%` }} />
                  </div>
                </div>
              ))}
              {categoryStats.length === 0 && (
                <p className="text-xs text-slate-400">No category breakdown available.</p>
              )}
            </div>
          </div>

          <div className="bg-[#0f1224] border border-white/5 p-6 rounded-2xl shadow-xl">
            <h4 className="font-bold text-md mb-2">Ledger Collections Ratio</h4>
            <p className="text-xs text-slate-400 mb-4">Online checkout orders vs Offline Walk-in sales volume</p>
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span>Online Payments (Stripe) - ₹{onlineTotal.toLocaleString()}</span>
                  <span className="text-emerald-500">{onlinePercentage}%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${onlinePercentage}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span>Offline Payments (Cash/Transfer) - ₹{offlineTotal.toLocaleString()}</span>
                  <span className="text-amber-500">{offlinePercentage}%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${offlinePercentage}%` }} />
                </div>
              </div>
              <div className="pt-2 border-t border-white/5 mt-2 flex justify-between items-center text-xs font-bold">
                <span>Total Billing Combined</span>
                <span className="text-white text-sm">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Tab 13: Transactions Ledger
  const renderPayments = () => {
    return (
      <div className="bg-[#0f1224] border border-white/5 rounded-2xl overflow-hidden shadow-xl animate-in fade-in duration-300">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-lg font-bold">Transactions & Cash Ledger</h3>
          <p className="text-xs text-slate-400">Integrated audit report of completed credit charges, bank transitions, and deposits</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-white/5">
                <th className="p-4">Reference ID</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Client email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {ordersList.map(o => (
                <tr key={o.id} className="hover:bg-white/2 transition-colors">
                  <td className="p-4 font-bold text-amber-500">ONLINE_ORDER_{o.id.substring(0, 6)}</td>
                  <td className="p-4 text-slate-300">{o.paymentMethod || 'Stripe'}</td>
                  <td className="p-4">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[11px] font-bold">
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-white">₹{o.totalAmount}</td>
                  <td className="p-4 text-slate-400">{o.customerEmail || 'N/A'}</td>
                </tr>
              ))}
              {ordersList.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">No payment records located.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Tab 14: Roles & Permissions
  const renderRoles = () => {
    return (
      <div className="bg-[#0f1224] border border-white/5 rounded-2xl overflow-hidden shadow-xl animate-in fade-in duration-300">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-lg font-bold">Role & Security Policy Permissions</h3>
          <p className="text-xs text-slate-400">Configure global permission scopes for ADMIN, STAFF and standard CUSTOMER</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="border border-white/5 rounded-xl p-5 bg-white/2">
            <h4 className="font-bold text-white mb-4">Admin Security Scope (Default settings)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <label className="flex items-center space-x-2 text-xs font-semibold">
                <input type="checkbox" defaultChecked disabled className="rounded bg-[#070914] border-white/25 text-amber-500 focus:ring-amber-500" />
                <span>Manage Inventory (CRUD)</span>
              </label>
              <label className="flex items-center space-x-2 text-xs font-semibold">
                <input type="checkbox" defaultChecked disabled className="rounded bg-[#070914] border-white/25 text-amber-500 focus:ring-amber-500" />
                <span>Adjust Client Roles</span>
              </label>
              <label className="flex items-center space-x-2 text-xs font-semibold">
                <input type="checkbox" defaultChecked disabled className="rounded bg-[#070914] border-white/25 text-amber-500 focus:ring-amber-500" />
                <span>View Order Invoices</span>
              </label>
            </div>
          </div>
          <div className="border border-white/5 rounded-xl p-5 bg-white/2">
            <h4 className="font-bold text-white mb-4">Staff Security Scope</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <label className="flex items-center space-x-2 text-xs font-semibold">
                <input type="checkbox" defaultChecked disabled className="rounded bg-[#070914] border-white/25 text-amber-500 focus:ring-amber-500" />
                <span>Add Offline Sales</span>
              </label>
              <label className="flex items-center space-x-2 text-xs font-semibold">
                <input type="checkbox" defaultChecked disabled className="rounded bg-[#070914] border-white/25 text-amber-500 focus:ring-amber-500" />
                <span>Register Walk-in Customers</span>
              </label>
              <label className="flex items-center space-x-2 text-xs font-semibold">
                <input type="checkbox" disabled className="rounded bg-[#070914] border-white/25 text-amber-500 focus:ring-amber-500" />
                <span>Delete Categories</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Helper to choose view renderer
  const renderActiveView = () => {
    if (activeTab === 'overview') return renderOverview();
    if (activeTab === 'users') return renderUsers();
    if (activeTab === 'vendors') return renderVendors();
    if (activeTab === 'products') return <InventoryManager />;
    if (activeTab === 'categories') return <CategoryManager />;
    if (activeTab === 'bookings') return renderBookings();
    if (activeTab === 'orders') return renderOrders();
    if (activeTab === 'payments') return renderPayments();
    if (activeTab === 'coupons') return renderCoupons();
    if (activeTab === 'reviews') return renderReviews();
    if (activeTab === 'notifications') return renderNotifications();
    if (activeTab === 'cms') return renderCms();
    if (activeTab === 'audit') return renderAudit();
    if (activeTab === 'settings') return renderSettings();
    if (activeTab === 'reports') return renderReports();
    if (activeTab === 'roles') return renderRoles();
    return <div className="text-center p-8 text-slate-400">Tab view not implemented yet.</div>;
  };

  return (
    <div className="flex-1 flex bg-[#070914] text-white">
      <SEO title="Admin Dashboard Portal" description="Manage EventDeco rentals and sales ledger." />

      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 cursor-pointer"
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#090b16] border-r border-white/5 flex flex-col justify-between transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } lg:static lg:flex-shrink-0 transition-transform duration-300 ease-in-out`}>
        <div className="flex flex-col h-full overflow-y-auto pb-4">
          {/* Logo Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
            <a href="/admin" className="flex items-center justify-center w-full">
              <img src="/images/logo.png" alt="EventDeco Logo" className="h-16 sm:h-20 w-auto object-contain transition-transform duration-300 hover:scale-105" />
            </a>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white ml-2 shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-6">
            {menuGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block px-3 mb-1">
                  {group.title}
                </span>
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center px-3.5 py-2.5 rounded-xl transition-all duration-200 text-xs font-semibold ${isActive
                          ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                      <Icon className="w-4.5 h-4.5 mr-3 flex-shrink-0" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-6 border-t border-white/5 bg-white/2 flex items-center justify-between text-xs">
          <div>
            <p className="font-bold text-white truncate max-w-[150px]">{user?.firstName || 'Staff'}</p>
            <span className="text-[10px] text-amber-500 font-semibold uppercase">{user?.role || 'Operator'}</span>
          </div>
          <button
            onClick={logout}
            className="p-2 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
            title="Log Out"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 bg-[#070914]/90 backdrop-blur border-b border-white/5 py-4 px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white bg-white/5 rounded-lg border border-white/5"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile View Branding Logo */}
            <div className="lg:hidden flex items-center pl-2">
              <img src="/images/logo.png" alt="EventDeco Logo" className="h-10 sm:h-12 w-auto object-contain brightness-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.05)]" />
            </div>

            {/* Breadcrumbs */}
            <div className="hidden sm:flex items-center space-x-2 text-xs font-medium text-slate-400">
              <span>Admin</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-white font-bold">{getBreadcrumbTitle()}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Direct Home Page Link */}


            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                className="p-2 text-slate-400 hover:text-white bg-white/5 border border-white/5 rounded-lg transition-all relative"
                title="Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                {notificationsList.filter(n => !n.readStatus).length > 0 && (
                  <span className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 bg-amber-500 text-black text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-[#070914] animate-pulse">
                    {notificationsList.filter(n => !n.readStatus).length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotificationDropdown && (
                <div className="absolute right-0 mt-3 w-80 bg-[#0f1224] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Alerts & Notifications</h4>
                    {notificationsList.some(n => !n.readStatus) && (
                      <button
                        onClick={handleMarkNotificationsRead}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                    {notificationsList.slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          handleMarkSingleRead(n.id);
                        }}
                        className={`p-3.5 flex items-start gap-3 cursor-pointer hover:bg-white/5 transition-colors ${
                          !n.readStatus ? 'bg-amber-500/5' : ''
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                          !n.readStatus ? 'bg-amber-500 animate-pulse' : 'bg-transparent'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs leading-normal break-words ${
                            !n.readStatus ? 'text-white font-semibold' : 'text-slate-400'
                          }`}>
                            {n.message}
                          </p>
                          <span className="text-[9px] text-slate-500 mt-1 block">
                            {new Date(n.createdAt || new Date()).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    {notificationsList.length === 0 && (
                      <div className="p-6 text-center text-xs text-slate-500">
                        No notifications found.
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t border-white/5 text-center bg-white/2">
                    <button
                      onClick={() => {
                        setActiveTab('notifications');
                        setShowNotificationDropdown(false);
                      }}
                      className="text-xs text-amber-500 hover:text-amber-400 font-bold block w-full"
                    >
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sync button */}
            <button
              onClick={fetchInitialData}
              className="p-2 text-slate-400 hover:text-white bg-white/5 border border-white/5 rounded-lg transition-all"
              title="Sync Data"
            >
              <RefreshCw className="w-4.5 h-4.5" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-6 lg:p-10 flex-1 bg-gradient-to-b from-[#070914] to-[#04050a]">
          {error && (
            <div className="bg-red-500/10 text-red-500 p-4 rounded-xl mb-8 border border-red-500/20 flex items-center space-x-2 text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            renderActiveView()
          )}
        </main>
      </div>

      {/* ==========================================
          MODAL POPUP DIALOGS (SHARED FORM EDITOR)
          ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#0f1224] border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/2">
              <h3 className="text-lg font-bold">
                {editItem ? 'Modify Item Settings' : 'Create New Registration'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              {modalType === 'vendor' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Vendor Name</label>
                    <input
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#070914] border border-white/10 rounded-xl text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase">Service Category</label>
                      <select
                        value={formData.serviceType || 'DJ'}
                        onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#070914] border border-white/10 rounded-xl text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      >
                        <option value="DJ">DJ & sound setups</option>
                        <option value="Florist">Florist & Flowers</option>
                        <option value="Catering">Catering Services</option>
                        <option value="Staging">Staging & Canopies</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase">Rating Score</label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={formData.rating || 5.0}
                        onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2.5 bg-[#070914] border border-white/10 rounded-xl text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Contact Email</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#070914] border border-white/10 rounded-xl text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Contact Phone</label>
                    <input
                      type="text"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#070914] border border-white/10 rounded-xl text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="vendorActive"
                      checked={formData.active !== false}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="rounded bg-[#070914] border-white/25 text-amber-500 focus:ring-amber-500"
                    />
                    <label htmlFor="vendorActive" className="text-xs font-semibold text-slate-300">
                      Vendor is active and eligible for bookings
                    </label>
                  </div>
                </>
              )}

              {modalType === 'coupon' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Promo Code</label>
                    <input
                      required
                      value={formData.code || ''}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g. FESTIVE30"
                      className="w-full px-4 py-2.5 bg-[#070914] border border-white/10 rounded-xl text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase">Discount Type</label>
                      <select
                        value={formData.discountType || 'PERCENTAGE'}
                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#070914] border border-white/10 rounded-xl text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      >
                        <option value="PERCENTAGE">Percentage (%)</option>
                        <option value="FIXED">Flat Off (₹)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase">Value Offset</label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.discountAmount || ''}
                        onChange={(e) => setFormData({ ...formData, discountAmount: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2.5 bg-[#070914] border border-white/10 rounded-xl text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase">Expiry Date</label>
                      <input
                        type="date"
                        value={formData.expiryDate || ''}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#070914] border border-white/10 rounded-xl text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase">Usage Limit</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.usageLimit || 100}
                        onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) })}
                        className="w-full px-4 py-2.5 bg-[#070914] border border-white/10 rounded-xl text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="couponActive"
                      checked={formData.active !== false}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="rounded bg-[#070914] border-white/25 text-amber-500 focus:ring-amber-500"
                    />
                    <label htmlFor="couponActive" className="text-xs font-semibold text-slate-300">
                      Coupon is active and claimable
                    </label>
                  </div>
                </>
              )}

              {modalType === 'setting' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Config Key</label>
                    <input
                      required
                      disabled={!!editItem}
                      value={formData.settingKey || ''}
                      onChange={(e) => setFormData({ ...formData, settingKey: e.target.value })}
                      placeholder="e.g. STRIPE_API_SANDBOX_MODE"
                      className="w-full px-4 py-2.5 bg-[#070914] border border-white/10 rounded-xl text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none disabled:opacity-55"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Config Value</label>
                    <input
                      required
                      value={formData.settingValue || ''}
                      onChange={(e) => setFormData({ ...formData, settingValue: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#070914] border border-white/10 rounded-xl text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Description Info</label>
                    <textarea
                      rows="2"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#070914] border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none resize-none"
                    />
                  </div>
                </>
              )}

              {modalType === 'cms' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase">CMS block Key</label>
                    <input
                      required
                      disabled={!!editItem}
                      value={formData.contentKey || ''}
                      onChange={(e) => setFormData({ ...formData, contentKey: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#070914] border border-white/10 rounded-xl text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none disabled:opacity-55"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Cms Title</label>
                    <input
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#070914] border border-white/10 rounded-xl text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase">CMS Category</label>
                    <select
                      value={formData.category || 'FAQ'}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#070914] border border-white/10 rounded-xl text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="FAQ">FAQ Page Content</option>
                      <option value="TERMS">Terms of Service</option>
                      <option value="PRIVACY">Privacy Policy</option>
                      <option value="BANNERS">Homepage Marketing Banners</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase">HTML / Content Body</label>
                    <textarea
                      rows="4"
                      value={formData.contentHtml || ''}
                      onChange={(e) => setFormData({ ...formData, contentHtml: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#070914] border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none resize-none font-mono"
                    />
                  </div>
                </>
              )}

              <div className="p-6 border-t border-white/5 flex justify-end space-x-4 bg-white/2 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          BOOKING DETAILS MODAL POPUP DIALOG
          ========================================== */}
      {isBookingModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#0f1224] border border-white/10 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/2">
              <div>
                <h3 className="text-lg font-black text-white">
                  {selectedBooking.bookingNumber || `Booking #${selectedBooking.id.substring(0, 8)}`}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Placed on {new Date(selectedBooking.createdAt).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={() => { setIsBookingModalOpen(false); setSelectedBooking(null); }} 
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[65vh]">
              {/* Customer Info Card */}
              <div className="bg-white/2 border border-white/5 p-4 rounded-xl space-y-3.5">
                <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider">Client & Delivery Info</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
                  <div>
                    <span className="text-slate-400 block mb-1">Full Name</span>
                    <strong className="text-white text-sm">{selectedBooking.fullName || 'Guest Client'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">WhatsApp Contact</span>
                    <strong className="text-white text-sm block">{selectedBooking.whatsAppNumber || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Email Address</span>
                    <strong className="text-white text-sm">{selectedBooking.email || selectedBooking.user?.email || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Event Date & Delivery Time</span>
                    <strong className="text-white text-sm block">
                      {new Date(selectedBooking.eventDate).toLocaleDateString()} @ {selectedBooking.eventTime}
                    </strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block mb-1">Event Location / Address</span>
                    <strong className="text-white text-sm block leading-relaxed">{selectedBooking.eventLocation}</strong>
                  </div>
                  {selectedBooking.additionalNotes && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 block mb-1">Additional Notes</span>
                      <p className="bg-[#070914] p-3 rounded-lg border border-white/5 text-slate-300 italic whitespace-pre-line leading-relaxed">
                        {selectedBooking.additionalNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider">Requested Rental Items</h4>
                <div className="space-y-2.5">
                  {selectedBooking.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-white/2 p-3 rounded-xl border border-white/5">
                      <div>
                        <p className="font-bold text-white text-sm">{item.item?.name || 'Rental Item'}</p>
                        <p className="text-slate-400 mt-0.5">Price: ₹{item.price ?? item.item?.price} per unit</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-black text-white text-sm">× {item.quantity}</p>
                        <p className="text-amber-500 font-bold mt-0.5">₹{((item.price ?? item.item?.price) * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Transition Selector */}
              <div className="bg-white/2 border border-white/5 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Update Booking Status</span>
                  <span className="text-[10px] text-slate-500 mt-1 block">Transition booking to a different state</span>
                </div>
                <select
                  value={selectedBooking.status}
                  onChange={async (e) => {
                    const nextStatus = e.target.value;
                    try {
                      await handleBookingStatusChange(selectedBooking.id, nextStatus);
                      setSelectedBooking({ ...selectedBooking, status: nextStatus });
                      // Fetch updated booking list to refresh main UI
                      const data = await api.getBookings();
                      setBookingsList(data || []);
                    } catch (err) {}
                  }}
                  className="bg-[#070914] border border-white/10 text-white rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none w-full sm:w-48 font-bold"
                >
                  <option value="PENDING">Pending Confirmation</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-white/5 flex flex-wrap gap-3 bg-white/2 rounded-b-2xl justify-between items-center">
              <div className="text-left shrink-0">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Estimated Total</span>
                <span className="text-base font-black text-amber-500">₹{selectedBooking.totalAmount?.toFixed(2)}</span>
              </div>
              <div className="flex space-x-2">
                {(selectedBooking.whatsAppNumber || selectedBooking.user?.phone) && (
                  <>
                    <a 
                      href={`tel:${selectedBooking.whatsAppNumber || selectedBooking.user?.phone}`}
                      className="flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-bold transition-all"
                    >
                      <Phone className="w-4 h-4 mr-1.5" />
                      Call Customer
                    </a>
                    <a 
                      href={`https://wa.me/${(selectedBooking.whatsAppNumber || selectedBooking.user?.phone).replace(/\+/g, '').replace(/[-\s]/g, '').trim()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-extrabold transition-all shadow-md shadow-emerald-500/10"
                    >
                      <MessageCircle className="w-4 h-4 mr-1.5 fill-black" />
                      WhatsApp
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
