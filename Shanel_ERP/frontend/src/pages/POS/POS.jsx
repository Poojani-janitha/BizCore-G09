import React from 'react'
import CustomerInfo from '../../component/pos/customerInfo/CustomerInfo'
import ItemTable from '../../component/pos/itemTable/ItemTable'
import InvoiceTotal from '../../component/pos/invoiceTotal/InvoiceTotal'
import PaymentMethod from '../../component/pos/paymentMethod/PaymentMethod'
import ActionButtons from '../../component/pos/actionButtons/ActionButtons'

const POS = () => {
  return (
    <div>
      <div className='d-flex flex-column vh-100 pos-container position-relative'>
        
        <div className='pos-header'>
          <h4 className='mb-0'>Point of Sale</h4>
        </div>

        <div className='flex-grow-1 overflow-auto'>
          <div className='container-fluid p-4'>


            {/* section 1 */}
            <div className='pos-card p-4 mb-3'>
              <CustomerInfo />
            </div>

              {/* section 2 */}

            <div className='pos-card mb-3'>
              <ItemTable />
            </div>

              {/* section 3 */}
            <div className='pos-card p-4 mb-3'>
              <div className='row g-3'>

                {/* section 1 invoice total */}
                <div className='col-md-4'>
                  <div className='border rounded p-3 bg-light h-100'>
                    <InvoiceTotal />
                  </div>
                </div>

                {/* section 2 payment method */}
                <div className='col-md-4'>
                  <div className='border rounded p-3 bg-light h-100'>
                    <PaymentMethod />
                  </div>
                </div>

                {/* section 3 action buttons */}
                <div className='col-md-4'>
                  <div className='border rounded p-3 bg-light h-100'>
                    <ActionButtons />
                  </div>
                </div>


               
              </div>

            </div>


            
          </div>
        </div>
      </div>
      
    </div>
  )
}

export default POS
