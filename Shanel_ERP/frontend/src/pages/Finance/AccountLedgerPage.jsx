import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const AccountLedgerPage = () => {
  const navigate = useNavigate();
  const { accountCode } = useParams();

  // Static data for demonstration
  const accountData = {
    name: "General Account",
    code: accountCode || "1001",
    category: "Asset • Current Operating",
    openingBalance: "LKR 0",
    periodTotal: "LKR 505,000",
    currentBalance: "LKR 450,000"
  };

  const transactions = [
    { date: '2026-05-04', ref: 'INV-2026-001', desc: 'Product Sales - BATCH-2026-001', debit: '-', credit: '45,000', balance: '670,000' },
    { date: '2026-05-03', ref: 'INV-2026-002', desc: 'Product Sales - BATCH-2026-002', debit: '-', credit: '125,000', balance: '625,000' },
    { date: '2026-05-01', ref: 'INV-2025-999', desc: 'Consultancy Fees', debit: '-', credit: '50,000', balance: '500,000' },
    { date: '2026-04-28', ref: 'REV-001', desc: 'Correction Entry - Service Reversal', debit: '15,000', credit: '-', balance: '450,000' },
    { date: '2026-04-25', ref: 'INV-2025-985', desc: 'Bulk Order - Shanel Prime', debit: '-', credit: '300,000', balance: '465,000' },
  ];

  return (
    <div className="w-full min-h-screen px-6 py-6 bg-[#f8fafc] flex flex-col gap-6 font-['Inter']">
      
      {/* Page Header Area */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
           <button 
             onClick={() => navigate('/finance/chart-of-accounts')}
             className="text-sm text-gray-500 hover:text-cyan-950 flex items-center gap-2 transition-colors mb-2"
           >
             ← Back to Chart of Accounts
           </button>
           <h1 className="text-3xl font-bold text-cyan-950">General Ledger</h1>
           <p className="text-gray-500 text-sm">Comprehensive financial control and recording system</p>
        </div>
        <button className="px-5 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
           <span>Export Data</span>
        </button>
      </div>

      {/* Account Details & Actions */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-cyan-50 rounded-full flex items-center justify-center text-cyan-700 font-bold text-xl">
             {accountData.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
               <h2 className="text-xl font-bold text-cyan-950">Account Ledger: {accountData.name}</h2>
               <span className="bg-gray-100 text-gray-500 px-3 py-0.5 rounded-lg text-sm font-mono font-medium">{accountData.code}</span>
            </div>
            <p className="text-sm text-gray-400 font-medium">{accountData.category}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Print</button>
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Export</button>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-1">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Opening Balance</span>
          <span className="text-cyan-950 text-2xl font-bold">{accountData.openingBalance}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-1">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Period Total (Net)</span>
          <span className="text-green-600 text-2xl font-bold">{accountData.periodTotal}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border-l-4 border-l-orange-500 border-y border-r border-gray-200 shadow-sm flex flex-col gap-1">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Current Balance</span>
          <span className="text-cyan-950 text-2xl font-bold">{accountData.currentBalance}</span>
        </div>
      </div>

      {/* Transactions Table Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col mb-8">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <input 
              type="text" 
              placeholder="Search transactions..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Date Range
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Reference</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Description</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Debit</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Credit</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Running Balance</th>
                <th className="px-6 py-4 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((tx, index) => (
                <tr key={index} className="hover:bg-cyan-50/20 transition-colors group">
                  <td className="px-6 py-4 text-sm text-gray-700">{tx.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-400 font-mono">{tx.ref}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-cyan-950">{tx.desc}</td>
                  <td className="px-6 py-4 text-sm text-right text-red-600 font-bold">{tx.debit}</td>
                  <td className="px-6 py-4 text-sm text-right text-green-600 font-bold">{tx.credit}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900 font-black">{tx.balance}</td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-gray-300 hover:text-gray-600 font-bold text-lg leading-none">⋮</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountLedgerPage;
