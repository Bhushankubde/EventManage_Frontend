import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Users, Plus, Check } from 'lucide-react';
import { SEO } from '../components/SEO';

const OfflineSalesPage = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Sale recording state
  const [formData, setFormData] = useState({
    customerId: '',
    itemId: '',
    quantity: 1,
    rentalStartDate: '',
    rentalEndDate: '',
    paymentMethod: 'Cash',
    depositAmount: 0
  });

  useEffect(() => {
    // Optionally fetch existing sales
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        customerId: formData.customerId,
        items: [{ itemId: formData.itemId, quantity: parseInt(formData.quantity) }],
        rentalStartDate: formData.rentalStartDate,
        rentalEndDate: formData.rentalEndDate,
        paymentMethod: formData.paymentMethod,
        paymentStatus: 'PAID',
        depositAmount: parseFloat(formData.depositAmount),
        notes: 'Walk-in offline sale'
      };
      
      const newSale = await api.createOfflineSale(payload);
      setSales([newSale, ...sales]);
      alert('Sale recorded successfully!');
    } catch (err) {
      setError(err.message || 'Failed to record sale');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in">
      <SEO title="Offline Sales" description="Record walk-in store sales." />
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Offline Sales</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-4 flex items-center"><ShoppingBag className="mr-2" /> Record New Sale</h2>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Customer ID (Walk-in Customer ID)</label>
              <input required type="text" name="customerId" value={formData.customerId} onChange={handleChange} className="w-full p-2 border border-border rounded-md bg-input-background" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Item ID</label>
                <input required type="text" name="itemId" value={formData.itemId} onChange={handleChange} className="w-full p-2 border border-border rounded-md bg-input-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input required type="number" min="1" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full p-2 border border-border rounded-md bg-input-background" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input required type="date" name="rentalStartDate" value={formData.rentalStartDate} onChange={handleChange} className="w-full p-2 border border-border rounded-md bg-input-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input required type="date" name="rentalEndDate" value={formData.rentalEndDate} onChange={handleChange} className="w-full p-2 border border-border rounded-md bg-input-background" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="w-full p-2 border border-border rounded-md bg-input-background">
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Transfer">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deposit Amount (₹)</label>
                <input type="number" min="0" step="0.01" name="depositAmount" value={formData.depositAmount} onChange={handleChange} className="w-full p-2 border border-border rounded-md bg-input-background" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-2 bg-primary text-primary-foreground font-medium rounded-lg mt-4">
              {loading ? 'Recording...' : 'Record Sale'}
            </button>
          </form>
        </div>

        <div className="glass-panel p-6 rounded-2xl h-fit">
          <h2 className="text-xl font-bold mb-4">Recent Sales Session</h2>
          {sales.length === 0 ? (
            <p className="text-muted-foreground text-sm">No sales recorded in this session yet.</p>
          ) : (
            <ul className="space-y-4">
              {sales.map((sale, idx) => (
                <li key={idx} className="p-4 border border-border rounded-lg bg-muted/30 flex justify-between items-center">
                  <div>
                    <p className="font-bold">Sale #{sale.id?.substring(0,6) || idx}</p>
                    <p className="text-sm text-muted-foreground">{sale.items?.[0]?.quantity} item(s)</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">₹{sale.totalAmount}</p>
                    <p className="text-xs text-muted-foreground">{sale.paymentMethod}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfflineSalesPage;
