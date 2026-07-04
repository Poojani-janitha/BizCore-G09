import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Loader, AlertCircle, RefreshCw, Printer, Download, Search, Calendar, ArrowDown, ArrowUp } from 'react-feather';
import { useTranslation } from 'react-i18next';
//import { Loader, AlertCircle, RefreshCw, Printer, Download, Search, Calendar } from 'react-feather';
import { API_ENDPOINTS } from '../../config/apiEndpoints';

const AccountLedgerPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { accountCode } = useParams();
  
  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' = oldest first (last to new), 'desc' = newest first (new to last)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchLedgerData();
  }, [accountCode]);

  const fetchLedgerData = async () => {
    try {
      setLoading(true);
      setError(null);
      setCurrentPage(1);
      //const res = await axios.get(`http://localhost:5000/api/accounts/ledger/${accountCode}`);
      const res = await axios.get(API_ENDPOINTS.accounts.ledger(accountCode));
      if (res.data.success) {
        setLedgerData(res.data.data);
      } else {
        setError('Failed to load ledger details');
      }
    } catch (err) {
      console.error('Error fetching ledger:', err);
      setError(err.response?.data?.message || t('finance.ledger.error_server'));
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

  const sortedTransactions = [...filteredTransactions];
  if (sortOrder === 'desc') {
    sortedTransactions.reverse();
  }

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = sortedTransactions.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
        <Loader className="animate-spin text-orange-500 mb-4" size={32} />
        <p className="text-gray-500 font-medium">{t('finance.ledger.loading')}</p>
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
             ← {t('finance.tabs.chart_of_accounts')}
           </button>
           <h1 className="text-3xl font-bold text-teal-950 tracking-tight">{t('finance.ledger.current_balance').split(' ')[0]} Detail</h1>
           <p className="text-gray-500 text-sm">{t('finance.subtitle')}</p>
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
        {/* Card 1: Initial Balance */}
        <div className="p-5 bg-white border border-gray-200 border-t-4 border-blue-600 rounded-2xl shadow-sm flex flex-col justify-between h-32 transition-all hover:-translate-y-1 hover:shadow-md">
          <div className="flex justify-between items-start w-full">
            <small className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {t('finance.ledger.initial_state')}
            </small>
            <div className="opacity-75">
              <ArrowUp size={20} className="text-blue-600" />
            </div>
          </div>
          <div>
            <h5 className="text-2xl font-black text-slate-800 leading-tight">
              LKR {fmt(account.balanceBroughtForward)}
            </h5>
          </div>
        </div>

        {/* Card 2: Transactions Count */}
        <div className="p-5 bg-white border border-gray-200 border-t-4 border-yellow-500 rounded-2xl shadow-sm flex flex-col justify-between h-32 transition-all hover:-translate-y-1 hover:shadow-md">
          <div className="flex justify-between items-start w-full">
            <small className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {t('finance.ledger.activity_level')}
            </small>
            <div className="opacity-75">
              <RefreshCw size={20} className="text-yellow-500" />
            </div>
          </div>
          <div>
            <h5 className="text-2xl font-black text-slate-800 leading-tight">
              {transactions.length} {t('finance.ledger.transactions')}
            </h5>
          </div>
        </div>

        {/* Card 3: Current Balance */}
        <div className="p-5 bg-white border border-gray-200 border-t-4 border-green-600 rounded-2xl shadow-sm flex flex-col justify-between h-32 transition-all hover:-translate-y-1 hover:shadow-md">
          <div className="flex justify-between items-start w-full">
            <small className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {t('finance.ledger.current_balance')}
            </small>
            <div className="opacity-75">
              <ArrowDown size={20} className="text-green-600" />
            </div>
          </div>
          <div>
            <h5 className="text-2xl font-black text-slate-800 leading-tight">
              LKR {fmt(account.currentBalance)}
            </h5>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col mb-12">
        <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('finance.ledger.search_placeholder')} 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm"
            />
          </div>
          <button 
            onClick={() => { setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); setCurrentPage(1); }}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
          >
            {sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            {sortOrder === 'asc' ? t('finance.ledger.oldest_first') : t('finance.ledger.newest_first')}
          </button>
          <button className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
            <Calendar size={16} /> {t('finance.ledger.date_range')}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/80 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('finance.ledger.date')}</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('finance.ledger.reference')}</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('finance.ledger.description')}</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">{t('finance.ledger.debit')}</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">{t('finance.ledger.credit')}</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">{t('finance.ledger.running_balance')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-gray-400 italic">{t('finance.ledger.no_transactions')}</td>
                </tr>
              ) : (
                currentTransactions.map((tx, index) => (
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

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center gap-4">
            <span className="text-xs text-gray-500 font-medium">
              {t('finance.ledger.showing_transactions', { start: indexOfFirstItem + 1, end: Math.min(indexOfLastItem, sortedTransactions.length), total: sortedTransactions.length })}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
              >
                {t('finance.ledger.previous')}
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
              >
                {t('finance.ledger.next')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountLedgerPage;
