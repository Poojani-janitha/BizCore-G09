import React from 'react'
import { useMemo } from 'react';

const Test = ({ cartItems , invoiceData, paymentData, customerData}) => {
  const items = useMemo(() => Array.isArray(cartItems) ? cartItems : [], [cartItems]);
//   const paydata = useMemo(() => typeof paymentData === 'object' && paymentData !== null ? paymentData : {}, [paymentData]);
//   const invData = useMemo(() => typeof invoiceData === 'object' && invoiceData !== null ? invoiceData : {}, [invoiceData]);
//   const custData = useMemo(() => typeof customerData === 'object' && customerData !== null ? customerData : {}, [customerData]);
//   const calculateTotal = useMemo(() => {
//     return items.reduce((sum, item) => sum + (Number(item?.total) || 0), 0);
//   }, [items]);

//   const paymentEntries = Object.entries(paydata);
//   const invoiceEntries = Object.entries(invData);
//   const customerEntries = Object.entries(custData);

//   return (
//     <>
//       {paymentEntries.length > 0 && (
//         <div>
//           <h5>payment </h5>
//           {paymentEntries.map(([key, value]) => (
//             <p key={key}>{key}: {String(value)}</p>
//           ))}
//         </div>
//       )}
//       {invoiceEntries.length > 0 && (
//         <div>
//           <h5>Invoice Data</h5>
//           {invoiceEntries.map(([key, value]) => (
//             <p key={key}>{key}: {String(value)}</p>
//           ))}
//         </div>
//       )}

// {cartItems.length > 0 && (
//         <div>
//           <h5>Cart Items</h5>
//           {cartItems.map((item, index) => (
//             <div key={index} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
//               <p><strong>id:</strong> {item.id}</p>
//               <p><strong>p_id:</strong> {item.p_id}</p>
//               <p><strong>p_code:</strong> {item.p_code}</p>
//               <p><strong>p_name:</strong> {item.p_name}</p>
//               <p><strong>p_unit:</strong> {item.p_unit}</p>
//               <p><strong>base_unit_price:</strong> {item.base_unit_price}</p>
//               <p><strong>unit_price:</strong> {item.unit_price}</p>
//               <p><strong>discount:</strong> {item.discount}</p>
//               <p><strong>tax:</strong> {item.tax}</p>
//               <p><strong>quntity:</strong> {item.quntity}</p>
//               <p><strong>free:</strong> {item.free}</p>
//               <p><strong>discount_allowed:</strong> {String(item.discount_allowed)}</p>
//               <p><strong>conversionFactor:</strong> {item.conversionFactor}</p>
//               <p><strong>subTotal:</strong> {item.subTotal}</p>
//               <p><strong>taxAmount:</strong> {item.taxAmount}</p>
//               <p><strong>total:</strong> {item.total}</p>
//             </div>
//           ))}
//         </div>
//       )}


//        {customerEntries.length > 0 && (
//         <div>
//           <h5>Customer Data</h5>
//           {customerEntries.map(([key, value]) => (
//             <p key={key}>{key}: {String(value)}</p>
//           ))}
//         </div>
//       )}
//       <div>
    
//          <p >Total: Rs. {calculateTotal}</p>
//       </div>
//     </>
//   )

return (
  <>
  <h1>hello</h1>
  </>
)
}

export default Test
