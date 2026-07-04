import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import {
    CheckCircle, XCircle, Clock, AlertTriangle, AlertCircle,
    RefreshCw, ChevronLeft, ChevronRight, DollarSign,
    User, Calendar, Briefcase, CreditCard, Search
} from 'react-feather';

// ─── Status Badge ────────────────────────────────────────────────────────────
const StatusBadge = ({ status, expiringSoon, pastDue }) => {
    const { t } = useTranslation();
    if (pastDue && status === 'Pending') return (
        <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2 py-1 d-inline-flex align-items-center gap-1" style={{ fontSize: '10px' }}>
            <AlertCircle size={10} /> {t('sales.cheques.past_due')}
        </span>
    );
    if (expiringSoon) return (
        <span className="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill px-2 py-1 d-inline-flex align-items-center gap-1" style={{ fontSize: '10px' }}>
            <AlertTriangle size={10} /> {t('sales.cheques.expiring_soon')}
        </span>
    );
    const map = {
        Pending: 'bg-warning-subtle text-warning border-warning-subtle',
        Cleared: 'bg-success-subtle text-success border-success-subtle',
        Bounced: 'bg-danger-subtle text-danger border-danger-subtle',
        Expired: 'bg-secondary-subtle text-secondary border-secondary-subtle'
    };
    const labelMap = {
        Pending: t('sales.cheques.pending'),
        Cleared: t('sales.cheques.cleared'),
        Bounced: t('sales.cheques.bounced'),
        Expired: t('sales.cheques.expired')
    };
    return (
        <span className={`badge border rounded-pill px-2 py-1 ${map[status] || 'bg-secondary-subtle text-secondary'}`} style={{ fontSize: '10px' }}>
            {labelMap[status] || status}
        </span>
    );
};

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
const ConfirmModal = ({ show, title, message, onConfirm, onCancel, requireReason = false, reasonLabel = 'Reason', confirmLabel = 'Confirm', confirmColor = 'danger' }) => {
    const { t } = useTranslation();
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    useEffect(() => { if (show) { setReason(''); setError(''); } }, [show]);

    const handleConfirm = () => {
        if (requireReason && !reason.trim()) { setError(`${reasonLabel} ${t('sales.required_field') || 'is required'}`); return; }
        onConfirm(reason);
    };

    if (!show) return null;
    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 440 }}>
                <div className="modal-content border-0 rounded-4 shadow-lg">
                    <div className="modal-header border-0 pb-0 pt-4 px-4">
                        <h5 className="fw-bold text-dark mb-0">{title}</h5>
                        <button className="btn-close" onClick={onCancel} />
                    </div>
                    <div className="modal-body px-4 py-3">
                        <p className="text-muted small mb-3">{message}</p>
                        {requireReason && (
                            <>
                                <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>{reasonLabel} *</label>
                                <textarea
                                    className="form-control form-control-sm rounded-3"
                                    rows={3}
                                    value={reason}
                                    onChange={e => { setReason(e.target.value); setError(''); }}
                                    placeholder={t('sales.cheques.bounce_reason')}
                                />
                                {error && <small className="text-danger">{error}</small>}
                            </>
                        )}
                    </div>
                    <div className="modal-footer border-0 pb-4 px-4 gap-2">
                        <button className="btn btn-light btn-sm rounded-3 px-4" onClick={onCancel}>{t('customerForm.cancel') || 'Cancel'}</button>
                        <button className={`btn btn-${confirmColor} btn-sm rounded-3 px-4 fw-bold`} onClick={handleConfirm}>{confirmLabel}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper to count remaining validation days of a cheque (standard 180 days rule)
