import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, CreditCard, FileText, Briefcase, Plus, Trash2, Check, AlertCircle, Clock, Search, ChevronDown, User } from 'react-feather';
import axios from 'axios';
import QuickAccountModal from '../../component/Finance/QuickAccountModal';

const API_BASE = 'http://localhost:5000/api/expenses';

const PAYMENT_METHODS = [
    { id: 'Cash', label: 'Cash', Icon: DollarSign },
    { id: 'Bank', label: 'Bank', Icon: Briefcase },
    { id: 'Cheque', label: 'Cheque', Icon: FileText },
];

const today = new Date();
const isoDate = today.toISOString().split('T')[0];

const fmt = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const statusBadge = (status) => {
    const map = {
        Paid: 'bg-success',
        Pending: 'bg-warning text-dark',
        Approved: 'bg-info',
        Rejected: 'bg-danger',
        Cancelled: 'bg-secondary'
    };
    return map[status] || 'bg-secondary';
};

const MakePaymentPage = () => {
    const navigate = useNavigate();

    // ── Payment Type State ──
    const [paymentType, setPaymentType] = useState('general'); // 'general' or 'credit'

    // ── Form State ──
    const [expenseDate, setExpenseDate] = useState(isoDate);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [category, setCategory] = useState('');
    const [subcategory, setSubcategory] = useState('');
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [paidTo, setPaidTo] = useState('');
    const [description, setDescription] = useState('');
    const [receiptNo, setReceiptNo] = useState('');
    
    // ── Bank Deposit Details ──
    const [bankName, setBankName] = useState('');
    const [depositSlipNo, setDepositSlipNo] = useState('');
    const [depositedBy, setDepositedBy] = useState('');
    const [depositDate, setDepositDate] = useState(isoDate);

    // ── Cheque Details ──
    const [chequeNo, setChequeNo] = useState('');
    const [chequeBank, setChequeBank] = useState('');
    const [chequeDate, setChequeDate] = useState(isoDate);

    // ── Supplier / Credit States ──
    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [outstandingBills, setOutstandingBills] = useState([]);
    const [selectedBill, setSelectedBill] = useState(null);
    const [loadingSuppliers, setLoadingSuppliers] = useState(false);
    const [loadingBills, setLoadingBills] = useState(false);
    const [supplierSearch, setSupplierSearch] = useState('');
    const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);

    // ── UI State ──
    const [submitting, setSubmitting] = useState(false);
    const [alert, setAlert] = useState(null);
    const [recentExpenses, setRecentExpenses] = useState([]);
    const [loadingExpenses, setLoadingExpenses] = useState(true);
    const [showQuickAccount, setShowQuickAccount] = useState(false);
    const [missingAccountCode, setMissingAccountCode] = useState('');

    // ── Load data on mount ──
    useEffect(() => {
        fetchRecentExpenses();
        fetchCategories();
        if (paymentType === 'credit') fetchSuppliers();
    }, [paymentType]);

    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            const res = await axios.get('http://localhost:5000/api/accounts?active=true');
            if (res.data.success) {
                const dbCategories = res.data.data.map(acc => ({
                    value: acc.Account_Name,
                    label: acc.Account_Name
                }));
                setCategories(dbCategories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoadingCategories(false);
        }
    };

    const fetchSuppliers = async () => {
        try {
            setLoadingSuppliers(true);
            const res = await axios.get('http://localhost:5000/api/supplier-payments');
            if (res.data.success) setSuppliers(res.data.data || []);
        } catch (e) { console.error(e); }
        finally { setLoadingSuppliers(false); }
    };

    const fetchOutstandingBills = async (id) => {
        setLoadingBills(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/supplier-payments/bills/${id}`);
            if (res.data?.success) setOutstandingBills(res.data.data || []);
        } catch (e) { setOutstandingBills([]); }
        finally { setLoadingBills(false); }
    };

    const fetchRecentExpenses = async () => {
        try {
            setLoadingExpenses(true);
            const res = await axios.get(`${API_BASE}?limit=10`);
            if (res.data.success) {
                setRecentExpenses(res.data.data);
            }
        } catch (err) {
            console.error('Failed to load expenses:', err);
        } finally {
            setLoadingExpenses(false);
        }
    };

    useEffect(() => {
        if (paymentType === 'credit' && selectedSupplier) fetchOutstandingBills(selectedSupplier.S_ID);
    }, [paymentType, selectedSupplier]);

    const handleSelectSupplier = (s) => {
        setSelectedSupplier(s); 
        setSupplierSearch(s.S_Name);
        setShowSupplierDropdown(false); 
        setSelectedBill(null);
        setCategory('Accounts Payable');
        setPaidTo(s.S_Name);
        setAmount('');
        setReceiptNo('');
    };

    const handleSelectBill = (bill) => {
        if (!bill) {
            setSelectedBill(null);
            setAmount('');
            setReceiptNo('');
            return;
        }
        setSelectedBill(bill);
        setAmount(bill.remainingAmount.toFixed(2));
        setReceiptNo(bill.referenceNo);
    };

    const resetForm = () => {
        setExpenseDate(isoDate);
        setCategory(paymentType === 'credit' ? 'Accounts Payable' : '');
        setSubcategory('');
        setAmount('');
        setPaymentMethod('Cash');
        setPaidTo('');
        setDescription('');
        setReceiptNo('');
        setBankName('');
        setDepositSlipNo('');
        setDepositedBy('');
        setDepositDate(isoDate);
        setChequeNo('');
        setChequeBank('');
        setChequeDate(isoDate);
        setSelectedBill(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAlert(null);

        if (paymentType === 'credit') {
            if (!selectedSupplier || !selectedBill || !amount || !paymentMethod) {
                setAlert({ type: 'danger', msg: 'Please select Supplier, Bill, Amount, and Payment Method.' });
                return;
            }
        } else {
            if (!expenseDate || !category || !amount || !paymentMethod) {
                setAlert({ type: 'danger', msg: 'Please fill in required fields: Date, Category, Amount, and Method.' });
                return;
            }
        }

        const expenseAmount = parseFloat(amount);
        if (isNaN(expenseAmount) || expenseAmount <= 0) {
            setAlert({ type: 'danger', msg: 'Amount must be a positive number.' });
            return;
        }

        setSubmitting(true);
        try {
            const commonPayload = {
                expenseDate,
                paymentMethod,
                amount: expenseAmount,
                description: description || null,
                bankName: (paymentMethod === 'Bank') ? bankName : null,
                depositSlipNo: (paymentMethod === 'Bank') ? depositSlipNo : null,
                depositedBy: (paymentMethod === 'Bank') ? depositedBy : null,
                depositDate: (paymentMethod === 'Bank') ? depositDate : null,
                chequeNo: (paymentMethod === 'Cheque') ? chequeNo : null,
                chequeBank: (paymentMethod === 'Cheque') ? chequeBank : null,
                chequeDate: (paymentMethod === 'Cheque') ? chequeDate : null,
            };

            let res;
            if (paymentType === 'credit') {
                const payload = {
                    ...commonPayload,
                    supplierId: selectedSupplier.S_ID,
                    referenceNo: receiptNo,
                    supplierTransId: selectedBill.supplierTransId,
                    paymentDate: expenseDate,
                    notes: description
                };
                res = await axios.post('http://localhost:5000/api/supplier-payments/pay-credit', payload);
            } else {
                const payload = {
                    ...commonPayload,
                    expenseCategory: category,
                    expenseSubcategory: subcategory || null,
                    paidTo: paidTo || null,
                    receiptNo: receiptNo || null,
                };
                res = await axios.post(`${API_BASE}/create`, payload);
            }

            if (res.data.success) {
                setAlert({ type: 'success', msg: `✅ ${res.data.message} | Journal: ${res.data.data.journal?.journalNo || 'N/A'}` });
                resetForm();
                if (paymentType === 'credit') {
                    setSelectedSupplier(null);
                    setSupplierSearch('');
                    setOutstandingBills([]);
                }
                fetchRecentExpenses();
            } else {
                setAlert({ type: 'danger', msg: res.data.message || 'Failed.' });
            }
        } catch (err) {
            setAlert({ type: 'danger', msg: err.response?.data?.message || err.message });
        } finally {
            setSubmitting(false);
        }
    };

    // ── Styles ──
    const cardStyle = {
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
    };

    const inputStyle = {
        borderRadius: '10px',
        border: '1px solid #d1d5db',
        padding: '8px 14px',
        fontSize: '14px',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        fontFamily: "'Inter', sans-serif"
    };

    const labelStyle = {
        fontSize: '12px',
        fontWeight: 600,
        color: '#64748b',
        marginBottom: '4px',
        fontFamily: "'Inter', sans-serif"
    };

    const sectionTitleStyle = {
        fontSize: '11px',
        fontWeight: 700,
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        fontFamily: "'Inter', sans-serif"
    };

    const filteredSuppliers = suppliers.filter(s => 
        s.S_Name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
        s.S_Code.toLowerCase().includes(supplierSearch.toLowerCase())
    );

    return (
        <div style={{ width: '100%', minHeight: '100%', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>

            {/* Alert */}

            {/* Alert */}
            {alert && (
                <div className={`alert alert-${alert.type} mx-4 mt-3 mb-0 d-flex align-items-center`} role="alert" style={{ borderRadius: '12px', fontSize: '14px' }}>
                    {alert.type === 'success' ? <Check size={16} className="me-2" /> : <AlertCircle size={16} className="me-2" />}
                    {alert.msg}
                    <button type="button" className="btn-close ms-auto" onClick={() => setAlert(null)} style={{ fontSize: '10px' }}></button>
                </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit}>
                <div className="p-4 d-flex flex-column gap-4">

                    {/* Prominent Toggle Switch */}
                    <div className="d-flex gap-3">
                        {[
                          { id: 'general', label: 'General Expense', icon: <DollarSign size={16}/>, color: '#0d9488', bg: '#ecfdf5', dark: '#065f46' },
                          { id: 'credit', label: 'Credit Payable', icon: <FileText size={16}/>, color: '#ea580c', bg: '#fff7ed', dark: '#c2410c' }
                        ].map(t => (
                            <button key={t.id} type="button" onClick={() => { setPaymentType(t.id); resetForm(); if(t.id==='credit') fetchSuppliers(); }}
                                className="flex-1 h-14 rounded-xl border-2 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
                                style={paymentType === t.id ? {
                                    backgroundColor: t.bg,
                                    borderColor: t.color,
                                    color: t.dark,
                                    boxShadow: `0 4px 6px -1px ${t.color}20`
                                } : { backgroundColor: '#fff', borderColor: '#e5e7eb', color: '#6b7280' }}>
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Row 1: Context Selection (Supplier/Bill or Category) */}
                    <div className="bg-white p-4" style={cardStyle}>
                        <p style={sectionTitleStyle}>{paymentType === 'general' ? 'Expense Details' : 'Supplier & Bill Selection'}</p>
                        
                        {paymentType === 'credit' ? (
                            <div className="row g-3 mt-1">
                                {/* Supplier Search */}
                                <div className="col-md-5 position-relative">
                                    <label style={labelStyle}>Search Supplier <span className="text-danger">*</span></label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '10px 0 0 10px' }}>
                                            <Search size={16} color="#64748b" />
                                        </span>
                                        <input 
                                            type="text" 
                                            value={supplierSearch}
                                            onChange={(e) => { setSupplierSearch(e.target.value); setShowSupplierDropdown(true); }}
                                            onFocus={() => setShowSupplierDropdown(true)}
                                            placeholder="Type supplier name or code..."
                                            className="form-control border-start-0" 
                                            style={{ ...inputStyle, borderRadius: '0 10px 10px 0' }}
                                        />
                                    </div>
                                    
                                    {showSupplierDropdown && supplierSearch && (
                                        <div className="position-absolute w-100 mt-1 bg-white border shadow-lg overflow-auto" 
                                             style={{ zIndex: 1000, borderRadius: '12px', maxHeight: '250px' }}>
                                            {loadingSuppliers ? (
                                                <div className="p-3 text-center small text-muted">Loading suppliers...</div>
                                            ) : filteredSuppliers.length === 0 ? (
                                                <div className="p-3 text-center small text-muted">No suppliers found</div>
                                            ) : (
                                                filteredSuppliers.map(s => (
                                                    <div 
                                                        key={s.S_ID} 
                                                        onClick={() => handleSelectSupplier(s)}
                                                        className="p-3 border-bottom cursor-pointer hover-bg-light d-flex justify-content-between align-items-center"
                                                        style={{ cursor: 'pointer' }}>
                                                        <div>
                                                            <div className="fw-bold text-dark small">{s.S_Name}</div>
                                                            <div className="text-muted" style={{ fontSize: '11px' }}>{s.S_Code} | {s.City}</div>
                                                        </div>
                                                        <div className="text-end">
                                                            <div className="text-danger fw-bold small">Rs. {fmt(s.Current_Balance)}</div>
                                                            <div className="text-muted" style={{ fontSize: '10px' }}>Balance</div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Bill Selection */}
                                <div className="col-md-4">
                                    <label style={labelStyle}>Select Outstanding Bill <span className="text-danger">*</span></label>
                                    <select 
                                        className="form-select" 
                                        style={inputStyle}
                                        value={selectedBill?.supplierTransId || ''}
                                        onChange={(e) => handleSelectBill(outstandingBills.find(b => b.supplierTransId === parseInt(e.target.value)))}
                                        disabled={!selectedSupplier}>
                                        <option value="">{loadingBills ? 'Loading bills...' : 'Select a bill...'}</option>
                                        {outstandingBills.map(bill => (
                                            <option key={bill.supplierTransId} value={bill.supplierTransId}>
                                                {bill.referenceNo} ({bill.transactionDate}) - Rs. {fmt(bill.remainingAmount)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-3">
                                    <label style={labelStyle}>Payment Date <span className="text-danger">*</span></label>
                                    <input type="date" value={expenseDate} onChange={e => setExpenseDate(e.target.value)}
                                        className="form-control" style={inputStyle} required />
                                </div>
                            </div>
                        ) : (
                            <div className="row g-3 mt-1">
                                <div className="col-md-3">
                                    <label style={labelStyle}>Expense Date <span className="text-danger">*</span></label>
                                    <input type="date" value={expenseDate} onChange={e => setExpenseDate(e.target.value)}
                                        className="form-control" style={inputStyle} required />
                                </div>
                                <div className="col-md-3">
                                    <label style={labelStyle}>Category <span className="text-danger">*</span></label>
                                    <select 
                                        value={category} 
                                        onChange={e => e.target.value === 'ADD_NEW' ? setShowQuickAccount(true) : setCategory(e.target.value)}
                                        className="form-select" 
                                        style={inputStyle} 
                                        required
                                    >
                                        <option value="">{loadingCategories ? 'Loading...' : 'Select category'}</option>
                                        {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                        <option value="ADD_NEW" style={{ fontWeight: 'bold', color: '#0d9488' }}>+ Add New Category</option>
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <label style={labelStyle}>Subcategory</label>
                                    <input type="text" value={subcategory} onChange={e => setSubcategory(e.target.value)}
                                        placeholder="e.g., Electricity Bill" className="form-control" style={inputStyle} />
                                </div>
                                <div className="col-md-3">
                                    <label style={labelStyle}>Amount (Rs.) <span className="text-danger">*</span></label>
                                    <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)}
                                        placeholder="0.00" className="form-control" style={inputStyle} required />
                                </div>
                            </div>
                        )}

                        <div className="row g-3 mt-1">
                            <div className="col-md-4">
                                <label style={labelStyle}>{paymentType === 'credit' ? 'Supplier Name' : 'Paid To'}</label>
                                <input type="text" value={paidTo} onChange={e => setPaidTo(e.target.value)}
                                    placeholder="Vendor / Payee name" className="form-control" style={inputStyle} readOnly={paymentType === 'credit'} />
                            </div>
                            <div className="col-md-4">
                                <label style={labelStyle}>{paymentType === 'credit' ? 'Bill Number' : 'Receipt No'}</label>
                                <input type="text" value={receiptNo} onChange={e => setReceiptNo(e.target.value)}
                                    placeholder="Receipt or invoice number" className="form-control" style={inputStyle} readOnly={paymentType === 'credit'} />
                            </div>
                            <div className="col-md-4">
                                <label style={labelStyle}>Description</label>
                                <input type="text" value={description} onChange={e => setDescription(e.target.value)}
                                    placeholder="Brief description of the payment" className="form-control" style={inputStyle} />
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Payment Method */}
                    <div className="bg-white p-4" style={cardStyle}>
                        <p style={sectionTitleStyle}>Payment Method <span className="text-danger">*</span></p>
                        <div className="row g-3 mt-1">
                            {PAYMENT_METHODS.map(({ id, label, Icon }) => {
                                const active = paymentMethod === id;
                                return (
                                    <div className="col-md-4" key={id}>
                                        <div onClick={() => setPaymentMethod(id)}
                                            className="d-flex flex-column align-items-center justify-content-center gap-2"
                                            style={{
                                                height: '80px',
                                                borderRadius: '16px',
                                                border: `2px solid ${active ? '#e97a1f' : '#e2e8f0'}`,
                                                backgroundColor: active ? '#fff7ed' : '#fff',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}>
                                            <Icon size={22} color={active ? '#c2410c' : '#6b7280'} />
                                            <span style={{ fontSize: '13px', fontWeight: 500, color: active ? '#c2410c' : '#6b7280' }}>{label}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Bank Details */}
                        {paymentMethod === 'Bank' && (
                            <div className="mt-4 p-3 border rounded-lg bg-light animate-fadeIn">
                                <h6 style={{ ...sectionTitleStyle, color: '#0d9488' }} className="mb-3">Bank Details</h6>
                                <div className="row g-3">
                                    <div className="col-md-3">
                                        <label style={labelStyle}>Bank Name</label>
                                        <input type="text" value={bankName} onChange={e => setBankName(e.target.value)}
                                            placeholder="e.g., BOC, HNB" className="form-control" style={inputStyle} />
                                    </div>
                                    <div className="col-md-3">
                                        <label style={labelStyle}>Transfer Reference</label>
                                        <input type="text" value={depositSlipNo} onChange={e => setDepositSlipNo(e.target.value)}
                                            placeholder="Ref number" className="form-control" style={inputStyle} />
                                    </div>
                                    <div className="col-md-3">
                                        <label style={labelStyle}>Transfer By</label>
                                        <input type="text" value={depositedBy} onChange={e => setDepositedBy(e.target.value)}
                                            placeholder="Name" className="form-control" style={inputStyle} />
                                    </div>
                                    <div className="col-md-3">
                                        <label style={labelStyle}>Transfer Date</label>
                                        <input type="date" value={depositDate} onChange={e => setDepositDate(e.target.value)}
                                            className="form-control" style={inputStyle} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Cheque Details */}
                        {paymentMethod === 'Cheque' && (
                            <div className="mt-4 p-3 border rounded-lg bg-light animate-fadeIn">
                                <h6 style={{ ...sectionTitleStyle, color: '#0d9488' }} className="mb-3">Cheque Details</h6>
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <label style={labelStyle}>Cheque No</label>
                                        <input type="text" value={chequeNo} onChange={e => setChequeNo(e.target.value)}
                                            placeholder="Cheque number" className="form-control" style={inputStyle} />
                                    </div>
                                    <div className="col-md-4">
                                        <label style={labelStyle}>Cheque Bank</label>
                                        <input type="text" value={chequeBank} onChange={e => setChequeBank(e.target.value)}
                                            placeholder="Bank" className="form-control" style={inputStyle} />
                                    </div>
                                    <div className="col-md-4">
                                        <label style={labelStyle}>Cheque Date</label>
                                        <input type="date" value={chequeDate} onChange={e => setChequeDate(e.target.value)}
                                            className="form-control" style={inputStyle} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Row 3: Expense Summary + Submit */}
                    <div className="bg-white overflow-hidden" style={cardStyle}>
                        <div className="px-4 py-3" style={{ background: 'linear-gradient(135deg, #004445, #0d5c4f)' }}>
                            <h6 className="text-white fw-bold mb-0" style={{ letterSpacing: '0.5px' }}>PAYMENT SUMMARY</h6>
                            <small style={{ color: '#99f6e4', fontSize: '11px' }}>Review before submitting</small>
                        </div>

                        <div className="row g-0 p-4">
                            <div className="col-md-4 pe-4">
                                <p style={sectionTitleStyle}>Details</p>
                                <div className="d-flex flex-column gap-2 mt-2">
                                    {[
                                        ['Type', paymentType === 'general' ? 'General Expense' : 'Credit Payable'],
                                        ['Date', expenseDate || '—'],
                                        ['Category', category || '—'],
                                        ['Paid To', paidTo || '—'],
                                        ['Method', PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label || '—'],
                                        ['Ref #', receiptNo || '—'],
                                    ].map(([k, v]) => (
                                        <div key={k} className="d-flex justify-content-between">
                                            <span style={{ fontSize: '13px', color: '#64748b' }}>{k}</span>
                                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="col-md-4 px-4 border-start">
                                <p style={sectionTitleStyle}>Description</p>
                                <p className="mt-2" style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
                                    {description || <em className="text-muted">No description provided</em>}
                                </p>
                            </div>

                            <div className="col-md-4 ps-4 border-start">
                                <p style={sectionTitleStyle}>Total Amount</p>
                                <div className="mt-2 p-4 text-center" style={{ backgroundColor: '#fff7ed', borderRadius: '16px' }}>
                                    <small className="text-muted d-block" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>TOTAL PAYABLE</small>
                                    <h2 className="fw-bold mb-0 mt-1" style={{ color: '#ea580c' }}>
                                        Rs. {fmt(parseFloat(amount) || 0)}
                                    </h2>
                                </div>
                                <button type="submit" disabled={submitting}
                                    className="btn w-100 mt-3 fw-bold shadow-sm"
                                    style={{
                                        height: '48px',
                                        borderRadius: '14px',
                                        background: 'linear-gradient(135deg, #f97316, #ea580c)',
                                        color: '#fff',
                                        fontSize: '14px',
                                        border: 'none',
                                        opacity: submitting ? 0.7 : 1,
                                    }}>
                                    {submitting ? '⏳ Submitting...' : '💸 CONFIRM PAYMENT'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Row 4: Recent Transactions */}
                    <div className="bg-white overflow-hidden" style={cardStyle}>
                        <div className="px-4 py-3 border-bottom d-flex justify-content-between align-items-center">
                            <p style={sectionTitleStyle} className="mb-0">Recent Transactions</p>
                            <small className="text-muted">{recentExpenses.length} records</small>
                        </div>

                        {loadingExpenses ? (
                            <div className="text-center py-5"><div className="spinner-border spinner-border-sm text-muted"></div></div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover mb-0" style={{ fontSize: '13px' }}>
                                    <thead style={{ backgroundColor: '#f8fafc' }}>
                                        <tr>
                                            <th className="fw-semibold text-muted border-0 px-4 py-3 small">ID</th>
                                            <th className="fw-semibold text-muted border-0 py-3 small">DATE</th>
                                            <th className="fw-semibold text-muted border-0 py-3 small">CATEGORY</th>
                                            <th className="fw-semibold text-muted border-0 py-3 small">PAID TO</th>
                                            <th className="fw-semibold text-muted border-0 py-3 small">PAYMENT</th>
                                            <th className="fw-semibold text-muted border-0 py-3 text-end small">AMOUNT</th>
                                            <th className="fw-semibold text-muted border-0 py-3 text-center small">STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentExpenses.map((exp) => (
                                            <tr key={exp.Expense_ID}>
                                                <td className="px-4 py-3 text-muted small">#{exp.Expense_ID}</td>
                                                <td className="py-3">{exp.Expense_Date}</td>
                                                <td className="py-3 small fw-bold text-dark">{exp.Expense_Category}</td>
                                                <td className="py-3">{exp.Paid_To || '—'}</td>
                                                <td className="py-3">{exp.Payment_Method}</td>
                                                <td className="py-3 text-end fw-bold">Rs. {fmt(parseFloat(exp.Amount) || 0)}</td>
                                                <td className="py-3 text-center">
                                                    <span className={`badge ${statusBadge(exp.Status)}`} style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '20px' }}>
                                                        {exp.Status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </form>

            {/* Quick Account Modal */}
            <QuickAccountModal 
                isOpen={showQuickAccount} 
                onClose={() => setShowQuickAccount(false)}
                initialCode={missingAccountCode}
                initialType="Expense"
                onAccountCreated={(acc) => {
                    setAlert({ type: 'success', msg: `✅ Category '${acc.Account_Name}' added and selected!` });
                    const newCat = { value: acc.Account_Name, label: acc.Account_Name };
                    setCategories(prev => [...prev, newCat]);
                    setCategory(acc.Account_Name);
                }}
            />
        </div>
    );
};

export default MakePaymentPage;
