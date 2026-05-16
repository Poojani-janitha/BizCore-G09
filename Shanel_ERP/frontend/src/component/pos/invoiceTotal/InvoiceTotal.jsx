import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const InvoiceTotal = ({ cartItems, onChangeInvoiceData }) => {
    const { t } = useTranslation();

    const summary = useMemo(() => {
        const items = Array.isArray(cartItems) ? cartItems : [];
        
        // Calculate totals from all items
        const totals = items.reduce((acc, item) => {
            const lineSubtotal = parseFloat(item.subTotal ?? item.total) || 0;
            const lineTaxRate = parseFloat(item.tax) || 0;
            const lineTaxAmount = parseFloat(item.taxAmount ?? (lineSubtotal * (lineTaxRate / 100))) || 0;
            const discountPercentage = parseFloat(item.discount) || 0;
            const qty = parseFloat(item.quntity || item.qty) || 0;
            const unitPrice = parseFloat(item.unit_price) || 0;
            
            // Calculate actual discount amount: (qty × unitPrice) × discount%
            // This is the discount applied BEFORE it was subtracted from the price
            const itemDiscountAmount = (qty * unitPrice) * (discountPercentage / 100);
            
            const freeQty = parseFloat(item.free) || 0;

            acc.subTotal += lineSubtotal;
            acc.taxTotal += lineTaxAmount;
            acc.count += qty;
            acc.itemDiscountTotal += itemDiscountAmount;
            acc.freeValue += (freeQty * unitPrice);
            return acc;
        }, { subTotal: 0, taxTotal: 0, count: 0, itemDiscountTotal: 0, freeValue: 0 });

        // Final total: subTotal + taxTotal (subTotal already has discount applied)
        const finalTotal = totals.subTotal + totals.taxTotal;

        return {
            subTotal: totals.subTotal,
            taxTotal: totals.taxTotal,
            count: totals.count,
            itemDiscountTotal: totals.itemDiscountTotal,
            freeValue: totals.freeValue,
            discountPercentage: 0,  // For backend - no whole-bill discount %
            discountAmount: 0,      // For backend - no whole-bill discount amount
            finalTotal: Math.max(0, finalTotal)
        };
    }, [cartItems]);

    useEffect(() => {
        if (onChangeInvoiceData) {
            onChangeInvoiceData(summary);
        }
    }, [summary, onChangeInvoiceData]);

    return (
        <div className="h-100 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="m-0 fw-bold text-primary text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>{t('invoiceTotal.title')}</h6>
                <div className="d-flex align-items-center gap-2">
                    <span className="text-muted small fw-bold">{t('invoiceTotal.items')}:</span>
                    <span className="badge bg-secondary rounded-pill px-3">{summary.count.toFixed(0)}</span>
                </div>
            </div>

            <div className="row g-2 flex-grow-1">
                {/* Item Discounts Applied */}
                <div className="col-3">
                    <div className="p-2 rounded-3 bg-white border h-100 d-flex flex-column justify-content-center shadow-sm text-center">
                        <label className="text-uppercase text-muted fw-bold mb-2" style={{ fontSize: '0.6rem' }}>{t('invoiceTotal.itemDiscounts')}</label>
                        <div className="fw-bold text-danger fs-6">
                            {summary.itemDiscountTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>

                {/* Tax */}
                <div className="col-3">
                    <div className="p-2 rounded-3 h-100 d-flex flex-column justify-content-center shadow-sm text-center border" style={{ background: '#fff5f5' }}>
                        <label className="text-uppercase text-muted fw-bold mb-1" style={{ fontSize: '0.6rem' }}>{t('invoiceTotal.taxTotal')}</label>
                        <div className="fw-bold text-dark fs-6">
                            {summary.taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>

                {/* Free Value */}
                <div className="col-3">
                    <div className="p-2 rounded-3 h-100 d-flex flex-column justify-content-center shadow-sm text-center border" style={{ background: '#f0fff4' }}>
                        <label className="text-uppercase text-muted fw-bold mb-1" style={{ fontSize: '0.6rem' }}>{t('invoiceTotal.freeValue')}</label>
                        <div className="fw-bold text-success fs-6">
                            {summary.freeValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>

                {/* Net Total */}
                <div className="col-3">
                    <div className="p-2 rounded-3 h-100 d-flex flex-column justify-content-center shadow-sm text-center border" style={{ background: '#f5f3ff', borderBottom: '3px solid #7c3aed' }}>
                        <label className="text-uppercase text-primary fw-bold mb-1" style={{ fontSize: '0.6rem' }}>{t('invoiceTotal.netTotal')}</label>
                        <div className="fw-bold text-primary fs-5">
                            {summary.finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceTotal;

// {
//   subTotal: 1050.00,              // 800 + 250
//   taxTotal: 132.50,               // 120 + 12.5
//   count: 15,                      // 10 + 5
//   itemDiscountTotal: 80.00,       // 800 × 10% = 80 (only on Milk)
//   freeValue: 200.00,              // 2 × 100 (Milk free items)
//   discountAmount: 0,              // No whole-bill discount
//   finalTotal: 1102.50             // 1050 - 80 + 132.50
// }
