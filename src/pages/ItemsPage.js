import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Star, ShoppingBag, Grid, AlertTriangle, RefreshCw, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { SafeLazyImage } from '../components/SafeImage';
import { SEO } from '../components/SEO';

// Deterministic mock rating helper
const getMockRating = (id) => {
  if (!id) return 4.5;
  const code = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return (4.0 + (code % 11) * 0.1).toFixed(1);
};

// Deterministic mock popularity helper
const getMockPopularity = (id) => {
  if (!id) return 50;
  return id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 100;
};

// Shimmer Skeleton Loader
const SkeletonCard = () => (
  <div className="glass-panel rounded-2xl overflow-hidden flex flex-col border border-border/40 animate-pulse">
    <div className="aspect-[3/2] w-full bg-slate-800 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
    </div>
    <div className="p-5 flex-1 space-y-3">
      <div className="h-3 w-1/4 bg-slate-700 rounded"></div>
      <div className="h-5 w-3/4 bg-slate-700 rounded"></div>
      <div className="h-4 w-5/6 bg-slate-700 rounded"></div>
      <div className="flex items-center gap-2 pt-2">
        <div className="h-4 w-12 bg-slate-700 rounded"></div>
        <div className="h-4 w-8 bg-slate-700 rounded"></div>
      </div>
      <div className="flex items-center justify-between pt-4">
        <div className="h-6 w-20 bg-slate-700 rounded"></div>
        <div className="h-8 w-8 rounded-full bg-slate-700"></div>
      </div>
    </div>
  </div>
);

