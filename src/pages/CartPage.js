import React from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { SEO } from '../components/SEO';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const subtotal = cart.reduce((total, { item, quantity }) => total + (item.price * quantity), 0);
  const tax = subtotal * 0.1; // 10% tax for example
  const total = subtotal + tax;

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center animate-in fade-in">
        <SEO title="Shopping Cart" description="Review items in your shopping cart." />
        <div className="glass-panel p-12 rounded-2xl inline-block max-w-lg w-full">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">Looks like you haven't added any items to your cart yet.</p>
          <Link to="/catalog" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors inline-block">
            Browse Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in">
      <SEO title="Shopping Cart" description="Review items in your shopping cart." />
      
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          {cart.map(({ item, quantity }) => (
            <div key={item.id} className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row items-center gap-4">
              <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src={item.imageUrl || 'https://images.unsplash.com/photo-1508215885820-4585e5610d32?w=200&q=80'} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 flex flex-col sm:flex-row justify-between w-full">
                <div>
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-muted-foreground text-sm">₹{item.price?.toFixed(2)} / day</p>
                </div>
                
                <div className="flex items-center gap-6 mt-4 sm:mt-0">
                  <div className="flex items-center bg-input-background rounded-md border border-border">
                    <button 
                      onClick={() => updateQuantity(item.id, quantity - 1)}
                      className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors rounded-l-md"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium text-sm">{quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, quantity + 1)}
                      disabled={item.stock <= quantity}
                      className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors rounded-r-md disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="font-bold w-20 text-right">
                    ₹{(item.price * quantity).toFixed(2)}
                  </div>
                  
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="glass-panel p-6 rounded-2xl sticky top-24">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6 pb-6 border-b border-border">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Estimated Tax (10%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex justify-between font-bold text-xl mb-6">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            
            <button 
              onClick={() => navigate('/checkout')}
              className="w-full py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-sm"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
