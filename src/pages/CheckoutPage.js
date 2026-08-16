import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SEO } from '../components/SEO';
import { toast, Toaster } from 'sonner';
import { MessageCircle, CheckCircle, ArrowRight, Calendar, Clock, MapPin, User, FileText, Sparkles } from 'lucide-react';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const [loading, setLoading] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null); // holds { bookingNumber, whatsAppLink }

  const subtotal = cart.reduce((total, ci) => total + ((ci.price ?? ci.item.price) * ci.quantity), 0);
  const tax = 0;
  const totalAmount = subtotal;

  // Auto-populate user details from their profile
  useEffect(() => {
    if (user) {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      setValue('fullName', fullName);
      setValue('whatsAppNumber', user.phone || '');
      setValue('email', user.email || '');
    }
  }, [user, setValue]);

  // Redirect to catalog/cart if empty and no booking was created
  useEffect(() => {
    if (cart.length === 0 && !createdBooking) {
      toast.error('Your cart is empty');
      navigate('/cart');
    }
  }, [cart, navigate, createdBooking]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // 1. Save Booking in the database via POST /bookings
      const bookingPayload = {
        fullName: data.fullName,
        whatsAppNumber: data.whatsAppNumber,
        email: data.email,
        eventDate: data.eventDate,
        eventTime: data.eventTime,
        eventLocation: data.eventLocation,
        additionalNotes: data.additionalNotes,
        items: cart.map(ci => ({ itemId: ci.item.id, quantity: ci.quantity }))
      };

      const bookingResponse = await api.createBooking(bookingPayload);

      // 2. Update user profile on server if details changed
      const currentFullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
      const profileChanged = 
        data.fullName.trim() !== currentFullName || 
        data.whatsAppNumber.trim() !== (user?.phone || '');

      if (profileChanged && user) {
        const nameParts = data.fullName.trim().split(/\s+/);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        try {
          await api.updateCurrentUser({
            firstName,
            lastName,
            phone: data.whatsAppNumber
          });
        } catch (profileErr) {
          console.warn("Failed to update profile", profileErr);
        }
      }

      // 3. Fetch store WhatsApp number from system settings
      let storeWaNumber = '919876543210';
      try {
        const settings = await api.getSystemSettings();
        const whatsappSetting = settings.find(s => s.settingKey === 'whatsapp_number');
        if (whatsappSetting && whatsappSetting.settingValue) {
          storeWaNumber = whatsappSetting.settingValue.replace(/\+/g, '').replace(/[-\s]/g, '').trim();
        }
      } catch (settingsErr) {
        console.warn("Failed to fetch custom store whatsapp setting, using default", settingsErr);
      }

      // 4. Construct WhatsApp pre-filled message
      const itemsListText = cart
        .map(ci => `• ${ci.item.name} × ${ci.quantity}`)
        .join('\n');

      const message = `Hello Event Deco Team,

I would like to rent the following items.

Booking Details

Name:
${data.fullName}

WhatsApp:
${data.whatsAppNumber}

Event Date:
${new Date(data.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}

Delivery Time:
${data.eventTime}

Delivery Address:
${data.eventLocation}

Items:
${itemsListText}

${data.additionalNotes ? `Additional Notes:\n${data.additionalNotes}\n` : ''}
Please contact me to confirm availability.

Thank you.`;

      const encodedMessage = encodeURIComponent(message);
      const whatsAppLink = `https://wa.me/${storeWaNumber}?text=${encodedMessage}`;

      // 5. Clear shopping cart
      clearCart();

      // 6. Set success screen state
      setCreatedBooking({
        bookingNumber: bookingResponse.bookingNumber || 'Pending',
        whatsAppLink: whatsAppLink
      });

      // 7. Auto-open WhatsApp link in a new tab
      window.open(whatsAppLink, '_blank');
      toast.success('Booking registered! Opening WhatsApp...');

    } catch (err) {
      console.error(err);
      toast.error(err.message || 'An error occurred while creating booking.');
    } finally {
      setLoading(false);
    }
  };

  if (createdBooking) {
    return (
      <div className="dark flex-1 flex flex-col bg-gradient-to-b from-[#090b16] via-[#0d1430] to-[#05060b] text-white pt-28 sm:pt-36 lg:pt-40 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center animate-in zoom-in duration-300">
        <div className="max-w-xl w-full">
          <SEO title="Booking Success" description="Your rental booking has been registered." />
          <Toaster position="top-center" />
          
          <div className="bg-[#0f1224] border border-emerald-500/20 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
            {/* Green WhatsApp Branding Glow */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-lg shadow-emerald-500/5 animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>

            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-3.5 py-1 rounded-full font-bold uppercase tracking-wider">
              Booking Registered
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-4">
              Request Received!
            </h1>
            
            <p className="text-slate-400 text-sm mt-3 max-w-sm mx-auto leading-relaxed">
              Your booking request has been saved under status <strong className="text-amber-400 font-semibold">Pending Admin Confirmation</strong>. We have opened WhatsApp to finish the booking process.
            </p>

            {/* Booking Code Display */}
            <div className="my-6 p-4 bg-white/5 rounded-2xl border border-white/5 inline-block">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Booking Number</p>
              <p className="text-xl font-mono font-black text-amber-500 tracking-wider mt-1">
                {createdBooking.bookingNumber}
              </p>
            </div>

            <div className="space-y-4 max-w-sm mx-auto mt-2">
              <a 
                href={createdBooking.whatsAppLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full py-3 px-6 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02]"
              >
                <MessageCircle className="w-5 h-5 mr-2 fill-black" />
                Open WhatsApp Manually
              </a>

              <button 
                onClick={() => navigate('/bookings')}
                className="flex items-center justify-center w-full py-3 px-6 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold rounded-xl transition-all hover:border-white/20"
              >
                Go to My Bookings
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500 mt-6 leading-relaxed">
              If you blocked pop-ups, please click the green button above to start your WhatsApp chat.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dark flex-1 flex flex-col bg-gradient-to-b from-[#090b16] via-[#0d1430] to-[#05060b] text-white pt-28 sm:pt-36 lg:pt-40 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
        <SEO title="Checkout via WhatsApp" description="Confirm your industrial event rental details." />
        <Toaster position="top-center" />

      {/* Checkout Progress Stepper */}
      <div className="flex justify-center items-center space-x-2 sm:space-x-4 mb-8 sm:mb-10 text-xs sm:text-sm font-semibold text-slate-400">
        <span className="text-emerald-400">1. Cart</span>
        <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-white border-b-2 border-emerald-500 pb-1">2. Details</span>
        <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
        <span>3. WhatsApp Handoff</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-8 tracking-tight">
        Checkout Details
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Checkout Form */}
        <div className="lg:col-span-7 bg-[#0f1224] border border-white/5 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
          <div className="flex items-center space-x-2 pb-4 border-b border-white/5">
            <User className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Contact & Rental Details</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                {...register('fullName', { required: 'Full Name is required' })}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
                placeholder="John Doe"
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">WhatsApp Number</label>
              <input
                type="text"
                {...register('whatsAppNumber', { 
                  required: 'WhatsApp Number is required',
                  pattern: {
                    value: /^[0-9+()#&.\s-]{10,20}$/,
                    message: 'Please enter a valid WhatsApp contact number'
                  }
                })}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
                placeholder="e.g. +91 9876543210"
              />
              {errors.whatsAppNumber && <p className="text-red-500 text-xs mt-1">{errors.whatsAppNumber.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Address (Optional)</label>
              <input
                type="email"
                {...register('email')}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
                placeholder="john@example.com"
              />
            </div>

            {/* Event Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Event Address / Location</label>
              <input
                type="text"
                {...register('eventLocation', { 
                  required: 'Event location is required',
                  minLength: { value: 6, message: 'Address must be at least 6 characters' }
                })}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
                placeholder="e.g. ABC Hall, Linking Road, Mumbai"
              />
              {errors.eventLocation && <p className="text-red-500 text-xs mt-1">{errors.eventLocation.message}</p>}
            </div>

            {/* Date and Time Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Event Date</label>
                <input
                  type="date"
                  {...register('eventDate', { required: 'Event Date is required' })}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
                />
                {errors.eventDate && <p className="text-red-500 text-xs mt-1">{errors.eventDate.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Delivery Time</label>
                <input
                  type="time"
                  {...register('eventTime', { required: 'Delivery Time is required' })}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
                />
                {errors.eventTime && <p className="text-red-500 text-xs mt-1">{errors.eventTime.message}</p>}
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Additional Notes / Special Instructions</label>
              <textarea
                {...register('additionalNotes')}
                rows="3"
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm resize-none"
                placeholder="e.g. Need delivery before 9 AM, setup assistance required..."
              ></textarea>
            </div>

            {/* Checkout Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="flex items-center justify-center w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.01] disabled:opacity-50 mt-6"
            >
              {loading ? (
                'Processing Request...'
              ) : (
                <>
                  <MessageCircle className="w-5 h-5 mr-2 fill-black" />
                  Book via WhatsApp
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5 bg-[#0f1224] border border-white/5 p-6 rounded-3xl shadow-xl h-fit">
          <div className="flex items-center space-x-2 pb-4 mb-4 border-b border-white/5">
            <FileText className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-white">Order Summary</h2>
          </div>

          {/* Cart Items List */}
          <div className="space-y-3 max-h-60 overflow-y-auto mb-6 pr-2">
            {cart.map((ci, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm bg-white/2 p-3 rounded-xl border border-white/5">
                <div className="pr-4 truncate flex-1">
                  <p className="font-bold text-white truncate">{ci.item.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">₹{ci.price ?? ci.item.price} × {ci.quantity}</p>
                </div>
                <span className="font-bold text-white text-right">
                  ₹{((ci.price ?? ci.item.price) * ci.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-3.5 text-sm text-slate-300 font-medium">
            <div className="flex justify-between border-b border-white/5 pb-4">
              <span>Items Total</span>
              <span className="text-white">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-black text-lg text-white pt-2">
              <span>Est. Total Amount</span>
              <span className="text-amber-500">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Service Quality Badges */}
          <div className="mt-8 pt-6 border-t border-white/5 space-y-3.5">
            <div className="flex items-center text-xs text-slate-400">
              <Sparkles className="w-4 h-4 mr-2.5 text-amber-500" />
              <span>Rental availability finalized directly by staff</span>
            </div>
            <div className="flex items-center text-xs text-slate-400">
              <MessageCircle className="w-4 h-4 mr-2.5 text-emerald-400 fill-emerald-400/20" />
              <span>No online gateway – secure WhatsApp confirmation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
