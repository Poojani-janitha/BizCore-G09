import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Calendar, CheckCircle, DollarSign, FileText, Loader,
  AlertCircle, Search, Plus, X
} from 'react-feather';
import QuickAccountModal from '../../component/Finance/QuickAccountModal';

const API_BASE = 'http://localhost:5000/api/incomes';
const CUSTOMER_API = 'http://localhost:5000/api/customer';
const CREDIT_API = 'http://localhost:5000/api/credit-payments';

const PAYMENT_METHODS = [
  { id: 'Cash', label: 'Cash', icon: '💵' },
  { id: 'Bank_Deposit', label: 'Bank Deposit', icon: '🏦' },
  { id: 'Cheque', label: 'Cheque', icon: '📄' }
];

// No hardcoded categories - all fetched from DB
const DEFAULT_INCOME_CATEGORIES = [];

const ReceivePaymentPage = () => {
  const navigate = useNavigate();
  const [paymentType, setPaymentType] = useState('general');
  const [formData, setFormData] = useState({
    customerName: '', amount: '', incomeCategory: 'Sales',
    description: '', paymentMethod: 'Cash',
    date: new Date().toISOString().split('T')[0], referenceNo: '',
    bankName: '', depositSlipNo: '', depositedBy: '', depositDate: '',
    chequeNo: '', chequeBank: '', chequeDate: '',
    creditTransId: ''
  });
  
  // ── Quick Account State ──
  const [showQuickAccount, setShowQuickAccount] = useState(false);
  const [missingAccountCode, setMissingAccountCode] = useState('');
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const customerDropdownRef = useRef(null);
  const [outstandingInvoices, setOutstandingInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  const customerOptions = useMemo(() => customers.map(c => c.C_Name).filter(Boolean), [customers]);
  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers;
    const t = customerSearch.toLowerCase();
    return customers.filter(c => c.C_Name?.toLowerCase().includes(t) || c.Customer_Code?.toLowerCase().includes(t) || c.Phone1?.includes(t));
  }, [customers, customerSearch]);

  useEffect(() => {
    (async () => {
      try {
        setLoadingCustomers(true);
        const res = await axios.get(CUSTOMER_API);
        if (res.data?.success) setCustomers(res.data.data || []);
      } catch (e) { console.error(e); }
      finally { setLoadingCustomers(false); }
    })();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      // Only fetch Revenue (Income) accounts for the income category dropdown
      const res = await axios.get('http://localhost:5000/api/accounts?active=true&type=Revenue');
      if (res.data.success) {
        // Store full account objects to filter by type later if needed
        const accounts = res.data.data;
        setIncomeCategories(accounts.map(acc => acc.Account_Name));
      }
    } catch (error) {
      console.error('Error fetching income categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    const h = (e) => { if (customerDropdownRef.current && !customerDropdownRef.current.contains(e.target)) setShowCustomerDropdown(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    if (paymentType === 'credit' && selectedCustomer) fetchOutstandingInvoices(selectedCustomer.C_ID);
  }, [paymentType, selectedCustomer]);

  const fetchOutstandingInvoices = async (id) => {
    setLoadingInvoices(true);
    try {
      const res = await axios.get(`${CREDIT_API}/invoices/${id}`);
      if (res.data?.success) setOutstandingInvoices(res.data.data || []);
    } catch (e) { setOutstandingInvoices([]); }
    finally { setLoadingInvoices(false); }
  };

  const handleSelectCustomer = (c) => {
    setSelectedCustomer(c); setCustomerSearch(c.C_Name);
    setShowCustomerDropdown(false); setSelectedInvoice(null);
    setFormData(p => ({ ...p, referenceNo: '', creditTransId: '', amount: '' }));
  };

  const handleSelectInvoice = (inv) => {
    if (!inv) {
      setSelectedInvoice(null);
      setFormData(p => ({ ...p, referenceNo: '', creditTransId: '', amount: '' }));
      return;
    }
    setSelectedInvoice(inv);
    setFormData(p => ({ ...p, referenceNo: inv.referenceNo, creditTransId: inv.creditTransId, amount: inv.remainingAmount.toFixed(2) }));
  };

  const handleAddCategory = () => {
    // Legacy logic removed - using QuickAccountModal instead
  };

  const handleChange = (e) => { setFormData(p => ({ ...p, [e.target.name]: e.target.value })); };

  const handlePaymentTypeChange = (type) => {
    setPaymentType(type); setSelectedCustomer(null); setSelectedInvoice(null);
    setCustomerSearch(''); setOutstandingInvoices([]); setAlert(null);
    setFormData({
      customerName: '', 
      amount: '', 
      incomeCategory: type === 'credit' ? 'Accounts Receivable' : 'Sales', 
      description: '',
      paymentMethod: 'Cash', 
      date: new Date().toISOString().split('T')[0], 
      referenceNo: '',
      bankName: '', 
      depositSlipNo: '', 
      depositedBy: '', 
      depositDate: '',
      chequeNo: '', 
      chequeBank: '', 
      chequeDate: '', 
      creditTransId: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (paymentType === 'credit') return handleCreditSubmit();
    return handleGeneralSubmit();
  };

  const handleGeneralSubmit = async () => {
    if (!formData.customerName || !formData.amount || !formData.paymentMethod || !formData.incomeCategory) {
      setAlert({ type: 'error', message: 'Please fill in all required fields.' }); return;
    }
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) { setAlert({ type: 'error', message: 'Amount must be positive.' }); return; }
    setSubmitting(true); setAlert(null);
    try {
      const payload = {
        incomeDate: formData.date, incomeCategory: formData.incomeCategory,
        amount, source: formData.customerName, description: formData.description || null,
        receiptNo: formData.referenceNo || null, paymentMethod: formData.paymentMethod,
        // Bank Deposit fields
        bankName: formData.bankName || null,
        depositSlipNo: formData.depositSlipNo || null,
        depositedBy: formData.depositedBy || null,
        depositDate: formData.depositDate || null,
        // Cheque fields
        chequeNo: formData.chequeNo || null,
        chequeBank: formData.chequeBank || null,
        chequeDate: formData.chequeDate || null
      };
      const res = await axios.post(`${API_BASE}/create`, payload);
      if (res.data?.success) {
        setAlert({ type: 'success', message: `Receipt saved. Journal: ${res.data.data.journal.journalNo}` });
        setFormData(p => ({ ...p, customerName: '', amount: '', description: '', referenceNo: '',
          bankName: '', depositSlipNo: '', depositedBy: '', depositDate: '',
          chequeNo: '', chequeBank: '', chequeDate: '' }));
      } else setAlert({ type: 'error', message: res.data?.message || 'Failed.' });
    } catch (e) {
      const msg = e.response?.data?.message || e.message;
      if (typeof msg === 'string' && msg.includes('not found in ACCOUNT_CHART')) {
        const codeMatch = msg.match(/\((\d+)\)/);
        if (codeMatch) setMissingAccountCode(codeMatch[1]);
        setShowQuickAccount(true);
      } else {
        setAlert({ type: 'error', message: msg });
      }
    } finally { setSubmitting(false); }
  };

  const handleCreditSubmit = async () => {
    if (!selectedCustomer) { setAlert({ type: 'error', message: 'Please select a customer.' }); return; }
    if (!formData.creditTransId) { setAlert({ type: 'error', message: 'Please select an invoice.' }); return; }
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) { setAlert({ type: 'error', message: 'Amount must be positive.' }); return; }
    setSubmitting(true); setAlert(null);
    try {
      const payload = {
        customerId: selectedCustomer.C_ID, amount,
        paymentMethod: formData.paymentMethod, referenceNo: formData.referenceNo,
        creditTransId: formData.creditTransId,
        paymentDate: formData.date, notes: formData.description || null,
        bankName: formData.bankName, depositSlipNo: formData.depositSlipNo,
        depositedBy: formData.depositedBy, depositDate: formData.depositDate,
        chequeNo: formData.chequeNo, chequeBank: formData.chequeBank, chequeDate: formData.chequeDate
      };
      const res = await axios.post(`${CREDIT_API}/receive`, payload);
      if (res.data?.success) {
        setAlert({ type: 'success', message: `${res.data.message} | Journal: ${res.data.data.journal.journalNo}` });
        setSelectedCustomer(null); setSelectedInvoice(null); setCustomerSearch(''); setOutstandingInvoices([]);
        setFormData(p => ({ ...p, amount: '', description: '', referenceNo: '', bankName: '', depositSlipNo: '', depositedBy: '', depositDate: '', chequeNo: '', chequeBank: '', chequeDate: '' }));
      } else setAlert({ type: 'error', message: res.data?.message || 'Failed.' });
    } catch (e) {
      const msg = e.response?.data?.message || e.message;
      if (typeof msg === 'string' && msg.includes('not found in ACCOUNT_CHART')) {
        const codeMatch = msg.match(/\((\d+)\)/);
        if (codeMatch) setMissingAccountCode(codeMatch[1]);
        setShowQuickAccount(true);
      } else {
        setAlert({ type: 'error', message: msg });
      }
    } finally { setSubmitting(false); }
  };

  // ── Shared input style
  const inp = "w-full h-11 rounded-lg border border-gray-200 px-3 outline-none focus:ring-2 focus:ring-teal-500 text-sm";
  const label = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="w-full min-h-screen bg-[#f3f5f7] text-gray-900">
      <main className="max-w-6xl mx-auto px-6 py-6">

        {/* Toggle */}
        <div className="flex gap-3 mb-5">
          {[{ id: 'general', label: 'General Income', color: 'green', icon: <DollarSign size={16}/> },
            { id: 'credit', label: 'Credit Payment', color: 'orange', icon: <FileText size={16}/> }
          ].map(t => (
            <button key={t.id} type="button" onClick={() => handlePaymentTypeChange(t.id)}
              className="flex-1 h-14 rounded-xl border-2 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
              style={paymentType === t.id ? {
                backgroundColor: t.color === 'green' ? '#f0fdf4' : '#fff7ed',
                borderColor: t.color === 'green' ? '#22c55e' : '#f97316',
                color: t.color === 'green' ? '#15803d' : '#c2410c'
              } : { backgroundColor: '#fff', borderColor: '#e5e7eb', color: '#6b7280' }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Alert */}
        {alert && (
          <div className={`mb-4 flex items-center gap-2 rounded-lg px-4 py-3 border ${alert.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {alert.type === 'success' ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
            <span className="text-sm">{alert.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <CheckCircle size={18} className={paymentType === 'credit' ? 'text-orange-600' : 'text-green-600'}/>
            <h2 className="text-xl font-semibold tracking-wide">
              {paymentType === 'credit' ? 'CREDIT PAYMENT' : 'PAYMENT DETAILS'}
            </h2>
          </div>

          {/* Row 1: Date + Customer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={label}>Payment Date</label>
              <div className="flex gap-2">
                <input type="date" name="date" value={formData.date} onChange={handleChange} className={inp}/>
                <button type="button" onClick={() => setFormData(p => ({ ...p, date: new Date().toISOString().split('T')[0] }))}
                  className="h-11 px-3 rounded-lg bg-gray-100 text-gray-700 font-medium flex items-center gap-1 text-sm whitespace-nowrap">
                  <Calendar size={14}/> Today
                </button>
              </div>
            </div>
            <div>
              <label className={label}>Customer</label>
              {paymentType === 'general' ? (
                <>
                  <input type="text" name="customerName" value={formData.customerName} onChange={handleChange}
                    list="customers" required className={inp}
                    placeholder={loadingCustomers ? 'Loading...' : 'Select or type customer'}/>
                  <datalist id="customers">{customerOptions.map(n => <option key={n} value={n}/>)}</datalist>
                </>
              ) : (
                <div className="relative" ref={customerDropdownRef}>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input type="text" value={customerSearch}
                      onChange={e => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true); if (!e.target.value) setSelectedCustomer(null); }}
                      onFocus={() => setShowCustomerDropdown(true)}
                      className="w-full h-11 rounded-lg border border-gray-200 pl-9 pr-3 outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                      placeholder="Search customer..."/>
                  </div>
                  {showCustomerDropdown && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {loadingCustomers ? <div className="px-4 py-3 text-gray-400 text-sm">Loading...</div>
                        : filteredCustomers.length === 0 ? <div className="px-4 py-3 text-gray-400 text-sm">No customers found</div>
                        : filteredCustomers.map(c => (
                          <button key={c.C_ID} type="button" onClick={() => handleSelectCustomer(c)}
                            className="w-full text-left px-4 py-2 hover:bg-orange-50 transition flex justify-between items-center text-sm">
                            <span><span className="font-medium">{c.C_Name}</span><span className="text-gray-400 ml-2">{c.Customer_Code}</span></span>
                            <span className="text-orange-600 font-medium">Rs. {parseFloat(c.Current_Balance || 0).toFixed(2)}</span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Credit balance info */}
          {paymentType === 'credit' && selectedCustomer && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">{selectedCustomer.C_Name}</p>
                <p className="text-xs text-orange-500 mt-1">Credit Limit: Rs. {parseFloat(selectedCustomer.Credit_Limit || 0).toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-orange-500">Outstanding Balance</p>
                <p className="text-xl font-bold text-orange-700">Rs. {parseFloat(selectedCustomer.Current_Balance || 0).toFixed(2)}</p>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="mt-5">
            <label className={label}>Payment Method</label>
            <div className="grid grid-cols-3 gap-3">
              {PAYMENT_METHODS.map(({ id, label: lbl, icon }) => {
                const active = formData.paymentMethod === id;
                const accent = paymentType === 'credit' ? '#f97316' : '#22c55e';
                const bg = paymentType === 'credit' ? '#fff7ed' : '#f0fdf4';
                return (
                  <button key={id} type="button"
                    onClick={() => setFormData(p => ({ ...p, paymentMethod: id, bankName: '', depositSlipNo: '', depositedBy: '', depositDate: '', chequeNo: '', chequeBank: '', chequeDate: '' }))}
                    className="h-16 rounded-xl border flex flex-col items-center justify-center gap-1 transition"
                    style={active ? { backgroundColor: bg, borderColor: accent, color: accent } : { backgroundColor: '#fff', borderColor: '#e5e7eb' }}>
                    <span className="text-lg">{icon}</span>
                    <span className="text-xs font-medium">{lbl}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bank Deposit Fields */}
          {formData.paymentMethod === 'Bank_Deposit' && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🏦</span>
                <span className="font-semibold text-sm text-blue-800">Bank Deposit Details</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-blue-700 mb-1">Bank Name</label>
                  <input name="bankName" value={formData.bankName} onChange={handleChange}
                    className="w-full h-10 rounded-lg border border-blue-200 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-400" placeholder="Bank name"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-blue-700 mb-1">Deposit Slip No</label>
                  <input name="depositSlipNo" value={formData.depositSlipNo} onChange={handleChange}
                    className="w-full h-10 rounded-lg border border-blue-200 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-400" placeholder="SLIP123456"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-blue-700 mb-1">Deposited By</label>
                  <input name="depositedBy" value={formData.depositedBy} onChange={handleChange}
                    className="w-full h-10 rounded-lg border border-blue-200 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-400" placeholder="Employee ID"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-blue-700 mb-1">Deposit Date</label>
                  <input type="date" name="depositDate" value={formData.depositDate} onChange={handleChange}
                    className="w-full h-10 rounded-lg border border-blue-200 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-400"/>
                </div>
              </div>
            </div>
          )}

          {/* Cheque Fields */}
          {formData.paymentMethod === 'Cheque' && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">📄</span>
                <span className="font-semibold text-sm text-yellow-800">Cheque Details</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-yellow-700 mb-1">Cheque Number</label>
                  <input name="chequeNo" value={formData.chequeNo} onChange={handleChange}
                    className="w-full h-10 rounded-lg border border-yellow-200 px-3 text-sm outline-none focus:ring-2 focus:ring-yellow-400" placeholder="Cheque No"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-yellow-700 mb-1">Bank Name</label>
                  <input name="chequeBank" value={formData.chequeBank} onChange={handleChange}
                    className="w-full h-10 rounded-lg border border-yellow-200 px-3 text-sm outline-none focus:ring-2 focus:ring-yellow-400" placeholder="Bank name"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-yellow-700 mb-1">Cheque Date</label>
                  <input type="date" name="chequeDate" value={formData.chequeDate} onChange={handleChange}
                    className="w-full h-10 rounded-lg border border-yellow-200 px-3 text-sm outline-none focus:ring-2 focus:ring-yellow-400"/>
                </div>
              </div>
            </div>
          )}

          {/* Row 2: Amount + Reference/Invoice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            <div>
              <label className={label}>Amount Received</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">Rs.</span>
                <input type="number" name="amount" value={formData.amount} onChange={handleChange}
                  required min="0" step="0.01"
                  className="w-full h-12 rounded-lg border border-green-300 pl-12 pr-3 outline-none focus:ring-2 focus:ring-green-500 text-sm" placeholder="0.00"/>
              </div>
            </div>
            <div>
              <label className={label}>{paymentType === 'credit' ? 'Select Invoice' : 'Reference Number'}</label>
              {paymentType === 'credit' ? (
                !selectedCustomer ? <div className="w-full h-12 rounded-lg border border-gray-200 px-3 flex items-center text-gray-400 text-sm">Select a customer first</div>
                : loadingInvoices ? <div className="w-full h-12 rounded-lg border border-gray-200 px-3 flex items-center text-gray-400 text-sm"><Loader size={14} className="animate-spin mr-2"/> Loading...</div>
                : outstandingInvoices.length === 0 ? <div className="w-full h-12 rounded-lg border border-gray-200 px-3 flex items-center text-gray-400 text-sm">No outstanding invoices</div>
                : <select value={formData.creditTransId} onChange={e => { const inv = outstandingInvoices.find(i => String(i.creditTransId) === e.target.value); handleSelectInvoice(inv); }}
                    className="w-full h-12 rounded-lg border border-orange-300 px-3 outline-none focus:ring-2 focus:ring-orange-500 text-sm">
                    <option value="">-- Select invoice --</option>
                    {outstandingInvoices.map(inv => <option key={inv.creditTransId} value={inv.creditTransId}>{inv.referenceNo} — Due: Rs. {inv.remainingAmount.toFixed(2)}</option>)}
                  </select>
              ) : <input type="text" name="referenceNo" value={formData.referenceNo} onChange={handleChange} className={inp} placeholder="Reference number"/>}
            </div>
          </div>

          {/* Selected invoice details */}
          {paymentType === 'credit' && selectedInvoice && (
            <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 flex flex-wrap gap-4">
              <span>Invoice: <strong>{selectedInvoice.referenceNo}</strong></span>
              <span>Total: <strong>Rs. {selectedInvoice.totalAmount.toFixed(2)}</strong></span>
              <span>Paid: <strong>Rs. {selectedInvoice.paidAmount.toFixed(2)}</strong></span>
              <span className="text-orange-600">Remaining: <strong>Rs. {selectedInvoice.remainingAmount.toFixed(2)}</strong></span>
            </div>
          )}

          {/* Row 3: Category + Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            <div>
              <label className={label}>{paymentType === 'credit' ? 'Receivable Account' : 'Income Category'}</label>
              <select name="incomeCategory" value={formData.incomeCategory} 
                disabled={paymentType === 'credit'}
                onChange={e => {
                  if (e.target.value === 'ADD_NEW') {
                    setShowQuickAccount(true);
                  } else {
                    handleChange(e);
                  }
                }}
                className={`w-full h-11 rounded-lg border px-3 outline-none focus:ring-2 focus:ring-teal-500 text-sm ${paymentType === 'credit' ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed' : 'border-gray-200 text-gray-900'}`}>
                <option value="">{loadingCategories ? 'Loading...' : '-- Select Category --'}</option>
                {incomeCategories.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="ADD_NEW" style={{ fontWeight: 'bold', color: '#0d9488' }}>+ Add New Category</option>
              </select>
            </div>
            <div>
              <label className={label}>Notes (Optional)</label>
              <input type="text" name="description" value={formData.description} onChange={handleChange}
                className={inp} placeholder="Add note about this payment"/>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-8">
            <button type="button" onClick={() => navigate('/finance')} className="h-12 px-7 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm">Cancel</button>
            <button type="submit" disabled={submitting}
              className="h-12 px-7 rounded-lg text-white font-medium shadow-sm disabled:opacity-70 flex items-center gap-2 text-sm"
              style={{ background: 'linear-gradient(to right, #f97316, #ea580c)' }}>
              {submitting && <Loader size={14} className="animate-spin"/>}
              {paymentType === 'credit' ? 'Receive Credit Payment' : 'Save Receipt'}
            </button>
          </div>
        </form>
      </main>
      {/* Quick Account Modal */}
      <QuickAccountModal 
        isOpen={showQuickAccount} 
        onClose={() => setShowQuickAccount(false)}
        initialCode={missingAccountCode}
        initialType="Revenue"
        onAccountCreated={(acc) => {
          setAlert({ type: 'success', message: `✅ Category '${acc.Account_Name}' added and selected!` });
          // Refresh categories list
          setIncomeCategories(prev => {
            if (prev.includes(acc.Account_Name)) return prev;
            return [...prev, acc.Account_Name];
          });
          setFormData(prev => ({ ...prev, incomeCategory: acc.Account_Name }));
        }}
      />
    </div>
  );
};

export default ReceivePaymentPage;
