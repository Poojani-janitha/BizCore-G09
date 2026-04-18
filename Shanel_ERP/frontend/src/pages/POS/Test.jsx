import React from 'react'
import { useMemo } from 'react';

const Test = ({ cartItems , invoiceData, paymentData}) => {
  const items = useMemo(() => Array.isArray(cartItems) ? cartItems : [], [cartItems]);
  const paydata = useMemo(() => typeof paymentData === 'object' && paymentData !== null ? paymentData : {}, [paymentData]);
  const invData = useMemo(() => typeof invoiceData === 'object' && invoiceData !== null ? invoiceData : {}, [invoiceData]);
  const calculateTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item?.total) || 0), 0);
  }, [items]);

  const paymentEntries = Object.entries(paydata);
  const invoiceEntries = Object.entries(invData);

  return (
    <>
      {paymentEntries.length > 0 && (
        <div>
          <h5>Payment Data</h5>
          {paymentEntries.map(([key, value]) => (
            <p key={key}>{key}: {String(value)}</p>
          ))}
        </div>
      )}
      {invoiceEntries.length > 0 && (
        <div>
          <h5>Invoice Data</h5>
          {invoiceEntries.map(([key, value]) => (
            <p key={key}>{key}: {String(value)}</p>
          ))}
        </div>
      )}
      <div>
    
         <p >Total: Rs. {calculateTotal}</p>
      </div>
    </>
  )
}

export default Test
