import React, { forwardRef } from "react";
import './BillTemplate.css';
import companyLogo from '../../../assets/buisness logo2.png';

const toNumber = (value) => parseFloat(value) || 0;

const BillTemplate = forwardRef(({ cartItems = [], invoiceData, customerData, invoiceNo }, ref) => {
    // Calculate total prices and discounts matching the screenshot layout
    const totalGross = cartItems.reduce((sum, item) => sum + (toNumber(item.quntity) * toNumber(item.unit_price)), 0);
    const totalDiscount = cartItems.reduce((sum, item) => sum + ((toNumber(item.quntity) * toNumber(item.unit_price)) * (toNumber(item.discount) / 100)), 0);
    const netAmount = invoiceData?.finalTotal || (totalGross - totalDiscount);

    return (
        <div ref={ref} className="bill-container">
            {/* Logo and Company Details Row */}
            <div className="bill-header-row">
                <div className="brand-logo-container">
                    <img 
                        src={companyLogo} 
                        alt="Shanel products" 
                        className="logo-img" 
                        style={{ width: '90px', height: '90px', objectFit: 'contain' }} 
                    />
                </div>
                <div className="company-details">
                    <h1 className="brand-title">Shanel products</h1>
                    <p className="details-text font-semibold">R.A.B.Erandi Wansapala</p>
                    <p className="details-text">Udawela Morahela Balangoda</p>
                    <p className="details-text">Re.no.ර/ඉඹු/001924</p>
                    <p className="details-text">0773174234 / Watsap 0714676762</p>
                </div>
            </div>

            {/* Bill No, Date and Customer Name Meta Block */}
            <div className="bill-meta-block">
                <div className="meta-single-row">
                    <div className="meta-field customer-field">
                        <span className="meta-label">Customer Name:</span>
                        <span className="meta-value">{customerData?.c_name || customerData?.name || 'Walk-in Customer'}</span>
                    </div>
                    <div className="meta-fields-right">
                        <div className="meta-field">
                            <span className="meta-label">Bill No:</span>
                            <span className="meta-value">{invoiceNo || invoiceData?.invoiceNo || '—'}</span>
                        </div>
                        <div className="meta-field">
                            <span className="meta-label">Date:</span>
                            <span className="meta-value">{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid Table of Bill Items */}
            <div className="bill-table-wrapper">
                <table className="bill-items-table">
                    <thead>
                        <tr>
                            <th className="col-name">Item Name</th>
                            <th className="col-unit text-center">Unit</th>
                            <th className="col-price text-end">Price (Rs.)</th>
                            <th className="col-discount text-center">Discount (%)</th>
                            <th className="col-total text-end">Total (Rs.)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cartItems.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center py-4 text-muted">No items in invoice</td>
                            </tr>
                        ) : (
                            cartItems.map((item, index) => (
                                <tr key={index}>
                                    <td className="col-name">{item.p_name || item.name}</td>
                                    <td className="col-unit text-center">{item.p_unit || 'Packet'}</td>
                                    <td className="col-price text-end">
                                        {toNumber(item.unit_price).toFixed(2)}
                                    </td>
                                    <td className="col-discount text-center">
                                        {toNumber(item.discount) > 0 ? `${toNumber(item.discount)}%` : '—'}
                                    </td>
                                    <td className="col-total text-end">
                                        {toNumber(item.total).toFixed(2)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Summary Totals Right Aligned */}
            <div className="bill-summary-block">
                <div className="summary-row-item">
                    <span className="summary-label">Total Amount:</span>
                    <span className="summary-value">Rs. {totalGross.toFixed(2)}</span>
                </div>
                <div className="summary-row-item">
                    <span className="summary-label">Discount Received:</span>
                    <span className="summary-value">Rs. {totalDiscount.toFixed(2)}</span>
                </div>
                <div className="summary-row-item net-total">
                    <span className="summary-label">Net Amount:</span>
                    <span className="summary-value">Rs. {netAmount.toFixed(2)}</span>
                </div>
            </div>

            {/* Bottom Signatures Row */}
            <div className="bill-signatures-block">
                <div className="signature-column">
                    <div className="sig-line"></div>
                    <span className="sig-label">Customer Signature</span>
                </div>
                <div className="signature-column">
                    <div className="sig-line"></div>
                    <span className="sig-label">Issued by Signature</span>
                </div>
            </div>
        </div>
    );
});

BillTemplate.displayName = 'BillTemplate';

export default BillTemplate;
