import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ShoppingBag, Users, Plus, Check, Search, Phone, UserPlus, AlertCircle } from 'lucide-react';
import { SEO } from '../components/SEO';
import { toast } from 'sonner';

const OfflineSalesPage = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Walk-in search state
  const [phoneSearch, setPhoneSearch] = useState('');
  const [foundCustomer, setFoundCustomer] = useState(null);
  const [searchMessage, setSearchMessage] = useState('');

  // Inline customer creation state
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    notes: 'Walk-in customer registered from Offline Sales portal'
  });

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

  const [itemsList, setItemsList] = useState([]);

  useEffect(() => {
    fetchOfflineSales();
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const data = await api.getItems();
      setItemsList(data || []);
    } catch (err) {
      console.error('Failed to load items', err);
    }
  };

  const fetchOfflineSales = async () => {
    try {
      setLoading(true);
      const data = await api.getOfflineSales();
      setSales(data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load historical offline sales');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchCustomer = async (e) => {
    e.preventDefault();
    if (!phoneSearch.trim()) return;
    setSearchMessage('');
    try {
      const customer = await api.searchWalkInCustomerByPhone(phoneSearch.trim());
      if (customer) {
        setFoundCustomer(customer);
        setFormData(prev => ({ ...prev, customerId: customer.id }));
        toast.success(`Customer found: ${customer.firstName} ${customer.lastName}`);
      } else {
        setFoundCustomer(null);
        setSearchMessage('No customer found with that phone number. You can register them below.');
        toast.info('No customer found.');
      }
    } catch (err) {
      setFoundCustomer(null);
      setSearchMessage('Error searching customer. You can register a new one below.');
    }
  };

  const handleRegisterCustomer = async (e) => {
    e.preventDefault();
    try {
      const newCustomer = await api.createWalkInCustomer(customerForm);
      setFoundCustomer(newCustomer);
      setFormData(prev => ({ ...prev, customerId: newCustomer.id }));
      setShowAddCustomer(false);
      toast.success(`Registered successfully: ${newCustomer.firstName}`);
      // reset form
      setCustomerForm({ firstName: '', lastName: '', phone: '', email: '', address: '', notes: 'Walk-in customer' });
    } catch (err) {
      toast.error(err.message || 'Failed to register walk-in customer');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerId) {
      toast.error('Please search or register a walk-in customer first.');
      return;
    }

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
      toast.success('Offline sale recorded successfully!');
      
      // Reset sale form (keep customer selected)
      setFormData(prev => ({
        ...prev,
        itemId: '',
        quantity: 1,
        rentalStartDate: '',
        rentalEndDate: '',
        depositAmount: 0
      }));
    } catch (err) {
      setError(err.message || 'Failed to record sale');
      toast.error(err.message || 'Failed to record sale');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 lg:pt-40 pb-12 bg-[#070914] text-white min-h-screen">
      <SEO title="Offline Sales Portal" description="Record walk-in store sales & associate customer profiles." />
      
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-serif font-black text-white">Offline Store Cashier</h1>
          <p className="text-xs text-slate-400 mt-1">Register walk-in customer sales and rentals</p>
        </div>
        <a
          href="/admin"
          className="bg-white/5 border border-white/5 hover:bg-white/10 text-xs font-bold px-4 py-2 rounded-xl text-slate-300 hover:text-white transition-all"
        >
          Return to Admin Dashboard
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Customer Search & Registration */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Customer Search Box */}
          <div className="bg-[#0f1224] border border-white/5 p-6 rounded-2xl shadow-xl">
            <h3 className="text-md font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              1. Link Walk-in Customer
            </h3>
            <form onSubmit={handleSearchCustomer} className="flex gap-2">
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  required
                  type="text"
                  placeholder="Enter phone number..."
                  value={phoneSearch}
                  onChange={(e) => setPhoneSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#070914] border border-white/10 rounded-xl text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2.5 rounded-xl text-xs flex items-center"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {foundCustomer ? (
              <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-bold text-emerald-400">Linked Customer Profile</p>
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-sm font-medium">{foundCustomer.firstName} {foundCustomer.lastName}</p>
                <p className="text-xs text-slate-400">Phone: {foundCustomer.phone} | Email: {foundCustomer.email || 'N/A'}</p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {searchMessage && (
                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-start space-x-2 text-xs text-slate-300">
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>{searchMessage}</span>
                  </div>
                )}
                {!showAddCustomer ? (
                  <button
                    onClick={() => setShowAddCustomer(true)}
                    className="w-full py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <UserPlus className="w-4 h-4" /> Create New Customer Record
                  </button>
                ) : (
                  <form onSubmit={handleRegisterCustomer} className="p-4 bg-white/2 border border-white/5 rounded-xl space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        required
                        placeholder="First Name"
                        value={customerForm.firstName}
                        onChange={(e) => setCustomerForm({ ...customerForm, firstName: e.target.value })}
                        className="w-full px-3 py-2 bg-[#070914] border border-white/10 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                      <input
                        required
                        placeholder="Last Name"
                        value={customerForm.lastName}
                        onChange={(e) => setCustomerForm({ ...customerForm, lastName: e.target.value })}
                        className="w-full px-3 py-2 bg-[#070914] border border-white/10 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <input
                      required
                      placeholder="Phone"
                      value={customerForm.phone}
                      onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-[#070914] border border-white/10 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={customerForm.email}
                      onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-[#070914] border border-white/10 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                    <input
                      placeholder="Street Address"
                      value={customerForm.address}
                      onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                      className="w-full px-3 py-2 bg-[#070914] border border-white/10 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddCustomer(false)}
                        className="flex-1 py-2 border border-white/10 hover:bg-white/5 rounded-lg text-xs font-semibold text-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-xs font-bold"
                      >
                        Register User
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CENTER COLUMN: Order Cart & Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Record New Sale Form */}
            <div className="bg-[#0f1224] border border-white/5 p-6 rounded-2xl shadow-xl md:col-span-1">
              <h3 className="text-md font-bold mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                2. Cart Details
              </h3>
              {error && <div className="text-red-500 text-xs mb-4 bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl">{error}</div>}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Equipment Rental Item</label>
                  <select
                    required
                    name="itemId"
                    value={formData.itemId}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-[#070914] border border-white/10 rounded-xl text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none cursor-pointer"
                  >
                    <option value="">Select Equipment...</option>
                    {itemsList.map(item => (
                      <option key={item.id} value={item.id} className="bg-[#0f1224] text-white">
                        {item.name} (Stock: {item.stock} - Price: ₹{item.price})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Rental Quantity</label>
                  <input
                    required
                    type="number"
                    min="1"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-[#070914] border border-white/10 rounded-xl text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Start Date</label>
                    <input
                      required
                      type="date"
                      name="rentalStartDate"
                      value={formData.rentalStartDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-[#070914] border border-white/10 rounded-xl text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">End Date</label>
                    <input
                      required
                      type="date"
                      name="rentalEndDate"
                      value={formData.rentalEndDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-[#070914] border border-white/10 rounded-xl text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Payment Method</label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-[#070914] border border-white/10 rounded-xl text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none cursor-pointer"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="Transfer">Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Security Deposit (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="depositAmount"
                      value={formData.depositAmount}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-[#070914] border border-white/10 rounded-xl text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm mt-4 shadow-md transition-all disabled:opacity-50"
                >
                  {loading ? 'Recording...' : 'Complete Invoice'}
                </button>
              </form>
            </div>

            {/* Recent Sales Session log */}
            <div className="bg-[#0f1224] border border-white/5 p-6 rounded-2xl shadow-xl md:col-span-1 h-[450px] overflow-y-auto flex flex-col">
              <div>
                <h3 className="text-md font-bold mb-1">Recent Invoices</h3>
                <p className="text-xs text-slate-400 mb-4">Historical walk-in checkout registry logs</p>
              </div>
              <div className="flex-1 space-y-4">
                {sales.map((sale, idx) => (
                  <div key={sale.id || idx} className="p-3 border border-white/5 rounded-xl bg-white/2 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-xs text-amber-500">Invoice #{sale.id?.substring(0, 6) || idx}</p>
                      <p className="text-[10px] text-slate-400">{sale.customerName || 'Walk-in Client'}</p>
                      <span className="text-[9px] text-slate-500 block pt-1">
                        {sale.createdAt ? new Date(sale.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-emerald-400">₹{sale.totalAmount}</p>
                      <p className="text-[10px] text-slate-400">{sale.paymentMethod}</p>
                    </div>
                  </div>
                ))}
                {sales.length === 0 && (
                  <p className="text-slate-400 text-xs text-center py-12">No sales logged in history.</p>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OfflineSalesPage;
