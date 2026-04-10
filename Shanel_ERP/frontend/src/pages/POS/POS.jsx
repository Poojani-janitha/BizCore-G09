import React from 'react'
import CustomerInfo from '../../component/pos/customerInfo/CustomerInfo'
import ItemTable from '../../component/pos/itemTable/ItemTable'
import InvoiceTotal from '../../component/pos/invoiceTotal/InvoiceTotal'
import PaymentMethod from '../../component/pos/paymentMethod/PaymentMethod'
import ActionButtons from '../../component/pos/actionButtons/ActionButtons'

const POS = () => {
  return (
    // Remove vh-100 and the extra relative positioning
    <div className='pos-wrapper w-100' style={{ overflowX: 'hidden'}}>
      {/* Section 1: Customer Info */}
      <div className='card border-0 shadow-sm p-4 mb-3'>
        <CustomerInfo />
      </div>

      {/* Section 2: Item Table */}
      <div className='card border-0 shadow-sm p-3 mb-3'>
        <ItemTable />
      </div>

      {/* Section 3: Bottom Grid */}
      <div className='row g-3'>
        <div className='col-xl-4 col-lg-6'>
          <div className='card border-0 shadow-sm p-3 h-100'>
            <InvoiceTotal />
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
      </div>
      
    </div>
  )
}

export default POS
