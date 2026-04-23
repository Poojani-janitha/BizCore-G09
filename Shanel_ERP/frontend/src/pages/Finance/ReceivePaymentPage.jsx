import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle,
  CreditCard,
  DollarSign,
  FileText,
  Loader,
  AlertCircle
} from 'react-feather';

const API_BASE = 'http://localhost:5000/api/incomes';
const CUSTOMER_API = 'http://localhost:5000/api/customer';

const PAYMENT_METHODS = [
  { id: 'Cash', label: 'Cash', Icon: DollarSign },
  { id: 'Bank', label: 'Bank', Icon: Briefcase },
  { id: 'Cheque', label: 'Cheque', Icon: FileText },
  { id: 'Card', label: 'Card', Icon: CreditCard }
];

const INCOME_CATEGORIES = ['Sales', 'Interest', 'Commission', 'Other'];

const ReceivePaymentPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customerName: '',
    amount: '',
    incomeCategory: 'Sales',
    description: '',
    paymentMethod: 'Cash',
    date: new Date().toISOString().split('T')[0],
    referenceNo: ''
  });
  const [customers, setCustomers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [alert, setAlert] = useState(null);

  const customerOptions = useMemo(
    () => customers.map((c) => c.C_Name).filter(Boolean),
    [customers]
  );

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoadingCustomers(true);
        const res = await axios.get(CUSTOMER_API);
        if (res.data?.success) {
          setCustomers(res.data.data || []);
        }
      } catch (error) {
        console.error('Failed to load customers:', error);
      } finally {
        setLoadingCustomers(false);
      }
    };

    loadCustomers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customerName || !formData.amount || !formData.paymentMethod || !formData.incomeCategory) {
      setAlert({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setAlert({ type: 'error', message: 'Amount must be a valid positive number.' });
      return;
    }

    setSubmitting(true);
    setAlert(null);

    try {
      const payload = {
        incomeDate: formData.date,
        incomeCategory: formData.incomeCategory,
        amount,
        source: formData.customerName,
        description: formData.description || null,
        receiptNo: formData.referenceNo || null,
        paymentMethod: formData.paymentMethod
      };

      const res = await axios.post(`${API_BASE}/create`, payload);

      if (res.data?.success) {
        setAlert({
          type: 'success',
          message: `Receipt saved. Journal: ${res.data.data.journal.journalNo}`
        });
        setFormData((prev) => ({
          ...prev,
          customerName: '',
          amount: '',
          description: '',
          referenceNo: ''
        }));
      } else {
        setAlert({ type: 'error', message: res.data?.message || 'Failed to save receipt.' });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Server error while saving receipt.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f3f5f7] text-gray-900">

      <main className="max-w-6xl mx-auto px-6 py-6">

        {alert && (
          <div
            className={`mb-4 flex items-center gap-2 rounded-lg px-4 py-3 border ${
              alert.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {alert.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{alert.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <CheckCircle size={18} className="text-green-600" />
            <h2 className="text-2xl font-semibold tracking-wide">PAYMENT DETAILS</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full h-11 rounded-lg border border-gray-200 px-3 outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, date: new Date().toISOString().split('T')[0] }))}
                  className="h-11 px-4 rounded-lg bg-gray-100 text-gray-700 font-medium flex items-center gap-1"
                >
                  <Calendar size={14} /> Today
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                list="customers"
                required
                className="w-full h-11 rounded-lg border border-gray-200 px-3 outline-none focus:ring-2 focus:ring-teal-500"
                placeholder={loadingCustomers ? 'Loading customers...' : 'Select or type customer'}
              />
              <datalist id="customers">
                {customerOptions.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PAYMENT_METHODS.map(({ id, label, Icon }) => {
                const active = formData.paymentMethod === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: id }))}
                    className={`h-20 rounded-xl border flex flex-col items-center justify-center gap-2 transition ${
                      active
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : 'bg-white border-gray-200 text-gray-800 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount Received</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rs.</span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full h-12 rounded-lg border border-green-300 pl-12 pr-3 outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reference Number</label>
              <input
                type="text"
                name="referenceNo"
                value={formData.referenceNo}
                onChange={handleChange}
                className="w-full h-12 rounded-lg border border-gray-200 px-3 outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter reference number"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Income Category</label>
              <select
                name="incomeCategory"
                value={formData.incomeCategory}
                onChange={handleChange}
                className="w-full h-12 rounded-lg border border-gray-200 px-3 outline-none focus:ring-2 focus:ring-teal-500"
              >
                {INCOME_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full h-12 rounded-lg border border-gray-200 px-3 outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Add note about this payment"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={() => navigate('/finance')}
              className="h-12 px-7 rounded-lg border border-gray-300 text-gray-700 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-12 px-7 rounded-lg text-white font-medium bg-gradient-to-r from-orange-500 to-orange-600 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting && <Loader size={14} className="animate-spin" />} Save Receipt
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ReceivePaymentPage;
