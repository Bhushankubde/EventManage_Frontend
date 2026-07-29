import React, { useState, useEffect, useRef, useMemo } from 'react';
import { api } from '../services/api';
import { 
  ShoppingBag, Users, Search, Phone, UserPlus, AlertCircle, 
  DollarSign, Clock, Printer, ArrowRight, X, 
  ArrowLeft, Landmark, CreditCard, ChevronRight, CheckCircle2, 
  ShieldCheck, User, Trash2
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { toast } from 'sonner';

const OfflineSalesPage = () => {
  const [activeTab, setActiveTab] = useState('cashier'); // 'cashier', 'dashboard', 'pending', 'customers'
  
  // Master lists
  const [sales, setSales] = useState([]);
  const [customersList, setCustomersList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- TAB 1: POS CASHIER STATES ---
  const [phoneSearch, setPhoneSearch] = useState('');
  const [searchMessage, setSearchMessage] = useState('');
  const [foundCustomer, setFoundCustomer] = useState(null);
  const [cashierStep, setCashierStep] = useState(1); // 1: Search/Register, 2: Add to Cart, 3: Invoice & Pay
  
  // Inline customer creation
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  // Rental details & cart
  const [cart, setCart] = useState([]); // Array of { item, quantity }
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentItemId, setCurrentItemId] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [rentalStartDate, setRentalStartDate] = useState('');
  const [rentalEndDate, setRentalEndDate] = useState('');
  const [depositAmount, setDepositAmount] = useState(0);
  const [cashierNotes, setCashierNotes] = useState('');

  // Payment
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [generatedSale, setGeneratedSale] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // --- TAB 3: PENDING PAYMENTS STATES ---
  const [searchPending, setSearchPending] = useState('');
  const [paymentModalSale, setPaymentModalSale] = useState(null);
  const [paymentModalAmount, setPaymentModalAmount] = useState('');
  const [paymentModalMethod, setPaymentModalMethod] = useState('Cash');

  // --- TAB 4: CUSTOMER DIRECTORY STATES ---
  const [searchCustomerQuery, setSearchCustomerQuery] = useState('');
  const [selectedProfileCustomer, setSelectedProfileCustomer] = useState(null);
  const [selectedProfileHistory, setSelectedProfileHistory] = useState([]);
  const [profileActiveTab, setProfileActiveTab] = useState('rentals'); // 'rentals', 'payments', 'outstanding'

  const didFetchRef = useRef(false);

  // On mount: Fetch general data
  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [salesData, customersData, categoriesData] = await Promise.all([
        api.getOfflineSales(),
        api.getWalkInCustomers(),
        api.getCategories()
      ]);
      setSales(salesData || []);
      setCustomersList(customersData || []);
      setCategories(categoriesData || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load initial POS data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch items when category selection changes
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const params = {};
        if (selectedCategory && selectedCategory !== 'all') {
          params.categoryId = selectedCategory;
        }
        const data = await api.getItems(params);
        setItemsList(data || []);
      } catch (err) {
        console.error('Failed to load items', err);
      }
    };
    fetchItems();
  }, [selectedCategory]);

  // --- RENTAL UTILITIES ---
  const getRentalDays = (start, end) => {
    if (!start || !end) return 1;
    const sDate = new Date(start);
    const eDate = new Date(end);
    const diffTime = eDate - sDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
    return isNaN(diffDays) || diffDays <= 0 ? 1 : diffDays;
  };

  const rentalDays = getRentalDays(rentalStartDate, rentalEndDate);

  const cartSubtotalPerDay = cart.reduce((acc, item) => acc + (item.item.price * item.quantity), 0);
  const cartTotalCost = cartSubtotalPerDay * rentalDays;
  const combinedTotal = cartTotalCost + (parseFloat(depositAmount) || 0);

  const isDateRangeInvalid = useMemo(() => {
    if (!rentalStartDate || !rentalEndDate) return false;
    return rentalEndDate < rentalStartDate;
  }, [rentalStartDate, rentalEndDate]);

  // --- ACTION: SEARCH CUSTOMER ---
  const handleSearchCustomer = async (e) => {
    e.preventDefault();
    if (!phoneSearch.trim()) return;
    setSearchMessage('');
    setFoundCustomer(null);
    try {
      const customer = await api.searchWalkInCustomerByPhone(phoneSearch.trim());
      if (customer) {
        setFoundCustomer(customer);
        toast.success(`Linked Customer: ${customer.firstName} ${customer.lastName}`);
        setRegisterForm({ fullName: '', phone: '', email: '', address: '', notes: '' });
      } else {
        setSearchMessage('No customer found with that phone number. You can register them below.');
        setRegisterForm(prev => ({ ...prev, phone: phoneSearch.trim() }));
      }
    } catch (err) {
      if (err.message && (err.message.toLowerCase().includes('not found') || err.message.toLowerCase().includes('404'))) {
        setSearchMessage('No customer found with that phone number. You can register them below.');
        setRegisterForm(prev => ({ ...prev, phone: phoneSearch.trim() }));
      } else {
        toast.error(err.message || 'Error searching customer.');
        setSearchMessage('Error searching customer. Please try again.');
      }
    }
  };

  // --- ACTION: REGISTER CUSTOMER ---
  const handleRegisterCustomer = async (e) => {
    e.preventDefault();
    if (!registerForm.fullName.trim() || !registerForm.phone.trim() || !registerForm.address.trim()) {
      toast.error('Please fill in Name, Phone number, and Street Address.');
      return;
    }

    try {
      const names = registerForm.fullName.trim().split(/\s+/);
      const firstName = names[0];
      const lastName = names.slice(1).join(' ') || '-';

      const newCustomer = await api.createWalkInCustomer({
        firstName,
        lastName,
        phone: registerForm.phone.trim(),
        email: registerForm.email.trim(),
        address: registerForm.address.trim(),
        notes: registerForm.notes.trim() || 'Registered from POS Cashier portal'
      });

      setFoundCustomer(newCustomer);
      // Add to local list
      setCustomersList(prev => [newCustomer, ...prev]);
      toast.success(`Customer registered & linked: ${newCustomer.firstName}`);
      setRegisterForm({ fullName: '', phone: '', email: '', address: '', notes: '' });
      setSearchMessage('');
    } catch (err) {
      toast.error(err.message || 'Failed to register customer');
    }
  };

  // --- ACTION: ADD TO CART ---
  const handleAddToCart = () => {
    if (!currentItemId) {
      toast.error('Please select an item to add.');
      return;
    }
    const item = itemsList.find(i => i.id === currentItemId);
    if (!item) return;

    if (item.stock < currentQuantity) {
      toast.error(`Only ${item.stock} units available in stock.`);
      return;
    }

    const existingIndex = cart.findIndex(c => c.item.id === item.id);
    if (existingIndex > -1) {
      const newQty = cart[existingIndex].quantity + parseInt(currentQuantity);
      if (item.stock < newQty) {
        toast.error(`Cannot exceed available stock (${item.stock} items).`);
        return;
      }
      const updated = [...cart];
      updated[existingIndex].quantity = newQty;
      setCart(updated);
    } else {
      setCart([...cart, { item, quantity: parseInt(currentQuantity) }]);
    }
    
    toast.success(`${item.name} added to cashier cart.`);
    setCurrentItemId('');
    setCurrentQuantity(1);
  };

  const handleRemoveFromCart = (itemId) => {
    setCart(cart.filter(c => c.item.id !== itemId));
  };

  const handleGenerateInvoice = () => {
    if (cart.length === 0) {
      toast.error('Cannot generate invoice. Cart is empty.');
      return;
    }
    if (!rentalStartDate || !rentalEndDate) {
      toast.error('Please select Rental Start and End dates.');
      return;
    }
    if (isDateRangeInvalid) {
      toast.error('Rental End Date cannot be earlier than Rental Start Date.');
      return;
    }
    // Set default paid amount to Combined Total
    setPaidAmount(combinedTotal);
    setCashierStep(3);
  };

  const handleRecordSale = async () => {
    if (!foundCustomer) {
      toast.error('No customer profile linked.');
      return;
    }
    if (cart.length === 0) return;

    setLoading(true);
    try {
      const payload = {
        customerId: foundCustomer.id,
        items: cart.map(c => ({
          itemId: c.item.id,
          quantity: c.quantity
        })),
        rentalStartDate,
        rentalEndDate,
        paymentMethod,
        paymentStatus: paidAmount >= combinedTotal ? 'PAID' : (paidAmount > 0 ? 'PARTIAL' : 'PENDING'),
        depositAmount: parseFloat(depositAmount) || 0,
        paidAmount: parseFloat(paidAmount) || 0,
        notes: cashierNotes || 'Walk-in cashier checkout'
      };

      const newSale = await api.createOfflineSale(payload);
      setGeneratedSale(newSale);
      setShowInvoiceModal(true);

      // Reset POS cashier
      setCart([]);
      setFoundCustomer(null);
      setPhoneSearch('');
      setRentalStartDate('');
      setRentalEndDate('');
      setDepositAmount(0);
      setCashierNotes('');
      setPaidAmount(0);
      setCashierStep(1);

      // Refresh master lists
      const [updatedSales, updatedCustomers] = await Promise.all([
        api.getOfflineSales(),
        api.getWalkInCustomers()
      ]);
      setSales(updatedSales || []);
      setCustomersList(updatedCustomers || []);

      toast.success('Sale successfully logged!');
    } catch (err) {
      toast.error(err.message || 'Failed to record transaction');
    } finally {
      setLoading(false);
    }
  };

  // --- ACTION: COLLECT PENDING BALANCE ---
  const handleOpenCollectPayment = (sale) => {
    setPaymentModalSale(sale);
    setPaymentModalAmount(sale.pendingAmount.toString());
    setPaymentModalMethod('Cash');
  };

  const handleSaveCollectPayment = async (e) => {
    e.preventDefault();
    if (!paymentModalSale) return;
    const amount = parseFloat(paymentModalAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid payment amount.');
      return;
    }

    try {
      setLoading(true);
      await api.collectOfflineSalePayment(paymentModalSale.id, amount);
      setPaymentModalSale(null);
      toast.success('Outstanding payment recorded successfully.');

      // Refresh master lists & active customer profile if open
      const updatedSales = await api.getOfflineSales();
      setSales(updatedSales || []);

      if (selectedProfileCustomer) {
        const customerHistory = await api.getOfflineSales({ customerId: selectedProfileCustomer.id });
        setSelectedProfileHistory(customerHistory || []);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  // --- ACTION: PROCESSING RETURNS ---
  const handleProcessReturn = async (saleId) => {
    if (!window.confirm('Are you sure you want to mark these items as returned? This will automatically add quantities back into stock.')) return;
    try {
      setLoading(true);
      await api.returnOfflineSale(saleId);
      toast.success('Items successfully returned & inventory restocked.');

      // Refresh data
      const updatedSales = await api.getOfflineSales();
      setSales(updatedSales || []);

      if (selectedProfileCustomer) {
        const customerHistory = await api.getOfflineSales({ customerId: selectedProfileCustomer.id });
        setSelectedProfileHistory(customerHistory || []);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to process return');
    } finally {
      setLoading(false);
    }
  };

  // --- ACTION: VIEW CUSTOMER PROFILE ---
  const handleViewCustomerProfile = async (customer) => {
    setSelectedProfileCustomer(customer);
    setProfileActiveTab('rentals');
    try {
      const history = await api.getOfflineSales({ customerId: customer.id });
      setSelectedProfileHistory(history || []);
    } catch (err) {
      toast.error('Failed to retrieve customer rental history');
    }
  };

  // --- STATS CALCULATIONS FOR DASHBOARD ---
  const todayDateString = new Date().toDateString();
  const todayCustomersCount = customersList.filter(c => new Date(c.createdAt).toDateString() === todayDateString).length;
  
  const activeRentalsCount = sales.filter(s => s.rentalStatus === 'ACTIVE').length;
  
  const overdueReturnsCount = sales.filter(s => {
    return s.rentalStatus === 'ACTIVE' && new Date(s.rentalEndDate) < new Date();
  }).length;

  const pendingPaymentsCount = sales.filter(s => s.paymentStatus === 'PARTIAL' || s.paymentStatus === 'PENDING').length;
  const fullyPaidCount = sales.filter(s => s.paymentStatus === 'PAID').length;
  const totalRevenueCollected = sales.reduce((sum, s) => sum + (s.paidAmount || 0), 0);
  const totalOutstandingBalance = sales.reduce((sum, s) => sum + (s.pendingAmount || 0), 0);

  // Filtered lists
  const filteredPendingInvoices = sales.filter(s => {
    if (s.pendingAmount <= 0) return false;
    const q = searchPending.toLowerCase().trim();
    if (!q) return true;
    const name = `${s.customer?.firstName} ${s.customer?.lastName}`.toLowerCase();
    const phone = s.customer?.phone || '';
    const invId = s.id?.substring(0, 6).toLowerCase() || '';
    return name.includes(q) || phone.includes(q) || invId.includes(q);
  });

  const filteredCustomers = customersList.filter(c => {
    const q = searchCustomerQuery.toLowerCase().trim();
    if (!q) return true;
    const name = `${c.firstName} ${c.lastName}`.toLowerCase();
    const phone = c.phone || '';
    return name.includes(q) || phone.includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 lg:pt-40 pb-12 bg-[#070914] text-white min-h-screen">
      <SEO title="Walk-in POS Cashier & Registry" description="Manage walk-in store cashier desk, customer registries, rental invoices, return restocking, and pending payments." />
      
      {error && (
        <div className="bg-red-500/10 text-red-500 p-4 rounded-xl mb-6 border border-red-500/20 flex items-center space-x-2 text-sm">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Styles for printing receipt */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #invoice-print-area, #invoice-print-area * { visibility: visible; }
          #invoice-print-area { position: absolute; left: 0; top: 0; width: 100%; color: black !important; background: white !important; }
          .no-print { display: none !important; }
        }
      `}} />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/10 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-black text-white tracking-wide">Walk-in Customer module</h1>
          <p className="text-xs text-slate-400 mt-1">Cashier Desk POS portal & Rental ERP registry logs</p>
        </div>
        <a
          href="/admin"
          className="bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold px-4 py-2.5 rounded-xl text-slate-300 hover:text-white transition-all shadow-md flex items-center gap-1.5"
        >
          Return to Admin Dashboard <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-white/5 mb-8 p-1 bg-white/2 rounded-2xl max-w-full overflow-x-auto whitespace-nowrap scrollbar-hide md:max-w-fit flex-nowrap">
        <button
          onClick={() => setActiveTab('cashier')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'cashier' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> POS Cashier
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'dashboard' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Clock className="w-4 h-4" /> POS Dashboard
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'pending' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <DollarSign className="w-4 h-4" /> Pending Payments
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'customers' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" /> Customer Directory
        </button>
      </div>

      {/* TAB CONTENTS */}
      
      {/* 1. POS CASHIER TAB */}
      {activeTab === 'cashier' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Step Progress Bar */}
          <div className="flex items-center justify-center max-w-xl mx-auto mb-8 bg-white/2 p-3 rounded-2xl border border-white/5">
            <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl ${cashierStep === 1 ? 'bg-amber-500 text-black' : 'text-slate-400'}`}>
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">1</span> Link Customer
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 mx-2" />
            <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl ${cashierStep === 2 ? 'bg-amber-500 text-black' : 'text-slate-400'}`}>
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">2</span> Add Rentals
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 mx-2" />
            <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl ${cashierStep === 3 ? 'bg-amber-500 text-black' : 'text-slate-400'}`}>
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">3</span> Complete Invoice
            </div>
          </div>

          {/* STEP 1: LINK CUSTOMER */}
          {cashierStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Search Customer */}
              <div className="lg:col-span-5 bg-[#0f1224] border border-white/5 p-6 rounded-2xl shadow-xl space-y-6">
                <div>
                  <h3 className="text-md font-bold mb-1 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-amber-500" /> Customer Phone Search
                  </h3>
                  <p className="text-xs text-slate-400">Search customer by their mobile number</p>
                </div>
                
                <form onSubmit={handleSearchCustomer} className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-3 h-4 w-4 text-slate-400 text-sm font-medium">+91</span>
                    <input
                      required
                      type="tel"
                      placeholder="Enter mobile number..."
                      value={phoneSearch}
                      onChange={(e) => setPhoneSearch(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-[#070914] border border-white/10 rounded-xl text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2.5 rounded-xl text-xs flex items-center"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </form>

                {foundCustomer && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-3">
                    <div className="flex justify-between items-center border-b border-emerald-500/10 pb-2">
                      <p className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4.5 h-4.5" /> Customer Profile Linked
                      </p>
                    </div>
                    <div className="space-y-1 text-xs">
                      <p className="text-sm font-bold">{foundCustomer.firstName} {foundCustomer.lastName}</p>
                      <p className="text-slate-400">ID: {foundCustomer.id?.substring(0, 8).toUpperCase()}</p>
                      <p className="text-slate-400">Phone: {foundCustomer.phone}</p>
                      <p className="text-slate-400">Address: {foundCustomer.address}</p>
                      {foundCustomer.email && <p className="text-slate-400">Email: {foundCustomer.email}</p>}
                    </div>

                    <button
                      onClick={() => setCashierStep(2)}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all mt-2"
                    >
                      Proceed to New Rental Booking <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {searchMessage && !foundCustomer && (
                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-3 animate-in fade-in duration-300">
                    <div className="flex items-start gap-2 text-xs text-slate-300">
                      <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>{searchMessage}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Register New Customer (if search failed) */}
              <div className="lg:col-span-7 bg-[#0f1224] border border-white/5 p-6 rounded-2xl shadow-xl space-y-6">
                <div>
                  <h3 className="text-md font-bold mb-1 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-amber-500" /> New Customer Registration
                  </h3>
                  <p className="text-xs text-slate-400">Create a new customer profile directly without leaving the POS desk</p>
                </div>

                <form onSubmit={handleRegisterCustomer} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Customer Full Name *</label>
                      <input
                        required
                        type="text"
                        placeholder="First and Last Name"
                        value={registerForm.fullName}
                        onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                        className="w-full px-3 py-2 bg-[#070914] border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Mobile Number *</label>
                      <input
                        required
                        type="tel"
                        placeholder="Mobile Phone"
                        value={registerForm.phone}
                        onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-[#070914] border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Email Address (Optional)</label>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        className="w-full px-3 py-2 bg-[#070914] border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Notes (Optional)</label>
                      <input
                        placeholder="E.g. VIP client, references..."
                        value={registerForm.notes}
                        onChange={(e) => setRegisterForm({ ...registerForm, notes: e.target.value })}
                        className="w-full px-3 py-2 bg-[#070914] border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Full Street Address *</label>
                    <textarea
                      required
                      rows="2"
                      placeholder="Customer residential/business address..."
                      value={registerForm.address}
                      onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                      className="w-full px-3 py-2 bg-[#070914] border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <User className="w-4 h-4" /> Save Profile & Link Customer
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* STEP 2: BUILD RENTAL ORDER (CART) */}
          {cashierStep === 2 && foundCustomer && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Linked Customer Overview Bar */}
              <div className="col-span-12 bg-white/2 border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl flex items-center justify-center font-bold">
                    {foundCustomer.firstName[0]}{foundCustomer.lastName[0] || ''}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{foundCustomer.firstName} {foundCustomer.lastName}</h4>
                    <p className="text-xs text-slate-400">Mobile: {foundCustomer.phone} | Address: {foundCustomer.address}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFoundCustomer(null);
                    setCart([]);
                    setCashierStep(1);
                  }}
                  className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 py-1 px-2.5 border border-red-500/20 rounded-lg hover:bg-red-500/5 transition-all"
                >
                  <X className="w-3.5 h-3.5" /> Disconnect Customer
                </button>
              </div>

              {/* Item Selector & Form */}
              <div className="lg:col-span-5 bg-[#0f1224] border border-white/5 p-6 rounded-2xl shadow-xl space-y-6">
                <div>
                  <h3 className="text-md font-bold mb-1">Add Equipment to Invoice</h3>
                  <p className="text-xs text-slate-400">Browse categories and add rental inventory units</p>
                </div>

                <div className="space-y-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Category Filter</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#070914] border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none cursor-pointer"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Product Select */}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Select Equipment Item</label>
                    <select
                      value={currentItemId}
                      onChange={(e) => setCurrentItemId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#070914] border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none cursor-pointer"
                    >
                      <option value="">Select Item...</option>
                      {itemsList.map(item => (
                        <option key={item.id} value={item.id} disabled={item.stock <= 0}>
                          {item.name} (Stock: {item.stock} - Price: ₹{item.price}/day) {item.stock <= 0 ? '[OUT OF STOCK]' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Rental Quantity</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        value={currentQuantity}
                        onChange={(e) => setCurrentQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="flex-1 px-3 py-2 bg-[#070914] border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                      <button
                        onClick={handleAddToCart}
                        className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded-xl text-xs"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>

                  <hr className="border-white/5 my-4" />

                  {/* Date Picker */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Rental Start Date</label>
                      <input
                        required
                        type="date"
                        value={rentalStartDate}
                        onChange={(e) => {
                          setRentalStartDate(e.target.value);
                          e.target.blur();
                        }}
                        onClick={(e) => e.target.showPicker && e.target.showPicker()}
                        className="w-full px-3 py-2 bg-[#070914] border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Rental End Date</label>
                      <input
                        required
                        type="date"
                        value={rentalEndDate}
                        onChange={(e) => {
                          setRentalEndDate(e.target.value);
                          e.target.blur();
                        }}
                        onClick={(e) => e.target.showPicker && e.target.showPicker()}
                        className="w-full px-3 py-2 bg-[#070914] border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none cursor-pointer"
                      />
                    </div>
                    {isDateRangeInvalid && (
                      <p className="text-red-500 text-[10px] mt-1 font-semibold col-span-2">
                        Rental End Date cannot be earlier than Rental Start Date.
                      </p>
                    )}
                  </div>

                  {/* Security Deposit & Notes */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Security Deposit (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full px-3 py-2 bg-[#070914] border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Invoice Notes</label>
                      <input
                        placeholder="E.g. Cash collected..."
                        value={cashierNotes}
                        onChange={(e) => setCashierNotes(e.target.value)}
                        className="w-full px-3 py-2 bg-[#070914] border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Cart Summary */}
              <div className="lg:col-span-7 bg-[#0f1224] border border-white/5 p-6 rounded-2xl shadow-xl space-y-6 flex flex-col justify-between min-h-[460px]">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-md font-bold">Checkout Cart Items</h3>
                    <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold">
                      {cart.length} unique items
                    </span>
                  </div>

                  <div className="overflow-x-auto max-h-56">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] text-slate-400 uppercase font-bold">
                          <th className="py-2">Item Name</th>
                          <th className="py-2 text-right">Price/Day</th>
                          <th className="py-2 text-center">Qty</th>
                          <th className="py-2 text-right">Total/Day</th>
                          <th className="py-2 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-xs">
                        {cart.map(c => (
                          <tr key={c.item.id} className="hover:bg-white/2">
                            <td className="py-3 font-semibold text-white">{c.item.name}</td>
                            <td className="py-3 text-right">₹{c.item.price}</td>
                            <td className="py-3 text-center font-bold text-amber-500">{c.quantity}</td>
                            <td className="py-3 text-right text-emerald-400 font-semibold">₹{c.item.price * c.quantity}</td>
                            <td className="py-3 text-center">
                              <button
                                onClick={() => handleRemoveFromCart(c.item.id)}
                                className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-white/5"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {cart.length === 0 && (
                          <tr>
                            <td colSpan="5" className="text-center py-10 text-slate-400">Cart is empty. Add equipment items on the left.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-4">
                  <div className="bg-[#070914] p-4 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Rental Duration:</span>
                      <span className="font-semibold text-white">{rentalDays} Days</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Rent Subtotal (per day):</span>
                      <span className="font-semibold text-white">₹{cartSubtotalPerDay}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Gross Rent Cost ({rentalDays} days):</span>
                      <span className="font-semibold text-emerald-400">₹{cartTotalCost}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Security Deposit:</span>
                      <span className="font-semibold text-white">₹{depositAmount}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold pt-2 border-t border-white/5">
                      <span>Total Amount Due:</span>
                      <span className="text-white">₹{combinedTotal}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setCashierStep(1)}
                      className="flex-1 py-3 border border-white/10 hover:bg-white/5 rounded-xl text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back to Customer
                    </button>
                    <button
                      onClick={handleGenerateInvoice}
                      disabled={cart.length === 0 || !rentalStartDate || !rentalEndDate || isDateRangeInvalid}
                      className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
                    >
                      Generate Invoice <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT & CONFIRMATION */}
          {cashierStep === 3 && foundCustomer && cart.length > 0 && (
            <div className="max-w-3xl mx-auto bg-[#0f1224] border border-white/5 p-6 rounded-2xl shadow-xl space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-md font-bold">Collect Invoice Payment</h3>
                  <p className="text-xs text-slate-400">Record cashier payment for client rental booking</p>
                </div>
                <button
                  onClick={() => setCashierStep(2)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
                </button>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 bg-[#070914] p-4 rounded-xl text-center text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Total Billing</p>
                  <p className="text-lg font-bold text-white">₹{combinedTotal}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Rental Days</p>
                  <p className="text-lg font-bold text-white">{rentalDays} Days</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Security Deposit</p>
                  <p className="text-lg font-bold text-white">₹{depositAmount}</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Method */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1.5">Payment Method</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Cash')}
                      className={`py-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        paymentMethod === 'Cash' ? 'border-amber-500 bg-amber-500/5 text-amber-500' : 'border-white/5 bg-white/2 text-slate-300'
                      }`}
                    >
                      <DollarSign className="w-4 h-4" /> Cash
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Card')}
                      className={`py-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        paymentMethod === 'Card' ? 'border-amber-500 bg-amber-500/5 text-amber-500' : 'border-white/5 bg-white/2 text-slate-300'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" /> Credit Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Transfer')}
                      className={`py-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        paymentMethod === 'Transfer' ? 'border-amber-500 bg-amber-500/5 text-amber-500' : 'border-white/5 bg-white/2 text-slate-300'
                      }`}
                    >
                      <Landmark className="w-4 h-4" /> Bank Transfer
                    </button>
                  </div>
                </div>

                {/* Paid Amount Input */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Enter Cash Received (Paid Amount)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    max={combinedTotal}
                    step="0.01"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Math.min(combinedTotal, Math.max(0, parseFloat(e.target.value) || 0)))}
                    className="w-full px-4 py-3 bg-[#070914] border border-white/10 rounded-xl text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                  
                  {/* Quick Payment Selection */}
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setPaidAmount(combinedTotal)}
                      className="text-[10px] font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-white px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      Scenario B: Full Payment (₹{combinedTotal})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaidAmount(Math.min(combinedTotal, 2000))}
                      className="text-[10px] font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-white px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      Pay ₹2,000 (Advance)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaidAmount(Math.min(combinedTotal, 5000))}
                      className="text-[10px] font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-white px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      Pay ₹5,000 (Advance)
                    </button>
                  </div>
                </div>

                {/* Scenarios Status Indicator */}
                <div className="p-4 bg-[#070914] rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <p className="text-slate-400">Remaining Balance Due Later:</p>
                    <p className="text-lg font-bold text-white">₹{(combinedTotal - paidAmount).toFixed(2)}</p>
                  </div>
                  <div>
                    {paidAmount >= combinedTotal ? (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold">
                        Paid (Full Payment)
                      </span>
                    ) : (paidAmount > 0 ? (
                      <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold">
                        Partially Paid (Advance)
                      </span>
                    ) : (
                      <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold">
                        Unpaid (Pending)
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleRecordSale}
                disabled={loading}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/5 disabled:opacity-40"
              >
                <ShieldCheck className="w-5 h-5" /> {loading ? 'Processing...' : 'Confirm Invoice & Record Sale'}
              </button>
            </div>
          )}

        </div>
      )}

      {/* 2. POS DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Dashboard Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-[#0f1224] border border-white/5 p-6 rounded-2xl flex items-center shadow-xl">
              <div className="p-4 bg-amber-500/10 text-amber-500 rounded-xl mr-4 border border-amber-500/20">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Today's Registrations</p>
                <h3 className="text-2xl font-extrabold text-white mt-1">{todayCustomersCount} Customers</h3>
              </div>
            </div>

            <div className="bg-[#0f1224] border border-white/5 p-6 rounded-2xl flex items-center shadow-xl">
              <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-xl mr-4 border border-emerald-500/20">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Rentals</p>
                <h3 className="text-2xl font-extrabold text-white mt-1">{activeRentalsCount} Rentals</h3>
              </div>
            </div>

            <div className="bg-[#0f1224] border border-white/5 p-6 rounded-2xl flex items-center shadow-xl">
              <div className="p-4 bg-red-500/10 text-red-500 rounded-xl mr-4 border border-red-500/20">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Returns</p>
                <h3 className="text-2xl font-extrabold text-white mt-1">{overdueReturnsCount} Orders</h3>
              </div>
            </div>

            <div className="bg-[#0f1224] border border-white/5 p-6 rounded-2xl flex items-center shadow-xl">
              <div className="p-4 bg-purple-500/10 text-purple-500 rounded-xl mr-4 border border-purple-500/20">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Balance Due</p>
                <h3 className="text-2xl font-extrabold text-white mt-1">₹{totalOutstandingBalance.toLocaleString()}</h3>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0f1224] border border-white/5 p-6 rounded-2xl shadow-xl">
              <h3 className="text-sm font-bold text-white mb-1">Financial Highlights</h3>
              <p className="text-xs text-slate-400 mb-4">Gross walk-in sales performance</p>
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold">Total Revenue Collected:</span>
                  <span className="text-emerald-400 font-bold text-sm">₹{totalRevenueCollected.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold">Total Outstanding Balance:</span>
                  <span className="text-red-400 font-bold text-sm">₹{totalOutstandingBalance.toLocaleString()}</span>
                </div>
                <hr className="border-white/5" />
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold">Fully Paid Orders:</span>
                  <span className="text-white font-semibold">{fullyPaidCount}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold">Partially Paid Orders:</span>
                  <span className="text-white font-semibold">{pendingPaymentsCount}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0f1224] border border-white/5 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">POS Overview</h3>
                <p className="text-xs text-slate-400 mb-4">Total operations registry logs</p>
              </div>
              <div className="text-xs text-slate-400 space-y-2">
                <p>Ensure return check-ins are done promptly to reflect accurate inventory stock.</p>
                <p>Collection of outstanding payments automatically settles invoices.</p>
                <button
                  onClick={() => setActiveTab('cashier')}
                  className="w-full mt-4 bg-amber-500 hover:bg-amber-400 text-black py-2.5 rounded-xl font-bold transition-all text-xs"
                >
                  Create New Checkout Invoice
                </button>
              </div>
            </div>
          </div>

          {/* Historical Log */}
          <div className="bg-[#0f1224] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2">
              <div>
                <h3 className="text-lg font-bold">Recently Generated Invoices</h3>
                <p className="text-xs text-slate-400 font-medium">Checkout history register logs</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-white/5 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-white/5">
                    <th className="p-4">Invoice No.</th>
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Rental Duration</th>
                    <th className="p-4 text-right">Total Rent</th>
                    <th className="p-4 text-right">Paid Amount</th>
                    <th className="p-4 text-right">Pending Amount</th>
                    <th className="p-4 text-center">Rental Return</th>
                    <th className="p-4 text-center">Payment Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {sales.map(sale => (
                    <tr key={sale.id} className="hover:bg-white/2 transition-colors">
                      <td className="p-4 font-bold text-amber-500">#{sale.id?.substring(0, 6).toUpperCase()}</td>
                      <td className="p-4 text-white font-semibold">{sale.customer?.firstName} {sale.customer?.lastName}</td>
                      <td className="p-4 text-slate-400">
                        {sale.rentalStartDate} to {sale.rentalEndDate}
                      </td>
                      <td className="p-4 text-right text-white font-semibold">₹{sale.totalAmount}</td>
                      <td className="p-4 text-right text-emerald-400">₹{sale.paidAmount || 0}</td>
                      <td className="p-4 text-right text-red-400">₹{sale.pendingAmount || 0}</td>
                      <td className="p-4 text-center">
                        {sale.rentalStatus === 'RETURNED' ? (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                            Returned
                          </span>
                        ) : (
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                            Active Rent
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {sale.paymentStatus === 'PAID' ? (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                            Paid
                          </span>
                        ) : (sale.paymentStatus === 'PARTIAL' ? (
                          <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                            Partial
                          </span>
                        ) : (
                          <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                            Pending
                          </span>
                        ))}
                      </td>
                      <td className="p-4 text-center space-x-2">
                        <button
                          onClick={() => {
                            setGeneratedSale(sale);
                            setShowInvoiceModal(true);
                          }}
                          className="p-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition-all"
                          title="Print Receipt"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {sale.rentalStatus === 'ACTIVE' && (
                          <button
                            onClick={() => handleProcessReturn(sale.id)}
                            className="text-[10px] bg-emerald-500 text-black px-2 py-1 rounded font-bold hover:bg-emerald-400 transition-all"
                          >
                            Mark Returned
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {sales.length === 0 && (
                    <tr>
                      <td colSpan="9" className="p-8 text-center text-slate-400">No invoices logged.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 3. PENDING PAYMENTS TAB */}
      {activeTab === 'pending' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0f1224] p-4 rounded-2xl border border-white/5">
            <div>
              <h3 className="text-md font-bold">Outstanding Receivables Ledger</h3>
              <p className="text-xs text-slate-400">Track and collect outstanding balances on active/completed invoices</p>
            </div>
            
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, phone, invoice..."
                value={searchPending}
                onChange={(e) => setSearchPending(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#070914] border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-[#0f1224] border border-white/5 rounded-2xl overflow-hidden shadow-xl animate-in fade-in duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-white/5 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-white/5">
                    <th className="p-4">Invoice No.</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Mobile</th>
                    <th className="p-4 text-right">Total Rent</th>
                    <th className="p-4 text-right">Paid Amount</th>
                    <th className="p-4 text-right">Outstanding Balance</th>
                    <th className="p-4 text-center">Return Date</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {filteredPendingInvoices.map(sale => (
                    <tr key={sale.id} className="hover:bg-white/2 transition-colors">
                      <td className="p-4 font-bold text-amber-500">#{sale.id?.substring(0, 6).toUpperCase()}</td>
                      <td className="p-4 text-white font-semibold">{sale.customer?.firstName} {sale.customer?.lastName}</td>
                      <td className="p-4 text-slate-300">{sale.customer?.phone}</td>
                      <td className="p-4 text-right text-white font-semibold">₹{sale.totalAmount}</td>
                      <td className="p-4 text-right text-emerald-400">₹{sale.paidAmount}</td>
                      <td className="p-4 text-right text-red-400 font-bold">₹{sale.pendingAmount}</td>
                      <td className="p-4 text-center text-slate-400">{sale.rentalEndDate}</td>
                      <td className="p-4 text-center">
                        <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                          Partially Paid
                        </span>
                      </td>
                      <td className="p-4 text-center space-x-2">
                        <button
                          onClick={() => handleOpenCollectPayment(sale)}
                          className="bg-emerald-500 text-black px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-400 transition-all text-[11px]"
                        >
                          Collect Balance
                        </button>
                        <button
                          onClick={() => {
                            setGeneratedSale(sale);
                            setShowInvoiceModal(true);
                          }}
                          className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded hover:text-white transition-all inline-flex items-center"
                          title="Print Receipt"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredPendingInvoices.length === 0 && (
                    <tr>
                      <td colSpan="9" className="p-8 text-center text-slate-400">No pending payments located.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 4. CUSTOMER DIRECTORY TAB */}
      {activeTab === 'customers' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0f1224] p-4 rounded-2xl border border-white/5">
            <div>
              <h3 className="text-md font-bold">Walk-in Customer Profiles</h3>
              <p className="text-xs text-slate-400">Manage client directory log files and review individual history stats</p>
            </div>
            
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by customer name or phone..."
                value={searchCustomerQuery}
                onChange={(e) => setSearchCustomerQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#070914] border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {!selectedProfileCustomer ? (
            <div className="bg-[#0f1224] border border-white/5 rounded-2xl overflow-hidden shadow-xl animate-in fade-in duration-300">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-white/5 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-white/5">
                      <th className="p-4">Customer Name</th>
                      <th className="p-4">Mobile Number</th>
                      <th className="p-4">Email Address</th>
                      <th className="p-4">Street Address</th>
                      <th className="p-4">Registered Date</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {filteredCustomers.map(c => (
                      <tr key={c.id} className="hover:bg-white/2 transition-colors">
                        <td className="p-4 font-semibold text-white">{c.firstName} {c.lastName}</td>
                        <td className="p-4 text-slate-300">{c.phone}</td>
                        <td className="p-4 text-slate-400">{c.email || 'N/A'}</td>
                        <td className="p-4 text-slate-400 max-w-xs truncate">{c.address}</td>
                        <td className="p-4 text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleViewCustomerProfile(c)}
                            className="bg-amber-500 hover:bg-amber-400 text-black px-3 py-1.5 rounded-lg font-bold transition-all text-[11px]"
                          >
                            View Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredCustomers.length === 0 && (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-slate-400">No customers found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            // DEDICATED CUSTOMER PROFILE VIEW
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <button
                onClick={() => setSelectedProfileCustomer(null)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 mb-2 font-semibold"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Customer Directory
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Profile Details Card */}
                <div className="lg:col-span-4 bg-[#0f1224] border border-white/5 p-6 rounded-2xl shadow-xl space-y-6">
                  <div className="text-center pb-4 border-b border-white/5">
                    <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-3">
                      {selectedProfileCustomer.firstName[0]}{selectedProfileCustomer.lastName[0] || ''}
                    </div>
                    <h3 className="text-md font-bold text-white">{selectedProfileCustomer.firstName} {selectedProfileCustomer.lastName}</h3>
                    <p className="text-xs text-slate-400">Customer ID: {selectedProfileCustomer.id?.substring(0, 8).toUpperCase()}</p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Mobile Number</p>
                      <p className="text-white font-semibold">{selectedProfileCustomer.phone}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Email Address</p>
                      <p className="text-white font-semibold">{selectedProfileCustomer.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Street Address</p>
                      <p className="text-slate-300 leading-relaxed">{selectedProfileCustomer.address}</p>
                    </div>
                    {selectedProfileCustomer.notes && (
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Registry Notes</p>
                        <p className="text-slate-400 italic">"{selectedProfileCustomer.notes}"</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Stats & History */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Statistics Panel */}
                  <div className="grid grid-cols-3 gap-4 bg-[#0f1224] border border-white/5 p-4 rounded-2xl shadow-md text-center text-xs">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Total Rentals</p>
                      <p className="text-lg font-bold text-white">{selectedProfileHistory.length}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Total Spend</p>
                      <p className="text-lg font-bold text-emerald-400">
                        ₹{selectedProfileHistory.reduce((sum, h) => sum + (h.paidAmount || 0), 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Pending Amount</p>
                      <p className="text-lg font-bold text-red-400">
                        ₹{selectedProfileHistory.reduce((sum, h) => sum + (h.pendingAmount || 0), 0)}
                      </p>
                    </div>
                  </div>

                  {/* Profile History Tabs */}
                  <div className="bg-[#0f1224] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                    <div className="border-b border-white/5 flex p-1 bg-white/2">
                      <button
                        onClick={() => setProfileActiveTab('rentals')}
                        className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg transition-all ${
                          profileActiveTab === 'rentals' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Rental History
                      </button>
                      <button
                        onClick={() => setProfileActiveTab('payments')}
                        className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg transition-all ${
                          profileActiveTab === 'payments' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Payment Ledger
                      </button>
                      <button
                        onClick={() => setProfileActiveTab('outstanding')}
                        className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg transition-all ${
                          profileActiveTab === 'outstanding' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Pending Balances
                      </button>
                    </div>

                    <div className="p-4">
                      {profileActiveTab === 'rentals' && (
                        <div className="overflow-x-auto text-xs">
                          <table className="w-full text-left border-collapse min-w-[550px]">
                            <thead>
                              <tr className="border-b border-white/5 text-[10px] text-slate-400 uppercase font-bold">
                                <th className="py-2">Invoice No.</th>
                                <th className="py-2">Dates</th>
                                <th className="py-2 text-right">Rent Cost</th>
                                <th className="py-2 text-center">Status</th>
                                <th className="py-2 text-center">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {selectedProfileHistory.map(h => (
                                <tr key={h.id}>
                                  <td className="py-3 font-semibold text-amber-500">#{h.id?.substring(0, 6).toUpperCase()}</td>
                                  <td className="py-3 text-slate-300">{h.rentalStartDate} to {h.rentalEndDate}</td>
                                  <td className="py-3 text-right font-bold text-white">₹{h.totalAmount}</td>
                                  <td className="py-3 text-center">
                                    {h.rentalStatus === 'RETURNED' ? (
                                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] font-bold">
                                        Returned
                                      </span>
                                    ) : (
                                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[9px] font-bold">
                                        Active
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 text-center">
                                    {h.rentalStatus === 'ACTIVE' && (
                                      <button
                                        onClick={() => handleProcessReturn(h.id)}
                                        className="text-[9px] bg-emerald-500 text-black px-2 py-1 rounded font-bold hover:bg-emerald-400"
                                      >
                                        Mark Returned
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                              {selectedProfileHistory.length === 0 && (
                                <tr>
                                  <td colSpan="5" className="text-center py-6 text-slate-400">No rental history recorded.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {profileActiveTab === 'payments' && (
                        <div className="overflow-x-auto text-xs">
                          <table className="w-full text-left border-collapse min-w-[500px]">
                            <thead>
                              <tr className="border-b border-white/5 text-[10px] text-slate-400 uppercase font-bold">
                                <th className="py-2">Invoice</th>
                                <th className="py-2">Paid Amount</th>
                                <th className="py-2">Payment Method</th>
                                <th className="py-2">Outstanding Due</th>
                                <th className="py-2 text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {selectedProfileHistory.map(h => (
                                <tr key={h.id}>
                                  <td className="py-3 font-semibold text-amber-500">#{h.id?.substring(0, 6).toUpperCase()}</td>
                                  <td className="py-3 text-emerald-400 font-bold">₹{h.paidAmount}</td>
                                  <td className="py-3 text-slate-300">{h.paymentMethod}</td>
                                  <td className="py-3 text-red-400 font-bold">₹{h.pendingAmount}</td>
                                  <td className="py-3 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                      h.paymentStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                    }`}>
                                      {h.paymentStatus}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                              {selectedProfileHistory.length === 0 && (
                                <tr>
                                  <td colSpan="5" className="text-center py-6 text-slate-400">No transaction logs available.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {profileActiveTab === 'outstanding' && (
                        <div className="overflow-x-auto text-xs">
                          <table className="w-full text-left border-collapse min-w-[450px]">
                            <thead>
                              <tr className="border-b border-white/5 text-[10px] text-slate-400 uppercase font-bold">
                                <th className="py-2">Invoice No.</th>
                                <th className="py-2">Due Return Date</th>
                                <th className="py-2 text-right">Outstanding Balance</th>
                                <th className="py-2 text-center">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {selectedProfileHistory.filter(h => h.pendingAmount > 0).map(h => (
                                <tr key={h.id}>
                                  <td className="py-3 font-semibold text-amber-500">#{h.id?.substring(0, 6).toUpperCase()}</td>
                                  <td className="py-3 text-slate-300">{h.rentalEndDate}</td>
                                  <td className="py-3 text-right font-bold text-red-400">₹{h.pendingAmount}</td>
                                  <td className="py-3 text-center">
                                    <button
                                      onClick={() => handleOpenCollectPayment(h)}
                                      className="bg-emerald-500 text-black px-2.5 py-1 rounded font-bold hover:bg-emerald-400"
                                    >
                                      Collect Balance
                                    </button>
                                  </td>
                                </tr>
                              ))}
                              {selectedProfileHistory.filter(h => h.pendingAmount > 0).length === 0 && (
                                <tr>
                                  <td colSpan="4" className="text-center py-6 text-slate-400">All invoices are settled! No outstanding dues.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* --- INVOICE RECEIPT MODAL OVERLAY --- */}
      {showInvoiceModal && generatedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white text-black w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col no-print">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50">
              <h3 className="text-md font-bold text-slate-800 flex items-center gap-1.5">
                <Printer className="w-5 h-5 text-amber-600" /> Invoice Generated Successfully
              </h3>
              <button
                onClick={() => {
                  setShowInvoiceModal(false);
                  setGeneratedSale(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PRINT AREA CONTAINER */}
            <div id="invoice-print-area" className="p-8 space-y-6 overflow-y-auto max-h-[70vh] bg-white text-black font-sans">
              
              {/* Receipt Header */}
              <div className="text-center border-b border-dashed border-slate-300 pb-6">
                <h2 className="text-xl font-serif font-black tracking-widest text-slate-950 uppercase">EVENTDECO RENTALS</h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Premium Party Furnishing & Equipment Rentals</p>
                <p className="text-[10px] text-slate-400 mt-1">Bussiness Desk POS CASHIER</p>
              </div>

              {/* Invoice Meta */}
              <div className="grid grid-cols-2 gap-4 text-xs border-b border-dashed border-slate-200 pb-4">
                <div>
                  <p className="text-slate-400 font-semibold uppercase text-[9px]">Invoice Details</p>
                  <p className="font-bold text-slate-800">Invoice No: #{generatedSale.id?.substring(0, 6).toUpperCase()}</p>
                  <p className="text-slate-600">Created: {new Date(generatedSale.createdAt).toLocaleString()}</p>
                  <p className="text-slate-600">Recorded By: {generatedSale.recordedBy}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase text-[9px]">Bill To Customer</p>
                  <p className="font-bold text-slate-800">{generatedSale.customer?.firstName} {generatedSale.customer?.lastName}</p>
                  <p className="text-slate-600">Mobile: {generatedSale.customer?.phone}</p>
                  <p className="text-slate-600">Address: {generatedSale.customer?.address}</p>
                </div>
              </div>

              {/* Items Summary Table */}
              <div>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-400 font-bold uppercase text-[9px]">
                      <th className="py-2">Equipment Description</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Unit Price</th>
                      <th className="py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {generatedSale.items?.map((it, idx) => (
                      <tr key={it.id || idx}>
                        <td className="py-3.5 font-semibold">{it.item?.name || 'Equipment Item'}</td>
                        <td className="py-3.5 text-center font-bold">{it.quantity}</td>
                        <td className="py-3.5 text-right">₹{it.price}</td>
                        <td className="py-3.5 text-right font-bold text-slate-900">₹{it.price * it.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Rental Dates Summary */}
              <div className="bg-slate-50 p-4 rounded-xl text-xs grid grid-cols-2 gap-4 border border-slate-100">
                <div>
                  <p className="text-slate-400 font-semibold uppercase text-[9px] mb-0.5">Rental Start Date</p>
                  <p className="font-bold text-slate-800">{generatedSale.rentalStartDate}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase text-[9px] mb-0.5">Rental End Date</p>
                  <p className="font-bold text-slate-800">{generatedSale.rentalEndDate}</p>
                </div>
              </div>

              {/* Invoice Totals Ledger */}
              <div className="space-y-2 border-t border-dashed border-slate-300 pt-4 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Rental Rent (Subtotal):</span>
                  <span className="font-semibold text-slate-800">₹{generatedSale.totalAmount}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Security Deposit Added:</span>
                  <span className="font-semibold text-slate-800">₹{generatedSale.depositAmount}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-slate-100 pt-2 text-slate-950">
                  <span>Grand Combined Total:</span>
                  <span>₹{generatedSale.totalAmount + generatedSale.depositAmount}</span>
                </div>
                <div className="flex justify-between text-xs text-emerald-600 font-semibold">
                  <span>Cash/Credit Paid (Received Amount):</span>
                  <span>₹{generatedSale.paidAmount}</span>
                </div>
                <div className="flex justify-between text-xs text-red-600 font-bold">
                  <span>Outstanding Balance Due Later:</span>
                  <span>₹{generatedSale.pendingAmount}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider pt-2 border-t border-dashed border-slate-200">
                  <span>Payment status:</span>
                  <span className={generatedSale.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}>
                    {generatedSale.paymentStatus} ({generatedSale.paymentMethod})
                  </span>
                </div>
              </div>

              {/* T&C & Footer */}
              <div className="text-center pt-8 border-t border-slate-200 space-y-4 text-[9px] text-slate-400 leading-normal">
                <p>
                  <strong>Terms & Conditions:</strong> All rented equipment must be returned in the original, undamaged state by the return date. Late returns or damages are subject to security deposit forfeiture or supplementary charges.
                </p>
                <div className="grid grid-cols-2 gap-12 pt-8">
                  <div className="border-t border-slate-300 pt-1 text-center">
                    <p className="font-bold text-slate-600">Customer Signature</p>
                  </div>
                  <div className="border-t border-slate-300 pt-1 text-center">
                    <p className="font-bold text-slate-600">Store Manager Sign</p>
                  </div>
                </div>
                <p className="pt-4 font-bold text-slate-500">Thank you for business with EVENTDECO RENTALS!</p>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-3 no-print">
              <button
                onClick={() => {
                  setShowInvoiceModal(false);
                  setGeneratedSale(null);
                }}
                className="flex-1 py-2.5 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-600 text-center"
              >
                Close Window
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Invoice Receipt
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- PENDING PAYMENT COLLECTION MODAL --- */}
      {paymentModalSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f1224] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/2">
              <h3 className="text-md font-bold text-white flex items-center gap-1.5">
                <DollarSign className="w-5 h-5 text-amber-500" /> Collect Outstanding Balance
              </h3>
              <button onClick={() => setPaymentModalSale(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCollectPayment} className="p-6 space-y-4">
              <div className="bg-[#070914] p-4 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Customer:</span>
                  <span className="font-semibold text-white">{paymentModalSale.customer?.firstName} {paymentModalSale.customer?.lastName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Invoice No:</span>
                  <span className="font-bold text-amber-500">#{paymentModalSale.id?.substring(0, 6).toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total Due:</span>
                  <span className="font-semibold text-white">₹{paymentModalSale.totalAmount}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Paid So Far:</span>
                  <span className="font-semibold text-emerald-400">₹{paymentModalSale.paidAmount}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-white/5 pt-2 text-red-400">
                  <span>Remaining Balance:</span>
                  <span>₹{paymentModalSale.pendingAmount}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Enter Amount Received (₹)</label>
                <input
                  required
                  type="number"
                  min="0.01"
                  max={paymentModalSale.pendingAmount}
                  step="0.01"
                  value={paymentModalAmount}
                  onChange={(e) => setPaymentModalAmount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#070914] border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Payment Method</label>
                <select
                  value={paymentModalMethod}
                  onChange={(e) => setPaymentModalMethod(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#070914] border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none cursor-pointer"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Transfer">Bank Transfer</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setPaymentModalSale(null)}
                  className="flex-1 py-2.5 border border-white/10 hover:bg-white/5 rounded-xl text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-1"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW PROFILE CUSTOMER MODAL (OVERLAY IN CUSTOMERS TAB) --- */}
      {selectedProfileCustomer && activeTab !== 'customers' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0f1224] border border-white/10 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/2">
              <h3 className="text-md font-bold text-white flex items-center gap-1.5">
                <User className="w-5 h-5 text-amber-500" /> Customer Profile details
              </h3>
              <button
                onClick={() => {
                  setSelectedProfileCustomer(null);
                  setSelectedProfileHistory([]);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Scrollable Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Details */}
                <div className="lg:col-span-4 space-y-4 text-xs bg-[#070914] p-4 rounded-xl border border-white/5">
                  <div className="text-center pb-4 border-b border-white/5">
                    <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-2">
                      {selectedProfileCustomer.firstName[0]}{selectedProfileCustomer.lastName[0] || ''}
                    </div>
                    <h4 className="text-sm font-bold text-white">{selectedProfileCustomer.firstName} {selectedProfileCustomer.lastName}</h4>
                    <p className="text-[10px] text-slate-500">ID: {selectedProfileCustomer.id?.substring(0, 8).toUpperCase()}</p>
                  </div>

                  <div>
                    <p className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">Mobile Number</p>
                    <p className="text-white font-semibold">{selectedProfileCustomer.phone}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">Email Address</p>
                    <p className="text-white font-semibold">{selectedProfileCustomer.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">Street Address</p>
                    <p className="text-slate-300 leading-normal">{selectedProfileCustomer.address}</p>
                  </div>
                  {selectedProfileCustomer.notes && (
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">Notes</p>
                      <p className="text-slate-400 italic">"{selectedProfileCustomer.notes}"</p>
                    </div>
                  )}
                </div>

                {/* Stats & History Tabbed area */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Small Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 bg-[#070914] p-3 rounded-xl border border-white/5 text-center text-xs">
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase mb-0.5">Rentals</p>
                      <p className="font-bold text-white">{selectedProfileHistory.length}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase mb-0.5">Spend</p>
                      <p className="font-bold text-emerald-400">
                        ₹{selectedProfileHistory.reduce((sum, h) => sum + (h.paidAmount || 0), 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase mb-0.5">Balance</p>
                      <p className="font-bold text-red-400">
                        ₹{selectedProfileHistory.reduce((sum, h) => sum + (h.pendingAmount || 0), 0)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#070914] border border-white/5 rounded-xl overflow-hidden">
                    <div className="flex border-b border-white/5 p-1 bg-white/2">
                      <button
                        onClick={() => setProfileActiveTab('rentals')}
                        className={`flex-1 py-1.5 text-center text-[11px] font-semibold rounded-lg transition-all ${
                          profileActiveTab === 'rentals' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Rental History
                      </button>
                      <button
                        onClick={() => setProfileActiveTab('payments')}
                        className={`flex-1 py-1.5 text-center text-[11px] font-semibold rounded-lg transition-all ${
                          profileActiveTab === 'payments' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Payment Ledger
                      </button>
                      <button
                        onClick={() => setProfileActiveTab('outstanding')}
                        className={`flex-1 py-1.5 text-center text-[11px] font-semibold rounded-lg transition-all ${
                          profileActiveTab === 'outstanding' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Outstanding Dues
                      </button>
                    </div>

                    <div className="p-4">
                      {profileActiveTab === 'rentals' && (
                        <div className="overflow-x-auto text-[11px]">
                          <table className="w-full text-left border-collapse min-w-[550px]">
                            <thead>
                              <tr className="border-b border-white/5 text-[9px] text-slate-500 uppercase font-bold">
                                <th className="py-2">Invoice No.</th>
                                <th className="py-2">Dates</th>
                                <th className="py-2 text-right">Rent Cost</th>
                                <th className="py-2 text-center">Status</th>
                                <th className="py-2 text-center">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {selectedProfileHistory.map(h => (
                                <tr key={h.id}>
                                  <td className="py-2 font-semibold text-amber-500">#{h.id?.substring(0, 6).toUpperCase()}</td>
                                  <td className="py-2 text-slate-300">{h.rentalStartDate} to {h.rentalEndDate}</td>
                                  <td className="py-2 text-right font-bold text-white">₹{h.totalAmount}</td>
                                  <td className="py-2 text-center">
                                    {h.rentalStatus === 'RETURNED' ? (
                                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[8px] font-bold">
                                        Returned
                                      </span>
                                    ) : (
                                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded text-[8px] font-bold">
                                        Active
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2 text-center">
                                    {h.rentalStatus === 'ACTIVE' && (
                                      <button
                                        onClick={() => handleProcessReturn(h.id)}
                                        className="text-[8px] bg-emerald-500 text-black px-1.5 py-0.5 rounded font-bold hover:bg-emerald-400"
                                      >
                                        Mark Returned
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                              {selectedProfileHistory.length === 0 && (
                                <tr>
                                  <td colSpan="5" className="text-center py-4 text-slate-400">No rental history logged.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {profileActiveTab === 'payments' && (
                        <div className="overflow-x-auto text-[11px]">
                          <table className="w-full text-left border-collapse min-w-[500px]">
                            <thead>
                              <tr className="border-b border-white/5 text-[9px] text-slate-500 uppercase font-bold">
                                <th className="py-2">Invoice</th>
                                <th className="py-2 text-right">Paid</th>
                                <th className="py-2">Method</th>
                                <th className="py-2 text-right">Pending</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {selectedProfileHistory.map(h => (
                                <tr key={h.id}>
                                  <td className="py-2 font-semibold text-amber-500">#{h.id?.substring(0, 6).toUpperCase()}</td>
                                  <td className="py-2 text-right text-emerald-400 font-bold">₹{h.paidAmount}</td>
                                  <td className="py-2 text-slate-300">{h.paymentMethod}</td>
                                  <td className="py-2 text-right text-red-400 font-bold">₹{h.pendingAmount}</td>
                                </tr>
                              ))}
                              {selectedProfileHistory.length === 0 && (
                                <tr>
                                  <td colSpan="4" className="text-center py-4 text-slate-400">No ledger transactions available.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {profileActiveTab === 'outstanding' && (
                        <div className="overflow-x-auto text-[11px]">
                          <table className="w-full text-left border-collapse min-w-[450px]">
                            <thead>
                              <tr className="border-b border-white/5 text-[9px] text-slate-500 uppercase font-bold">
                                <th className="py-2">Invoice No.</th>
                                <th className="py-2">Due Return Date</th>
                                <th className="py-2 text-right">Dues Outstanding</th>
                                <th className="py-2 text-center">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {selectedProfileHistory.filter(h => h.pendingAmount > 0).map(h => (
                                <tr key={h.id}>
                                  <td className="py-2 font-semibold text-amber-500">#{h.id?.substring(0, 6).toUpperCase()}</td>
                                  <td className="py-2 text-slate-300">{h.rentalEndDate}</td>
                                  <td className="py-2 text-right font-bold text-red-400">₹{h.pendingAmount}</td>
                                  <td className="py-2 text-center">
                                    <button
                                      onClick={() => handleOpenCollectPayment(h)}
                                      className="bg-emerald-500 text-black px-2 py-0.5 rounded font-bold hover:bg-emerald-400 text-[9px]"
                                    >
                                      Collect
                                    </button>
                                  </td>
                                </tr>
                              ))}
                              {selectedProfileHistory.filter(h => h.pendingAmount > 0).length === 0 && (
                                <tr>
                                  <td colSpan="4" className="text-center py-4 text-slate-400">All balances are paid!</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}

                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OfflineSalesPage;
