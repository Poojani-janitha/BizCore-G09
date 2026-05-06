import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, CreditCard, FileText, Briefcase, Plus, Trash2, Check, AlertCircle, Clock } from 'react-feather';
import axios from 'axios';
import QuickAccountModal from '../../component/Finance/QuickAccountModal';

const API_BASE = 'http://localhost:5000/api/expenses';

// No hardcoded categories - all fetched from DB

const PAYMENT_METHODS = [
    { id: 'Cash', label: 'Cash', Icon: DollarSign },
    { id: 'Bank', label: 'Bank', Icon: Briefcase },
    { id: 'Cheque', label: 'Cheque', Icon: FileText },
];

const today = new Date();
const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
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
    }, []);

    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            const res = await axios.get('http://localhost:5000/api/accounts?type=Expense&active=true');
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

    const resetForm = () => {
        setExpenseDate(isoDate);
        setCategory('');
        setSubcategory('');
        setAmount('');
        setPaymentMethod('Cash');
        setPaidTo('');
        setDescription('');
        setReceiptNo('');
        
        // Reset banking fields
        setBankName('');
        setDepositSlipNo('');
        setDepositedBy('');
        setDepositDate(isoDate);
        setChequeNo('');
        setChequeBank('');
        setChequeDate(isoDate);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAlert(null);

        if (!expenseDate || !category || !amount || !paymentMethod) {
            setAlert({ type: 'danger', msg: 'Please fill in all required fields: Date, Category, Amount, and Payment Method.' });
            return;
        }

        const expenseAmount = parseFloat(amount);
        if (isNaN(expenseAmount) || expenseAmount <= 0) {
            setAlert({ type: 'danger', msg: 'Amount must be a valid positive number.' });
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                expenseDate,
                expenseCategory: category,
                expenseSubcategory: subcategory || null,
                amount: expenseAmount,
                paymentMethod,
                paidTo: paidTo || null,
                description: description || null,
                receiptNo: receiptNo || null,
                
                // Bank fields
                bankName: paymentMethod === 'Bank' ? bankName : null,
                depositSlipNo: paymentMethod === 'Bank' ? depositSlipNo : null,
                depositedBy: paymentMethod === 'Bank' ? depositedBy : null,
                depositDate: paymentMethod === 'Bank' ? depositDate : null,

                // Cheque fields
                chequeNo: paymentMethod === 'Cheque' ? chequeNo : null,
                chequeBank: paymentMethod === 'Cheque' ? chequeBank : null,
                chequeDate: paymentMethod === 'Cheque' ? chequeDate : null,
            };

            const res = await axios.post(`${API_BASE}/create`, payload);

            if (res.data.success) {
                setAlert({ type: 'success', msg: `✅ ${res.data.message} | Journal: ${res.data.data.journal.journalNo}` });
                resetForm();
                fetchRecentExpenses();
            } else {
                setAlert({ type: 'danger', msg: res.data.message || 'Failed to create expense.' });
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            if (typeof msg === 'string' && msg.includes('not found in ACCOUNT_CHART')) {
                const codeMatch = msg.match(/\((\d+)\)/);
                if (codeMatch) setMissingAccountCode(codeMatch[1]);
                setShowQuickAccount(true);
            } else {
                setAlert({ type: 'danger', msg: msg || 'Server error.' });
            }
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

    return (
        <div style={{ width: '100%', minHeight: '100%', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>

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

                    {/* Row 1: Expense Details */}
                    <div className="bg-white p-4" style={cardStyle}>
                        <p style={sectionTitleStyle}>Expense Details</p>
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
                                    onChange={e => {
                                        if (e.target.value === 'ADD_NEW') {
                                            setShowQuickAccount(true);
                                        } else {
                                            setCategory(e.target.value);
                                        }
                                    }}
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

                        <div className="row g-3 mt-1">
                            <div className="col-md-4">
                                <label style={labelStyle}>Paid To</label>
                                <input type="text" value={paidTo} onChange={e => setPaidTo(e.target.value)}
                                    placeholder="Vendor / Payee name" className="form-control" style={inputStyle} />
                            </div>
                            <div className="col-md-4">
                                <label style={labelStyle}>Receipt No</label>
                                <input type="text" value={receiptNo} onChange={e => setReceiptNo(e.target.value)}
                                    placeholder="Receipt or invoice number" className="form-control" style={inputStyle} />
                            </div>
                            <div className="col-md-4">
                                <label style={labelStyle}>Description</label>
                                <input type="text" value={description} onChange={e => setDescription(e.target.value)}
                                    placeholder="Brief description of the expense" className="form-control" style={inputStyle} />
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
                                        <label style={labelStyle}>Deposit Slip No</label>
                                        <input type="text" value={depositSlipNo} onChange={e => setDepositSlipNo(e.target.value)}
                                            placeholder="Slip number" className="form-control" style={inputStyle} />
                                    </div>
                                    <div className="col-md-3">
                                        <label style={labelStyle}>Deposited By</label>
                                        <input type="text" value={depositedBy} onChange={e => setDepositedBy(e.target.value)}
                                            placeholder="Name" className="form-control" style={inputStyle} />
                                    </div>
                                    <div className="col-md-3">
                                        <label style={labelStyle}>Deposit Date</label>
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
                        {/* Summary Header */}
                        <div className="px-4 py-3" style={{ background: 'linear-gradient(135deg, #004445, #0d5c4f)' }}>
                            <h6 className="text-white fw-bold mb-0" style={{ letterSpacing: '0.5px' }}>EXPENSE SUMMARY</h6>
                            <small style={{ color: '#99f6e4', fontSize: '11px' }}>Review before submitting</small>
                        </div>

                        <div className="row g-0 p-4">
                            {/* Details */}
                            <div className="col-md-4 pe-4">
                                <p style={sectionTitleStyle}>Details</p>
                                <div className="d-flex flex-column gap-2 mt-2">
                                    {[
                                        ['Date', expenseDate || '—'],
                                        ['Category', categories.find(c => c.value === category)?.label || '—'],
                                        ['Subcategory', subcategory || '—'],
                                        ['Paid To', paidTo || '—'],
                                        ['Payment', PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label || '—'],
                                        ['Receipt #', receiptNo || '—'],
                                        paymentMethod === 'Bank' ? ['Bank', bankName || '—'] : null,
                                        paymentMethod === 'Bank' ? ['Slip #', depositSlipNo || '—'] : null,
                                        paymentMethod === 'Cheque' ? ['Cheque #', chequeNo || '—'] : null,
                                        paymentMethod === 'Cheque' ? ['Cheque Date', chequeDate || '—'] : null,
                                    ].filter(Boolean).map(([k, v]) => (
                                        <div key={k} className="d-flex justify-content-between">
                                            <span style={{ fontSize: '13px', color: '#64748b' }}>{k}</span>
                                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="col-md-4 px-4 border-start">
                                <p style={sectionTitleStyle}>Description</p>
                                <p className="mt-2" style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
                                    {description || <em className="text-muted">No description provided</em>}
                                </p>
                            </div>

                            {/* Total + Submit */}
                            <div className="col-md-4 ps-4 border-start">
                                <p style={sectionTitleStyle}>Total Amount</p>
                                <div className="mt-2 p-4 text-center" style={{ backgroundColor: '#fff7ed', borderRadius: '16px' }}>
                                    <small className="text-muted d-block" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>TOTAL PAYABLE</small>
                                    <h2 className="fw-bold mb-0 mt-1" style={{ color: '#ea580c' }}>
                                        Rs. {fmt(parseFloat(amount) || 0)}
                                    </h2>
                                </div>
                                <button type="submit" disabled={submitting}
                                    className="btn w-100 mt-3 fw-bold"
                                    style={{
                                        height: '48px',
                                        borderRadius: '14px',
                                        background: 'linear-gradient(135deg, #f97316, #ea580c)',
                                        color: '#fff',
                                        fontSize: '14px',
                                        border: 'none',
                                        letterSpacing: '0.3px',
                                        boxShadow: '0 4px 12px rgba(249,115,22,0.3)',
                                        cursor: submitting ? 'not-allowed' : 'pointer',
                                        opacity: submitting ? 0.7 : 1,
                                        transition: 'all 0.2s'
                                    }}>
                                    {submitting ? '⏳ Submitting...' : '💸 SUBMIT EXPENSE'}
                                </button>
                                <p className="text-center text-muted mt-2" style={{ fontSize: '11px' }}>
                                    Creates journal entry automatically
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Row 4: Recent Expenses Table */}
                    <div className="bg-white overflow-hidden" style={cardStyle}>
                        <div className="px-4 py-3 border-bottom d-flex justify-content-between align-items-center">
                            <div>
                                <p style={sectionTitleStyle} className="mb-0">Recent Expenses</p>
                            </div>
                            <small className="text-muted">{recentExpenses.length} records</small>
                        </div>

                        {loadingExpenses ? (
                            <div className="text-center py-5">
                                <div className="spinner-border spinner-border-sm text-muted" role="status"></div>
                                <p className="text-muted mt-2" style={{ fontSize: '13px' }}>Loading expenses...</p>
                            </div>
                        ) : recentExpenses.length === 0 ? (
                            <div className="text-center py-5">
                                <Clock size={32} className="text-muted mb-2" />
                                <p className="text-muted" style={{ fontSize: '13px' }}>No expenses recorded yet</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover mb-0" style={{ fontSize: '13px' }}>
                                    <thead style={{ backgroundColor: '#f8fafc' }}>
                                        <tr>
                                            <th className="fw-semibold text-muted border-0 px-4 py-3" style={{ fontSize: '11px' }}>ID</th>
                                            <th className="fw-semibold text-muted border-0 py-3" style={{ fontSize: '11px' }}>DATE</th>
                                            <th className="fw-semibold text-muted border-0 py-3" style={{ fontSize: '11px' }}>CATEGORY</th>
                                            <th className="fw-semibold text-muted border-0 py-3" style={{ fontSize: '11px' }}>PAID TO</th>
                                            <th className="fw-semibold text-muted border-0 py-3" style={{ fontSize: '11px' }}>PAYMENT</th>
                                            <th className="fw-semibold text-muted border-0 py-3 text-end" style={{ fontSize: '11px' }}>AMOUNT</th>
                                            <th className="fw-semibold text-muted border-0 py-3 text-center" style={{ fontSize: '11px' }}>STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentExpenses.map((exp) => (
                                            <tr key={exp.Expense_ID}>
                                                <td className="px-4 py-3 text-muted">#{exp.Expense_ID}</td>
                                                <td className="py-3">{exp.Expense_Date}</td>
                                                <td className="py-3">
                                                    <span className="badge bg-light text-dark border" style={{ fontWeight: 500, fontSize: '11px' }}>
                                                        {exp.Expense_Category?.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="py-3">{exp.Paid_To || '—'}</td>
                                                <td className="py-3">{exp.Payment_Method?.replace('_', ' ')}</td>
                                                <td className="py-3 text-end fw-semibold">Rs. {fmt(parseFloat(exp.Amount) || 0)}</td>
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
                    // Refresh categories list
                    const newCat = { value: acc.Account_Name, label: acc.Account_Name };
                    setCategories(prev => {
                        if (prev.find(p => p.value === newCat.value)) return prev;
                        return [...prev, newCat];
                    });
                    setCategory(acc.Account_Name);
                }}
            />
        </div>
    );
};

export default MakePaymentPage;
