import React, { useState, useEffect } from "react";
import axios from "axios";
import RecentSalesTable from "../../component/Sale/recentSalesTable/RecentSalesTable";
import { Search, Filter, Calendar, XCircle, Package, AlertCircle, Eye, Printer, RotateCcw } from "react-feather";

// ─── Void Confirmation Modal ──────────────────────────────────────────────────
const VoidModal = ({ show, sale, onConfirm, onCancel }) => {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => { if (show) { setReason(''); setError(''); } }, [show]);

    const handleConfirm = async () => {
        if (!reason.trim()) { setError('Void reason is required'); return; }
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            await axios.post(`/api/sales-management/sales/${sale.Sale_Id}/void-audit`, {
                reason: reason.trim(),
                userId: user?.id
            });
            onConfirm();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to void sale');
        } finally {
            setLoading(false);
        }
    };

    if (!show || !sale) return null;
    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 440 }}>
                <div className="modal-content border-0 rounded-4 shadow-lg">
                    <div className="modal-header border-0 pb-0 pt-4 px-4">
                        <h5 className="fw-bold text-danger mb-0">❌ Void Sale</h5>
                        <button className="btn-close" onClick={onCancel} />
                    </div>
                    <div className="modal-body px-4 py-3">
                        <div className="alert alert-warning border-0 rounded-3 py-2 px-3 small mb-3 d-flex align-items-center gap-2">
                            <AlertCircle size={14} />
                            This action cannot be undone. Invoice <strong>{sale.Invoice_No}</strong> will be permanently voided.
                        </div>
                        {error && <div className="alert alert-danger border-0 rounded-3 py-2 px-3 small mb-3">{error}</div>}
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>Void Reason *</label>
                        <textarea
                            className="form-control form-control-sm rounded-3"
                            rows={3}
                            value={reason}
                            onChange={e => { setReason(e.target.value); setError(''); }}
                            placeholder="Explain why this sale is being voided..."
                        />
                    </div>
                    <div className="modal-footer border-0 pb-4 px-4 gap-2">
                        <button className="btn btn-light btn-sm rounded-3 px-4" onClick={onCancel}>Cancel</button>
                        <button className="btn btn-danger btn-sm rounded-3 px-4 fw-bold" onClick={handleConfirm} disabled={loading}>
                            {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                            Void Sale
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Enhanced Sales History Table ─────────────────────────────────────────────
// Extends RecentSalesTable with Void action
const SalesHistoryTable = ({ externalData, externalLoading, title, pagination, onPageChange, onVoid }) => {
    const [selectedSaleId, setSelectedSaleId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [voidTarget, setVoidTarget] = useState(null);
    const sales = externalData || [];
    const loading = externalLoading;

    // Get user role from localStorage for permission-gating
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const canVoid = ['Admin', 'Manager', 'admin', 'manager'].includes(user?.role || user?.Role);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Paid': return 'bg-success-subtle text-success border-success-subtle';
            case 'Partially_Paid': return 'bg-warning-subtle text-warning border-warning-subtle';
            case 'Unpaid': return 'bg-danger-subtle text-danger border-danger-subtle';
            default: return 'bg-secondary-subtle text-secondary';
        }
    };

    // Dynamically import SaleDetailsModal
    const SaleDetailsModal = React.lazy(() => import('../../component/Sale/SaleDetailsModal/SaleDetailsModal'));

    return (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
            <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                <h6 className="fw-bold text-dark mb-0">{title}</h6>
            </div>
            <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                        <tr>
                            {['Invoice #', 'Date', 'Customer', 'Type', 'Total', 'Balance', 'Status', 'Actions'].map(h => (
                                <th key={h} className="py-3 text-uppercase small fw-bold text-muted" style={{ fontSize: '10px' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={8} className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary" /></td></tr>
                        ) : sales.length === 0 ? (
                            <tr><td colSpan={8} className="text-center py-5 text-muted small">No transactions found</td></tr>
                        ) : sales.map(sale => (
                            <tr key={sale.Sale_Id} style={sale.Status === 'Void' ? { opacity: 0.6, backgroundColor: '#f8f9fa' } : {}}>
                                <td className="ps-4">
                                    <div className="fw-bold text-primary">{sale.Invoice_No}</div>
                                    {sale.Status === 'Void' && <small className="badge bg-secondary-subtle text-secondary rounded-pill" style={{ fontSize: '9px' }}>VOID</small>}
                                </td>
                                <td>
                                    <div className="text-dark fw-medium small">{new Date(sale.Sale_Date).toLocaleDateString()}</div>
                                    <small className="text-muted" style={{ fontSize: '11px' }}>{sale.Sale_Time}</small>
                                </td>
                                <td>
                                    <div className="fw-bold text-dark small">{sale.Customer?.C_Name || 'Walking Customer'}</div>
                                    <small className="text-muted" style={{ fontSize: '11px' }}>{sale.Customer?.Phone1 || 'N/A'}</small>
                                </td>
                                <td>
                                    <span className={`badge rounded-pill px-2 py-1 ${sale.Sale_Type === 'Wholesale' ? 'bg-primary-subtle text-primary' : 'bg-info-subtle text-info'}`} style={{ fontSize: '10px' }}>
                                        {sale.Sale_Type}
                                    </span>
                                </td>
                                <td className="fw-bold text-dark small">Rs.{parseFloat(sale.Total_Amount).toLocaleString()}</td>
                                <td className={`fw-bold small ${parseFloat(sale.Balance_Due) > 0 ? 'text-danger' : 'text-success'}`}>
                                    Rs.{parseFloat(sale.Balance_Due || 0).toLocaleString()}
                                </td>
                                <td>
                                    <span className={`badge border rounded-pill px-3 py-2 ${getStatusBadge(sale.Payment_Status)}`} style={{ fontSize: '10px' }}>
                                        {sale.Payment_Status?.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="pe-4">
                                    <div className="btn-group shadow-sm rounded-3 overflow-hidden border bg-white">
                                        <button
                                            className="btn btn-sm btn-white px-2 border-end"
                                            title="View Detail"
                                            onClick={() => { setSelectedSaleId(sale.Sale_Id); setShowModal(true); }}
                                        >
                                            <Eye size={15} className="text-primary" />
                                        </button>
                                        <button className="btn btn-sm btn-white px-2 border-end" title="Print Invoice">
                                            <Printer size={15} className="text-secondary" />
                                        </button>
                                        {canVoid && sale.Status !== 'Void' && (
                                            <button
                                                className="btn btn-sm btn-white px-2"
                                                title="Void Sale"
                                                onClick={() => setVoidTarget(sale)}
                                            >
                                                <RotateCcw size={15} className="text-danger" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
                <div className="card-footer bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center border-top">
                    <span className="text-muted small">
                        Showing <strong>{((pagination.page - 1) * pagination.limit) + 1}</strong> to <strong>{Math.min(pagination.page * pagination.limit, pagination.total)}</strong> of <strong>{pagination.total}</strong>
                    </span>
                    <nav>
                        <ul className="pagination pagination-sm mb-0 gap-1">
                            <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                                <button className="page-link border-0 rounded-3 shadow-sm px-3" onClick={() => onPageChange(pagination.page - 1)}>‹</button>
                            </li>
                            {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                                const p = i + 1;
                                return (
                                    <li key={p} className={`page-item ${pagination.page === p ? 'active' : ''}`}>
                                        <button className={`page-link border-0 rounded-3 shadow-sm px-3 ${pagination.page === p ? 'bg-primary text-white' : 'bg-light text-dark'}`} onClick={() => onPageChange(p)}>{p}</button>
                                    </li>
                                );
                            })}
                            <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                                <button className="page-link border-0 rounded-3 shadow-sm px-3" onClick={() => onPageChange(pagination.page + 1)}>›</button>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}

            {/* Modals */}
            <React.Suspense fallback={null}>
                {showModal && (
                    <SaleDetailsModal
                        saleId={selectedSaleId}
                        show={showModal}
                        onClose={() => { setShowModal(false); setSelectedSaleId(null); }}
                    />
                )}
            </React.Suspense>

            <VoidModal
                show={!!voidTarget}
                sale={voidTarget}
                onConfirm={() => { setVoidTarget(null); onVoid(); }}
                onCancel={() => setVoidTarget(null)}
            />
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const SalesHistory = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 0, limit: 20 });
    const [filters, setFilters] = useState({
        query: '', startDate: '', endDate: '',
        paymentStatus: '', productType: '', saleType: '', status: '', page: 1
    });

    const fetchFilteredSales = async () => {
        try {
            setLoading(true);
            const { query, startDate, endDate, paymentStatus, productType, saleType, status, page } = filters;
            let url = `/api/sales-management/search?page=${page}&limit=20`;
            if (query) url += `&query=${encodeURIComponent(query)}`;
            if (startDate) url += `&startDate=${startDate}`;
            if (endDate) url += `&endDate=${endDate}`;
            if (paymentStatus) url += `&paymentStatus=${paymentStatus}`;
            if (productType) url += `&productType=${productType}`;
            if (saleType) url += `&saleType=${saleType}`;
            if (status) url += `&status=${status}`;
            const response = await axios.get(url);
            if (response.data.success) {
                setSales(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error("Error searching sales:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const t = setTimeout(fetchFilteredSales, 300);
        return () => clearTimeout(t);
    }, [filters]);

    const handleReset = () => setFilters({
        query: '', startDate: '', endDate: '', paymentStatus: '', productType: '', saleType: '', status: '', page: 1
    });

    return (
        <div className="container-fluid p-4 bg-light min-vh-100">
            {/* Header removed for global navbar consistency */}


            {/* Filter Bar */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
                <div className="row g-3 align-items-end">
                    <div className="col-md-2">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>Search Invoice</label>
                        <div className="input-group input-group-sm shadow-sm rounded-3 overflow-hidden border">
                            <span className="input-group-text bg-white border-0"><Search size={14} className="text-muted" /></span>
                            <input type="text" className="form-control border-0 ps-0" placeholder="INV-2026..." value={filters.query} onChange={e => setFilters({ ...filters, query: e.target.value, page: 1 })} />
                        </div>
                    </div>
                    <div className="col-md-2">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>From Date</label>
                        <div className="input-group input-group-sm shadow-sm rounded-3 overflow-hidden border">
                            <span className="input-group-text bg-white border-0"><Calendar size={14} className="text-muted" /></span>
                            <input type="date" className="form-control border-0 ps-0" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value, page: 1 })} />
                        </div>
                    </div>
                    <div className="col-md-2">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>To Date</label>
                        <div className="input-group input-group-sm shadow-sm rounded-3 overflow-hidden border">
                            <span className="input-group-text bg-white border-0"><Calendar size={14} className="text-muted" /></span>
                            <input type="date" className="form-control border-0 ps-0" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value, page: 1 })} />
                        </div>
                    </div>
                    <div className="col-md-2">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>Payment Status</label>
                        <div className="input-group input-group-sm shadow-sm rounded-3 overflow-hidden border">
                            <span className="input-group-text bg-white border-0"><Filter size={14} className="text-muted" /></span>
                            <select className="form-select border-0 ps-0" value={filters.paymentStatus} onChange={e => setFilters({ ...filters, paymentStatus: e.target.value, page: 1 })}>
                                <option value="">All Statuses</option>
                                <option value="Paid">Paid</option>
                                <option value="Unpaid">Unpaid</option>
                                <option value="Partially_Paid">Partially Paid</option>
                            </select>
                        </div>
                    </div>
                    <div className="col-md-1">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>Type</label>
                        <select className="form-select form-select-sm shadow-sm rounded-3 border" value={filters.saleType} onChange={e => setFilters({ ...filters, saleType: e.target.value, page: 1 })}>
                            <option value="">All</option>
                            <option value="Retail">Retail</option>
                            <option value="Wholesale">Wholesale</option>
                        </select>
                    </div>
                    <div className="col-md-1">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>Status</label>
                        <select className="form-select form-select-sm shadow-sm rounded-3 border" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value, page: 1 })}>
                            <option value="">All</option>
                            <option value="Active">Active</option>
                            <option value="Void">Void</option>
                        </select>
                    </div>
                    <div className="col-md-2 text-end">
                        <button className="btn btn-sm btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 border shadow-sm fw-bold rounded-3" onClick={handleReset} style={{ height: '31px' }}>
                            <XCircle size={14} /> Reset Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Table */}
            <SalesHistoryTable
                externalData={sales}
                externalLoading={loading}
                title={`${pagination.total} Transactions Found`}
                pagination={pagination}
                onPageChange={(p) => setFilters(prev => ({ ...prev, page: p }))}
                onVoid={fetchFilteredSales}
            />
        </div>
    );
};

export default SalesHistory;
