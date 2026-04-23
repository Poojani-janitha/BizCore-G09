import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, CreditCard, DollarSign, FileText, Briefcase } from 'react-feather';

const CATEGORIES = ['Utilities', 'Office Supplies', 'Travel', 'Rent', 'Salaries', 'Marketing', 'Maintenance', 'Other'];
const DEPARTMENTS = ['Production', 'Sales', 'Marketing', 'Finance', 'HR', 'IT', 'Admin'];
const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', Icon: DollarSign },
  { id: 'bank', label: 'Bank Transfer', Icon: Briefcase },
  { id: 'cheque', label: 'Cheque', Icon: FileText },
  { id: 'card', label: 'Credit Card', Icon: CreditCard },
];

const today = new Date();
const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
const isoDate = today.toISOString().split('T')[0];

const emptyItem = { category: '', vendor: '', description: '', amount: '' };

const MakePaymentPage = () => {
  const navigate = useNavigate();
  const [expenseDate, setExpenseDate] = useState(isoDate);
  const [department, setDepartment] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [lineItems, setLineItems] = useState([{ ...emptyItem }]);
  const [bankDetails, setBankDetails] = useState({ bankName: '', slipNo: '', depositedBy: '', depositDate: '', refNo: '', notes: '' });

  const addLineItem = () => setLineItems(prev => [{ ...emptyItem }, ...prev]);
  const removeLineItem = (i) => setLineItems(prev => prev.filter((_, idx) => idx !== i));
  const updateLineItem = (i, field, value) => {
    setLineItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  };

  const totalAmount = lineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const filledItems = lineItems.filter(i => i.category && i.amount);

  const categoryBreakdown = filledItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + (parseFloat(item.amount) || 0);
    return acc;
  }, {});

  const handleSubmit = () => {
    const payload = { expenseDate, department, paymentMethod, lineItems: filledItems, bankDetails, totalAmount };
    console.log('Expense Submission:', payload);
    alert('Expenses submitted for approval!');
    navigate('/finance');
  };

  const fmt = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const inputCls = "w-full h-10 px-3 py-2 text-sm rounded-[10px] border border-gray-300 outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all font-['Inter']";
  const labelCls = "text-xs font-medium text-gray-600 font-['Inter'] leading-4";
  const sectionTitle = "text-xs font-semibold text-gray-500 uppercase tracking-wide font-['Inter'] leading-4";

  return (
    <div className="w-full min-h-full bg-neutral-100 font-['Inter']">
      {/* Page Header */}
      <div className="w-full bg-white border-b border-gray-200 px-6 py-2.5">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-6">💸 Expense Management</h1>
            <p className="text-[11px] text-gray-500">Record and manage company expenses</p>
          </div>
          <span className="text-xs text-gray-400 font-['Inter']">{dateStr}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full py-6 px-6 flex flex-col gap-5">

        {/* Voucher Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className={sectionTitle}>Voucher Details</p>
          <div className="grid grid-cols-2 gap-6 mt-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Expense Date</label>
              <input type="date" value={expenseDate} onChange={e => setExpenseDate(e.target.value)} className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Department</label>
              <select value={department} onChange={e => setDepartment(e.target.value)} className={inputCls}>
                <option value="">Select department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Expense Line Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
            <p className={sectionTitle}>Expense Line Items</p>
            <span className="text-xs text-gray-400">{filledItems.length} item{filledItems.length !== 1 ? 's' : ''} added</span>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-[40px_1fr_1fr_1fr_1fr_64px] bg-gray-50 border-b border-gray-200">
            {['#', 'Category', 'Vendor', 'Description', 'Amount (Rs.)', ''].map((h, i) => (
              <div key={i} className="px-4 py-3">
                <span className="text-xs font-semibold text-gray-600">{h}</span>
              </div>
            ))}
          </div>

          {/* Input Row */}
          <div className="grid grid-cols-[40px_1fr_1fr_1fr_1fr_64px] bg-blue-50/40 border-b border-gray-100 items-center">
            <div className="px-4 py-4"><span className="text-sm text-gray-400 font-medium">#</span></div>
            <div className="px-2 py-3">
              <select value="" onChange={e => { if (e.target.value) { setLineItems(prev => [{ ...emptyItem, category: e.target.value }, ...prev]); e.target.value = ''; }}}
                className="w-full h-9 px-2 text-sm rounded-[10px] border border-gray-300 bg-white outline-none">
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="px-2 py-3"><input placeholder="Vendor name" className="w-full h-9 px-3 text-sm rounded-[10px] border border-gray-300 outline-none" disabled /></div>
            <div className="px-2 py-3"><input placeholder="Description" className="w-full h-9 px-3 text-sm rounded-[10px] border border-gray-300 outline-none" disabled /></div>
            <div className="px-2 py-3"><input placeholder="0.00" className="w-full h-9 px-3 text-sm rounded-[10px] border border-gray-300 outline-none" disabled /></div>
            <div className="flex justify-center py-3">
              <button onClick={addLineItem} className="w-9 h-9 bg-[#004445] rounded-[10px] flex items-center justify-center hover:bg-[#006060] transition-colors">
                <Plus size={16} color="white" />
              </button>
            </div>
          </div>

          {/* Line Item Rows */}
          {lineItems.map((item, i) => (
            <div key={i} className="grid grid-cols-[40px_1fr_1fr_1fr_1fr_64px] border-b border-gray-100 items-center hover:bg-gray-50/50 transition-colors">
              <div className="px-4 py-4"><span className="text-sm text-gray-400">{i + 1}</span></div>
              <div className="px-2 py-3">
                <select value={item.category} onChange={e => updateLineItem(i, 'category', e.target.value)}
                  className="w-full h-9 px-2 text-sm rounded-[10px] border border-gray-300 outline-none bg-white">
                  <option value="">Category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="px-2 py-3">
                <input value={item.vendor} onChange={e => updateLineItem(i, 'vendor', e.target.value)}
                  placeholder="Vendor name" className="w-full h-9 px-3 text-sm rounded-[10px] border border-gray-300 outline-none" />
              </div>
              <div className="px-2 py-3">
                <input value={item.description} onChange={e => updateLineItem(i, 'description', e.target.value)}
                  placeholder="Description" className="w-full h-9 px-3 text-sm rounded-[10px] border border-gray-300 outline-none" />
              </div>
              <div className="px-2 py-3">
                <input type="number" value={item.amount} onChange={e => updateLineItem(i, 'amount', e.target.value)}
                  placeholder="0.00" className="w-full h-9 px-3 text-sm rounded-[10px] border border-gray-300 outline-none" />
              </div>
              <div className="flex justify-center py-3">
                <button onClick={() => removeLineItem(i)} className="w-8 h-8 bg-red-50 rounded-[10px] flex items-center justify-center hover:bg-red-100 transition-colors">
                  <Trash2 size={14} className="text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className={sectionTitle}>Payment Method</p>
          <div className="grid grid-cols-4 gap-4 mt-4">
            {PAYMENT_METHODS.map(({ id, label, Icon }) => {
              const active = paymentMethod === id;
              return (
                <button key={id} onClick={() => setPaymentMethod(id)}
                  className={`h-20 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer
                    ${active ? 'bg-orange-50 border-orange-500' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                  <Icon size={20} className={active ? 'text-orange-700' : 'text-gray-600'} />
                  <span className={`text-xs font-medium ${active ? 'text-orange-700' : 'text-gray-600'}`}>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Bank Transfer Details */}
          {paymentMethod === 'bank' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className={sectionTitle}>Bank Transfer Details</p>
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Bank Name</label>
                  <input value={bankDetails.bankName} onChange={e => setBankDetails(p => ({ ...p, bankName: e.target.value }))}
                    placeholder="e.g., Commercial Bank" className={inputCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Deposit Slip Number</label>
                  <input value={bankDetails.slipNo} onChange={e => setBankDetails(p => ({ ...p, slipNo: e.target.value }))}
                    placeholder="Enter slip number" className={inputCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Deposited By</label>
                  <input value={bankDetails.depositedBy} onChange={e => setBankDetails(p => ({ ...p, depositedBy: e.target.value }))}
                    placeholder="Employee name" className={inputCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Deposit Date</label>
                  <input type="date" value={bankDetails.depositDate} onChange={e => setBankDetails(p => ({ ...p, depositDate: e.target.value }))}
                    className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Reference Number (Optional)</label>
                  <input value={bankDetails.refNo} onChange={e => setBankDetails(p => ({ ...p, refNo: e.target.value }))}
                    placeholder="Reference or receipt number" className={inputCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Notes (Optional)</label>
                  <input value={bankDetails.notes} onChange={e => setBankDetails(p => ({ ...p, notes: e.target.value }))}
                    placeholder="Additional payment notes..." className={inputCls} />
                </div>
              </div>
            </div>
          )}

          {/* Cheque Details */}
          {paymentMethod === 'cheque' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className={sectionTitle}>Cheque Details</p>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Cheque Number</label>
                  <input placeholder="Enter cheque number" className={inputCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Bank Name</label>
                  <input placeholder="Issuing bank" className={inputCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Cheque Date</label>
                  <input type="date" className={inputCls} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Expense Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Summary Header */}
          <div className="px-6 pt-5 pb-4 bg-gradient-to-br from-[#004445] via-[#004445] to-[#0d5c4f]">
            <h3 className="text-base font-bold text-white tracking-wide">EXPENSE SUMMARY</h3>
            <p className="text-xs text-teal-200 mt-0.5">Voucher overview</p>
          </div>

          {/* Summary Body */}
          <div className="grid grid-cols-3 gap-6 p-6">
            {/* Details Column */}
            <div>
              <p className={sectionTitle}>Details</p>
              <div className="mt-4 space-y-3">
                {[
                  ['Date', expenseDate || '—'],
                  ['Department', department || '—'],
                  ['Payment', PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label || '—'],
                  ['Line Items', String(filledItems.length)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-sm text-gray-500">{k}</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Breakdown */}
            <div>
              <p className={sectionTitle}>Category Breakdown</p>
              <div className="mt-4 space-y-3">
                {Object.keys(categoryBreakdown).length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No items added yet</p>
                ) : (
                  Object.entries(categoryBreakdown).map(([cat, amt]) => (
                    <div key={cat}>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">{cat}</span>
                        <span className="text-sm font-semibold text-gray-900">Rs. {fmt(amt)}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: totalAmount > 0 ? `${(amt / totalAmount) * 100}%` : '0%' }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Total Amount */}
            <div>
              <p className={sectionTitle}>Total Amount</p>
              <div className="mt-4 p-5 bg-orange-50 rounded-2xl">
                <p className="text-xs text-gray-500">TOTAL PAYABLE</p>
                <p className="text-4xl font-bold text-orange-600 mt-1 leading-tight">Rs. {fmt(totalAmount)}</p>
              </div>
              <button onClick={handleSubmit}
                className="w-full h-12 mt-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold rounded-2xl shadow-md hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all tracking-tight cursor-pointer">
                💸 SUBMIT EXPENSES
              </button>
              <p className="text-center text-xs text-gray-400 mt-2">Will be submitted for manager approval</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MakePaymentPage;
