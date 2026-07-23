import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Lightbulb, 
  Layers, 
  Armchair, 
  Sparkles, 
  Music, 
  PartyPopper, 
  Utensils, 
  Camera, 
  ArrowRight 
} from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { SafeLazyImage } from './SafeImage';

const getCategoryIcon = (name) => {
  if (!name) return Sparkles;
  const n = name.toLowerCase();
  if (n.includes('light')) return Lightbulb;
  if (n.includes('stage') || n.includes('truss')) return Layers;
  if (n.includes('seat') || n.includes('chair') || n.includes('table') || n.includes('sofa')) return Armchair;
  if (n.includes('decor') || n.includes('flower') || n.includes('prop') || n.includes('wedding')) return Sparkles;
  if (n.includes('sound') || n.includes('audio') || n.includes('speaker') || n.includes('music') || n.includes('dj')) return Music;
  if (n.includes('birthday') || n.includes('party')) return PartyPopper;
  if (n.includes('cater') || n.includes('food')) return Utensils;
  if (n.includes('photo') || n.includes('camera')) return Camera;
  return Sparkles;
};

// Badges for featured items
const getBadgeForItem = (index) => {
  const badges = [
    { label: 'Best Seller', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    { label: 'Available This Weekend', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    { label: 'Bulk Discount', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    { label: 'New', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  ];
  return badges[index % badges.length];
};

export const CatalogSection = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catData, itemData] = await Promise.all([
        api.getCategories().catch(() => []),
        api.getItems().catch(() => [])
      ]);

      const activeCategories = (Array.isArray(catData) ? catData : []).filter(c => c.active !== false);
      setCategories(activeCategories);

      const activeItems = (Array.isArray(itemData) ? itemData : []).filter(
        i => i.available !== false && i.available !== 0 && i.available !== 'false' && i.available !== '0'
      );
      setItems(activeItems);
    } catch (err) {
      console.error('Error fetching homepage catalog data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative z-10 bg-gradient-to-b from-[#0a0c1f] via-[#151726] to-[#090b16]">
      <div className="max-w-[1600px] mx-auto w-full space-y-14 sm:space-y-16">

        {/* SECTION 1: BROWSE BY CATEGORIES */}
        <div>
          <div className="mb-6 sm:mb-8 text-left">
            <span className="text-amber-400 text-[11px] sm:text-xs font-bold uppercase tracking-widest block mb-1">
              BROWSE BY
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-serif">
              Categories
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-28 bg-white/5 rounded-xl animate-pulse border border-white/5"></div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 bg-white/5 rounded-xl border border-white/5 text-slate-400 text-sm">
              No categories found in database.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5">
              {categories.map((cat) => {
                const IconComponent = getCategoryIcon(cat.name);
                return (
                  <button
                    key={cat.id}
                    onClick={() => navigate(`/catalog?category=${cat.id}`)}
                    className="group flex flex-col items-center justify-center p-4 sm:p-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer text-center"
                  >
                    {cat.imageUrl ? (
                      <div className="w-11 h-11 rounded-lg overflow-hidden mb-3 border border-white/10 group-hover:scale-105 transition-transform flex-shrink-0">
                        <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-sm flex-shrink-0">
                        <IconComponent className="w-5 h-5" />
                      </div>
                    )}
                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors leading-tight line-clamp-1">
                      {cat.name}
                    </h3>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 2: POPULAR RIGHT NOW - FEATURED ITEMS */}
        <div>
          <div className="mb-6 sm:mb-8 text-left flex items-end justify-between">
            <div>
              <span className="text-amber-400 text-[11px] sm:text-xs font-bold uppercase tracking-widest block mb-1">
                POPULAR RIGHT NOW
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-serif">
                Featured Items
              </h2>
            </div>
            <Link
              to="/catalog"
              className="text-amber-400 hover:text-amber-300 text-xs sm:text-sm font-bold flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-64 bg-white/5 rounded-xl animate-pulse border border-white/5"></div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 bg-white/5 rounded-xl border border-white/5 text-slate-400 text-sm">
              No items available in database.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5">
              {items.slice(0, 10).map((item, index) => {
                const badge = getBadgeForItem(index);
                const isOutOfStock = !item.available || item.stock <= 0;

                return (
                  <div
                    key={item.id}
                    className="group flex flex-col p-3.5 sm:p-4 rounded-xl bg-gradient-to-br from-[#0d122b]/60 to-[#05060b]/90 border border-white/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:shadow-xl"
                  >
                    {/* Image Container */}
                    <div 
                      onClick={() => navigate(`/items/${item.id}`)}
                      className="aspect-[4/3] w-full bg-slate-900 rounded-lg overflow-hidden relative border border-white/5 mb-3 cursor-pointer"
                    >
                      <SafeLazyImage
                        src={item.imageUrl}
                        fallbackSrc="https://images.unsplash.com/photo-1508215885820-4585e5610d32?w=500&q=80"
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                      />
                      {/* Badge */}
                      <div className={`absolute top-2 left-2 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border backdrop-blur ${badge.color}`}>
                        {badge.label}
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <h3 
                          onClick={() => navigate(`/items/${item.id}`)}
                          className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors leading-tight line-clamp-1 cursor-pointer"
                        >
                          {item.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 leading-snug line-clamp-1 mt-1">
                          {item.description || 'Premium event rental.'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between mt-auto">
                        <div onClick={() => navigate(`/items/${item.id}`)} className="cursor-pointer">
                          <span className="text-sm sm:text-base font-black text-white">₹{item.price?.toFixed(2)}</span>
                          <span className="text-[9px] text-slate-400">/day</span>
                        </div>

                        <button
                          disabled={isOutOfStock}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/items/${item.id}`);
                          }}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                            isOutOfStock
                              ? 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                              : 'bg-amber-500 text-black hover:bg-amber-400 hover:shadow-md hover:shadow-amber-500/20 cursor-pointer'
                          }`}
                        >
                          {isOutOfStock ? 'Sold Out' : 'Book'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
