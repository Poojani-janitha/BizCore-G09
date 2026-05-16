import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, CheckCircle } from 'react-feather';
import axios from 'axios';

const QuickAccountModal = ({ isOpen, onClose, initialCode = '', initialType = 'Asset', initialCategory = '', onAccountCreated }) => {
    const [formData, setFormData] = useState({
        accountCode: initialCode,
        accountName: '',
        accountType: initialType,
        accountCategory: initialCategory,
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(prev => ({ 
                ...prev, 
                accountCode: initialCode,
                accountType: initialType,
                accountCategory: initialCategory 
            }));
            setSuccess(false);
            setError(null);
            
            // If no initial code, fetch the next available one
            if (!initialCode) {
                fetchNextCode(initialType);
            }
        }
    }, [isOpen, initialCode, initialType, initialCategory]);

    const fetchNextCode = async (type) => {
        try {
            const res = await axios.get(`/api/accounts/next-code/${type}`);
            if (res.data.success) {
                setFormData(prev => ({ ...prev, accountCode: res.data.nextCode }));
            }
        } catch (err) {
            console.error('Error fetching next code:', err);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await axios.post('/api/accounts/create', formData);
            if (res.data.success) {
                setSuccess(true);
                setTimeout(() => {
                    onAccountCreated(res.data.data);
                    onClose();
                }, 1500);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] outline-none transition-all text-sm";
    const labelStyle = "block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider";

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-[#FF6B35]/10 rounded-lg">
                            <Save size={18} className="text-[#FF6B35]" />
                        </div>
                        <h3 className="font-bold text-cyan-950">Quick Account Creation</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {success ? (
                        <div className="py-8 text-center flex flex-col items-center gap-3">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-bounce">
                                <CheckCircle size={32} />
                            </div>
                            <h4 className="font-bold text-green-700">Account Created!</h4>
                            <p className="text-sm text-gray-500 text-center px-8">The account has been added to the Chart of Accounts successfully.</p>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs flex items-center gap-2">
                                    <AlertCircle size={14} />
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelStyle}>Type *</label>
                                    <select 
                                        className={inputStyle}
                                        value={formData.accountType}
                                        onChange={e => {
                                            const newType = e.target.value;
                                            setFormData({...formData, accountType: newType});
                                            fetchNextCode(newType);
                                        }}
                                    >
                                        {['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'].map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelStyle}>Code *</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className={inputStyle}
                                        placeholder="e.g. 1001"
                                        value={formData.accountCode}
                                        onChange={e => setFormData({...formData, accountCode: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelStyle}>Account Category</label>
                                <input 
                                    type="text" 
                                    className={inputStyle}
                                    placeholder="e.g. Current Asset"
                                    value={formData.accountCategory}
                                    onChange={e => setFormData({...formData, accountCategory: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className={labelStyle}>Account Name *</label>
                                <input 
                                    type="text" 
                                    required 
                                    className={inputStyle}
                                    placeholder="e.g. Cash in Hand"
                                    value={formData.accountName}
                                    onChange={e => setFormData({...formData, accountName: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className={labelStyle}>Description</label>
                                <textarea 
                                    className={`${inputStyle} resize-none`}
                                    rows="3"
                                    placeholder="Optional description..."
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button 
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all text-sm"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2.5 bg-[#FF6B35] text-white font-bold rounded-xl hover:bg-[#e85a24] shadow-lg shadow-[#FF6B35]/20 transition-all text-sm disabled:opacity-50"
                                >
                                    {loading ? 'Creating...' : 'Create Account'}
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default QuickAccountModal;