export default function ItemsPage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('category') || 'all';

  // API State
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('All Products');
  const [categoryDesc, setCategoryDesc] = useState('Explore our premium event rental listings.');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State keys based on category to keep them isolated
  const sessionStorageKey = `eventdeco_items_state_${categoryId}`;

  // Filter/Sort State (initialized from sessionStorage if available)
  const [searchTerm, setSearchTerm] = useState(() => {
    const saved = sessionStorage.getItem(sessionStorageKey);
    return saved ? JSON.parse(saved).searchTerm || '' : '';
  });
  
  const [sortBy, setSortBy] = useState(() => {
    const saved = sessionStorage.getItem(sessionStorageKey);
    return saved ? JSON.parse(saved).sortBy || 'newest' : 'newest';
  });

  const [showOnlyAvailable, setShowOnlyAvailable] = useState(() => {
    const saved = sessionStorage.getItem(sessionStorageKey);
    return saved ? JSON.parse(saved).showOnlyAvailable ?? false : false;
  });

  const [minPrice, setMinPrice] = useState(() => {
    const saved = sessionStorage.getItem(sessionStorageKey);
    return saved ? JSON.parse(saved).minPrice || '' : '';
  });

  const [maxPrice, setMaxPrice] = useState(() => {
    const saved = sessionStorage.getItem(sessionStorageKey);
    return saved ? JSON.parse(saved).maxPrice || '' : '';
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(() => {
    const saved = sessionStorage.getItem(sessionStorageKey);
    return saved ? JSON.parse(saved).currentPage || 1 : 1;
  });
  
  const [pageSize, setPageSize] = useState(() => {
    const saved = sessionStorage.getItem(sessionStorageKey);
    return saved ? JSON.parse(saved).pageSize || 8 : 8;
  });

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    const filtersState = {
      searchTerm,
      sortBy,
      showOnlyAvailable,
      minPrice,
      maxPrice,
      currentPage,
      pageSize
    };
    sessionStorage.setItem(sessionStorageKey, JSON.stringify(filtersState));
  }, [searchTerm, sortBy, showOnlyAvailable, minPrice, maxPrice, currentPage, pageSize, sessionStorageKey]);

  // Initial Fetch: Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.getCategories();
        const active = (Array.isArray(data) ? data : []).filter(c => c.active !== false);
        setCategories(active);
        
        // Find selected category name/desc
        if (categoryId !== 'all') {
          const currentCat = active.find(c => c.id === categoryId);
          if (currentCat) {
            setCategoryName(currentCat.name);
            if (currentCat.description) {
              setCategoryDesc(currentCat.description);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load categories details', err);
      }
    };
    fetchCategories();
  }, [categoryId]);

  // Fetch Items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = {};
        if (categoryId !== 'all') params.categoryId = categoryId;
        if (searchTerm) params.search = searchTerm;
        
        const data = await api.getItems(params);
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Failed to retrieve inventory items.');
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    
    // Debounce search slightly to optimize calls
    const handler = setTimeout(() => {
      fetchItems();
    }, 250);

    return () => clearTimeout(handler);
  }, [categoryId, searchTerm]);

  // Filter & Sort Application locally
  const filteredItems = items
    .filter(item => {
      // 1. Availability filter
      if (showOnlyAvailable && (!item.available || item.stock <= 0)) {
        return false;
      }
      // 2. Min Price filter
      if (minPrice && item.price < parseFloat(minPrice)) {
        return false;
      }
      // 3. Max Price filter
      if (maxPrice && item.price > parseFloat(maxPrice)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      // 4. Sorting logic
      if (sortBy === 'priceAsc') return a.price - b.price;
      if (sortBy === 'priceDesc') return b.price - a.price;
      if (sortBy === 'rating') return parseFloat(getMockRating(b.id)) - parseFloat(getMockRating(a.id));
      if (sortBy === 'popularity') return getMockPopularity(b.id) - getMockPopularity(a.id);
      if (sortBy === 'availability') {
        const aAvail = a.available && a.stock > 0 ? 1 : 0;
        const bAvail = b.available && b.stock > 0 ? 1 : 0;
        return bAvail - aAvail;
      }
      // Newest default (using item id or index)
      return b.id.localeCompare(a.id);
    });

  // Calculate paginated slices
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  
  // Adjust current page if it is out of bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + pageSize);

  // Clear filters helper
  const handleResetFilters = () => {
    setSearchTerm('');
    setSortBy('newest');
    setShowOnlyAvailable(false);
    setMinPrice('');
    setMaxPrice('');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090b16] via-[#0d1430] to-[#05060b] text-white py-12 px-4 sm:px-6 lg:px-8">
      <SEO title={categoryName} description={categoryDesc} />

      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Navigation Breadcrumb & Title Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-white/10 pb-6">
          <div className="space-y-2">
            <button 
              onClick={() => navigate(`/catalog?category=${categoryId}`)}
              className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-amber-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Catalog
            </button>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent flex items-center gap-3">
              <span className="h-8 w-1 bg-amber-400 rounded-full"></span>
              {categoryName}
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">{categoryDesc}</p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-4 self-start md:self-center">
            <div className="glass-panel px-4 py-2 rounded-xl text-center border border-white/5 bg-white/2 backdrop-blur-sm">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Category items</p>
              <p className="text-lg font-black text-amber-400">{items.length}</p>
            </div>
            <div className="glass-panel px-4 py-2 rounded-xl text-center border border-white/5 bg-white/2 backdrop-blur-sm">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Filtered count</p>
              <p className="text-lg font-black text-amber-400">{filteredItems.length}</p>
            </div>
          </div>
        </div>

        {/* Toolbar & Filters Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filters Sidebar */}
          <aside className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#0d122b]/40 backdrop-blur-md">
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/5">
                <h3 className="font-extrabold text-lg flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-amber-400" /> Filters
                </h3>
                <button 
                  onClick={handleResetFilters}
                  className="text-xs text-slate-400 hover:text-amber-400 underline font-medium transition-colors"
                >
                  Reset all
                </button>
              </div>

              <div className="space-y-6">
                {/* Search field */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Keyword search..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                </div>

                {/* Sort Option */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sort By</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none text-white cursor-pointer"
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="newest">Newest Listings</option>
                    <option value="priceAsc">Price: Low to High</option>
                    <option value="priceDesc">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="popularity">Most Popular</option>
                    <option value="availability">Availability Priority</option>
                  </select>
                </div>

                {/* Price Range inputs */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Price Range ($)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      min="0"
                      className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-center"
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                    <span className="text-slate-500">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      min="0"
                      className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-center"
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                </div>

                {/* Availability switch toggle */}
                <div className="flex items-center justify-between pt-2">
                  <label htmlFor="avail-toggle" className="text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer">
                    Show Available Only
                  </label>
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      id="avail-toggle"
                      className="sr-only peer"
                      checked={showOnlyAvailable}
                      onChange={(e) => {
                        setShowOnlyAvailable(e.target.checked);
                        setCurrentPage(1);
                      }}
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500 cursor-pointer"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Support/Bulk Ad banner */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#0f111a] text-center space-y-4">
              <Grid className="w-10 h-10 text-amber-500 mx-auto" />
              <div>
                <h4 className="font-bold text-sm">Industrial Rentals</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Need bulk logistics for staging or large corporate audio events? Access wholesale quotes.</p>
              </div>
              <button className="text-xs font-bold text-amber-400 hover:text-amber-300 underline transition-colors">
                Contact Coordination Team
              </button>
            </div>
          </aside>

          {/* Main Grid & Pagination */}
          <main className="lg:col-span-3 space-y-8">
            
            {/* Catalog list header */}
            <div className="flex justify-between items-center bg-white/2 px-4 py-2 border border-white/5 rounded-xl text-sm">
              <span className="text-slate-400">
                Displaying <span className="text-white font-bold">{Math.min(startIndex + 1, totalItems)}-{Math.min(startIndex + pageSize, totalItems)}</span> of <span className="text-white font-bold">{totalItems}</span> matching products
              </span>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-xs hidden sm:inline">Per page:</span>
                <select
                  className="bg-slate-900/60 border border-white/10 rounded-lg px-2 py-1 text-xs cursor-pointer focus:outline-none"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={4}>4</option>
                  <option value={8}>8</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                </select>
              </div>
            </div>

            {/* Dynamic Results Grid */}
            {loading ? (
              // Loading state
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(pageSize)].map((_, idx) => (
                  <SkeletonCard key={idx} />
                ))}
              </div>
            ) : error ? (
              // Error state
              <div className="glass-panel p-8 text-center rounded-2xl border border-destructive/20 bg-destructive/5 space-y-4">
                <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
                <h3 className="text-lg font-bold text-destructive">Failed to Load Products</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">{error}</p>
                <button 
                  onClick={() => navigate(0)}
                  className="bg-destructive text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-destructive/90 transition-colors inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Retry Loading
                </button>
              </div>
            ) : totalItems === 0 ? (
              // Empty state
              <div className="glass-panel p-16 text-center rounded-2xl border border-white/5 bg-[#0d122b]/20">
                <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold">No Items Found</h3>
                <p className="text-slate-400 mt-2 text-sm max-w-md mx-auto">We couldn't find any products in this category that match your search filters.</p>
                <button 
                  onClick={handleResetFilters}
                  className="mt-6 bg-amber-500 text-black px-6 py-2 rounded-xl font-semibold hover:bg-amber-400 transition-colors text-sm"
                >
                  Clear Applied Filters
                </button>
              </div>
            ) : (
              // Complete card listings (Aesthetic category card style matching homepage cards)
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedItems.map(item => {
                  const rating = getMockRating(item.id);
                  const isOutOfStock = !item.available || item.stock <= 0;

                  return (
                    <div 
                      key={item.id} 
                      className="group flex flex-col p-5 rounded-2xl bg-gradient-to-br from-[#0d122b]/50 to-[#05060b]/90 border border-white/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-400/30 hover:shadow-2xl"
                    >
                      {/* Image header */}
                      <div className="aspect-[3/2] w-full bg-slate-900 rounded-xl overflow-hidden relative border border-white/5 mb-4">
                        <SafeLazyImage 
                          src={item.imageUrl}
                          fallbackSrc="https://images.unsplash.com/photo-1508215885820-4585e5610d32?w=500&q=80"
                          alt={item.name} 
                          effect="blur"
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Stock label */}
                        <div className={`absolute top-2 right-2 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded backdrop-blur border shadow-sm ${
                          isOutOfStock 
                            ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                            : 'bg-green-500/10 text-green-400 border-green-500/20'
                        }`}>
                          {isOutOfStock ? 'Out of Stock' : `${item.stock} Available`}
                        </div>
                      </div>

                      {/* Content block */}
                      <div className="flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                            {categories.find(c => c.id === item.categoryId)?.name || 'General Listing'}
                          </span>
                          {/* Stars Rating */}
                          <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="text-xs font-black text-slate-200">{rating}</span>
                          </div>
                        </div>

                        <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors leading-tight mb-2">
                          {item.name}
                        </h3>

                        <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
                          {item.description || 'No description provided for this catalog listing. Premium quality equipment guaranteed.'}
                        </p>

                        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                          <div>
                            <span className="text-xl font-black text-white">${item.price?.toFixed(2)}</span>
                            <span className="text-[10px] text-slate-500"> / day</span>
                          </div>
                          
                          <button 
                            disabled={isOutOfStock}
                            onClick={() => addToCart(item)}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                              isOutOfStock
                                ? 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                                : 'bg-amber-500 text-black hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/10'
                            }`}
                          >
                            {isOutOfStock ? 'Sold Out' : 'Book Now'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-white/5 pt-6">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/60 border border-white/10 rounded-xl text-xs font-semibold hover:bg-slate-800/80 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                
                {/* Page numbers */}
                <div className="flex gap-1.5">
                  {[...Array(totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all border ${
                          isActive
                            ? 'bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/10'
                            : 'bg-slate-900/60 text-slate-400 border-white/10 hover:bg-slate-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/60 border border-white/10 rounded-xl text-xs font-semibold hover:bg-slate-800/80 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
            
          </main>
        </div>

      </div>
    </div>
  );
}