const getDaysToExpire = (chequeDateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chequeDate = new Date(chequeDateStr);
    chequeDate.setHours(0, 0, 0, 0);

    const expiryDate = new Date(chequeDate);
    expiryDate.setDate(expiryDate.getDate() + 180);

    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const ChequeManagementPage = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('Pending');
    const [cheques, setCheques] = useState([]);
    const [summary, setSummary] = useState({ pending: {}, expiringSoon: {}, bounced: {}, cleared: {}, expired: {} });
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 0, limit: 20 });
    const [confirmState, setConfirmState] = useState({ show: false, type: '', cheque: null });
    const [searchTerm, setSearchTerm] = useState('');

    const fetchSummary = async () => {
        try {
            const res = await axios.get('/api/sales-management/cheques/summary');
            if (res.data.success) setSummary(res.data.data);
        } catch (err) { console.error('Summary error:', err); }
    };

    const fetchCheques = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/sales-management/cheques?status=${activeTab}&page=${page}&limit=20&query=${searchTerm}`);
            if (res.data.success) {
                setCheques(res.data.data);
                setPagination(res.data.pagination);
            }
        } catch (err) { console.error('Cheques error:', err); }
        finally { setLoading(false); }
    }, [activeTab, searchTerm]);

    useEffect(() => { fetchSummary(); }, []);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchCheques(1);
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm, fetchCheques]);

    useEffect(() => {
        fetchCheques(1);
    }, [activeTab, fetchCheques]);

    const handleAction = (type, cheque) => setConfirmState({ show: true, type, cheque });

    const handleConfirm = async (reason) => {
        const { type, cheque } = confirmState;
        setConfirmState({ show: false, type: '', cheque: null });
        const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id;
        try {
            if (type === 'clear') {
                await axios.post(`/api/sales-management/cheques/${cheque.Cheque_ID}/clear`, { userId });
            } else if (type === 'bounce') {
                await axios.post(`/api/sales-management/cheques/${cheque.Cheque_ID}/bounce`, { reason, userId });
            }
            fetchCheques(pagination.page);
            fetchSummary();
        } catch (err) {
            alert(err.response?.data?.message || 'Action failed');
        }
    };

    // Sort cheques dynamically based on date to expire (expired/negative days at the top, then minimum remaining days)
    const sortedCheques = [...cheques].sort((a, b) => {
        const daysA = getDaysToExpire(a.Cheque_Date);
        const daysB = getDaysToExpire(b.Cheque_Date);
        return daysA - daysB;
    });

    const getTableHeaderLabel = (header) => {
        const headerMappings = {
            'Cheque #': t('sales.cheques.col_cheque_no'),
            'Bank / Branch': t('sales.cheques.col_bank'),
            'Customer': t('sales.customer_name'),
            'Amount': t('sales.amount_col') || 'Amount',
            'Cheque Date': t('sales.cheques.col_date'),
            'Days to Expire': t('sales.cheques.col_days'),
            'Linked Invoice(s)': t('sales.cheques.col_invoice'),
            'Status': t('sales.status') || 'Status',
            'Actions': t('actionButtons.title') || 'Actions'
        };
        return headerMappings[header] || header;
    };

    return (
        <div className="container-fluid p-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Outfit', 'Inter', sans-serif" }}>

            {/* Summary Tiles (KPI cards matching Sales Dashboard / Customer List page border styles) */}
            <div className="row g-3 mb-4">
                {[
                    { label: t('sales.cheques.pending_title'), value: summary.pending?.count || 0, color: 'warning', icon: <Clock size={20} className="text-warning" />, description: t('sales.cheques.pending_desc') },
                    { label: t('sales.cheques.bounced_title'), value: summary.bounced?.count || 0, color: 'danger', icon: <XCircle size={20} className="text-danger" />, description: t('sales.cheques.bounced_desc') },
                    { label: t('sales.cheques.expiring_title'), value: summary.expiringSoon?.count || 0, color: 'warning', icon: <AlertTriangle size={20} style={{ color: '#fd7e14' }} />, description: t('sales.cheques.expiring_desc'), customColor: '#fd7e14' },
                    { label: t('sales.cheques.expired_title'), value: summary.expired?.count || 0, color: 'danger', icon: <AlertCircle size={20} className="text-danger" />, description: t('sales.cheques.expired_desc') },
                ].map((tile, i) => (
                    <div key={i} className="col-md-3">
                        <div
                            className={`card border-0 border-top border-4 border-${tile.color} shadow-sm p-3 h-100 bg-white`}
                            style={tile.customColor ? { borderTopColor: tile.customColor } : {}}
                        >
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '11px' }}>{tile.label}</small>
                                {tile.icon}
                            </div>
                            <h6 className="fw-bold mb-0 text-dark">{tile.value}</h6>
                            <small className="text-muted" style={{ fontSize: '11px' }}>{tile.description}</small>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search Filter Card */}
            <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
                <div className="row align-items-center">
                    <div className="col-md-6">
                        <div className="input-group input-group-sm border rounded-3 overflow-hidden shadow-sm bg-light align-items-center px-2">
                            <span className="bg-transparent border-0 d-flex align-items-center"><Search size={14} className="text-muted" /></span>
                            <input
                                type="text"
                                className="form-control border-0 bg-transparent shadow-none py-2"
                                placeholder={t('sales.cheques.search_placeholder')}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs (Styled like company-items page tabs) */}
            <div className="d-flex flex-wrap gap-2 mb-4">
                {[
                    { key: 'Pending', label: t('sales.cheques.pending'), count: summary.pending?.count || 0 },
                    { key: 'Cleared', label: t('sales.cheques.cleared'), count: summary.cleared?.count || 0 },
                    { key: 'Bounced', label: t('sales.cheques.bounced'), count: summary.bounced?.count || 0 }
                ].map(tab => (
                    <button
                        key={tab.key}
                        type="button"
                        className={`btn btn-sm fw-semibold px-3 d-flex align-items-center gap-2 ${activeTab === tab.key ? 'btn-dark' : 'btn-light border'}`}
                        onClick={() => setActiveTab(tab.key)}
                        id={`cheque-tab-${tab.key.toLowerCase()}`}
                    >
                        {tab.label}
                        <span className={`badge ${activeTab === tab.key ? 'bg-white text-dark' : 'bg-secondary-subtle text-secondary'}`} style={{ fontSize: '10px' }}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div className="card-header bg-white border-0 py-3 px-4">
                    <h6 className="fw-bold text-dark mb-0">
                        {pagination.total} {t(`sales.cheques.${activeTab.toLowerCase()}`)} {t('sales.cheques.expired_title').replace('Expired Cheques', 'Cheques').replace('කල් ඉකුත් වූ චෙක්පත්', 'චෙක්පත්').replace('காலாவதியான காசோலைகள்', 'காசோலைகள்')}
                    </h6>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                {['Cheque #', 'Bank / Branch', 'Customer', 'Amount', 'Cheque Date', 'Days to Expire', 'Linked Invoice(s)', 'Status', ...(activeTab === 'Pending' ? ['Actions'] : [])].map(h => (
                                    <th key={h} className="py-3 text-uppercase small fw-bold text-muted" style={{ fontSize: '10px' }}>{getTableHeaderLabel(h)}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={9} className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary" /></td></tr>
                            ) : cheques.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="text-center py-5">
                                        <div className="text-muted">
                                            <CheckCircle size={32} className="mb-2 opacity-25" />
                                            <p className="small mb-0">
                                                {(t('sales.cheques.no_cheques') || 'No {status} cheques').replace('{status}', t(`sales.cheques.${activeTab.toLowerCase()}`))}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : sortedCheques.map(ch => {
                                const days = getDaysToExpire(ch.Cheque_Date);
                                return (
                                    <tr key={ch.Cheque_ID} style={ch.isPastDue ? { backgroundColor: '#fff5f5' } : ch.isExpiringSoon ? { backgroundColor: '#fffbf0' } : {}}>
                                        <td>
                                            <div className="fw-bold text-dark">{ch.Cheque_No}</div>
                                        </td>
                                        <td>
                                            <div className="d-flex flex-column">
                                                <span className="fw-medium text-dark small d-flex align-items-center gap-1"><Briefcase size={11} />{ch.Bank}</span>
                                                {ch.Branch && <small className="text-muted" style={{ fontSize: '11px' }}>{ch.Branch}</small>}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex flex-column">
                                                <span className="fw-bold text-dark small d-flex align-items-center gap-1"><User size={11} />{ch.Customer?.C_Name || '—'}</span>
                                                {ch.Customer?.Customer_Code && <small className="text-muted" style={{ fontSize: '10px' }}>{ch.Customer.Customer_Code}</small>}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-1">
                                                <span className="fw-bold text-dark">Rs.{parseFloat(ch.Amount).toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-1 small">
                                                <Calendar size={12} className="text-muted" />
                                                <span className={ch.isPastDue ? 'text-danger fw-bold' : 'text-dark'}>
                                                    {new Date(ch.Cheque_Date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            {/* Days to Expire column logic */}
                                            {days < 0 ? (
                                                <span className="text-danger fw-bold small">
                                                    {t('sales.cheques.expired_ago').replace('{days}', Math.abs(days))}
                                                </span>
                                            ) : days === 0 ? (
                                                <span className="text-warning fw-bold small">{t('sales.cheques.expires_today')}</span>
                                            ) : (
                                                <span className={days <= 5 ? "text-warning fw-bold small" : "text-dark small"}>
                                                    {t('sales.cheques.days_left').replace('{days}', days)}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {/* Plain text link list instead of badges */}
                                            <div className="d-flex flex-column gap-1">
                                                {ch.Payment?.Allocations?.length > 0 ? (
                                                    ch.Payment.Allocations.map(a => (
                                                        <span key={a.Alloc_ID} className="fw-bold text-dark small" style={{ fontSize: '11px' }}>
                                                            {a.Sale?.Invoice_No || `Sale #${a.Sale_ID}`}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-muted small">—</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <StatusBadge status={ch.Cheque_Status} expiringSoon={ch.isExpiringSoon} pastDue={ch.isPastDue} />
                                        </td>
                                        {activeTab === 'Pending' && (
                                            <td>
                                                <div className="btn-group shadow-sm border rounded-3 overflow-hidden">
                                                    <button
                                                        className="btn btn-sm btn-white px-2 border-end d-flex align-items-center gap-1"
                                                        title="Mark as Cleared (Cashed)"
                                                        onClick={() => handleAction('clear', ch)}
                                                        id={`clear-cheque-${ch.Cheque_ID}`}
                                                    >
                                                        <CheckCircle size={13} className="text-success" />
                                                        <span style={{ fontSize: '11px' }} className="text-success fw-bold">{t('sales.cheques.cash')}</span>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-white px-2 d-flex align-items-center gap-1"
                                                        title="Mark as Bounced"
                                                        onClick={() => handleAction('bounce', ch)}
                                                        id={`bounce-cheque-${ch.Cheque_ID}`}
                                                    >
                                                        <XCircle size={13} className="text-danger" />
                                                        <span style={{ fontSize: '11px' }} className="text-danger fw-bold">{t('sales.cheques.reject')}</span>
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="card-footer bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center border-top">
                        <span className="text-muted small">
                            {t('sales.cheques.page_info').replace('{page}', pagination.page).replace('{pages}', pagination.pages).replace('{total}', pagination.total)}
                        </span>
                        <nav>
                            <ul className="pagination pagination-sm mb-0 gap-1">
                                <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link border-0 rounded-3 shadow-sm px-3" onClick={() => fetchCheques(pagination.page - 1)}><ChevronLeft size={14} /></button>
                                </li>
                                <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                                    <button className="page-link border-0 rounded-3 shadow-sm px-3" onClick={() => fetchCheques(pagination.page + 1)}><ChevronRight size={14} /></button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>

            {/* Confirm Modals */}
            <ConfirmModal
                show={confirmState.show && confirmState.type === 'clear'}
                title={t('sales.cheques.confirm_clear_title')}
                message={t('sales.cheques.confirm_clear_msg').replace('{no}', confirmState.cheque?.Cheque_No || '').replace('{amt}', parseFloat(confirmState.cheque?.Amount || 0).toLocaleString())}
                confirmLabel={t('sales.cheques.mark_cleared')}
                confirmColor="success"
                onConfirm={handleConfirm}
                onCancel={() => setConfirmState({ show: false, type: '', cheque: null })}
            />
            <ConfirmModal
                show={confirmState.show && confirmState.type === 'bounce'}
                title={t('sales.cheques.confirm_bounce_title')}
                message={t('sales.cheques.confirm_bounce_msg').replace('{no}', confirmState.cheque?.Cheque_No || '').replace('{amt}', parseFloat(confirmState.cheque?.Amount || 0).toLocaleString())}
                confirmLabel={t('sales.cheques.record_bounce')}
                confirmColor="danger"
                requireReason
                reasonLabel={t('sales.cheques.bounce_reason')}
                onConfirm={handleConfirm}
                onCancel={() => setConfirmState({ show: false, type: '', cheque: null })}
            />
        </div>
    );
};

export default ChequeManagementPage;
