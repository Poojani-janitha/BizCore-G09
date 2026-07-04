import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Plus, Trash2, CheckCircle } from 'react-feather';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/apiEndpoints';
import { useTranslation } from 'react-i18next';

const CreateJournalEntryModal = ({ isOpen, onClose, onEntryCreated }) => {
    const { t } = useTranslation();
    const [accounts, setAccounts] = useState([]);
    const [formData, setFormData] = useState({
        Entry_Date: new Date().toISOString().split('T')[0],
        Description: '',
        lines: [
            { Account_ID: '', Debit_Amount: '', Credit_Amount: '', Description: '' },
            { Account_ID: '', Debit_Amount: '', Credit_Amount: '', Description: '' }
        ]
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchAccounts();
            setFormData({
                Entry_Date: new Date().toISOString().split('T')[0],
                Description: '',
                lines: [
                    { Account_ID: '', Debit_Amount: '', Credit_Amount: '', Description: '' },
                    { Account_ID: '', Debit_Amount: '', Credit_Amount: '', Description: '' }
                ]
            });
            setError(null);
        }
    }, [isOpen]);

    const fetchAccounts = async () => {
        try {
            const res = await axios.get(API_ENDPOINTS.accounts.list);
            if (res.data.success) {
                setAccounts(res.data.data.filter(a => a.Is_Active));
            }
        } catch (err) {
            console.error('Error fetching accounts:', err);
        }
    };

    if (!isOpen) return null;

    const handleLineChange = (index, field, value) => {
        const newLines = [...formData.lines];
        if (field === 'Debit_Amount') {
            newLines[index].Debit_Amount = value;
            if (value) newLines[index].Credit_Amount = '';
        } else if (field === 'Credit_Amount') {
            newLines[index].Credit_Amount = value;
            if (value) newLines[index].Debit_Amount = '';
        } else {
            newLines[index][field] = value;
        }
        setFormData({ ...formData, lines: newLines });
    };

    const addLine = () => {
        setFormData({
            ...formData,
            lines: [...formData.lines, { Account_ID: '', Debit_Amount: '', Credit_Amount: '', Description: '' }]
        });
    };

    const removeLine = (index) => {
        const newLines = formData.lines.filter((_, i) => i !== index);
        setFormData({ ...formData, lines: newLines });
    };

    const totalDebit = formData.lines.reduce((sum, line) => sum + parseFloat(line.Debit_Amount || 0), 0);
    const totalCredit = formData.lines.reduce((sum, line) => sum + parseFloat(line.Credit_Amount || 0), 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validations
        if (!formData.Entry_Date) {
            setError('Entry Date is required.');
            setLoading(false);
            return;
        }

        if (!formData.Description) {
            setError('Description is required.');
            setLoading(false);
            return;
        }

        const validLines = formData.lines.filter(l => l.Account_ID && (parseFloat(l.Debit_Amount) > 0 || parseFloat(l.Credit_Amount) > 0));
        
        if (validLines.length < 2) {
            setError('At least two valid lines (with an account and an amount) are required.');
            setLoading(false);
            return;
        }

        if (!isBalanced) {
            setError('Total Debits must equal Total Credits.');
            setLoading(false);
            return;
        }

        try {
            const res = await axios.post(API_ENDPOINTS.journalEntries.create, {
                ...formData,
                lines: validLines
            });
            
            if (res.data.success) {
                onEntryCreated();
                onClose();
            } else {
                setError(res.data.message || 'Failed to create journal entry.');
            }
        } catch (err) {
            console.error('Submit error:', err);
            setError(err.response?.data?.message || 'Error communicating with server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Create Journal Entry</h2>
                        <p className="text-sm text-gray-500 mt-1">Add a new manual journal entry</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-3">
                            <AlertCircle size={20} className="mt-0.5 shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form id="journal-entry-form" onSubmit={handleSubmit} className="space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Entry Date *</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.Entry_Date}
                                    onChange={(e) => setFormData({...formData, Entry_Date: e.target.value})}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-900"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter description..."
                                    value={formData.Description}
                                    onChange={(e) => setFormData({...formData, Description: e.target.value})}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-900"
                                />
                            </div>
                        </div>

                        {/* Lines Table */}
                        <div className="mt-6 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-700 font-semibold uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3 border-b border-gray-200 w-1/3">Account</th>
                                        <th className="px-4 py-3 border-b border-gray-200 w-1/4">Line Description</th>
                                        <th className="px-4 py-3 border-b border-gray-200 w-32 text-right">Debit</th>
                                        <th className="px-4 py-3 border-b border-gray-200 w-32 text-right">Credit</th>
                                        <th className="px-4 py-3 border-b border-gray-200 w-16 text-center"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.lines.map((line, index) => (
                                        <tr key={index} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                                            <td className="px-4 py-2">
                                                <select
                                                    value={line.Account_ID}
                                                    onChange={(e) => handleLineChange(index, 'Account_ID', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-orange-500/20 text-gray-900"
                                                >
                                                    <option value="">Select Account</option>
                                                    {accounts.map(acc => (
                                                        <option key={acc.Account_ID} value={acc.Account_ID}>
                                                            {acc.Account_Code} - {acc.Account_Name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    value={line.Description}
                                                    onChange={(e) => handleLineChange(index, 'Description', e.target.value)}
                                                    placeholder="Optional"
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-orange-500/20"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={line.Debit_Amount}
                                                    onChange={(e) => handleLineChange(index, 'Debit_Amount', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-orange-500/20 text-right"
                                                    placeholder="0.00"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={line.Credit_Amount}
                                                    onChange={(e) => handleLineChange(index, 'Credit_Amount', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-orange-500/20 text-right"
                                                    placeholder="0.00"
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeLine(index)}
                                                    disabled={formData.lines.length <= 2}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-50 border-t border-gray-200 font-semibold text-gray-900">
                                        <td colSpan="2" className="px-4 py-3 text-right">Total</td>
                                        <td className="px-4 py-3 text-right">{totalDebit.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right">{totalCredit.toFixed(2)}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <button
                                type="button"
                                onClick={addLine}
                                className="flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-xl transition-colors"
                            >
                                <Plus size={16} /> Add Line
                            </button>

                            {!isBalanced && (totalDebit > 0 || totalCredit > 0) && (
                                <span className="text-sm font-medium text-red-600 flex items-center gap-1.5">
                                    <AlertCircle size={16} /> Out of balance by {Math.abs(totalDebit - totalCredit).toFixed(2)}
                                </span>
                            )}
                            {isBalanced && totalDebit > 0 && (
                                <span className="text-sm font-medium text-green-600 flex items-center gap-1.5">
                                    <CheckCircle size={16} /> Balanced
                                </span>
                            )}
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="journal-entry-form"
                        disabled={loading || !isBalanced || totalDebit === 0}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-orange-600 rounded-xl hover:bg-orange-700 hover:shadow-lg hover:shadow-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save size={18} />
                                Create Entry
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateJournalEntryModal;
