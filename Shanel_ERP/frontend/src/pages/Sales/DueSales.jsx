import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
    AlertCircle, DollarSign, Search, RefreshCw,
    ChevronLeft, ChevronRight, Clock, AlertTriangle
} from "react-feather";

const PaymentBadge = ({ status }) => {
    const map = {
        Paid: 'bg-success-subtle text-success',
        Partially_Paid: 'bg-warning-subtle text-warning',
        Unpaid: 'bg-danger-subtle text-danger'
    };
    return (
        <span className={`badge rounded-pill px-2 py-1 ${map[status] || 'bg-secondary-subtle text-secondary'}`} style={{ fontSize: '10px' }}>
            {status?.replace('_', ' ')}
        </span>
    );
};

const DueSales = () => {
    const navigate = useNavigate();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 0, limit: 20 });
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);

    const fetchDueSales = useCallback(async () => {
        setLoading(true);
        try {
            let url = `/api/sales-management/due?page=${page}&limit=20`;
            if (query.trim()) url += `&query=${encodeURIComponent(query)}`;
            const res = await axios.get(url);
            if (res.data.success) {
                setSales(res.data.data);
                setPagination(res.data.pagination);
            }
        } catch (err) {
            console.error("Error fetching due sales:", err);
        } finally {
            setLoading(false);
        }
    }, [page, query]);

    useEffect(() => {
        const timer = setTimeout(fetchDueSales, 300);
        return () => clearTimeout(timer);
    }, [fetchDueSales]);

    const totalDue = sales.reduce((sum, s) => sum + parseFloat(s.Balance_Due || 0), 0);
    const overdueCount = sales.filter(s => s.isOverdue).length;

    return (
        <div className="container-fluid p-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            {/* Collection Summary Banner with embedded summary stats */}
            <div className="alert border-0 shadow-sm rounded-4 d-flex justify-content-between align-items-center gap-3 mb-4 p-3 bg-white" style={{ borderLeft: '4px solid #ffc107', marginTop: '1rem' }}>
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-warning p-2 rounded-circle text-white shadow-sm"><AlertCircle size={18} /></div>
                    <div>
                        <span className="fw-bold text-dark d-block">Collection Summary</span>
                        <span className="text-muted small">
                            You have <span className="text-danger fw-bold">{pagination.total}</span> invoices with pending balances.
                            {overdueCount > 0 && <> <span className="text-warning fw-bold">{overdueCount} are past their due date</span> and need urgent attention.</>}
                            {' '}Oldest dues are shown first.
                        </span>
                    </div>
                </div>

                {/* Symmetrical Stats Integrated to Right Corner */}
                <div className="d-flex align-items-center gap-4 pe-2">
                    {overdueCount > 0 && (
                        <div className="border-end pe-4 text-end">
                            <small className="text-muted fw-bold text-uppercase d-block" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Overdue Invoices</small>
                            <span className="fw-bold text-warning" style={{ fontSize: '16px' }}>{overdueCount}</span>
                        </div>
                    )}
                    <div className="text-end">
                        <small className="text-muted fw-bold text-uppercase d-block" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Total Pending</small>
                        <span className="fw-bold text-danger" style={{ fontSize: '16px' }}>Rs.{totalDue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
                <div className="row g-3 align-items-end">
                    <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>Search</label>
                        <div className="input-group input-group-sm border rounded-3 overflow-hidden shadow-sm">
                            <span className="input-group-text bg-white border-0"><Search size={14} className="text-muted" /></span>
                            <input
                                type="text"
                                className="form-control border-0 ps-0"
                                placeholder="Invoice number or customer name..."
                                value={query}
                                onChange={e => { setQuery(e.target.value); setPage(1); }}
                            />
                        </div>
                    </div>
                    <div className="col-md-2">
                        <button className="btn btn-light btn-sm w-100 rounded-3 border d-flex align-items-center justify-content-center gap-2" onClick={fetchDueSales}>
                            <RefreshCw size={14} /> Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                    <h6 className="fw-bold text-dark mb-0">{pagination.total} Outstanding Invoices</h6>
                    {overdueCount > 0 && (
                        <span className="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill px-3">
                            <AlertTriangle size={11} className="me-1" />{overdueCount} Overdue
                        </span>
                    )}
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                {['Invoice #', 'Customer', 'Total', 'Balance Due', 'Cash Rcvd', 'Bank Rcvd', 'Cheque Rcvd', 'Status', 'Action'].map(h => (
                                    <th key={h} className="py-3 text-uppercase small fw-bold text-muted" style={{ fontSize: '10px' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={9} className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary" /></td></tr>
                            ) : sales.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="text-center py-5">
                                        <div className="text-muted">
                                            <DollarSign size={32} className="mb-2 opacity-25" />
                                            <p className="small mb-0">No outstanding invoices found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : sales.map(sale => (
                                <tr
                                    key={sale.Sale_Id}
                                    style={sale.isOverdue
                                        ? { backgroundColor: '#fff5f5', borderLeft: '3px solid #dc3545' }
                                        : {}
                                    }
                                >
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            {sale.isOverdue && <AlertTriangle size={12} className="text-danger" title="Overdue" />}
                                            <span className="fw-bold text-primary small">{sale.Invoice_No}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="fw-bold text-dark small">{sale.Customer?.C_Name || '—'}</div>
                                        <small className="text-muted" style={{ fontSize: '10px' }}>{sale.Customer?.Customer_Code}</small>
                                    </td>
                                    <td className="fw-bold small">Rs.{parseFloat(sale.Total_Amount).toLocaleString()}</td>
                                    <td>
                                        <span className="fw-bold text-danger">Rs.{parseFloat(sale.Balance_Due).toLocaleString()}</span>
                                    </td>
                                    <td className="small text-muted">Rs.{parseFloat(sale.cashReceived || 0).toLocaleString()}</td>
                                    <td className="small text-muted">Rs.{parseFloat(sale.bankReceived || 0).toLocaleString()}</td>
                                    <td className="small text-muted">Rs.{parseFloat(sale.chequeReceived || 0).toLocaleString()}</td>
                                    <td><PaymentBadge status={sale.Payment_Status} /></td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-primary px-3 rounded-3 fw-bold"
                                            style={{ fontSize: '11px' }}
                                            onClick={() => navigate('/sales/collection')}
                                            title="Record Payment"
                                        >
                                            Make Payment
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="card-footer bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center border-top">
                        <span className="text-muted small">
                            Page {pagination.page} of {pagination.pages} · {pagination.total} invoices
                        </span>
                        <nav>
                            <ul className="pagination pagination-sm mb-0 gap-1">
                                <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link border-0 rounded-3 shadow-sm px-3" onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></button>
                                </li>
                                <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                                    <button className="page-link border-0 rounded-3 shadow-sm px-3" onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DueSales;
