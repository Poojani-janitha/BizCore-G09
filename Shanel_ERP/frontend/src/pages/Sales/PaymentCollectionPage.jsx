/**
 * PaymentCollectionPage
 * 
 * Enhanced page for managing pending payments
 * Track outstanding balances, collection history, and customer details
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle, DollarSign, Phone, Mail, Calendar, Eye } from 'react-feather';
import {
    fetchDueSales,
    formatCurrency,
    formatDate,
    addPaymentToSale
} from '../../services/salesManagementService';
import FilterBar from '../../component/Sale/FilterBar/FilterBar';
import SaleDetailsModal from '../../component/Sale/SaleDetailsModal/SaleDetailsModal';
import './PaymentCollectionPage.css';

const PaymentCollectionPage = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        pages: 0,
        limit: 20
    });
    const [filters, setFilters] = useState({
        page: 1
    });
    const [selectedSale, setSelectedSale] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [paymentModal, setPaymentModal] = useState(false);
    const [paymentData, setPaymentData] = useState({
        amount: 0,
        method: 'Cash'
    });

    useEffect(() => {
        fetchDueSalesData();
    }, [filters]);

    const fetchDueSalesData = async () => {
        try {
            setLoading(true);
            const response = await fetchDueSales(filters.page, filters.limit || 20);
            if (response.success) {
                setSales(response.data);
                setPagination(response.pagination);
            }
        } catch (error) {
            console.error('Error fetching due sales:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        setFilters({ ...filters, page: newPage });
    };

    const handleReset = () => {
        setFilters({ page: 1 });
    };

    const handlePaymentSubmit = async (saleId) => {
        try {
            const response = await addPaymentToSale(saleId, paymentData);
            if (response.success) {
                alert('Payment recorded successfully');
                setPaymentModal(false);
                fetchDueSalesData();
            }
        } catch (error) {
            alert('Error recording payment: ' + error.message);
        }
    };

    // Calculate totals
    const totalDue = sales.reduce((sum, sale) => sum + parseFloat(sale.Balance_Due || 0), 0);
    const totalInvoices = pagination.total;
    const overdueDays = 30; // Example: invoices over 30 days

    if (loading && sales.length === 0) {
        return (
            <div className="container-fluid p-4 bg-light min-vh-100 d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="text-muted mt-2 small fw-bold text-uppercase">Loading payment data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid p-4 bg-light min-vh-100">
            {/* Page Header */}
            <div className="mb-4">
                <h4 className="fw-bold text-dark mb-1">Payment Collection & Outstanding Balance</h4>
                <p className="text-muted small">Manage pending payments and track customer credit</p>
            </div>

            {/* Summary Cards */}
            <div className="row g-3 mb-4">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-danger">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-danger-subtle p-2 rounded-3 text-danger">
                                <DollarSign size={20} />
                            </div>
                            <div>
                                <small className="text-muted fw-bold text-uppercase d-block" style={{fontSize: '10px'}}>Total Pending</small>
                                <span className="fw-bold text-dark h6 mb-0">Rs.{formatCurrency(totalDue)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-warning">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-warning-subtle p-2 rounded-3 text-warning">
                                <AlertCircle size={20} />
                            </div>
                            <div>
                                <small className="text-muted fw-bold text-uppercase d-block" style={{fontSize: '10px'}}>Outstanding</small>
                                <span className="fw-bold text-dark h6 mb-0">{totalInvoices} Invoices</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-info">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-info-subtle p-2 rounded-3 text-info">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <small className="text-muted fw-bold text-uppercase d-block" style={{fontSize: '10px'}}>Avg Days</small>
                                <span className="fw-bold text-dark h6 mb-0">{overdueDays} Days</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-success">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-success-subtle p-2 rounded-3 text-success">
                                <Phone size={20} />
                            </div>
                            <div>
                                <small className="text-muted fw-bold text-uppercase d-block" style={{fontSize: '10px'}}>Unique Customers</small>
                                <span className="fw-bold text-dark h6 mb-0">{new Set(sales.map(s => s.C_ID)).size}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alert for collection */}
            <div className="alert alert-info border-0 shadow-sm rounded-4 d-flex align-items-center gap-3 mb-4 p-3 bg-white">
                <div className="bg-info p-2 rounded-circle text-white">
                    <AlertCircle size={18} />
                </div>
                <div>
                    <span className="fw-bold text-dark d-block">Collection Action Required</span>
                    <span className="text-muted small">
                        Priority collection: <span className="text-danger fw-bold">{sales.filter(s => {
                            const days = Math.floor((new Date() - new Date(s.Sale_Date)) / (1000 * 60 * 60 * 24));
                            return days > 30;
                        }).length}</span> invoices over 30 days old. Click on any invoice to record a payment.
                    </span>
                </div>
            </div>

            {/* Outstanding Invoices Table */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div className="card-header bg-white border-0 py-3 px-4">
                    <h6 className="fw-bold text-dark mb-0">Outstanding Invoices</h6>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 py-3 text-uppercase small fw-bold text-muted" style={{fontSize: '11px'}}>Invoice #</th>
                                <th className="py-3 text-uppercase small fw-bold text-muted" style={{fontSize: '11px'}}>Customer</th>
                                <th className="py-3 text-uppercase small fw-bold text-muted" style={{fontSize: '11px'}}>Invoice Date</th>
                                <th className="py-3 text-uppercase small fw-bold text-muted text-end" style={{fontSize: '11px'}}>Total Amount</th>
                                <th className="py-3 text-uppercase small fw-bold text-muted text-end" style={{fontSize: '11px'}}>Balance Due</th>
                                <th className="py-3 text-uppercase small fw-bold text-muted text-center" style={{fontSize: '11px'}}>Days Due</th>
                                <th className="pe-4 py-3 text-end text-uppercase small fw-bold text-muted" style={{fontSize: '11px'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.length > 0 ? (
                                sales.map((sale) => {
                                    const daysDue = Math.floor((new Date() - new Date(sale.Sale_Date)) / (1000 * 60 * 60 * 24));
                                    return (
                                        <tr key={sale.Sale_Id}>
                                            <td className="ps-4 fw-bold text-primary">{sale.Invoice_No}</td>
                                            <td>
                                                <div className="d-flex flex-column">
                                                    <span className="text-dark fw-medium">{sale.Customer?.C_Name || 'Walking Customer'}</span>
                                                    <small className="text-muted" style={{fontSize: '11px'}}>{sale.Customer?.Phone1 || 'N/A'}</small>
                                                </div>
                                            </td>
                                            <td className="text-muted">{formatDate(sale.Sale_Date)}</td>
                                            <td className="fw-bold text-end">Rs.{formatCurrency(sale.Total_Amount)}</td>
                                            <td className="fw-bold text-end text-danger">Rs.{formatCurrency(sale.Balance_Due)}</td>
                                            <td className="text-center">
                                                <span className={`badge ${daysDue > 30 ? 'bg-danger' : daysDue > 15 ? 'bg-warning' : 'bg-success'}`}>
                                                    {daysDue} days
                                                </span>
                                            </td>
                                            <td className="pe-4 text-end">
                                                <button 
                                                    className="btn btn-sm btn-light border shadow-sm rounded-3 px-3 me-2"
                                                    onClick={() => {
                                                        setSelectedSale(sale.Sale_Id);
                                                        setShowModal(true);
                                                    }}
                                                    title="View Details"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-primary shadow-sm rounded-3 px-3"
                                                    onClick={() => {
                                                        setSelectedSale(sale.Sale_Id);
                                                        setPaymentData({amount: sale.Balance_Due, method: 'Cash'});
                                                        setPaymentModal(true);
                                                    }}
                                                    title="Record Payment"
                                                >
                                                    Record Payment
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-5 text-muted fw-medium">
                                        No outstanding invoices. All payments are current!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                    <div className="card-footer bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center border-top">
                        <span className="text-muted small">
                            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                        </span>
                        <nav>
                            <ul className="pagination pagination-sm mb-0 gap-1">
                                <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link border-0 rounded-3 shadow-sm px-3" onClick={() => handlePageChange(pagination.page - 1)}>
                                        Previous
                                    </button>
                                </li>
                                {[...Array(pagination.pages)].map((_, i) => {
                                    const pageNum = i + 1;
                                    if (pageNum === 1 || pageNum === pagination.pages || (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)) {
                                        return (
                                            <li key={pageNum} className={`page-item ${pagination.page === pageNum ? 'active' : ''}`}>
                                                <button 
                                                    className={`page-link border-0 rounded-3 shadow-sm px-3 ${pagination.page === pageNum ? 'bg-primary text-white' : 'bg-light text-dark'}`}
                                                    onClick={() => handlePageChange(pageNum)}
                                                >
                                                    {pageNum}
                                                </button>
                                            </li>
                                        );
                                    }
                                    return null;
                                })}
                                <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                                    <button className="page-link border-0 rounded-3 shadow-sm px-3" onClick={() => handlePageChange(pagination.page + 1)}>
                                        Next
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>

            {/* Modals */}
            <SaleDetailsModal 
                saleId={selectedSale} 
                show={showModal}
                onClose={() => setShowModal(false)}
            />

            {/* Payment Recording Modal */}
            {paymentModal && (
                <div className="modal-overlay" onClick={() => setPaymentModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header bg-white border-bottom p-4">
                            <h5 className="fw-bold text-dark mb-0">Record Payment</h5>
                            <button className="btn btn-light border-0" onClick={() => setPaymentModal(false)}>×</button>
                        </div>
                        <div className="modal-body p-4">
                            <div className="mb-3">
                                <label className="form-label fw-bold">Payment Method</label>
                                <select 
                                    className="form-select form-select-sm"
                                    value={paymentData.method}
                                    onChange={(e) => setPaymentData({...paymentData, method: e.target.value})}
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Cheque">Cheque</option>
                                    <option value="Bank">Bank Transfer</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Amount</label>
                                <input 
                                    type="number"
                                    className="form-control form-control-sm"
                                    value={paymentData.amount}
                                    onChange={(e) => setPaymentData({...paymentData, amount: parseFloat(e.target.value)})}
                                />
                            </div>
                        </div>
                        <div className="modal-footer bg-white border-top p-4">
                            <button className="btn btn-light border" onClick={() => setPaymentModal(false)}>Cancel</button>
                            <button 
                                className="btn btn-primary"
                                onClick={() => handlePaymentSubmit(selectedSale)}
                            >
                                Record Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentCollectionPage;
