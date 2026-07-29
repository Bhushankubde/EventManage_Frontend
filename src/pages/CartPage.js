import React from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, Calendar, ShoppingBag, ArrowRight, Sparkles, MessageCircle, FileText } from 'lucide-react';
import { SEO } from '../components/SEO';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const subtotal = cart.reduce((total, ci) => total + ((ci.price ?? ci.item.price) * ci.quantity), 0);
  const tax = subtotal * 0.1; // 10% estimated tax/service charge
  const total = subtotal + tax;

  if (cart.length === 0) {
    return (
      <div className="dark min-h-screen bg-gradient-to-b from-[#090b16] via-[#0d1430] to-[#05060b] text-white pt-28 sm:pt-36 lg:pt-40 pb-12 px-4 sm:px-6 lg:px-8">
        <SEO title="My Booking Cart" description="Your event booking cart is currently empty." />
        <div className="max-w-7xl mx-auto py-20 text-center animate-in fade-in duration-500">
          <div className="glass-panel p-12 rounded-2xl inline-block max-w-lg w-full border border-white/10 bg-gradient-to-br from-[#0d122b]/60 to-[#05060b]/90 shadow-2xl">
            <ShoppingBag className="w-16 h-16 text-amber-500 mx-auto mb-6 animate-bounce" />
            <h2 className="text-2xl font-bold mb-2 text-white">My booking cart is empty</h2>
            <p className="text-slate-400 mb-8 text-sm leading-relaxed">
              Configure dates, quantities, and packages on rental items in the catalog to add them to your cart.
            </p>
            <Link
              to="/catalog"
              className="bg-amber-500 text-black px-6 py-3 rounded-full font-bold text-sm hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/20 transition-all inline-flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              Browse Catalog <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleWhatsAppInquiryAll = () => {
    let message = `Hello EventDeco! I am interested in inquiring about the following items in my Booking Cart:\n\n`;

    cart.forEach((ci, idx) => {
      const formattedDate = ci.eventDate ? new Date(ci.eventDate).toLocaleDateString() : 'Not selected';
      message += `*${idx + 1}. ${ci.item.name}*\n` +
        `- *Package:* ${ci.selectedPackage || 'Basic'}\n` +
        `- *Event Date:* ${formattedDate}\n` +
        `- *Quantity:* ${ci.quantity}\n` +
        `- *Notes:* ${ci.notes || 'None'}\n` +
        `- *Price:* ₹${(ci.price * ci.quantity).toLocaleString()}\n\n`;
    });

    message += `*Estimated Subtotal:* ₹${subtotal.toLocaleString()}\n` +
      `Could you please confirm availability for these items on the requested dates?`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="dark min-h-screen bg-gradient-to-b from-[#090b16] via-[#0d1430] to-[#05060b] text-white pt-28 sm:pt-36 lg:pt-40 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <SEO title="My Booking Cart" description="Review items in your event booking cart before checkout." />

        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span className="h-8 w-1 bg-amber-400 rounded-full"></span>
              My Booking Cart
            </h1>
            <p className="text-xs text-slate-400 mt-1">Review your selected event rental items and services</p>
          </div>

          <button
            onClick={clearCart}
            className="text-xs text-red-400 hover:text-red-300 font-bold border border-red-500/20 hover:bg-red-500/10 px-4 py-2 rounded-full transition-all cursor-pointer"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((cartItem) => {
              const { id: cartItemId, item, quantity, eventDate, selectedPackage, notes, price: itemPrice } = cartItem;
              const displayPrice = itemPrice ?? item.price;
              const lineTotal = displayPrice * quantity;

              return (
                <div
                  key={cartItemId}
                  className="group glass-panel p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-5 border border-white/5 bg-gradient-to-br from-[#0d122b]/40 to-[#05060b]/95 hover:border-amber-500/20 transition-all duration-300 hover:shadow-xl"
                >
                  {/* Item Image */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[#090b16] rounded-xl overflow-hidden flex-shrink-0 relative border border-white/5">
                    <img
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1508215885820-4585e5610d32?w=300&q=80'}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>

                  {/* Details Wrapper */}
                  <div className="flex-1 flex flex-col justify-between w-full h-full space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <h3 className="font-extrabold text-lg text-white group-hover:text-amber-400 transition-colors leading-tight">
                          {item.name}
                        </h3>

                        {/* Package Option Badge */}
                        {selectedPackage && (
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/20">
                              <Sparkles className="w-3 h-3 mr-0.5 text-amber-400" />
                              {selectedPackage.split('—')[0].trim()} Package
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Unit Price */}
                      <div className="text-right sm:text-right text-slate-300">
                        <span className="text-sm font-semibold">₹{displayPrice.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-500 block"> / day</span>
                      </div>
                    </div>

                    {/* Event Date & Special Notes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white/2 p-3 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Calendar className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <span>
                          Event Date: <strong className="text-white font-bold">{eventDate ? new Date(eventDate).toLocaleDateString() : 'Not specified'}</strong>
                        </span>
                      </div>

                      {notes && (
                        <div className="flex items-start gap-2 text-slate-300">
                          <FileText className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                          <span className="italic line-clamp-2">
                            Notes: "{notes}"
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Controls & Total */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      {/* Quantity selectors */}
                      <div className="flex items-center bg-slate-900/60 rounded-xl border border-white/10 px-1 py-1">
                        <button
                          onClick={() => updateQuantity(cartItemId, quantity - 1)}
                          disabled={quantity <= 1}
                          className="p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-extrabold text-sm text-white">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(cartItemId, quantity + 1)}
                          disabled={item.stock && item.stock <= quantity}
                          className="p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line Total & Remove button */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-xs text-slate-500 uppercase tracking-widest block font-bold">Total</span>
                          <span className="font-extrabold text-base text-white">₹{lineTotal.toLocaleString()}</span>
                        </div>

                        <button
                          onClick={() => removeFromCart(cartItemId)}
                          className="p-2.5 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                          title="Remove Item"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Order Summary Card */}
          <div className="lg:col-span-4 flex-shrink-0">
            <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-[#0d122b]/50 to-[#05060b]/95 shadow-2xl space-y-6 sticky top-28">
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Order Summary
              </h2>

              <div className="space-y-4 border-b border-white/5 pb-5 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Items Subtotal</span>
                  <span className="text-white font-bold">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Service Fee / Tax (10%)</span>
                  <span className="text-white font-bold">₹{tax.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between font-black text-xl text-white">
                <span>Total Estimate</span>
                <span className="text-amber-400">₹{total.toLocaleString()}</span>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full py-3.5 px-4 border border-transparent text-sm font-bold rounded-full text-black bg-amber-400 hover:bg-amber-300 transition-all hover:shadow-lg hover:shadow-amber-500/15 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleWhatsAppInquiryAll}
                  className="w-full py-3.5 px-4 rounded-full text-sm font-bold border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" /> Inquire all on WhatsApp
                </button>
              </div>

              <p className="text-[10px] text-slate-500 text-center leading-normal">
                Availability and final pricing will be verified by EventDeco coordinators during booking validation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
