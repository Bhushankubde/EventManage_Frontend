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
    
    // Store customization details with item
    const customizedItem = {
      ...item,
      selectedPackage: currentPkg.label,
      eventDate: eventDate || 'Not specified',
      notes,
      price: unitPrice
    };

    addToCart(customizedItem, quantity);
    toast.success(`${item.name} (${currentPkg.id.toUpperCase()}) added to booking cart!`);
  };

  const handleWhatsAppEnquiry = () => {
    if (!item) return;

    const formattedDate = eventDate ? new Date(eventDate).toLocaleDateString() : 'Not selected';
    const message = `Hello Saaj Events! I am interested in inquiring about *${item.name}*.\n\n` +
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <SEO title={item.name} description={item.description || 'Event decor rental item.'} />

      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between mb-6 border-b border-border/40 pb-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link to={`/catalog?category=${item.categoryId || 'all'}`} className="hover:text-foreground transition-colors">
            {category ? category.name : 'Category'}
          </Link>
          <span>/</span>
          <span className="text-foreground font-semibold truncate max-w-[200px] sm:max-w-none">{item.name}</span>
        </nav>
      </div>

      {/* Main Two-Column Layout matching Screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* LEFT COLUMN: Visual Media & Badges */}
        <div className="lg:col-span-5 space-y-6">
          <div className="group aspect-[4/3] w-full bg-muted rounded-2xl overflow-hidden relative border border-border shadow-lg cursor-pointer">
            <SafeLazyImage
              src={item.imageUrl}
              fallbackSrc="https://images.unsplash.com/photo-1508215885820-4585e5610d32?w=800&q=80"
              alt={item.name}
              effect="blur"
              className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
            />
            {item.stock > 0 && (
              <div className="absolute top-3 left-3 px-3 py-1 bg-background/95 backdrop-blur text-xs font-bold rounded-lg border border-border shadow-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {item.stock} Available in Stock
              </div>
            )}
          </div>

          {/* Value Highlights & Inclusions */}
          <div className="glass-panel p-5 rounded-2xl border border-border/80 space-y-3 bg-muted/20">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" /> What's Included
            </h4>
            <ul className="space-y-2 text-xs text-foreground/90">
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
            <h1 className="text-3xl sm:text-4xl font-serif font-extrabold tracking-tight text-foreground mb-3">
              {item.name}
            </h1>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.description || 'Traditional gold & red mandap with floral canopy, drapes and stage lighting. Setup + teardown included.'}
            </p>
          </div>

          {/* Pricing starting display */}
          <div className="border-y border-border/60 py-4 flex items-baseline gap-3">
            <span className="text-sm font-semibold text-muted-foreground">From</span>
            <span className="text-3xl font-extrabold text-foreground tracking-tight">
              ₹{basePrice.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">/ day</span>
          </div>

          {/* Configuration Form */}
          <div className="space-y-5">
            {/* Package Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Package Option
              </label>
              <select
                value={selectedPackage}
                onChange={(e) => setSelectedPackage(e.target.value)}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer"
              >
                {packages.map(pkg => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                {currentPkg.description}
              </p>
            </div>

            {/* Event Date & Quantity Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Event Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Event Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={todayStr}
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-input-background border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer"
                    placeholder="dd-mm-yyyy"
                  />
                </div>
              </div>

              {/* Quantity Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Quantity
                </label>
                <div className="flex items-center bg-input-background border border-border rounded-xl px-2 py-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="flex-1 text-center font-extrabold text-sm text-foreground">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => (item.stock ? Math.min(item.stock, prev + 1) : prev + 1))}
                    disabled={item.stock ? quantity >= item.stock : false}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Special Instructions (Optional) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Special Event Requirements / Notes (Optional)
              </label>
              <textarea
                rows="2"
                placeholder="Mention any custom stage dimensions, venue timings, or preferences..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-input-background border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
              ></textarea>
            </div>

            {/* Dynamic Calculated Total */}
            <div className="glass-panel p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Total Rental Estimate
              </span>
              <div className="text-right">
                <span className="text-2xl font-black text-foreground">
                  ₹{totalPrice.toLocaleString()}
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  ({quantity} unit{quantity > 1 ? 's' : ''} &bull; {currentPkg.id.toUpperCase()})
                </span>
              </div>
            </div>

            {/* Action Buttons matching Screenshot Pill Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {/* Primary: Add to Booking Cart */}
              <button
                onClick={handleAddToCart}
                disabled={item.available === false || item.stock <= 0}
                className={`flex-1 py-3.5 px-6 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                  item.available === false || item.stock <= 0
                    ? 'bg-muted text-muted-foreground cursor-not-allowed border border-border'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg active:scale-95'
                }`}
              >
                <ShoppingBag className="w-4 h-4" /> Add to Booking Cart
              </button>

              {/* Secondary: Enquire on WhatsApp */}
              <button
                onClick={handleWhatsAppEnquiry}
                className="flex-1 py-3.5 px-6 rounded-full font-bold text-sm border-2 border-primary text-primary hover:bg-primary/10 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Enquire on WhatsApp
              </button>
            </div>

            {/* Subtext matching Screenshot */}
            <p className="text-[11px] text-muted-foreground text-center sm:text-left leading-normal pt-1">
              Both options are visible here — you don't need to build a full cart to send a quick WhatsApp enquiry.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
