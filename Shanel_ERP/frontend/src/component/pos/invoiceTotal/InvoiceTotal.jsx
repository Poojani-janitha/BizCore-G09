import React, { useEffect, useMemo, useState } from 'react';

const InvoiceTotal = ({ cartItems, onChangeInvoiceData }) => {
    const [discount, setDiscount] = useState(0);
    const [discountType, setDiscountType] = useState('percentage');

    const summary = useMemo(() => {
        const items = Array.isArray(cartItems) ? cartItems : [];
        const totals = items.reduce((acc, item) => {
            const lineSubtotal = parseFloat(item.subTotal ?? item.total) || 0;
            const lineTaxRate = parseFloat(item.tax) || 0;
            const lineTaxAmount = parseFloat(item.taxAmount ?? (lineSubtotal * (lineTaxRate / 100))) || 0;

            acc.subTotal += lineSubtotal;
            acc.taxTotal += lineTaxAmount;
            acc.count += parseFloat(item.quntity || item.qty) || 0;
            return acc;
        }, { subTotal: 0, taxTotal: 0, count: 0 });

        let discountAmount = 0;
        if (discountType === 'percentage') {
            discountAmount = totals.subTotal * (parseFloat(discount) / 100 || 0);
        } else {
            discountAmount = parseFloat(discount) || 0;
        }

        const finalTotal = totals.subTotal - discountAmount + totals.taxTotal;

        return {
            subTotal: totals.subTotal,
            taxTotal: totals.taxTotal,
            count: totals.count,
            discountValue: discount,
            discountType: discountType,
            discountAmount: discountAmount,
            finalTotal: Math.max(0, finalTotal)
        };
    }, [cartItems, discount, discountType]);

    useEffect(() => {
        if (onChangeInvoiceData) {
            onChangeInvoiceData(summary);
        }
    }, [summary, onChangeInvoiceData]);

    return (
        <div className="h-100 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="m-0 fw-bold text-primary text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Invoice Summary</h6>
                <div className="d-flex align-items-center gap-2">
                    <span className="text-muted small fw-bold">Items:</span>
                    <span className="badge bg-secondary rounded-pill px-3">{summary.count.toFixed(0)}</span>
                </div>
            </div>

            <div className="row g-2 flex-grow-1">
                {/* Discount */}
                <div className="col-3">
                    <div className="p-2 rounded-3 bg-white border h-100 d-flex flex-column justify-content-center shadow-sm text-center">
                        <label className="text-uppercase text-muted fw-bold mb-2" style={{ fontSize: '0.6rem' }}>Discount</label>
                        <div className="input-group input-group-sm px-1">
                            <input type="number" className="form-control form-control-sm text-center fw-bold border-0 bg-light"
                                value={discount} onChange={(e) => setDiscount(e.target.value)} onFocus={(e) => e.target.select()} />
                            <select className="form-select form-select-sm border-0 bg-light fw-bold" style={{ maxWidth: '45px', fontSize: '0.65rem' }}
                                value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
                                <option value="percentage">%</option>
                                <option value="amount">Rs</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tax */}
                <div className="col-3">
                    <div className="p-2 rounded-3 h-100 d-flex flex-column justify-content-center shadow-sm text-center border" style={{ background: '#fff5f5' }}>
                        <label className="text-uppercase text-muted fw-bold mb-1" style={{ fontSize: '0.6rem' }}>Tax Total</label>
                        <div className="fw-bold text-dark fs-6">
                            {summary.taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>

                {/* Free Value */}
                <div className="col-3">
                    <div className="p-2 rounded-3 h-100 d-flex flex-column justify-content-center shadow-sm text-center border" style={{ background: '#f0fff4' }}>
                        <label className="text-uppercase text-muted fw-bold mb-1" style={{ fontSize: '0.6rem' }}>Free Value</label>
                        <div className="fw-bold text-success fs-6">0.00</div>
                    </div>
                </div>

                {/* Net Total */}
                <div className="col-3">
                    <div className="p-2 rounded-3 h-100 d-flex flex-column justify-content-center shadow-sm text-center border" style={{ background: '#f5f3ff', borderBottom: '3px solid #7c3aed' }}>
                        <label className="text-uppercase text-primary fw-bold mb-1" style={{ fontSize: '0.6rem' }}>Net Total</label>
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