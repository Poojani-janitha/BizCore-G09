import React from 'react'
import CustomerInfo from '../../component/pos/customerInfo/CustomerInfo'
import ItemTable from '../../component/pos/itemTable/ItemTable'
import InvoiceTotal from '../../component/pos/invoiceTotal/InvoiceTotal'
import PaymentMethod from '../../component/pos/paymentMethod/PaymentMethod'
import ActionButtons from '../../component/pos/actionButtons/ActionButtons'
import Test from './test'
import { useState } from 'react'

const POS = () => {
  const [cartItems, setCartItems] = useState([]);
  const [invoiceData, setInvoiceData] = useState([]);
  

  const handleInvoiceDataChange = (data) =>{
    setInvoiceData(data);
    console.log("Updated Invoice Data:", data);
  }
 
  return (
    // Remove vh-100 and the extra relative positioning
    <div className='pos-wrapper w-100' style={{ overflowX: 'hidden'}}>
      {/* Section 1: Customer Info */}
      <div className='card border-0 shadow-sm p-4 mb-3'>
        <CustomerInfo />
      </div>

      {/* Section 2: Item Table */}
      <div className='card border-0 shadow-sm p-3 mb-3'>
        <ItemTable cartItems={cartItems} setCartItems={setCartItems} />
      </div>

      {/* Section 3: Bottom Grid */}
      <div className='row g-3'>
        <div className='col-xl-4 col-lg-6'>
          <div className='card border-0 shadow-sm p-3 h-100'>
            <InvoiceTotal  cartItems={cartItems} onChangeInvoiceData={handleInvoiceDataChange}/>
          </div>
        </div>

        <div className='col-xl-4 col-lg-6'>
          <div className='card border-0 shadow-sm p-3 h-100'>
            <PaymentMethod />
          </div>
        </div>

        <div className='col-xl-4 col-lg-12'>
          <div className='card border-0 shadow-sm p-3 h-100'>
            <ActionButtons />
          </div>
        </div>
        
          {/* Test Component */}
          <div className='col-12'>
            <div className='card border-0 shadow-sm p-3 h-100'>
              <Test cartItems={cartItems} />
            </div>
          </div>
      </div>
      
    </div>
  )
}

export default POS
