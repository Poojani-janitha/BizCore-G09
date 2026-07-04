import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Box, Calendar, Layers,
  PlusCircle, Loader, RefreshCw, AlertCircle, ChevronDown, CheckCircle, Lock, Shield, X
} from 'react-feather';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import ChartOfAccountsPage from './ChartOfAccountsPage';
import FiscalPeriodModal from './FiscalPeriodModal';
import CreateJournalEntryModal from '../../component/Finance/CreateJournalEntryModal';
import { API_ENDPOINTS } from '../../config/apiEndpoints';

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
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [isDeleteAuthModalOpen, setIsDeleteAuthModalOpen] = useState(false);
  const [deleteAuthPassword, setDeleteAuthPassword] = useState('');
  const [periodToDelete, setPeriodToDelete] = useState(null);
  const [deleteAuthError, setDeleteAuthError] = useState(null);
  const [deleteAuthLoading, setDeleteAuthLoading] = useState(false);

  // Journal entries date filters
  const [jeStart, setJeStart] = useState('');
  const [jeEnd, setJeEnd] = useState('');

  const tabs = [
    { id: 'chart_of_accounts', label: t('finance.tabs.chart_of_accounts'), icon: (color) => <Box size={18} color={color} /> },
    { id: 'journal_entries', label: t('finance.tabs.journal_entries'), icon: (color) => <FileText size={18} color={color} /> },
    { id: 'fiscal_periods', label: t('finance.tabs.fiscal_periods'), icon: (color) => <Calendar size={18} color={color} /> },
  ];

  useEffect(() => {
    if (activeTab === 'journal_entries' && journalEntries.length === 0) {
      fetchJournalEntries(1, true);
    }
    if (activeTab === 'fiscal_periods' && fiscalPeriods.length === 0) {
      fetchFiscalPeriods();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'journal_entries') {
      fetchJournalEntries(1, true);
    }
  }, [jeStart, jeEnd]);

  const fetchJournalEntries = async (pageNum, reset = false) => {
    try {
      if (reset) setLoadingEntries(true);
      else setLoadingMore(true);
      
      const params = {};
      if (jeStart && jeEnd) {
        params.startDate = jeStart;
        params.endDate = jeEnd;
      }
      
      const res = await axios.get(API_ENDPOINTS.journalEntries.list(pageNum, 10), { params });
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
      const res = await axios.get(API_ENDPOINTS.fiscalPeriods.root);
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
      const res = await axios.put(API_ENDPOINTS.fiscalPeriods.status(id), { status: nextStatus });
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

  const handlePeriodDelete = (period) => {
    if (period.Status === 'OPEN') {
      alert("Cannot delete an OPEN fiscal period. You must close the period first.");
      return;
    }
    setPeriodToDelete(period);
    setIsDeleteAuthModalOpen(true);
    setDeleteAuthPassword('');
    setDeleteAuthError(null);
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    setDeleteAuthLoading(true);
    setDeleteAuthError(null);

    try {
      // 1. Authenticate with password
      const res = await axios.post(`http://localhost:5000/api/fiscal-periods/${periodToDelete.Period_ID}/authenticate-delete`, {
        password: deleteAuthPassword
      });

      if (res.data.success) {
        const { periodName, startDate, endDate, transactions } = res.data.data;

        // Close authentication modal cleanly
        setIsDeleteAuthModalOpen(false);
        setDeleteAuthPassword('');

        // 2. Automatically generate and download PDF of all transactions in this period
        const { downloadPeriodTransactionsPDF } = await import('../../utils/reportGenerators');
        downloadPeriodTransactionsPDF({
          periodName,
          startDate,
          endDate,
          transactions
        });

        // 3. Confirm deletion
        setTimeout(async () => {
          const confirmed = window.confirm(`Transactions report downloaded successfully.\n\nAre you sure you want to permanently DELETE the fiscal period "${periodName}"?\nThis action is irreversible and will delete the period record.`);

          if (confirmed) {
            // 4. Send DELETE request to DB
            const deleteRes = await axios.delete(`http://localhost:5000/api/fiscal-periods/${periodToDelete.Period_ID}`);
            if (deleteRes.data.success) {
              alert(`✅ Fiscal period "${periodName}" deleted successfully.`);
              fetchFiscalPeriods(); // Reload periods list
            }
          }
        }, 300); // Small timeout to allow browser download to initiate cleanly
      }
    } catch (err) {
      console.error('Error authenticating delete:', err);
      setDeleteAuthError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setDeleteAuthLoading(false);
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
      {/* Date Search Filter */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">From Date:</span>
          <input
            type="date"
            value={jeStart}
            onChange={(e) => setJeStart(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">To Date:</span>
          <input
            type="date"
            value={jeEnd}
            onChange={(e) => setJeEnd(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
          />
        </div>
        {(jeStart || jeEnd) && (
          <button
            onClick={() => {
              setJeStart('');
              setJeEnd('');
            }}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg font-bold text-xs transition"
          >
            Clear Filters
          </button>
        )}
      </div>

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
            { label: t('finance.fiscal.current_period'), value: currentPeriod.Period_Name, color: 'text-green-600', border: 'border-t-4 border-green-600', icon: <Calendar size={20} className="text-green-600" /> },
            { label: t('finance.fiscal.fiscal_year'), value: 'FY 2026-27', color: 'text-orange-600', border: 'border-t-4 border-orange-600', icon: <RefreshCw size={20} className="text-orange-600" /> },
            { label: t('finance.fiscal.system_status'), value: currentPeriod.Status === 'OPEN' ? t('finance.fiscal.ready_posting') : t('finance.fiscal.closed'), color: 'text-blue-600', border: 'border-t-4 border-blue-600', icon: <Shield size={20} className="text-blue-600" /> }
          ].map((card, idx) => (
            <div key={idx} className={`p-5 bg-white border border-gray-200 ${card.border} rounded-2xl shadow-sm flex flex-col justify-between h-32 transition-all hover:-translate-y-1 hover:shadow-md`}>
              <div className="flex justify-between items-start w-full">
                <small className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {card.label}
                </small>
                <div className="opacity-75">
                  {card.icon}
                </div>
              </div>
              <div>
                <h5 className="text-2xl font-black text-slate-800 leading-tight">
                  {card.value}
                </h5>
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
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleStatusChange(row.Period_ID, row.Status)}
                          className="text-orange-600 font-bold hover:text-orange-700 transition"
                        >
                          {t('finance.fiscal.change_status')}
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handlePeriodDelete(row)}
                          className="text-red-600 font-bold hover:text-red-700 transition"
                        >
                          Delete
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
      <div className="flex justify-end items-center">
        <div className="flex gap-3">
          {activeTab === 'journal_entries' && (
            <button 
              onClick={() => setIsJournalModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-xl font-semibold shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all hover:scale-105 active:scale-95"
            >
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
              className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${isActive
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
      </div>

      {/* Modal */}
      <FiscalPeriodModal
        isOpen={isPeriodModalOpen}
        onClose={() => setIsPeriodModalOpen(false)}
        onRefresh={fetchFiscalPeriods}
      />

      {/* Password Authentication Modal for Period Deletion */}
      {isDeleteAuthModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

            {/* Modal Header */}
            <div className="bg-teal-950 p-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white">
                  <Shield size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Confirm Deletion</h2>
                  <p className="text-teal-200 text-xs">Administrative Authentication Required</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsDeleteAuthModalOpen(false);
                  setDeleteAuthPassword('');
                  setDeleteAuthError(null);
                }}
                className="text-teal-200 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleDeleteSubmit} className="p-6 flex flex-col gap-5">
              <p className="text-xs text-gray-500 leading-relaxed">
                Deleting the fiscal period <strong>"{periodToDelete?.Period_Name}"</strong> requires admin password verification.
              </p>

              {deleteAuthError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium flex items-center gap-2">
                  <AlertCircle size={14} /> {deleteAuthError}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Admin Password</label>
                <input
                  type="password"
                  placeholder="Enter admin password..."
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  value={deleteAuthPassword}
                  onChange={(e) => setDeleteAuthPassword(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-3 mt-4">
                <button
                  type="submit"
                  disabled={deleteAuthLoading}
                  className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold shadow-lg shadow-orange-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {deleteAuthLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <CheckCircle size={16} />}
                  Authenticate & Delete
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteAuthModalOpen(false);
                    setDeleteAuthPassword('');
                    setDeleteAuthError(null);
                  }}
                  className="w-full py-2 text-gray-400 font-semibold hover:text-gray-600 transition-colors text-xs text-center"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Journal Entry Modal */}
      <CreateJournalEntryModal 
        isOpen={isJournalModalOpen} 
        onClose={() => setIsJournalModalOpen(false)} 
        onEntryCreated={() => fetchJournalEntries(1, true)} 
      />
    </div>
  );
};

export default GeneralLedgerPage;
