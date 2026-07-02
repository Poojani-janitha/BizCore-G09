import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Box, Calendar, Layers,
  PlusCircle, Loader, RefreshCw, AlertCircle, ChevronDown, CheckCircle, Lock, Shield
} from 'react-feather';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import ChartOfAccountsPage from './ChartOfAccountsPage';
import FiscalPeriodModal from './FiscalPeriodModal';

const GeneralLedgerPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('chart_of_accounts');
  const [journalEntries, setJournalEntries] = useState([]);
  const [fiscalPeriods, setFiscalPeriods] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [loadingPeriods, setLoadingPeriods] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalEntries, setTotalEntries] = useState(0);
  
  // Modal state
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);

  const tabs = [
    { id: 'chart_of_accounts', label: t('finance.tabs.chart_of_accounts'), icon: (color) => <Box size={18} color={color} /> },
    { id: 'journal_entries', label: t('finance.tabs.journal_entries'), icon: (color) => <FileText size={18} color={color} /> },
    { id: 'fiscal_periods', label: t('finance.tabs.fiscal_periods'), icon: (color) => <Calendar size={18} color={color} /> },
    { id: 'subledger_integration', label: t('finance.tabs.subledger'), icon: (color) => <Layers size={18} color={color} /> }
  ];

  useEffect(() => {
    if (activeTab === 'journal_entries' && journalEntries.length === 0) {
      fetchJournalEntries(1, true);
    }
    if (activeTab === 'fiscal_periods' && fiscalPeriods.length === 0) {
      fetchFiscalPeriods();
    }
  }, [activeTab]);

  const fetchJournalEntries = async (pageNum, reset = false) => {
    try {
      if (reset) setLoadingEntries(true);
      else setLoadingMore(true);
      
      const res = await axios.get(`http://localhost:5000/api/journal-entries?page=${pageNum}&limit=10`);
      if (res.data.success) {
        if (reset) {
          setJournalEntries(res.data.data);
        } else {
          setJournalEntries(prev => [...prev, ...res.data.data]);
        }
        setTotalEntries(res.data.total);
        setHasMore(pageNum < res.data.totalPages);
        setPage(pageNum);
      }
    } catch (err) {
      console.error('Error fetching journals:', err);
      setError('Server error while loading journals');
    } finally {
      setLoadingEntries(false);
      setLoadingMore(false);
    }
  };

  const fetchFiscalPeriods = async () => {
    try {
      setLoadingPeriods(true);
      const res = await axios.get('http://localhost:5000/api/fiscal-periods');
      if (res.data.success) {
        setFiscalPeriods(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching periods:', err);
      setError('Server error while loading fiscal periods');
    } finally {
      setLoadingPeriods(false);
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
    
    // Confirm before closing — this triggers Balance Brought Forward calculation
    if (nextStatus === 'CLOSED') {
      const confirmed = window.confirm(t('finance.fiscal.confirm_close'));
      if (!confirmed) return;
    } else {
      const confirmed = window.confirm(t('finance.fiscal.confirm_reopen'));
      if (!confirmed) return;
    }

    try {
      const res = await axios.put(`http://localhost:5000/api/fiscal-periods/${id}/status`, { status: nextStatus });
      if (res.data.success) {
        fetchFiscalPeriods();
        if (nextStatus === 'CLOSED' && res.data.accountsUpdated > 0) {
          alert(`✅ ${t('finance.fiscal.close_success', { count: res.data.accountsUpdated })}`);
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.response?.data?.message || 'Failed to update period status');
    }
  };

  const handleSeeMore = () => {
    if (!loadingMore && hasMore) {
      fetchJournalEntries(page + 1);
    }
  };

  const fmt = (n) => parseFloat(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const renderJournalEntries = () => (
    <div className="w-full pt-4 flex flex-col gap-4">
      {error && activeTab === 'journal_entries' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertCircle size={16} /> {error}
          </div>
          <button onClick={() => fetchJournalEntries(1, true)} className="p-1 hover:bg-red-100 rounded transition"><RefreshCw size={16} /></button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        {loadingEntries ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader className="animate-spin text-orange-500 mb-2" size={24} />
            <p className="text-gray-500 text-sm">{t('finance.journal.loading')}</p>
          </div>
        ) : journalEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <FileText size={48} strokeWidth={1} className="mb-3 opacity-20" />
            <p>{t('finance.journal.no_entries')}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">{t('finance.journal.date')}</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">{t('finance.journal.je_number')}</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">{t('finance.journal.description')}</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">{t('finance.journal.reference')}</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">{t('finance.journal.total_debit')}</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">{t('finance.journal.total_credit')}</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">{t('finance.journal.status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {journalEntries.map((entry) => (
                    <tr key={entry.Journal_ID} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600">{entry.Entry_Date}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-teal-900">{entry.Journal_No}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{entry.Description}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{entry.Reference_No || '—'}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">{fmt(entry.Total_Debit)}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">{fmt(entry.Total_Credit)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-700">
                          {entry.Status || 'Posted'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col items-center gap-3">
              <p className="text-xs text-gray-400 font-medium">
                {t('finance.journal.showing', { current: journalEntries.length, total: totalEntries })}
              </p>
              {hasMore && (
                <button 
                  onClick={handleSeeMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-6 py-2 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-50"
                >
                  {loadingMore ? <Loader size={14} className="animate-spin" /> : <ChevronDown size={14} />}
                  {t('finance.journal.see_more')}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderFiscalPeriods = () => {
    const currentPeriod = fiscalPeriods.find(p => p.Status === 'OPEN') || { Period_Name: 'None', Status: 'All Closed' };
    
    return (
      <div className="w-full pt-4 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: t('finance.fiscal.current_period'), value: currentPeriod.Period_Name, color: 'text-green-600', bg: 'bg-green-50', icon: <Calendar size={20} /> },
            { label: t('finance.fiscal.fiscal_year'), value: 'FY 2026-27', color: 'text-orange-600', bg: 'bg-orange-50', icon: <RefreshCw size={20} /> },
            { label: t('finance.fiscal.system_status'), value: currentPeriod.Status === 'OPEN' ? t('finance.fiscal.ready_posting') : t('finance.fiscal.closed'), color: 'text-blue-600', bg: 'bg-blue-50', icon: <Shield size={20} /> }
          ].map((card, idx) => (
            <div key={idx} className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${card.bg} ${card.color}`}>
                {card.icon}
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{card.label}</p>
                <p className="text-lg font-bold text-teal-950">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {loadingPeriods ? (
             <div className="flex flex-col items-center justify-center py-20">
                <Loader className="animate-spin text-orange-500" size={32} />
             </div>
          ) : fiscalPeriods.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Calendar size={48} className="mb-4 opacity-20" />
                <p>{t('finance.fiscal.no_periods')}</p>
                <button onClick={() => setIsPeriodModalOpen(true)} className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg font-bold text-sm">{t('finance.fiscal.initialize')}</button>
             </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">{t('finance.fiscal.period_name')}</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">{t('finance.fiscal.start_date')}</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">{t('finance.fiscal.end_date')}</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">{t('finance.fiscal.status')}</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">{t('finance.fiscal.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {fiscalPeriods.map((row) => {
                  let statusColor = 'text-green-700 bg-green-50';
                  if (row.Status === 'CLOSED') statusColor = 'text-orange-700 bg-orange-50';
                  
                  return (
                    <tr key={row.Period_ID} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-teal-950">{row.Period_Name}</td>
                      <td className="px-6 py-4 text-gray-500">{row.Start_Date}</td>
                      <td className="px-6 py-4 text-gray-500">{row.End_Date}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${statusColor}`}>
                          {row.Status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleStatusChange(row.Period_ID, row.Status)}
                          className="text-orange-600 font-bold hover:text-orange-700 transition"
                        >
                          {t('finance.fiscal.change_status')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] p-6 flex flex-col gap-6 font-['Inter']">
      
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-teal-950 tracking-tight">{t('finance.general_ledger')}</h1>
          <p className="text-gray-500 mt-1">{t('finance.subtitle')}</p>
        </div>
        
        <div className="flex gap-3">
          {activeTab === 'journal_entries' && (
            <button className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-xl font-semibold shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all hover:scale-105 active:scale-95">
              <PlusCircle size={18} /> {t('finance.journal.create_entry')}
            </button>
          )}
          {activeTab === 'chart_of_accounts' && null}
          {activeTab === 'fiscal_periods' && (
            <button 
              onClick={() => setIsPeriodModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-xl font-semibold shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all hover:scale-105 active:scale-95"
            >
              <PlusCircle size={18} /> {t('finance.fiscal.new_period')}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 pb-0 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
                isActive 
                  ? 'border-orange-600 text-orange-600 bg-orange-50/50 rounded-t-xl' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.icon(isActive ? '#ea580c' : '#6b7280')}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === 'journal_entries' && renderJournalEntries()}
        {activeTab === 'fiscal_periods' && renderFiscalPeriods()}
        {activeTab === 'chart_of_accounts' && <ChartOfAccountsPage />}
        {activeTab === 'subledger_integration' && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Layers size={64} strokeWidth={1} className="mb-4 opacity-20" />
            <h3 className="text-xl font-bold text-gray-500">{t('finance.subledger.title')}</h3>
            <p className="max-w-xs text-center mt-2">{t('finance.subledger.description')}</p>
            <span className="mt-4 px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-widest">{t('finance.subledger.coming_soon')}</span>
          </div>
        )}
      </div>

      {/* Modal */}
      <FiscalPeriodModal 
        isOpen={isPeriodModalOpen} 
        onClose={() => setIsPeriodModalOpen(false)} 
        onRefresh={fetchFiscalPeriods} 
      />
    </div>
  );
};

export default GeneralLedgerPage;
