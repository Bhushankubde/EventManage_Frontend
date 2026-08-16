import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Package, Clock, MessageCircle, AlertCircle } from 'lucide-react';
import { SEO } from '../components/SEO';
import { LoadingSpinner } from '../components/LoadingSpinner';

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await api.getBookings();
      setBookings(data);
    } catch (err) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
      case 'APPROVED':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'REJECTED':
        return 'bg-red-500/10 text-red-500 border border-red-500/20';
      default:
        return 'bg-slate-500/10 text-slate-500 border border-slate-500/20';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING': return 'Pending Admin Confirmation';
      case 'APPROVED': return 'Approved';
      case 'REJECTED': return 'Rejected';
      default: return status;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dark flex-1 flex flex-col bg-gradient-to-b from-[#090b16] via-[#0d1430] to-[#05060b] text-white pt-28 sm:pt-36 lg:pt-40 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
        <SEO title="My Bookings" description="View and track your rental bookings timeline." />
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">My Bookings</h1>
        {user?.role === 'ADMIN' && (
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            Admin Mode - Showing All
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-500 border border-red-500/20 p-4 rounded-xl mb-8 flex items-center text-sm">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {bookings.length === 0 && !error ? (
        <div className="bg-[#0f1224] border border-white/5 p-12 text-center rounded-3xl shadow-xl">
          <Calendar className="w-16 h-16 text-slate-500 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold text-white mb-2">No bookings found</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">You haven't made any booking requests yet. Browse the catalog to get started!</p>
          <a href="/catalog" className="inline-block bg-white text-black px-6 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition-colors text-sm">
            Browse Catalog
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {bookings.map(booking => (
            <div key={booking.id} className="bg-[#0f1224] border border-white/5 p-6 rounded-3xl flex flex-col lg:flex-row gap-6 hover:border-white/10 transition-all shadow-xl relative">
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-black text-white tracking-wide">
                      {booking.bookingNumber || `Booking #${booking.id.substring(0, 8)}`}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      Placed on {new Date(booking.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(booking.status)}`}>
                    {getStatusLabel(booking.status)}
                  </span>
                </div>
                
                {/* Event details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <div className="flex items-center text-sm text-slate-300">
                    <Calendar className="w-4 h-4 mr-2.5 text-amber-500" />
                    <span>Event Date: <strong className="text-white font-semibold">{new Date(booking.eventDate).toLocaleDateString()}</strong></span>
                  </div>
                  <div className="flex items-center text-sm text-slate-300">
                    <Clock className="w-4 h-4 mr-2.5 text-amber-500" />
                    <span>Delivery Time: <strong className="text-white font-semibold">{booking.eventTime}</strong></span>
                  </div>
                  <div className="flex items-center text-sm text-slate-300 col-span-1 sm:col-span-2">
                    <MapPin className="w-4 h-4 mr-2.5 text-amber-500" />
                    <span className="truncate">Event Location: <strong className="text-white font-semibold">{booking.eventLocation}</strong></span>
                  </div>
                  {booking.fullName && (
                    <div className="flex items-center text-sm text-slate-300 col-span-1 sm:col-span-2">
                      <span className="w-4 h-4 mr-2.5 text-center font-bold text-amber-500 text-xs">👤</span>
                      <span>Client Details: <strong className="text-white font-semibold">{booking.fullName}</strong> ({booking.whatsAppNumber})</span>
                    </div>
                  )}
                </div>

                {/* Status Progress Timeline */}
                <div className="pt-5 border-t border-white/5 mt-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Booking status tracker</p>
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-white/2 p-4 rounded-2xl border border-white/5">
                    {/* Stage 1: Submitted */}
                    <div className="flex items-center space-x-2.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-[10px] font-black shadow-md">
                        ✓
                      </div>
                      <div>
                        <p className="text-[11px] font-extrabold text-white leading-none">Booking Submitted</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Awaiting staff review</p>
                      </div>
                    </div>

                    {/* Stepper Arrow */}
                    <div className="h-0.5 bg-white/10 flex-1 hidden md:block max-w-[30px]"></div>

                    {/* Stage 2: Confirmation / Action */}
                    {booking.status === 'REJECTED' ? (
                      <div className="flex items-center space-x-2.5">
                        <div className="w-6 h-6 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center text-[10px] font-black shadow-md">
                          ✗
                        </div>
                        <div>
                          <p className="text-[11px] font-extrabold text-red-500 leading-none">Booking Rejected</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">Declined by Admin</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2.5">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-md ${
                          booking.status === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 animate-pulse'
                        }`}>
                          {booking.status === 'APPROVED' ? '✓' : '⏳'}
                        </div>
                        <div>
                          <p className={`text-[11px] font-extrabold leading-none ${booking.status === 'APPROVED' ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {booking.status === 'APPROVED' ? 'Approved & Confirmed' : 'Admin Confirmation Pending'}
                          </p>
                          <p className="text-[9px] text-slate-400 mt-0.5">
                            {booking.status === 'APPROVED' ? 'Order processed successfully' : 'Admin will call/chat soon'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Sidebar Info Summary */}
              <div className="lg:w-72 bg-white/2 border border-white/5 p-4 rounded-2xl flex flex-col justify-between h-fit">
                <div>
                  <h4 className="font-extrabold text-xs text-white uppercase tracking-wider mb-3 flex items-center">
                    <Package className="w-3.5 h-3.5 mr-2 text-slate-400" /> Items List ({booking.items?.length || 0})
                  </h4>
                  <ul className="space-y-2 mb-4">
                    {booking.items?.slice(0, 4).map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-400 flex justify-between bg-white/2 px-2.5 py-1.5 rounded-lg border border-white/5">
                        <span className="truncate pr-2 font-medium text-slate-200">{item.item?.name || 'Rental item'}</span>
                        <span className="font-bold text-white shrink-0">x{item.quantity}</span>
                      </li>
                    ))}
                    {booking.items?.length > 4 && (
                      <li className="text-[10px] text-amber-500 font-bold text-center pt-1">
                        +{booking.items.length - 4} more items
                      </li>
                    )}
                  </ul>
                </div>
                
                <div className="pt-3 border-t border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-medium">Est. Price Total</span>
                    <span className="text-base font-black text-amber-500">₹{booking.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
};

export default BookingsPage;
