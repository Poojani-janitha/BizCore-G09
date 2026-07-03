/**
 * SaleDetailsModal Component
 * 
 * Modal for viewing detailed sale information
 * Shows invoice details, items, payments, and customer info
 */

import React, { useState, useEffect } from 'react';
import { X, Eye, Printer, AlertCircle } from 'react-feather';
import { fetchSaleDetails, formatCurrency, formatDate, getPaymentStatusClass } from '../../../services/salesManagementService';
import './SaleDetailsModal.css';

const SaleDetailsModal = ({ saleId, show, onClose }) => {
    const [sale, setSale] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (show && saleId) {
            fetchSaleDetail();
        }
    }, [show, saleId]);

    const fetchSaleDetail = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetchSaleDetails(saleId);
            if (response.success) {
                setSale(response.data);
            }
        } catch (err) {
            setError(err.message || 'Error loading sale details');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="modal-header bg-white border-bottom d-flex justify-content-between align-items-center p-4">
                    <div>
                        <h5 className="fw-bold text-dark mb-1">Sale Invoice Details</h5>
                        <small className="text-muted">Complete transaction information and breakdown</small>
                    </div>
                    <button className="btn btn-light border-0 p-2 rounded-circle" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="modal-body p-4 overflow-auto" style={{maxHeight: 'calc(90vh - 200px)'}}>
                    {loading && (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="text-muted mt-2 small">Loading sale details...</p>
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-danger border-0 rounded-4 d-flex gap-3 align-items-start" role="alert">
                            <AlertCircle size={20} className="flex-shrink-0 mt-1" />
                            <div>
                                <strong>Error</strong>
                                <p className="mb-0 small">{error}</p>
                            </div>
                        </div>
                    )}

                    {sale && !loading && (
                        <>
                            {/* Invoice Header */}
                            <div className="row mb-4 pb-4 border-bottom">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <small className="text-muted fw-bold text-uppercase d-block" style={{fontSize: '10px'}}>Invoice Number</small>
                                        <h6 className="fw-bold text-primary mb-0">{sale.Invoice_No}</h6>
                                    </div>
                                    <div className="mb-3">
                                        <small className="text-muted fw-bold text-uppercase d-block" style={{fontSize: '10px'}}>Sale Date</small>
                                        <p className="fw-medium mb-0">{formatDate(sale.Sale_Date)}</p>
                                    </div>
                                    <div>
                                        <small className="text-muted fw-bold text-uppercase d-block" style={{fontSize: '10px'}}>Location</small>
                                        <span className={`badge rounded-pill px-3 py-2 fw-bold ${sale.Location === 'Shop' ? 'bg-primary-subtle text-primary' : sale.Location === 'Production' ? 'bg-info-subtle text-info' : 'bg-warning-subtle text-warning'}`}>
                                            {sale.Location}
                                        </span>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <small className="text-muted fw-bold text-uppercase d-block" style={{fontSize: '10px'}}>Payment Status</small>
                                        <span className={`badge border rounded-pill px-3 py-2 fw-bold ${getPaymentStatusClass(sale.Payment_Status)}`}>
                                            {sale.Payment_Status?.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="mb-3">
                                        <small className="text-muted fw-bold text-uppercase d-block" style={{fontSize: '10px'}}>Sale Type</small>
                                        <span className={`badge rounded-pill px-3 py-2 fw-bold ${sale.Sale_Type === 'Retail' ? 'bg-success-subtle text-success' : 'bg-info-subtle text-info'}`}>
                                            {sale.Sale_Type}
                                        </span>
                                    </div>
                                    <div>
                                        <small className="text-muted fw-bold text-uppercase d-block" style={{fontSize: '10px'}}>Customer</small>
                                        <p className="fw-medium mb-0">{sale.Customer?.C_Name || 'Walking Customer'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Sale Items */}
                            <div className="mb-4">
                                <h6 className="fw-bold text-dark mb-3">Sale Items</h6>
                                <div className="table-responsive">
                                    <table className="table table-sm table-borderless">
                                        <thead className="bg-light">
                                            <tr>
                                                <th className="py-2 text-uppercase small fw-bold text-muted" style={{fontSize: '10px'}}>Product</th>
                                                <th className="py-2 text-uppercase small fw-bold text-muted text-end" style={{fontSize: '10px'}}>Qty</th>
                                                <th className="py-2 text-uppercase small fw-bold text-muted text-center" style={{fontSize: '10px'}}>Unit</th>
                                                <th className="py-2 text-uppercase small fw-bold text-muted text-end" style={{fontSize: '10px'}}>Unit Price</th>
                                                <th className="py-2 text-uppercase small fw-bold text-muted text-end" style={{fontSize: '10px'}}>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sale.SaleItems?.map((item, idx) => (
                                                <tr key={idx} className="border-bottom">
                                                    <td className="py-3">
                                                        <small className="fw-medium text-dark">{item.Product?.P_Name || 'Unknown Product'}</small>
                                                    </td>
                                                    <td className="py-3 text-end fw-medium">{item.Quantity}</td>
                                                    <td className="py-3 text-center fw-medium">
                                                        <small className="badge bg-info-subtle text-info">
                                                            {item.UnitConversion?.Unit_Name || 'N/A'}
                                                        </small>
                                                    </td>
                                                    <td className="py-3 text-end fw-medium">Rs.{formatCurrency(item.Unit_Price)}</td>
                                                    <td className="py-3 text-end fw-bold">Rs.{formatCurrency(item.Quantity * item.Unit_Price)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Payment Details Breakdown */}
                            {sale.Payments && sale.Payments.length > 0 && (
                                <div className="mb-4">
                                    <h6 className="fw-bold text-dark mb-3">Payment Details</h6>
                                    <div className="row g-3">
                                        {/* Cash */}
                                        <div className="col-md-4">
                                            <div className="bg-success-subtle rounded-3 p-3 border border-success-subtle">
                                                <small className="text-muted fw-bold text-uppercase d-block" style={{fontSize: '10px'}}>Cash Received</small>
                                                <h6 className="fw-bold text-success mb-0">
                                                    Rs.{formatCurrency(
                                                        sale.Payments.filter(p => p.Payment_Method === 'Cash').reduce((sum, p) => sum + parseFloat(p.Payment_Amount || 0), 0)
                                                    )}
                                                </h6>
                                            </div>
                                        </div>

                                        {/* Cheque */}
                                        <div className="col-md-4">
                                            <div className="bg-info-subtle rounded-3 p-3 border border-info-subtle">
                                                <small className="text-muted fw-bold text-uppercase d-block" style={{fontSize: '10px'}}>Cheque</small>
                                                <h6 className="fw-bold text-info mb-0">
                                                    Rs.{formatCurrency(
                                                        sale.Payments.filter(p => p.Payment_Method === 'Cheque').reduce((sum, p) => sum + parseFloat(p.Payment_Amount || 0), 0)
                                                    )}
                                                </h6>
                                            </div>
                                        </div>

                                        {/* Bank Transfer */}
                                        <div className="col-md-4">
                                            <div className="bg-warning-subtle rounded-3 p-3 border border-warning-subtle">
                                                <small className="text-muted fw-bold text-uppercase d-block" style={{fontSize: '10px'}}>Bank Transfer</small>
                                                <h6 className="fw-bold text-warning mb-0">
                                                    Rs.{formatCurrency(
                                                        sale.Payments.filter(p => p.Payment_Method === 'Bank Transfer').reduce((sum, p) => sum + parseFloat(p.Payment_Amount || 0), 0)
                                                    )}
                                                </h6>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Financial Summary */}
                            <div className="bg-light rounded-4 p-4 mb-4">
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="text-muted small fw-bold">Subtotal:</span>
                                            <span className="fw-bold">Rs.{formatCurrency(sale.Total_Amount)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="text-muted small fw-bold">Discount:</span>
                                            <span className="fw-bold text-danger">- Rs.{formatCurrency(sale.Discount_Amount)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="text-muted small fw-bold">Tax:</span>
                                            <span className="fw-bold text-success">+ Rs.{formatCurrency(sale.Tax_Amount)}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="bg-white rounded-3 p-3 border border-2 border-primary">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="text-muted small fw-bold">Total Amount:</span>
                                                <h6 className="fw-bold text-primary mb-0">Rs.{formatCurrency(sale.Total_Amount + sale.Tax_Amount - sale.Discount_Amount)}</h6>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="text-muted small fw-bold">Paid Amount:</span>
                                                <span className="fw-bold text-success">Rs.{formatCurrency(sale.Paid_Amount)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="text-muted small fw-bold">Balance Due:</span>
                                                <span className={`fw-bold ${sale.Balance_Due > 0 ? 'text-danger' : 'text-success'}`}>Rs.{formatCurrency(sale.Balance_Due)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Details */}
                            {sale.Customer && (
                                <div className="bg-light rounded-4 p-4">
                                    <h6 className="fw-bold text-dark mb-3">Customer Information</h6>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <small className="text-muted fw-bold text-uppercase d-block" style={{fontSize: '10px'}}>Name</small>
                                            <p className="fw-medium mb-0">{sale.Customer.C_Name}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <small className="text-muted fw-bold text-uppercase d-block" style={{fontSize: '10px'}}>Phone</small>
                                            <p className="fw-medium mb-0">{sale.Customer.Phone1 || 'N/A'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <small className="text-muted fw-bold text-uppercase d-block" style={{fontSize: '10px'}}>Email</small>
                                            <p className="fw-medium mb-0">{sale.Customer.Email || 'N/A'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <small className="text-muted fw-bold text-uppercase d-block" style={{fontSize: '10px'}}>Address</small>
                                            <p className="fw-medium mb-0">{sale.Customer.C_Address || 'N/A'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <small className="text-muted fw-bold text-uppercase d-block" style={{fontSize: '10px'}}>Customer Type</small>
                                            <p className="fw-medium mb-0">{sale.Customer.Customer_Type || 'N/A'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <small className="text-muted fw-bold text-uppercase d-block" style={{fontSize: '10px'}}>Outstanding Balance</small>
                                            <p className={`fw-bold mb-0 ${sale.Customer.Current_Balance > 0 ? 'text-danger' : 'text-success'}`}>
                                                Rs.{formatCurrency(sale.Customer.Current_Balance || 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="modal-footer bg-white border-top p-4 d-flex gap-2 justify-content-end">
                    <button className="btn btn-light border shadow-sm rounded-3 px-4 d-flex align-items-center gap-2" onClick={onClose}>
                        Close
                    </button>
                    <button className="btn btn-primary shadow-sm rounded-3 px-4 d-flex align-items-center gap-2">
                        <Printer size={16} /> Print Invoice
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaleDetailsModal;
