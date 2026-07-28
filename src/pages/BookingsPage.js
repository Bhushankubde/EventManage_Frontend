import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Package, Clock, CreditCard } from 'lucide-react';
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
      // Depending on the backend API, we might need to pass the userId or it infers it from token
      const data = await api.getBookings();
      setBookings(data);
    } catch (err) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 lg:pt-40 pb-12 animate-in fade-in">
      <SEO title="My Bookings" description="View your past and upcoming event equipment bookings." />
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        {user?.role === 'ADMIN' && (
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
            Admin View - Showing All Bookings
          </span>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-8">
          {error}
        </div>
      )}

      {bookings.length === 0 && !error ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold mb-2">No bookings found</h2>
          <p className="text-muted-foreground mb-6">You haven't made any bookings yet.</p>
          <a href="/catalog" className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Browse Catalog
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map(booking => (
            <div key={booking.id} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row gap-6 hover:border-primary/30 transition-all">
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold">Booking #{booking.id.substring(0, 8)}</h3>
                    <p className="text-sm text-muted-foreground">Placed on {new Date(booking.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                    <span>{new Date(booking.eventDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    <span>{booking.eventTime}</span>
                  </div>
                  <div className="flex items-center text-sm col-span-1 sm:col-span-2">
                    <MapPin className="w-4 h-4 mr-2 text-primary" />
                    <span>{booking.eventLocation}</span>
                  </div>
                </div>
              </div>
              
              <div className="md:w-64 bg-muted/50 p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center">
                    <Package className="w-4 h-4 mr-2" /> Items ({booking.items?.length || 0})
                  </h4>
                  <ul className="space-y-1 mb-4">
                    {booking.items?.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex justify-between">
                        <span className="truncate pr-2">{item.item?.name || 'Item'}</span>
                        <span>x{item.quantity}</span>
                      </li>
                    ))}
                    {booking.items?.length > 3 && (
                      <li className="text-xs text-primary font-medium">+{booking.items.length - 3} more</li>
                    )}
                  </ul>
                </div>
                
                <div className="pt-4 border-t border-border/50">
                  <div className="flex justify-between items-center font-bold">
                    <span>Total</span>
                    <span>₹{booking.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
