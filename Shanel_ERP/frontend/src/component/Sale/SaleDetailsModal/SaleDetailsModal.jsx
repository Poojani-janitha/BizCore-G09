/**
 * SaleDetailsModal Component
 * 
 * Premium Modal for viewing detailed sale information
 * Shows invoice details, items, payments breakdown, and customer info
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
    X, Printer, AlertCircle, Calendar, Hash, MapPin, 
    Layers, User, Phone, Mail, Home, DollarSign, 
    CheckSquare, CreditCard, Clock, Shield, Award
} from 'react-feather';
import { useReactToPrint } from 'react-to-print';
import { useTranslation } from 'react-i18next';
import BillTemplate from '../../pos/billTemplate/BillTemplate';
import { fetchSaleDetails, formatCurrency, formatDate, getPaymentStatusClass } from '../../../services/salesManagementService';
import './SaleDetailsModal.css';

const SaleDetailsModal = ({ saleId, show, onClose }) => {
    const { t } = useTranslation();
    const [sale, setSale] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const printRef = useRef(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: sale ? `Invoice_${sale.Invoice_No}` : 'Invoice',
        pageStyle: `@page { size: auto; margin: 0; }`
    });

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

    // Helper to calculate payment method breakdown safely (handles both explicit columns and method string fallbacks)
    const getPaymentBreakdown = (payments = []) => {
        let cash = 0;
        let cheque = 0;
        let bank = 0;
        let credit = 0;

        payments.forEach(p => {
            if (p.Status === 'Void') return; // Skip voided/cancelled payments

            const amt = parseFloat(p.Payment_Amount || 0);
            const cashAmt = parseFloat(p.Cash_Amount || 0);
            const chequeAmt = parseFloat(p.Cheque_Amount || 0);
            const bankAmt = parseFloat(p.Bank_Transfer_Amount || 0);
            const creditAmt = parseFloat(p.Credit_Amount || 0);

            if (cashAmt || chequeAmt || bankAmt || creditAmt) {
                cash += cashAmt;
                cheque += chequeAmt;
                bank += bankAmt;
                credit += creditAmt;
            } else {
                // Fallback using Payment_Method string
                const method = p.Payment_Method || '';
                if (method === 'Cash') cash += amt;
                else if (method === 'Cheque') cheque += amt;
                else if (method === 'Bank_Transfer' || method === 'Bank Transfer' || method === 'Bank') bank += amt;
                else if (method === 'Credit') credit += amt;
            }
        });

        return { cash, cheque, bank, credit };
    };

    if (!show) return null;

    const paymentBreakdown = sale ? getPaymentBreakdown(sale.Payments) : { cash: 0, cheque: 0, bank: 0, credit: 0 };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="modal-header bg-white border-bottom d-flex justify-content-between align-items-center p-4">
                    <div>
                        <h5 className="fw-bold text-dark mb-1">{t('sales.details.title')}</h5>
                        <small className="text-muted">{t('sales.details.subtitle')}</small>
                    </div>
                    <button className="btn btn-light border-0 p-2 rounded-circle shadow-sm" onClick={onClose}>
                        <X size={18} className="text-secondary" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="modal-body p-4 overflow-auto">
                    {loading && (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="text-muted mt-3 small fw-bold text-uppercase">{t('inventory.table.loading')}</p>
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-danger border-0 rounded-4 d-flex gap-3 align-items-start p-3" role="alert">
                            <AlertCircle size={20} className="flex-shrink-0 mt-0.5 text-danger" />
                            <div>
                                <strong className="text-dark">{t('inventory.table.error')}</strong>
                                <p className="mb-0 small text-muted mt-1">{error}</p>
                            </div>
                        </div>
                    )}

                    {sale && !loading && (
                        <>
                            {/* Metadata Overview Cards */}
                            <div className="row g-3 mb-4">
                                {/* Invoice & Date Metadata */}
                                <div className="col-md-6">
                                    <div className="info-card-premium h-100">
                                        <h6 className="fw-bold text-dark mb-3 small text-uppercase tracking-wider" style={{fontSize: '11px'}}>{t('sales.details.invoice_info')}</h6>
                                        <div className="metadata-grid">
                                            <div className="metadata-item">
                                                <div className="metadata-details">
                                                    <span className="metadata-label">{t('sales.invoice_no')}</span>
                                                    <span className="metadata-value text-primary">{sale.Invoice_No}</span>
                                                </div>
                                            </div>
                                            <div className="metadata-item">
                                                <div className="metadata-details">
                                                    <span className="metadata-label">{t('sales.date')}</span>
                                                    <span className="metadata-value">{formatDate(sale.Sale_Date)} {sale.Sale_Time || ''}</span>
                                                </div>
                                            </div>
                                            <div className="metadata-item">
                                                <div className="metadata-details">
                                                    <span className="metadata-label">{t('sales.location')}</span>
                                                    <span className="metadata-value">{sale.Location}</span>
                                                </div>
                                            </div>
                                            <div className="metadata-item">
                                                <div className="metadata-details">
                                                    <span className="metadata-label">{t('sales.status')}</span>
                                                    <span className={`badge rounded-pill px-2.5 py-1 fw-bold ${sale.Status === 'Void' ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`} style={{fontSize: '10px', width: 'fit-content'}}>
                                                        {sale.Status === 'Void' ? t('sales.void').toUpperCase() : t('sales.active').toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Billing Level & Payment Status */}
                                <div className="col-md-6">
                                    <div className="info-card-premium h-100">
                                        <h6 className="fw-bold text-dark mb-3 small text-uppercase tracking-wider" style={{fontSize: '11px'}}>{t('sales.details.billing_status')}</h6>
                                        <div className="metadata-grid">
                                            <div className="metadata-item">
                                                <div className="metadata-details">
                                                    <span className="metadata-label">{t('sales.payment_status')}</span>
                                                    <span className={`badge border rounded-pill px-2 py-1 fw-bold ${getPaymentStatusClass(sale.Payment_Status)}`} style={{fontSize: '10px', width: 'fit-content'}}>
                                                        {sale.Payment_Status === 'Paid' ? t('sales.paid') : sale.Payment_Status === 'Unpaid' ? t('sales.unpaid') : sale.Payment_Status === 'Partially_Paid' ? t('sales.partially_paid') : sale.Payment_Status?.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="metadata-item">
                                                <div className="metadata-details">
                                                    <span className="metadata-label">{t('sales.type')}</span>
                                                    <span className={`badge rounded-pill px-2.5 py-1 fw-bold ${sale.Sale_Type === 'Retail' ? 'bg-success-subtle text-success' : 'bg-info-subtle text-info'}`} style={{fontSize: '10px', width: 'fit-content'}}>
                                                        {sale.Sale_Type === 'Retail' ? t('sales.retail') : t('sales.wholesale')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="metadata-item">
                                                <div className="metadata-details">
                                                    <span className="metadata-label">{t('customerForm.priceLevel')}</span>
                                                    <span className="metadata-value">{sale.Price_Level === 'Retail' ? t('sales.retail') : sale.Price_Level === 'Wholesale' ? t('sales.wholesale') : sale.Price_Level}</span>
                                                </div>
                                            </div>
                                            <div className="metadata-item">
                                                <div className="metadata-details">
                                                    <span className="metadata-label">{t('sales.print_status')}</span>
                                                    <span className="metadata-value">{sale.Bill_Printed ? t('sales.printed') : t('sales.not_printed')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sale Items Table */}
                            <div className="mb-4">
                                <h6 className="fw-bold text-dark mb-3 small text-uppercase tracking-wider" style={{fontSize: '11px', letterSpacing: '0.5px'}}>{t('sales.details.line_items')}</h6>
                                <div className="table-responsive-custom">
                                    <table className="table table-custom-premium align-middle">
                                        <thead>
                                            <tr>
                                                <th>{t('itemTable.description')}</th>
                                                <th className="text-end">{t('itemTable.qty')}</th>
                                                <th className="text-center">{t('itemTable.unit')}</th>
                                                <th className="text-end">{t('itemTable.price')}</th>
                                                <th className="text-end">{t('itemTable.total')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sale.SaleItems?.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td>
                                                        <span className="fw-bold text-dark d-block">{item.Product?.P_Name || 'Unknown Product'}</span>
                                                        <small className="text-muted">{item.Product?.P_Code || '—'}</small>
                                                    </td>
                                                    <td className="text-end fw-semibold">{parseFloat(item.Quantity).toLocaleString()}</td>
                                                    <td className="text-center">
                                                        <span className="badge bg-secondary-subtle text-secondary rounded-pill px-2.5 py-1 fw-bold" style={{fontSize: '10px'}}>
                                                            {item.UnitConversion?.Unit_Name || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="text-end fw-semibold">Rs.{formatCurrency(item.Unit_Price)}</td>
                                                    <td className="text-end fw-bold text-dark">Rs.{formatCurrency(item.Line_Total || (item.Quantity * item.Unit_Price))}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Payment Breakdown Cards */}
                            <div className="mb-4">
                                <h6 className="fw-bold text-dark mb-3 small text-uppercase tracking-wider" style={{fontSize: '11px', letterSpacing: '0.5px'}}>{t('sales.details.payment_breakdown')}</h6>
                                <div className="row g-3">
                                    {/* Cash */}
                                    <div className="col-md-3 col-sm-6">
                                        <div className="payment-card-premium cash">
                                            <div className="payment-icon-circle"><DollarSign size={15} /></div>
                                            <div className="d-flex flex-column">
                                                <small className="text-muted fw-bold" style={{fontSize: '9px', textTransform: 'uppercase'}}>{t('paymentMethod.cashTendered')}</small>
                                                <span className="fw-bold text-success" style={{fontSize: '13px'}}>Rs.{formatCurrency(paymentBreakdown.cash)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cheque */}
                                    <div className="col-md-3 col-sm-6">
                                        <div className="payment-card-premium cheque">
                                            <div className="payment-icon-circle"><CheckSquare size={15} /></div>
                                            <div className="d-flex flex-column">
                                                <small className="text-muted fw-bold" style={{fontSize: '9px', textTransform: 'uppercase'}}>{t('paymentMethod.cheque')}</small>
                                                <span className="fw-bold text-info" style={{fontSize: '13px'}}>Rs.{formatCurrency(paymentBreakdown.cheque)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bank Transfer */}
                                    <div className="col-md-3 col-sm-6">
                                        <div className="payment-card-premium bank">
                                            <div className="payment-icon-circle"><CreditCard size={15} /></div>
                                            <div className="d-flex flex-column">
                                                <small className="text-muted fw-bold" style={{fontSize: '9px', textTransform: 'uppercase'}}>{t('paymentMethod.bankTransfer')}</small>
                                                <span className="fw-bold text-warning" style={{fontSize: '13px'}}>Rs.{formatCurrency(paymentBreakdown.bank)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Credit Outstanding */}
                                    <div className="col-md-3 col-sm-6">
                                        <div className="payment-card-premium credit">
                                            <div className="payment-icon-circle"><Clock size={15} /></div>
                                            <div className="d-flex flex-column">
                                                <small className="text-muted fw-bold" style={{fontSize: '9px', textTransform: 'uppercase'}}>{t('paymentMethod.creditAmount')}</small>
                                                <span className="fw-bold text-danger" style={{fontSize: '13px'}}>Rs.{formatCurrency(paymentBreakdown.credit)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Financial Summary & Customer Row */}
                            <div className="row g-4 mb-2">
                                {/* Left Side: Customer Info panel */}
                                <div className="col-md-6">
                                    {sale.Customer ? (
                                        <div className="info-card-premium h-100">
                                            <h6 className="fw-bold text-dark mb-3 small text-uppercase tracking-wider" style={{fontSize: '11px'}}>{t('sales.details.customer_info')}</h6>
                                            <div className="metadata-grid">
                                                <div className="metadata-item">
                                                    <div className="metadata-icon-wrapper"><User size={13} /></div>
                                                    <div className="metadata-details">
                                                        <span className="metadata-label">{t('customerForm.customerName')}</span>
                                                        <span className="metadata-value">{sale.Customer.C_Name}</span>
                                                    </div>
                                                </div>
                                                <div className="metadata-item">
                                                    <div className="metadata-icon-wrapper"><Phone size={13} /></div>
                                                    <div className="metadata-details">
                                                        <span className="metadata-label">{t('customerForm.phone1')}</span>
                                                        <span className="metadata-value">{sale.Customer.Phone1 || 'N/A'}</span>
                                                    </div>
                                                </div>
                                                <div className="metadata-item" style={{gridColumn: 'span 2'}}>
                                                    <div className="metadata-icon-wrapper"><Mail size={13} /></div>
                                                    <div className="metadata-details">
                                                        <span className="metadata-label">{t('customerForm.email')}</span>
                                                        <span className="metadata-value">{sale.Customer.Email || 'N/A'}</span>
                                                    </div>
                                                </div>
                                                <div className="metadata-item" style={{gridColumn: 'span 2'}}>
                                                    <div className="metadata-icon-wrapper"><Home size={13} /></div>
                                                    <div className="metadata-details">
                                                        <span className="metadata-label">{t('customerForm.address')}</span>
                                                        <span className="metadata-value">{sale.Customer.Address || sale.Customer.C_Address || 'N/A'}</span>
                                                    </div>
                                                </div>
                                                <div className="metadata-item">
                                                    <span className="metadata-label">{t('customerForm.customerType')}</span>
                                                    <span className="metadata-value">{sale.Customer.Customer_Type || 'Retail'}</span>
                                                </div>
                                                <div className="metadata-item">
                                                    <span className="metadata-label">{t('informationBox.outstandingBalance')}</span>
                                                    <span className={`fw-bold ${parseFloat(sale.Customer.Current_Balance) > 0 ? 'text-danger' : 'text-success'}`}>
                                                        Rs.{formatCurrency(sale.Customer.Current_Balance)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="info-card-premium h-100 d-flex align-items-center justify-content-center text-muted py-5 small">
                                            <User size={20} className="me-2 opacity-50" /> Walking Customer Details (Non-registered)
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Symmetrical calculations & Balance highlight */}
                                <div className="col-md-6">
                                    <div className="financial-summary-premium h-100 d-flex flex-column justify-content-between gap-3">
                                        <div className="d-flex flex-column gap-2">
                                            <div className="summary-row-premium">
                                                <span className="summary-label">{t('invoiceTotal.netTotal')}</span>
                                                <span className="summary-value">Rs.{formatCurrency(parseFloat(sale.Subtotal || sale.Total_Amount))}</span>
                                            </div>
                                            <div className="summary-row-premium">
                                                <span className="summary-label">{t('invoiceTotal.itemDiscounts')}</span>
                                                <span className="summary-value text-danger">- Rs.{formatCurrency(sale.Discount_Amount)}</span>
                                            </div>
                                            <div className="summary-row-premium">
                                                <span className="summary-label">{t('invoiceTotal.taxTotal')}</span>
                                                <span className="summary-value text-success">+ Rs.{formatCurrency(sale.Tax_Amount)}</span>
                                            </div>
                                        </div>

                                        <div className="total-due-card-premium d-flex flex-column gap-2">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="summary-label small fw-bold">{t('sales.details.grand_total')}</span>
                                                <h5 className="fw-bold mb-0 text-white" style={{fontSize: '18px'}}>Rs.{formatCurrency(sale.Total_Amount)}</h5>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="summary-label small">{t('sales.details.amount_paid')}</span>
                                                <span className="fw-bold text-success-light" style={{color: '#4ade80'}}>Rs.{formatCurrency(sale.Paid_Amount)}</span>
                                            </div>
                                            <div className="border-top pt-2 mt-1 d-flex justify-content-between align-items-center">
                                                <span className="summary-label small fw-bold">{t('sales.details.balance_due')}</span>
                                                <span className={`fw-bold ${parseFloat(sale.Balance_Due) > 0 ? 'text-warning' : 'text-success-light'}`} style={parseFloat(sale.Balance_Due) > 0 ? {color: '#f87171'} : {color: '#4ade80'}}>
                                                    Rs.{formatCurrency(sale.Balance_Due)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="modal-footer bg-white border-top p-4 d-flex gap-2 justify-content-end">
                    <button className="btn btn-light border shadow-sm rounded-3 px-4 d-flex align-items-center gap-2" onClick={onClose} style={{fontWeight: '600', fontSize: '13px'}}>
                        {t('customerForm.cancel').replace('Cancel', 'Close')}
                    </button>
                    <button className="btn btn-primary shadow-sm rounded-3 px-4 d-flex align-items-center gap-2" onClick={handlePrint} disabled={!sale || loading} style={{fontWeight: '600', fontSize: '13px'}}>
                        <Printer size={15} /> {t('actionButtons.print').replace('PRINT (F10)', 'Print Invoice')}
                    </button>
                </div>
            </div>

            {/* Hidden printing layout */}
            <div style={{ display: 'none' }}>
                {sale && (
                    <BillTemplate
                        ref={printRef}
                        cartItems={(sale.SaleItems || []).map(item => ({
                            p_name: item.Product?.P_Name || 'Unknown Product',
                            p_unit: item.UnitConversion?.Unit_Name || 'Packet',
                            quntity: parseFloat(item.Quantity || 0),
                            unit_price: parseFloat(item.Unit_Price || 0),
                            discount: parseFloat(item.Line_Discount_Percentage || 0),
                            total: parseFloat(item.Line_Total || 0)
                        }))}
                        invoiceData={{
                            finalTotal: parseFloat(sale.Total_Amount || 0) + parseFloat(sale.Tax_Amount || 0) - parseFloat(sale.Discount_Amount || 0),
                            invoiceNo: sale.Invoice_No
                        }}
                        customerData={{
                            c_name: sale.Customer?.C_Name || 'Walk-in Customer'
                        }}
                        invoiceNo={sale.Invoice_No}
                    />
                )}
            </div>
        </div>
    );
};

export default SaleDetailsModal;
