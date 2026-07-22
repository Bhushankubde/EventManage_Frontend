import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, ShoppingCart, Info, AlertTriangle, Lightbulb, Layers, Armchair, Sparkles, Volume2, Music, Utensils, Camera, LayoutGrid, X } from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { SafeLazyImage } from '../components/SafeImage';
import 'react-lazy-load-image-component/src/effects/blur.css';

// Helper to get category icons dynamically based on name
const getCategoryIcon = (name) => {
  if (!name) return Sparkles;
  const n = name.toLowerCase();
  if (n.includes('light')) return Lightbulb;
  if (n.includes('stage') || n.includes('truss')) return Layers;
  if (n.includes('seat') || n.includes('chair') || n.includes('table') || n.includes('sofa')) return Armchair;
  if (n.includes('decor') || n.includes('prop') || n.includes('flower') || n.includes('fx')) return Sparkles;
  if (n.includes('sound') || n.includes('audio') || n.includes('speaker')) return Volume2;
  if (n.includes('dj') || n.includes('music')) return Music;
  if (n.includes('cater') || n.includes('food') || n.includes('utensil')) return Utensils;
  if (n.includes('camera') || n.includes('photo') || n.includes('video')) return Camera;
  return Sparkles; // Default
};

const CatalogPage = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [category, setCategory] = useState(categoryParam || null);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync category state with categoryParam from URL, or set default category if none in URL
  useEffect(() => {
    if (categories.length > 0) {
      if (categoryParam) {
        const found = categories.find(
          c => c.id === categoryParam ||
            c.name.toLowerCase() === categoryParam.toLowerCase() ||
            categoryParam.toLowerCase().includes(c.name.toLowerCase())
        );
        if (found) {
          setCategory(found.id);
        } else {
          setCategory(categoryParam);
        }
      } else {
        // Default to the first available category if no category is specified in URL
        const sorted = categories.slice().sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
        const defaultCategory = sorted[0]?.id;
        if (defaultCategory) {
          setCategory(defaultCategory);
          searchParams.set('category', defaultCategory);
          setSearchParams(searchParams, { replace: true });
        }
      }
    }
  }, [categoryParam, categories]);

  // Initial Fetch: Categories ONLY
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch Items ONLY when a category is selected or a search term is provided
  useEffect(() => {
    if (category || searchTerm) {
      fetchItems();
    } else {
      setItems([]);
      setLoading(false);
      setError(null);
    }
  }, [category, searchTerm]);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const data = await api.getCategories();
      // Only show active categories
      const active = (Array.isArray(data) ? data : []).filter(c => c.active !== false);
      setCategories(active);
    } catch (err) {
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchItems = async () => {
    if (!category && !searchTerm) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (category && category !== 'all') params.categoryId = category;
      if (searchTerm) params.search = searchTerm;

      const data = await api.getItems(params);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load items. Please ensure backend is running.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (catId) => {
    setCategory(catId);
    searchParams.set('category', catId);
    setSearchParams(searchParams);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
  };

  const selectedCategoryObj = categories.find(c => c.id === category);

  const displayItems = items.filter(item => {
    if (item.available === false || item.available === 0 || item.available === 'false' || item.available === '0') {
      return false;
    }
    if (minPrice !== '' && !isNaN(parseFloat(minPrice)) && item.price < parseFloat(minPrice)) {
      return false;
    }
    if (maxPrice !== '' && !isNaN(parseFloat(maxPrice)) && item.price > parseFloat(maxPrice)) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">

      {/* Premium Horizontal Categories Carousel */}
      <div className="mb-10 animate-in fade-in duration-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <span className="h-6 w-1 bg-primary rounded-full"></span>
              Browse Categories
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Select a category to explore available event rentals</p>
          </div>
        </div>

        {categoriesLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 w-40 bg-card border border-border rounded-xl animate-pulse flex-shrink-0"></div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-1 px-1 scrollbar-hide -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            {/* Dynamic Category Cards */}
            {categories
              .slice()
              .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
              .map(cat => {
                const Icon = getCategoryIcon(cat.name);
                const isSelected = category === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`flex items-center gap-3 px-5 py-3 rounded-xl border transition-all duration-300 flex-shrink-0 cursor-pointer ${isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/10 -translate-y-0.5 ring-2 ring-primary/40'
                      : 'bg-card border-border hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5'
                      }`}
                  >
                    {cat.imageUrl ? (
                      <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 relative border border-border">
                        <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${isSelected
                        ? 'bg-primary-foreground/15 text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                        }`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                    )}
                    <span className={`font-bold text-sm leading-tight ${isSelected ? 'text-primary-foreground' : 'text-foreground'
                      }`}>
                      {cat.name}
                    </span>
                  </button>
                );
              })}
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">

        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div className="glass-panel p-5 rounded-xl">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5" /> Filters
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Find items..."
                    className="w-full pl-9 pr-3 py-2 bg-input-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Category</label>
                <select
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
                  value={category || ''}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                >
                  {categories
                    .slice()
                    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
                    .map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))
                  }
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Price Range (₹/day)</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₹</span>
                    <input
                      type="number"
                      placeholder="Min"
                      min="0"
                      className="w-full pl-6 pr-2 py-1.5 bg-input-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                  </div>
                  <span className="text-muted-foreground text-xs">-</span>
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₹</span>
                    <input
                      type="number"
                      placeholder="Max"
                      min="0"
                      className="w-full pl-6 pr-2 py-1.5 bg-input-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {(searchTerm || minPrice || maxPrice) && (
                <button
                  onClick={handleResetFilters}
                  className="w-full py-2 text-xs font-semibold text-muted-foreground hover:text-foreground border border-border rounded-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Sidebar Info Box */}
          <div className="p-5 rounded-xl border border-dashed border-border bg-muted/50">
            <h3 className="font-bold text-sm mb-2">Bulk Orders</h3>
            <p className="text-xs text-muted-foreground mb-3">Planning a large scale event? Contact our sales team for industrial discounts.</p>
            <button className="text-xs font-semibold text-primary underline cursor-pointer">Contact Sales</button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold">
                  {selectedCategoryObj ? selectedCategoryObj.name : 'Category Equipment'}
                </h1>
                {selectedCategoryObj?.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedCategoryObj.description}</p>
                )}
              </div>
              <span className="text-sm text-muted-foreground">{displayItems.length} items</span>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-3">
                <AlertTriangle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            ) : displayItems.length === 0 ? (
              <div className="text-center py-20 glass-panel rounded-xl">
                <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-bold">No items found</h3>
                <p className="text-muted-foreground mt-2">No items are currently listed under this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {displayItems.map(item => (
                  <div key={item.id} className="group glass-panel rounded-xl overflow-hidden flex flex-col hover:border-primary/30 transition-colors">
                    <div 
                      onClick={() => navigate(`/items/${item.id}`)} 
                      className="aspect-[3/2] w-full bg-muted relative overflow-hidden cursor-pointer"
                    >
                      <SafeLazyImage
                        src={item.imageUrl}
                        fallbackSrc="https://images.unsplash.com/photo-1508215885820-4585e5610d32?w=500&q=80"
                        alt={item.name}
                        effect="blur"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-in-out"
                      />
                      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-background/90 backdrop-blur text-[10px] font-bold rounded shadow-sm">
                        {item.stock > 0 ? `${item.stock} in stock` : 'Out of Stock'}
                      </div>
                    </div>

                    <div className="p-3 flex flex-col flex-1">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">
                        {categories.find(c => c.id === item.categoryId)?.name || 'General'}
                      </div>
                      <h3 
                        onClick={() => navigate(`/items/${item.id}`)}
                        className="font-semibold text-sm leading-tight mb-1.5 flex-1 cursor-pointer hover:text-primary transition-colors"
                      >
                        {item.name}
                      </h3>

                      <div className="flex items-end justify-between mt-2">
                        <div onClick={() => navigate(`/items/${item.id}`)} className="cursor-pointer">
                          <span className="text-base font-black">₹{item.price?.toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground">/day</span>
                        </div>

                        <button
                          disabled={!item.stock || item.stock <= 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item);
                          }}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${item.stock > 0
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : 'bg-muted text-muted-foreground cursor-not-allowed'
                            }`}
                          aria-label="Add to cart"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;


