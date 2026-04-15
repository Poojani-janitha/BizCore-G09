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

  // 4. Correct placement of useEffect (Outside useMemo)
  useEffect(() => {
    if (onChangeInvoiceData) {
      onChangeInvoiceData(summary);
    }
  }, [summary, onChangeInvoiceData]);

  return (
    <div className='d-flex flex-column h-100'>
      <h6 className='mb-3 fw-semibold text-primary'>Invoice Total</h6>
      <div className='invoice-total-card rounded p-4 text-dark flex-grow-1 d-flex flex-column justify-content-center border shadow-sm bg-white'>

        <div className='text-center mb-3'>
          <div className='display-5 fw-bold'>
            Rs. {summary.finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className='border-top border-secondary border-opacity-25 pt-3'>
          {/* Items Count */}
          <div className='d-flex justify-content-between mb-2 align-items-center'>
            <span className="text-muted">Items :</span>
            <span className="fw-bold">{summary.count}</span>
          </div>

          {/* discount */}
          <div className='d-flex justify-content-between mb-2 align-items-center'>
            <span className="text-muted">Total Discount :</span>
            <div className="input-group input-group-sm w-50">
              <input
                type="number"
                className="form-control text-end text-danger fw-bold shadow-none"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                onFocus={(e) => e.target.select()}
              />
              <select
                className="form-select border-start-0 text-secondary"
                style={{ maxWidth: '65px', fontSize: '0.8rem' }}
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
              >
                <option value="percentage">%</option>
                <option value="amount">Rs.</option>
              </select>
            </div>
          </div>

          {/* Tax Total */}
          <div className='d-flex justify-content-between mb-2 align-items-center'>
            <span className="text-muted">Tax Total :</span>
            <span className="fw-semibold">Rs. {summary.taxTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTotal;