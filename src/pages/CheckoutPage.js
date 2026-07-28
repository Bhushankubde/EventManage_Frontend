import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { SEO } from '../components/SEO';
import { analytics } from '../utils/analytics';
import { toast, Toaster } from 'sonner';

// Initialize Stripe (use a placeholder key for now as per docs)
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

function PaymentForm({ amount, bookingData, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);

    try {
      // Create booking on backend first (mock payment intent for this test)
      const bookingResponse = await api.createBooking(bookingData);
      
      // Normally we'd confirm the stripe payment here
      // const { error, paymentIntent } = await stripe.confirmPayment(...)
      
      const orderResponse = await api.createOrder({
        bookingId: bookingResponse.id || 'mock-id',
        paymentMethod: 'card',
        totalAmount: amount
      });

      analytics.trackBooking(bookingResponse.id || 'mock-id', amount);
      toast.success('Payment successful! Booking confirmed.');
      onSuccess();
    } catch (error) {
      toast.error(error.message || 'Payment or Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* <PaymentElement /> -> Disabled locally without real keys to prevent crashes */}
      <div className="p-4 bg-muted border border-border rounded-lg text-sm text-center">
        Stripe Payment Element (Test Mode)
        <br />
        Amount to charge: ₹{amount.toFixed(2)}
      </div>
      <button 
        type="submit" 
        disabled={!stripe || loading}
        className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 transition-all disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay ₹${amount.toFixed(2)}`}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [showPayment, setShowPayment] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  
  const subtotal = cart.reduce((total, ci) => total + ((ci.price ?? ci.item.price) * ci.quantity), 0);
  const tax = subtotal * 0.1;
  const totalAmount = subtotal + tax;

  // Redirect to cart if empty
  React.useEffect(() => {
    if (cart.length === 0 && !showPayment) {
      toast.error('Your cart is empty');
      navigate('/cart');
    }
  }, [cart, navigate, showPayment]);

  const onSubmit = async (data) => {
    const fullBookingData = {
      ...data,
      items: cart.map(ci => ({ itemId: ci.item.id, quantity: ci.quantity }))
    };
    
    setBookingData(fullBookingData);
    setShowPayment(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pt-28 sm:pt-36 lg:pt-40 pb-12 animate-in fade-in">
      <SEO title="Checkout" description="Complete your industrial event booking." />
      <Toaster position="top-center" />
      
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-4">Event Details</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Event Date</label>
              <input
                type="date"
                {...register('eventDate', { required: 'Date is required' })}
                className="w-full p-2 border border-border rounded-md bg-input-background"
                disabled={showPayment}
              />
              {errors.eventDate && <p className="text-red-500 text-xs mt-1">{errors.eventDate.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Event Time</label>
              <input
                type="time"
                {...register('eventTime', { required: 'Time is required' })}
                className="w-full p-2 border border-border rounded-md bg-input-background"
                disabled={showPayment}
              />
              {errors.eventTime && <p className="text-red-500 text-xs mt-1">{errors.eventTime.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Event Location</label>
              <input
                type="text"
                {...register('eventLocation', { 
                  required: 'Location is required',
                  minLength: { value: 5, message: 'Location must be at least 5 characters' }
                })}
                className="w-full p-2 border border-border rounded-md bg-input-background"
                placeholder="123 Main St, City"
                disabled={showPayment}
              />
              {errors.eventLocation && <p className="text-red-500 text-xs mt-1">{errors.eventLocation.message}</p>}
            </div>
            
            {!showPayment && (
              <button type="submit" className="w-full py-2 bg-foreground text-background font-medium rounded-lg">
                Continue to Payment
              </button>
            )}
          </form>
        </div>

        <div className="glass-panel p-6 rounded-2xl h-fit">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-4 pb-4 border-b border-border">
            <span>Tax</span>
            <span>₹{(totalAmount * 0.1).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg mb-6">
            <span>Total</span>
            <span>₹{(totalAmount * 1.1).toFixed(2)}</span>
          </div>

          {showPayment && (
            <div className="border-t border-border pt-6 mt-6">
              <h3 className="font-bold mb-4">Payment Method</h3>
              <Elements stripe={stripePromise}>
                <PaymentForm 
                  amount={totalAmount * 1.1} 
                  bookingData={bookingData}
                  onSuccess={() => {
                    clearCart();
                    setTimeout(() => navigate('/catalog'), 2000);
                  }}
                />
              </Elements>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
