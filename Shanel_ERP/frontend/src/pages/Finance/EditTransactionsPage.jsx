import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Search, Filter, Edit3, CheckCircle, XCircle, AlertCircle, 
    ArrowRight, Plus, Trash2, Save, X, Eye, RefreshCw, ChevronDown
} from 'react-feather';

const EditTransactionsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalEntries, setTotalEntries] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [alert, setAlert] = useState(null);

    // Form State for Correction
    const [correctionForm, setCorrectionForm] = useState({
        Entry_Date: new Date().toISOString().split('T')[0],
        Description: '',
        lines: []
    });

    useEffect(() => {
        fetchTransactions(1, true);
        fetchAccounts();
    }, []);

    const fetchTransactions = async (pageNum, reset = false) => {
        try {
            if (reset) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }
            
            const response = await axios.get(`/api/journal-entries/correction/list?page=${pageNum}&limit=10`);
            if (response.data.success) {
                if (reset) {
                    setTransactions(response.data.data);
                } else {
                    setTransactions(prev => [...prev, ...response.data.data]);
                }
                setTotalEntries(response.data.total);
                setHasMore(pageNum < response.data.totalPages);
                setPage(pageNum);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            showAlert('danger', 'Failed to fetch transactions');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleSeeMore = () => {
        if (!loadingMore && hasMore) {
            fetchTransactions(page + 1);
        }
    };

    const fetchAccounts = async () => {
        try {
            const response = await axios.get('/api/accounts');
            if (response.data.success) {
                setAccounts(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching accounts:', error);
        }
    };

    const showAlert = (type, msg) => {
        setAlert({ type, msg });
        setTimeout(() => setAlert(null), 5000);
    };

    const handleStartCorrection = (tx) => {
        setSelectedTransaction(tx);
        setCorrectionForm({
            Entry_Date: new Date().toISOString().split('T')[0],
            Description: `Correction for ${tx.Journal_No}: ${tx.Description}`,
            lines: (tx.Lines || []).map(line => ({
                Account_ID: line.Account_ID,
                Debit_Amount: line.Debit_Amount,
                Credit_Amount: line.Credit_Amount,
                Description: line.Description
            }))
        });
        setIsEditing(true);
    };

    const handleAddLine = () => {
        setCorrectionForm({
            ...correctionForm,
            lines: [...correctionForm.lines, { Account_ID: '', Debit_Amount: 0, Credit_Amount: 0, Description: '' }]
        });
    };

    const handleRemoveLine = (index) => {
        const newLines = correctionForm.lines.filter((_, i) => i !== index);
        setCorrectionForm({ ...correctionForm, lines: newLines });
    };

    const handleLineChange = (index, field, value) => {
        const newLines = [...correctionForm.lines];
        newLines[index][field] = value;
        setCorrectionForm({ ...correctionForm, lines: newLines });
    };

    const handleSubmitCorrection = async (e) => {
        e.preventDefault();

        // Basic validation
        const totalDebit = correctionForm.lines.reduce((sum, l) => sum + parseFloat(l.Debit_Amount || 0), 0);
        const totalCredit = correctionForm.lines.reduce((sum, l) => sum + parseFloat(l.Credit_Amount || 0), 0);

        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            showAlert('danger', 'Total Debit and Total Credit must be equal.');
            return;
        }

        try {
            const response = await axios.post('/api/journal-entries/correction/submit', {
                originalJournalID: selectedTransaction.Journal_ID,
                correctedData: correctionForm
            });

            if (response.data.success) {
                showAlert('success', `Transaction corrected successfully! New Journal No: ${response.data.data.newJournalNo}`);
                setIsEditing(false);
                fetchTransactions(1, true);
            }
        } catch (error) {
            console.error('Error submitting correction:', error);
            showAlert('danger', error.response?.data?.message || 'Failed to correct transaction');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            Posted: 'bg-success-subtle text-success border-success',
            Draft: 'bg-warning-subtle text-warning border-warning',
            Cancelled: 'bg-danger-subtle text-danger border-danger',
            Revised: 'bg-info-subtle text-info border-info'
        };
        return <span className={`badge border px-2 py-1 ${styles[status] || 'bg-light text-dark'}`}>{status}</span>;
    };

    const filteredTx = (transactions || []).filter(tx => 
        (tx?.Journal_No?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (tx?.Description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-fluid p-0" style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#f8fafc', minHeight: '100%' }}>
            
            {/* Header */}
            <div className="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center">
                <div>
                    <h4 className="mb-0 fw-bold" style={{ color: '#0f172a' }}>Transaction Correction</h4>
                    <p className="text-muted small mb-0">Review and correct journal entries with a full audit trail</p>
                </div>
                {isEditing && (
                    <button onClick={() => setIsEditing(false)} className="btn btn-outline-secondary d-flex align-items-center gap-2">
                        <X size={18} /> Cancel Edit
                    </button>
                )}
            </div>

            {alert && (
                <div className={`alert alert-${alert.type} mx-4 mt-3 mb-0 shadow-sm border-0 d-flex align-items-center`} role="alert">
                    {alert.type === 'success' ? <CheckCircle className="me-2" size={18}/> : <AlertCircle className="me-2" size={18}/>}
                    {alert.msg}
                </div>
            )}

            <div className="p-4">
                {!isEditing ? (
                    <div className="bg-white rounded-4 border shadow-sm overflow-hidden">
                        <div className="p-3 border-bottom bg-light d-flex gap-3">
                            <div className="position-relative flex-grow-1">
                                <Search className="position-absolute top-50 translate-middle-y ms-3 text-muted" size={18} />
                                <input 
                                    type="text" 
                                    className="form-control ps-5 border-0 shadow-none" 
                                    placeholder="Search transactions by No. or Description..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ borderRadius: '12px', height: '45px', backgroundColor: '#f1f5f9' }}
                                />
                            </div>
                            <button className="btn btn-white border px-4 d-flex align-items-center gap-2" style={{ borderRadius: '12px' }}>
                                <Filter size={18} /> Filter
                            </button>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-4 border-0 py-3 text-muted small fw-bold">DATE</th>
                                        <th className="border-0 py-3 text-muted small fw-bold">JOURNAL NO</th>
                                        <th className="border-0 py-3 text-muted small fw-bold">DESCRIPTION</th>
                                        <th className="border-0 py-3 text-muted small fw-bold">TOTAL AMOUNT</th>
                                        <th className="border-0 py-3 text-muted small fw-bold text-center">STATUS</th>
                                        <th className="border-0 py-3 text-muted small fw-bold text-end pe-4">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-5">
                                                <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                                                Loading transactions...
                                            </td>
                                        </tr>
                                    ) : filteredTx.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-5 text-muted">No transactions found</td>
                                        </tr>
                                    ) : filteredTx.map(tx => (
                                        <tr key={tx.Journal_ID}>
                                            <td className="ps-4 py-3">{tx.Entry_Date}</td>
                                            <td className="py-3 fw-semibold">{tx.Journal_No}</td>
                                            <td className="py-3 text-truncate" style={{ maxWidth: '300px' }}>{tx.Description}</td>
                                            <td className="py-3 fw-bold text-slate-700">Rs. {parseFloat(tx.Total_Debit).toLocaleString()}</td>
                                            <td className="py-3 text-center">{getStatusBadge(tx.Status)}</td>
                                            <td className="py-3 text-end pe-4">
                                                <button 
                                                    onClick={() => handleStartCorrection(tx)}
                                                    className="btn btn-sm btn-light border d-inline-flex align-items-center gap-1"
                                                    style={{ borderRadius: '8px', padding: '6px 12px' }}
                                                >
                                                    <Edit3 size={14} className="text-primary" />
                                                    Correct
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination Footer */}
                        <div className="p-3 bg-light border-top d-flex flex-column align-items-center gap-2">
                            <p className="text-muted small mb-0 font-medium">
                                Showing {transactions.length} of {totalEntries} transactions
                            </p>
                            {hasMore && (
                                <button 
                                    onClick={handleSeeMore}
                                    disabled={loadingMore}
                                    className="btn btn-white border rounded-pill px-4 py-2 small fw-bold text-muted d-flex align-items-center gap-2 shadow-sm transition-all hover:bg-white hover:border-secondary"
                                >
                                    {loadingMore ? (
                                        <div className="spinner-border spinner-border-sm text-muted" role="status"></div>
                                    ) : (
                                        <ChevronDown size={16} />
                                    )}
                                    SEE MORE
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="row g-4">
                        {/* Original Transaction Summary */}
                        <div className="col-md-4">
                            <div className="bg-slate-900 text-white rounded-4 p-4 shadow-lg sticky-top" style={{ top: '100px' }}>
                                <div className="d-flex align-items-center gap-2 mb-4 opacity-75">
                                    <AlertCircle size={20} />
                                    <span className="small fw-bold tracking-wider uppercase">Original Transaction</span>
                                </div>
                                <h3 className="fw-bold mb-1">{selectedTransaction.Journal_No}</h3>
                                <p className="opacity-50 small mb-4">{selectedTransaction.Entry_Date}</p>
                                
                                <div className="space-y-4">
                                    <div className="p-3 bg-white bg-opacity-10 rounded-3">
                                        <label className="d-block small opacity-50 mb-1">Description</label>
                                        <p className="mb-0 small">{selectedTransaction.Description}</p>
                                    </div>
                                    <div className="p-3 bg-white bg-opacity-10 rounded-3">
                                        <label className="d-block small opacity-50 mb-1">Total Impact</label>
                                        <p className="mb-0 fw-bold">Rs. {parseFloat(selectedTransaction.Total_Debit).toLocaleString()}</p>
                                    </div>
                                </div>

                                <hr className="my-4 opacity-20" />

                                <div className="small opacity-75">
                                    <p className="mb-2 fw-bold">Journal Lines:</p>
                                    {selectedTransaction.Lines && selectedTransaction.Lines.map((l, i) => (
                                        <div key={i} className="mb-2 d-flex justify-content-between align-items-start border-bottom border-white border-opacity-10 pb-2">
                                            <div>
                                                <div className="fw-bold">{l.Account?.Account_Name}</div>
                                                <div className="opacity-50" style={{ fontSize: '10px' }}>{l.Account?.Account_Code}</div>
                                            </div>
                                            <div className="text-end">
                                                {parseFloat(l.Debit_Amount) > 0 ? (
                                                    <div className="text-success-emphasis">Dr Rs. {parseFloat(l.Debit_Amount).toLocaleString()}</div>
                                                ) : (
                                                    <div className="text-danger-emphasis">Cr Rs. {parseFloat(l.Credit_Amount).toLocaleString()}</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Correction Form */}
                        <div className="col-md-8">
                            <form onSubmit={handleSubmitCorrection} className="bg-white rounded-4 border shadow-sm p-4 h-100">
                                <div className="d-flex align-items-center gap-2 mb-4">
                                    <div className="p-2 bg-primary bg-opacity-10 rounded-3">
                                        <RefreshCw size={24} className="text-primary" />
                                    </div>
                                    <div>
                                        <h5 className="mb-0 fw-bold text-slate-800">New Corrected Entry</h5>
                                        <p className="text-muted small mb-0">System will automatically reverse the previous balances</p>
                                    </div>
                                </div>

                                <div className="row mb-4 g-3">
                                    <div className="col-md-4">
                                        <label className="form-label small fw-bold text-muted">Correction Date</label>
                                        <input 
                                            type="date" 
                                            className="form-control" 
                                            value={correctionForm.Entry_Date}
                                            onChange={(e) => setCorrectionForm({...correctionForm, Entry_Date: e.target.value})}
                                            style={{ borderRadius: '10px' }}
                                        />
                                    </div>
                                    <div className="col-md-8">
                                        <label className="form-label small fw-bold text-muted">New Description</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            placeholder="Reason for correction..."
                                            value={correctionForm.Description}
                                            onChange={(e) => setCorrectionForm({...correctionForm, Description: e.target.value})}
                                            style={{ borderRadius: '10px' }}
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <label className="form-label mb-0 fw-bold text-slate-700">Corrected Journal Lines</label>
                                        <button type="button" onClick={handleAddLine} className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1" style={{ borderRadius: '8px' }}>
                                            <Plus size={14} /> Add Line
                                        </button>
                                    </div>

                                    <div className="table-responsive border rounded-3 overflow-hidden">
                                        <table className="table table-bordered mb-0 align-middle">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th className="small py-2" style={{ width: '35%' }}>Account</th>
                                                    <th className="small py-2" style={{ width: '20%' }}>Debit (Rs.)</th>
                                                    <th className="small py-2" style={{ width: '20%' }}>Credit (Rs.)</th>
                                                    <th className="small py-2" style={{ width: '20%' }}>Memo</th>
                                                    <th className="small py-2 text-center" style={{ width: '5%' }}></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {correctionForm.lines.map((line, index) => (
                                                    <tr key={index}>
                                                        <td className="p-1">
                                                            <select 
                                                                className="form-select border-0 shadow-none bg-transparent"
                                                                value={line.Account_ID}
                                                                onChange={(e) => handleLineChange(index, 'Account_ID', e.target.value)}
                                                                style={{ fontSize: '13px' }}
                                                            >
                                                                <option value="">Select Account</option>
                                                                {accounts.map(acc => (
                                                                    <option key={acc.Account_ID} value={acc.Account_ID}>
                                                                        {acc.Account_Name} ({acc.Account_Code})
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="p-1">
                                                            <input 
                                                                type="number" 
                                                                className="form-control border-0 shadow-none bg-transparent text-end"
                                                                value={line.Debit_Amount}
                                                                onChange={(e) => handleLineChange(index, 'Debit_Amount', e.target.value)}
                                                                style={{ fontSize: '13px' }}
                                                            />
                                                        </td>
                                                        <td className="p-1">
                                                            <input 
                                                                type="number" 
                                                                className="form-control border-0 shadow-none bg-transparent text-end"
                                                                value={line.Credit_Amount}
                                                                onChange={(e) => handleLineChange(index, 'Credit_Amount', e.target.value)}
                                                                style={{ fontSize: '13px' }}
                                                            />
                                                        </td>
                                                        <td className="p-1">
                                                            <input 
                                                                type="text" 
                                                                className="form-control border-0 shadow-none bg-transparent"
                                                                value={line.Description}
                                                                onChange={(e) => handleLineChange(index, 'Description', e.target.value)}
                                                                placeholder="Memo..."
                                                                style={{ fontSize: '13px' }}
                                                            />
                                                        </td>
                                                        <td className="p-1 text-center">
                                                            <button type="button" onClick={() => handleRemoveLine(index)} className="btn btn-link text-danger p-0">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-light fw-bold">
                                                <tr>
                                                    <td className="text-end py-2 pe-3">TOTAL</td>
                                                    <td className="text-end py-2 pe-3">
                                                        {correctionForm.lines.reduce((sum, l) => sum + parseFloat(l.Debit_Amount || 0), 0).toLocaleString()}
                                                    </td>
                                                    <td className="text-end py-2 pe-3">
                                                        {correctionForm.lines.reduce((sum, l) => sum + parseFloat(l.Credit_Amount || 0), 0).toLocaleString()}
                                                    </td>
                                                    <td colSpan="2"></td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-end gap-3 pt-3">
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary px-5 py-2 d-flex align-items-center gap-2"
                                        style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #0d9488, #0f766e)', border: 'none' }}
                                    >
                                        <Save size={18} /> Post Correction
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .bg-slate-900 { background-color: #0f172a; }
                .text-slate-800 { color: #1e293b; }
                .text-slate-700 { color: #334155; }
                .bg-success-subtle { background-color: #f0fdf4; }
                .bg-warning-subtle { background-color: #fffbeb; }
                .bg-danger-subtle { background-color: #fef2f2; }
                .bg-info-subtle { background-color: #f0f9ff; }
                .btn-white { background: white; }
                .tracking-wider { letter-spacing: 0.05em; }
            `}</style>
        </div>
    );
};

export default EditTransactionsPage;
