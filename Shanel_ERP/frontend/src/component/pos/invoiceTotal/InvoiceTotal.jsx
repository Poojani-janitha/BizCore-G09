import React, { useEffect, useMemo, useState } from 'react';

const InvoiceTotal = ({ cartItems, onChangeInvoiceData }) => {
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('percentage'); // 'percentage' or 'amount'

    

  const summary = useMemo(() => {
    const items = Array.isArray(cartItems) ? cartItems : [];

    // 1. Sum up basic values from cart
    const totals = items.reduce((acc, item) => {
      const lineSubtotal = parseFloat(item.subTotal ?? item.total) || 0; //use subTotal if available, otherwise fallback to total
      const lineTaxRate = parseFloat(item.tax) || 0;
      const lineTaxAmount = parseFloat(item.taxAmount ?? (lineSubtotal * (lineTaxRate / 100))) || 0;

      acc.subTotal += lineSubtotal;
      acc.taxTotal += lineTaxAmount;
      acc.count += parseFloat(item.quntity || item.qty) || 0;
      return acc;
    }, { subTotal: 0, taxTotal: 0, count: 0 });

    // 2. Calculate Discount
    let discountAmount = 0;
    if (discountType === 'percentage') {
      discountAmount = totals.subTotal * (parseFloat(discount) / 100 || 0);
    } else {
      discountAmount = parseFloat(discount) || 0;
    }

    // 3. Calculate Final Total
    const finalTotal = totals.subTotal - discountAmount + totals.taxTotal;

    // 4. Get current date and time
    const now = new Date();
    const invoiceDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    const invoiceTime = now.toTimeString().split(' ')[0]; // HH:MM:SS format

    return {
      subTotal: totals.subTotal,
      taxTotal: totals.taxTotal,
      count: totals.count,
      discountValue: discount,
      discountType: discountType,
      discountAmount: discountAmount,
      finalTotal: Math.max(0, finalTotal),
      invoiceDate: invoiceDate,
      invoiceTime: invoiceTime


    };
  }, [cartItems, discount, discountType]);

  // 4. Correct placement of useEffect (Outside useMemo)
  useEffect(() => {
    if (onChangeInvoiceData) {
      onChangeInvoiceData(summary);
    }
  }, [summary, onChangeInvoiceData]);

    return (
        <div className="h-100 d-flex flex-column" style={{ borderRadius: '8px' }}>
            {/* Header and Piece Count Row */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="m-0 fw-bold text-primary text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                    Invoice Summary
                </h6>
                <div className="d-flex align-items-center gap-2">
                    <span className="text-muted small fw-bold">No Of Pcs:</span>
                    <span className="badge bg-secondary rounded-pill px-3">{summary.count.toFixed(2)}</span>
                </div>
            </div>

            {/* Flat Grid Layout */}
            <div className="row g-2 flex-grow-1">
                {/* Discount Section */}
                <div className="col-md-3">
                    <div className="p-2 rounded bg-white border h-100 d-flex flex-column justify-content-center shadow-sm">
                        <label className="d-block text-muted small fw-bold mb-1 text-center">Total Discount</label>
                        <div className="input-group input-group-sm">
                            <input
                                type="number"
                                className="form-control border-0 bg-light text-end fw-bold text-danger shadow-none"
                                value={discount}
                                onChange={(e) => setDiscount(e.target.value)}
                                onFocus={(e) => e.target.select()}
                            />
                            <select
                                className="form-select border-0 bg-light small font-monospace"
                                style={{ maxWidth: '55px', fontSize: '0.7rem' }}
                                value={discountType}
                                onChange={(e) => setDiscountType(e.target.value)}
                            >
                                <option value="percentage">%</option>
                                <option value="amount">Rs</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tax Section */}
                <div className="col-md-3">
                    <div className="p-2 rounded border h-100 d-flex flex-column justify-content-center text-center shadow-sm" style={{ background: '#fff5f5' }}>
                        <label className="d-block text-muted small fw-bold mb-1">Tax Total</label>
                        <div className="fw-bold text-dark fs-5">
                            {summary.taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>

                {/* Free Value Placeholder */}
                <div className="col-md-3">
                    <div className="p-2 rounded border h-100 d-flex flex-column justify-content-center text-center shadow-sm" style={{ background: '#f0fff4' }}>
                        <label className="d-block text-muted small fw-bold mb-1">Free Value</label>
                        <div className="fw-bold text-success fs-5">0.00</div>
                    </div>
                </div>

                {/* Main Display: Invoice Total */}
                <div className="col-md-3">
                    <div className="p-2 rounded border h-100 d-flex flex-column justify-content-center text-center shadow-sm" style={{ background: '#f5f3ff', borderLeft: '4px solid #7c3aed' }}>
                        <label className="d-block text-primary small fw-bold mb-1">Invoice Total</label>
                        <div className="fs-4 fw-bolder text-primary">
                            <small className="fs-6 me-1">Rs.</small>
                            {summary.finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceTotal;