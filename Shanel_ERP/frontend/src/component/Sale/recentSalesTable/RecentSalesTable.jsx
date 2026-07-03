import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Printer, RotateCcw, ChevronLeft, ChevronRight } from 'react-feather';
import SaleDetailsModal from '../SaleDetailsModal/SaleDetailsModal';

const RecentSalesTable = ({ 
    externalData, 
    externalLoading, 
    title = "Recent Transactions",
    pagination,
    onPageChange 
}) => {
    const [internalData, setInternalData] = useState([]);
    const [internalLoading, setInternalLoading] = useState(true);
    const [selectedSaleId, setSelectedSaleId] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // If externalData is provided, use it. Otherwise, fetch internally (for Dashboard use)
    const isExternal = externalData !== undefined;
    const sales = isExternal ? externalData : internalData;
    const loading = isExternal ? externalLoading : internalLoading;

    const fetchRecentSales = async () => {
        if (isExternal) return; // Don't fetch if data is provided from outside
        try {
            setInternalLoading(true);
            const response = await axios.get(`/api/sales-management/history?limit=10`);
            if (response.data.success) {
                setInternalData(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching recent sales:", error);
        } finally {
            setInternalLoading(false);
        }
    };

    useEffect(() => {
        fetchRecentSales();
    }, [isExternal]);

    // Function to get professional color-coded badges
    const getStatusBadge = (status) => {
        switch (status) {
            case 'Paid': return 'bg-success-subtle text-success border-success-subtle';
            case 'Partially_Paid': return 'bg-warning-subtle text-warning border-warning-subtle';
            case 'Unpaid': return 'bg-danger-subtle text-danger border-danger-subtle';
            default: return 'bg-secondary-subtle text-secondary';
        }
    };

    if (loading) {
        return (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                <div className="spinner-border text-primary m-auto" role="status"></div>
                <p className="text-muted mt-2 small fw-bold text-uppercase">Loading transactions...</p>
            </div>
        );
    }

    return (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
            <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                <h6 className="fw-bold text-dark mb-0">{title}</h6>
                {!isExternal && (
                    <button className="btn btn-sm btn-light text-primary fw-bold px-3 rounded-pill" onClick={fetchRecentSales}>Refresh</button>
                )}
            </div>
            <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                        <tr>
                            <th className="ps-4 py-3 text-uppercase small fw-bold text-muted" style={{fontSize: '11px'}}>Invoice #</th>
                            <th className="py-3 text-uppercase small fw-bold text-muted" style={{fontSize: '11px'}}>Date</th>
                            <th className="py-3 text-uppercase small fw-bold text-muted" style={{fontSize: '11px'}}>Customer</th>
                            <th className="py-3 text-uppercase small fw-bold text-muted" style={{fontSize: '11px'}}>Total</th>
                            <th className="py-3 text-uppercase small fw-bold text-muted" style={{fontSize: '11px'}}>Status</th>
                            <th className="pe-4 py-3 text-end text-uppercase small fw-bold text-muted" style={{fontSize: '11px'}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales && sales.length > 0 ? (
                            sales.map((sale) => (
                                <tr key={sale.Sale_Id}>
                                    <td className="ps-4 fw-bold text-primary">{sale.Invoice_No}</td>
                                    <td>
                                        <div className="d-flex flex-column">
                                            <span className="text-dark fw-medium">{new Date(sale.Sale_Date).toLocaleDateString()}</span>
                                            <small className="text-muted" style={{fontSize: '11px'}}>{sale.Sale_Time}</small>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex flex-column">
                                            <span className="text-dark fw-bold">{sale.Customer?.C_Name || 'Walking Customer'}</span>
                                            <small className="text-muted" style={{fontSize: '11px'}}>{sale.Customer?.Phone1 || 'N/A'}</small>
                                        </div>
                                    </td>
                                    <td className="fw-bold text-dark">Rs.{parseFloat(sale.Total_Amount).toLocaleString()}</td>
                                    <td>
                                        <span className={`badge border rounded-pill px-3 py-2 ${getStatusBadge(sale.Payment_Status)}`} style={{fontSize: '11px'}}>
                                            {sale.Payment_Status?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="pe-4 text-end">
                                        <div className="btn-group shadow-sm rounded-3 overflow-hidden border bg-white">
                                            <button 
                                                className="btn btn-sm btn-white px-2 border-end" 
                                                title="View Detail"
                                                onClick={() => {
                                                    setSelectedSaleId(sale.Sale_Id);
                                                    setShowModal(true);
                                                }}
                                            >
                                                <Eye size={16} className="text-primary" />
                                            </button>
                                            <button className="btn btn-sm btn-white px-2 border-end" title="Print Invoice"><Printer size={16} className="text-secondary" /></button>
                                            <button className="btn btn-sm btn-white px-2" title="Refund"><RotateCcw size={16} className="text-danger" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-5 text-muted fw-medium">No sales found matching your criteria.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            {pagination && pagination.pages > 1 && (
                <div className="card-footer bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center border-top">
                    <span className="text-muted small">
                        Showing <span className="fw-bold text-dark">{((pagination.page - 1) * pagination.limit) + 1}</span> to <span className="fw-bold text-dark">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="fw-bold text-dark">{pagination.total}</span> entries
                    </span>
                    <nav>
                        <ul className="pagination pagination-sm mb-0 gap-1">
                            <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                                <button className="page-link border-0 rounded-3 shadow-sm px-3" onClick={() => onPageChange(pagination.page - 1)}>
                                    <ChevronLeft size={16} />
                                </button>
                            </li>
                            {[...Array(pagination.pages)].map((_, i) => {
                                const pageNum = i + 1;
                                // Show first, last, and pages around current
                                if (pageNum === 1 || pageNum === pagination.pages || (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)) {
                                    return (
                                        <li key={pageNum} className={`page-item ${pagination.page === pageNum ? 'active' : ''}`}>
                                            <button className={`page-link border-0 rounded-3 shadow-sm px-3 ${pagination.page === pageNum ? 'bg-primary text-white' : 'bg-light text-dark'}`} onClick={() => onPageChange(pageNum)}>
                                                {pageNum}
                                            </button>
                                        </li>
                                    );
                                } else if (pageNum === pagination.page - 2 || pageNum === pagination.page + 2) {
                                    return <li key={pageNum} className="page-item disabled"><span className="page-link border-0 bg-transparent">...</span></li>;
                                }
                                return null;
                            })}
                            <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                                <button className="page-link border-0 rounded-3 shadow-sm px-3" onClick={() => onPageChange(pagination.page + 1)}>
                                    <ChevronRight size={16} />
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}

            {/* Sale Details Modal */}
            <SaleDetailsModal
                saleId={selectedSaleId}
                show={showModal}
                onClose={() => {
                    setShowModal(false);
                    setSelectedSaleId(null);
                }}
            />
        </div>
    );
};

export default RecentSalesTable;
