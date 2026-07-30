import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, ShoppingBag, MessageCircle, AlertTriangle, ShieldCheck, CheckCircle2, Truck, Plus, Minus, Layers, Clock, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { SafeLazyImage } from '../components/SafeImage';
import { SEO } from '../components/SEO';
import { toast } from 'sonner';

export default function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [item, setItem] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [selectedPackage, setSelectedPackage] = useState('basic');
  const [eventDate, setEventDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  // Get today's date in YYYY-MM-DD format for min date attribute
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchItemDetails();
  }, [id]);

  // Listen to WebSocket inventory updates dynamically
  useEffect(() => {
    const handleInventoryUpdate = (e) => {
      const { itemId, availableQuantity } = e.detail;
      if (item && item.id === itemId) {
        setItem(prevItem => ({ ...prevItem, stock: availableQuantity }));
        setQuantity(prevQty => Math.min(prevQty, availableQuantity > 0 ? availableQuantity : 1));
      }
    };

    window.addEventListener('inventory-update', handleInventoryUpdate);
    return () => window.removeEventListener('inventory-update', handleInventoryUpdate);
  }, [item]);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      let data;
      try {
        data = await api.getItemById(id);
      } catch (e) {
        // Fallback: search in getItems list if getItemById fails or endpoint not ready
        const allItems = await api.getItems();
        data = Array.isArray(allItems) ? allItems.find(i => i.id === id) : null;
      }

      if (!data) {
        throw new Error('Item not found.');
      }

      setItem(data);

      // Fetch category name if categoryId exists
      if (data.categoryId) {
        try {
          const categories = await api.getCategories();
          const foundCat = (Array.isArray(categories) ? categories : []).find(c => c.id === data.categoryId);
          if (foundCat) setCategory(foundCat);
        } catch (catErr) {
          // Ignore
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load item details.');
    } finally {
      setLoading(false);
    }
  };

  const basePrice = item?.price || 0;

  // Package multiplier offset helpers
  const packages = [
    { id: 'basic', label: `Basic — ₹${basePrice.toLocaleString()}`, priceMultiplier: 1.0, description: 'Standard setup + basic lighting' },
    { id: 'standard', label: `Standard — ₹${(basePrice * 1.35).toFixed(0).toLocaleString()}`, priceMultiplier: 1.35, description: 'Enhanced floral canopy + ambient LED setup' },
    { id: 'premium', label: `Deluxe Premium — ₹${(basePrice * 1.75).toFixed(0).toLocaleString()}`, priceMultiplier: 1.75, description: 'Full grand stage + custom backdrop + teardown service' },
  ];

  const currentPkg = packages.find(p => p.id === selectedPackage) || packages[0];
  const unitPrice = basePrice * currentPkg.priceMultiplier;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    if (!item) return;
    addToCart(item, quantity, eventDate, currentPkg.label, notes);
  };

  const handleWhatsAppEnquiry = () => {
    if (!item) return;

    const formattedDate = eventDate ? new Date(eventDate).toLocaleDateString() : 'Not selected';
    const message = `Hello EventDeco! I am interested in inquiring about *${item.name}*.\n\n` +
      `- *Package:* ${currentPkg.label}\n` +
      `- *Event Date:* ${formattedDate}\n` +
      `- *Quantity:* ${quantity}\n` +
      `- *Estimated Total:* ₹${totalPrice.toLocaleString()}\n` +
      (notes ? `- *Notes:* ${notes}\n` : '') +
      `\nCould you please confirm availability?`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="glass-panel p-8 rounded-2xl border border-destructive/20 bg-destructive/5 space-y-4">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
          <h2 className="text-xl font-bold text-destructive">Item Not Found</h2>
          <p className="text-sm text-muted-foreground">{error || 'The requested rental item could not be loaded.'}</p>
          <button
            onClick={() => navigate('/catalog')}
            className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-gradient-to-b from-[#090b16] via-[#0d1430] to-[#05060b] text-white pt-28 sm:pt-36 lg:pt-40 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <SEO title={item.name} description={item.description || 'Event decor rental item.'} />

        {/* Top Breadcrumb Header */}
        <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-slate-400">
            <Link to="/" className="hover:text-amber-400 transition-colors">Home</Link>
            <span>/</span>
            <Link to={`/catalog?category=${item.categoryId || 'all'}`} className="hover:text-amber-400 transition-colors">
              {category ? category.name : 'Category'}
            </Link>
            <span>/</span>
            <span className="text-white font-semibold truncate max-w-[200px] sm:max-w-none">{item.name}</span>
          </nav>
        </div>

        {/* Main Two-Column Layout matching Screenshot */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: Visual Media & Badges */}
          <div className="lg:col-span-5 space-y-6">
            <div className="group aspect-[4/3] w-full bg-slate-900 rounded-2xl overflow-hidden relative border border-white/5 shadow-2xl cursor-pointer">
              <SafeLazyImage
                src={item.imageUrl}
                fallbackSrc="https://images.unsplash.com/photo-1508215885820-4585e5610d32?w=800&q=80"
                alt={item.name}
                effect="blur"
                className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
              />
              {item.stock > 0 && (
                <div className="absolute top-3 left-3 px-3 py-1 bg-slate-950/80 backdrop-blur text-xs font-bold rounded-lg border border-white/10 shadow-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {item.stock} Available in Stock
                </div>
              )}
            </div>

            {/* Value Highlights & Inclusions */}
            <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-[#090b16]/40 backdrop-blur-md space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" /> What's Included
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Professional Setup & Teardown Service Included</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span>Sanitized & Verified Quality Rental Gear</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span>Flexible 24-hour Event Rental Period</span>
                </li>
              </ul>
            </div>
          </div>

          {/* RIGHT COLUMN: Item Details & Configuration Form */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif font-extrabold tracking-tight text-white mb-3">
                {item.name}
              </h1>
              
              <p className="text-sm text-slate-400 leading-relaxed">
                {item.description || 'Traditional event rental decor. Setup + teardown included.'}
              </p>
            </div>

            {/* Pricing starting display */}
            <div className="border-y border-white/10 py-4 flex items-baseline gap-3">
              <span className="text-sm font-semibold text-slate-500">From</span>
              <span className="text-3xl font-extrabold text-white tracking-tight">
                ₹{basePrice.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500">/ day</span>
            </div>

            {/* Configuration Form */}
            <div className="space-y-5">
              {/* Package Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Package Option
                </label>
                <select
                  value={selectedPackage}
                  onChange={(e) => setSelectedPackage(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/60 border border-white/10 text-white rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all cursor-pointer"
                >
                  {packages.map(pkg => (
                    <option key={pkg.id} value={pkg.id} className="bg-[#0f1224] text-white">
                      {pkg.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1.5 font-medium">
                  {currentPkg.description}
                </p>
              </div>

              {/* Event Date & Quantity Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Event Date */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Event Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      min={todayStr}
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-white/10 text-white rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all cursor-pointer"
                      placeholder="dd-mm-yyyy"
                    />
                  </div>
                </div>

                {/* Quantity Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center bg-slate-900/60 border border-white/10 rounded-xl px-2 py-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      disabled={quantity <= 1}
                      className="p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="flex-1 text-center font-extrabold text-sm text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(prev => (item.stock ? Math.min(item.stock, prev + 1) : prev + 1))}
                      disabled={item.stock ? quantity >= item.stock : false}
                      className="p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Special Instructions (Optional) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Special Event Requirements / Notes (Optional)
                </label>
                <textarea
                  rows="2"
                  placeholder="Mention any custom stage dimensions, venue timings, or preferences..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none"
                ></textarea>
              </div>

              {/* Dynamic Calculated Total */}
              <div className="glass-panel p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Total Rental Estimate
                </span>
                <div className="text-right">
                  <span className="text-2xl font-black text-amber-400">
                    ₹{totalPrice.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    ({quantity} unit{quantity > 1 ? 's' : ''} &bull; {currentPkg.id.toUpperCase()})
                  </span>
                </div>
              </div>

              {/* Action Buttons matching Screenshot Pill Buttons */}
              {eventDate && quantity >= 1 ? (
                <>
                  <div className="flex flex-col sm:flex-row gap-3 pt-2 animate-in fade-in duration-300">
                    {/* Primary: Add to Booking Cart */}
                    <button
                      onClick={handleAddToCart}
                      disabled={item.available === false || item.stock <= 0}
                      className={`flex-1 py-3.5 px-6 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                        item.available === false || item.stock <= 0
                          ? 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                          : 'bg-amber-500 text-black hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" /> Add to Booking Cart
                    </button>

                    {/* Secondary: Enquire on WhatsApp */}
                    <button
                      onClick={handleWhatsAppEnquiry}
                      className="flex-1 py-3.5 px-6 rounded-full font-bold text-sm border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-400" /> Enquire on WhatsApp
                    </button>
                  </div>

                  {/* Subtext matching Screenshot */}
                  <p className="text-[11px] text-slate-500 text-center sm:text-left leading-normal pt-1 animate-in fade-in duration-300">
                    Both options are visible here — you don't need to build a full cart to send a quick WhatsApp enquiry.
                  </p>
                </>
              ) : (
                <div className="p-5 bg-slate-900/40 border border-dashed border-white/10 rounded-2xl text-center text-xs text-slate-500 space-y-1 shadow-inner animate-in fade-in duration-300">
                  <Calendar className="w-5 h-5 text-amber-500 mx-auto mb-1 opacity-70" />
                  <p className="font-bold text-white">Awaiting Configuration</p>
                  <p>Please select an <span className="text-amber-500 font-medium">Event Date</span> to unlock the booking options.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
