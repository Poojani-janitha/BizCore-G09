import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Loader, AlertCircle, RefreshCw, Printer, Download, Search, Calendar } from 'react-feather';

const AccountLedgerPage = () => {
  const navigate = useNavigate();
  const { accountCode } = useParams();
  
  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLedgerData();
  }, [accountCode]);

  const fetchLedgerData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`http://localhost:5000/api/accounts/ledger/${accountCode}`);
      if (res.data.success) {
        setLedgerData(res.data.data);
      } else {
        setError('Failed to load ledger details');
      }
    } catch (err) {
      console.error('Error fetching ledger:', err);
      setError(err.response?.data?.message || 'Server error while loading ledger');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) => {
    if (n === '-' || n === undefined || n === null) return '0.00';
    return parseFloat(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const filteredTransactions = ledgerData?.transactions.filter(tx => 
    tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.reference?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
        <Loader className="animate-spin text-orange-500 mb-4" size={32} />
        <p className="text-gray-500 font-medium">Loading Account Ledger...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] px-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
        <p className="text-gray-500 mb-6 max-w-md">{error}</p>
        <div className="flex gap-4">
          <button onClick={() => navigate('/finance/general-ledger')} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all">Go Back</button>
          <button onClick={fetchLedgerData} className="px-6 py-2 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all flex items-center gap-2">
            <RefreshCw size={18} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const { account, transactions } = ledgerData;

  return (
    <div className="w-full min-h-screen px-6 py-6 bg-[#f8fafc] flex flex-col gap-6 font-['Inter']">
      
      {/* Page Header Area */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
           <button 
             onClick={() => navigate('/finance/general-ledger')}
             className="text-sm text-gray-400 hover:text-orange-600 flex items-center gap-2 transition-colors mb-2 font-medium"
           >
             ← Back to General Ledger
           </button>
           <h1 className="text-3xl font-bold text-teal-950 tracking-tight">Account Detail</h1>
           <p className="text-gray-500 text-sm">Real-time transaction history and balance tracking</p>
        </div>
        <div className="flex gap-3">
        </div>
      </div>

      {/* Account Info Bar */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 font-bold text-2xl shadow-inner">
             {account.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
               <h2 className="text-xl font-bold text-teal-950">{account.name}</h2>
               <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-lg text-xs font-mono font-bold tracking-wider">{account.code}</span>
            </div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
              {account.type} {account.category ? `• ${account.category}` : ''}
            </p>
          </div>
        </div>
        
        <div></div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-1">
          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">Initial State</span>
          <span className="text-teal-950 text-2xl font-black">LKR 0.00</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-1">
          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">Activity Level</span>
          <span className="text-blue-600 text-2xl font-black">{transactions.length} Trans.</span>
        </div>
        <div className="bg-orange-600 p-6 rounded-2xl shadow-lg shadow-orange-100 flex flex-col gap-1">
          <span className="text-orange-100 text-[10px] font-bold uppercase tracking-[0.2em]">Current Net Balance</span>
          <span className="text-white text-2xl font-black">LKR {fmt(account.currentBalance)}</span>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col mb-12">
        <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Filter transactions by description or reference..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm"
            />
          </div>
          <button className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
            <Calendar size={16} /> Date Range
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/80 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reference</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Debit</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Credit</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Running Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-gray-400 italic">No transactions found matching your search.</td>
                </tr>
              ) : (
                filteredTransactions.map((tx, index) => (
                  <tr key={index} className="hover:bg-orange-50/30 transition-colors group border-b border-gray-50 last:border-0">
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">{tx.date}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-1 rounded-md">{tx.reference}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-teal-950">{tx.description}</td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-red-500">{fmt(tx.debit)}</td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-green-600">{fmt(tx.credit)}</td>
                    <td className="px-6 py-4 text-sm text-right">
                       <span className="text-teal-950 font-black tracking-tight">{fmt(tx.runningBalance)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountLedgerPage;
