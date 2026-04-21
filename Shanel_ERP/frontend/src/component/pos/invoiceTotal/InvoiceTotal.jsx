import React from 'react'

const InvoiceTotal = () => {
  return (
    <div className='d-flex flex-column h-100'>
        <h6 className='mb-3 fw-semibold text-primary'>Invoice Total</h6>
        <div className='invoice-total-card rounded p-4 text-white shadow flex-grow-1 d-flex flex-column justify-content-center'>
            <div className='text-center mb-3'>
                <div className='display-3 fw-bold'>₹ 12,500.00</div>
            </div>

            <div className='border-top border-white border-opacity-25 pt-3'>

                <div className='d-flex justify-content-between mb-2'>
                    <span>Items : </span>
                    <span className='fw-semibold'>12</span>
                </div>

                  <div className='d-flex justify-content-between mb-2'>
                    <span>Discount : </span>
                    <span className='fw-semibold'>12</span>
                </div>

                  <div className='d-flex justify-content-between mb-2'>
                    <span>Tax : </span>
                    <span className='fw-semibold'>12</span>
                </div>

            </div>
        </div>
      
    </div>
  )
}

export default InvoiceTotal
