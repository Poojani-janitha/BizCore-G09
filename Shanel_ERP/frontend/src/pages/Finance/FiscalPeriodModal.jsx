import React, { useState } from 'react';
import { X, Calendar, Info, CheckCircle } from 'react-feather';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../../config/apiEndpoints';

const FiscalPeriodModal = ({ isOpen, onClose, onRefresh }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    start: '',
    end: '',
    status: 'OPEN'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.post(API_ENDPOINTS.fiscalPeriods.root, formData);
      if (res.data.success) {
        onRefresh();
        onClose();
        setFormData({ name: '', start: '', end: '', status: 'OPEN' });
      }
    } catch (err) {
      console.error('Error creating period:', err);
      setError(err.response?.data?.message || 'Failed to create fiscal period');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="bg-teal-950 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white">
              <Calendar size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{t('finance.fiscal.new_period')}</h2>
              <p className="text-teal-200 text-xs">Define a new accounting interval</p>
            </div>
          </div>
          <button onClick={onClose} className="text-teal-200 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium flex items-center gap-2">
              <Info size={14} /> {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t('finance.fiscal.period_name')}</label>
            <input 
              type="text" 
              placeholder="e.g., January 2026"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t('finance.fiscal.start_date')}</label>
              <input 
                type="date" 
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                value={formData.start}
                onChange={(e) => setFormData({...formData, start: e.target.value})}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t('finance.fiscal.end_date')}</label>
              <input 
                type="date" 
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                value={formData.end}
                onChange={(e) => setFormData({...formData, end: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t('finance.fiscal.initial_status')}</label>
            <select 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="OPEN">{t('finance.fiscal.open_label')}</option>
              <option value="CLOSED">{t('finance.fiscal.closed_label')}</option>
            </select>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-orange-600 text-white rounded-2xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <CheckCircle size={20} />}
              {loading ? t('finance.fiscal.creating') : t('finance.fiscal.create_period')}
            </button>
            <button 
              type="button" 
              onClick={onClose}
              className="w-full py-3 text-gray-400 font-semibold hover:text-gray-600 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FiscalPeriodModal;
