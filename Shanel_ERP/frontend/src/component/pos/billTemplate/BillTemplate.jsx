import React, { forwardRef } from "react";

import './BillTemplate.css'

const BillTemplate = forwardRef(({ cartItems, invoiceData, customerData, companyInfo, invoiceNo }, ref) => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.total || 0), 0);//reduce uses a callback function to iterate through the cartItems array and calculate the total price for each item (item.total) and adds it to the accumulated sum. The initial value of sum is set to 0.
    const tax = invoiceData?.taxAmount || 0;
    const discount = invoiceData?.discountAmount || 0;
    const total = invoiceData?.finalTotal || subtotal - discount + tax;

    return (
        <div ref={ref} className="bill-template">
            <div className="bill-header">
                <h2>RECEIPT</h2>
                <p className="company-name">{companyInfo?.name || 'Your Company Name'}</p>
                <p className="company-contact">{companyInfo?.phone || 'Phone'}</p>

            </div>
            <hr />

            <div className="row-item">
                <span>Date: </span>
                <strong>{new Date().toLocaleDateString()}</strong>

            </div>

            <div className="row-item">
                <span>Time: </span>
                <strong>{new Date().toLocaleTimeString()}</strong>
            </div>

            <div className="row-item">
                <span>Invoice No: </span>
                <strong>{invoiceNo || invoiceData?.invoiceNo || 'N/A'}</strong>
            </div>



            <hr />

            <div className="bill-section">
                <h5>Customer Information</h5>
                <div className="row-item">
                    <span>Name: </span>
                    <strong>{customerData?.c_name || customerData?.name || 'Walk-in Customer'}</strong>


                </div>
                {(customerData?.phone1 || customerData?.c_phone || customerData?.phone) && (
                    <div className="row-item">
                        <span>Phone: </span>
                        <strong>{customerData.phone1 || customerData.c_phone || customerData.phone}</strong>
                    </div>
                )}
            </div>

            <hr />

            <div className="bill-items">
                <h5>Items</h5>
                <table className="items-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Rate</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cartItems.map((item, index) => (
                            <tr key={index}>
                                <td>{item.p_name || item.name}</td>
                                <td>{item.quntity || item.quantity}</td>
                                <td>Rs.{parseFloat(item.unit_price || item.rate || 0).toFixed(2)}</td>
                                <td>Rs.{parseFloat(item.total || 0).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <hr />

            <div className="bill-summary">
                <div className="summary-row">
                    <span>Subtotal:</span>
                    <strong>Rs. {subtotal.toFixed(2)}</strong>
                </div>
                {discount > 0 && (
                    <div className="summary-row">
                        <span>Discount:</span>
                        <strong>-Rs. {discount.toFixed(2)}</strong>
                    </div>
                )}
                {tax > 0 && (
                    <div className="summary-row">
                        <span>Tax:</span>
                        <strong>Rs. {tax.toFixed(2)}</strong>
                    </div>
                )}
                <div className="summary-row total">
                    <span>TOTAL:</span>
                    <strong>Rs. {total.toFixed(2)}</strong>
                </div>
            </div>

            <hr />


            <div className="bill-footer">
                <p>Thank you for your purchase!</p>
                <p className="print-note">*** This is a computer-generated receipt ***</p>
            </div>

        </div>

    )
});


BillTemplate.displayName = 'BillTemplate';

export default BillTemplate
