import React from 'react'

const InvoiceTotal = () => {
  return (
    <div className='d-flex flex-column h-100'>
        <h6 className='mb-3 fw-semibold text-dark'>Invoice Summary</h6>
        
        <div className='rounded p-4 text-white shadow-sm flex-grow-1 d-flex flex-column justify-content-center' 
             style={{ backgroundColor: '#004445' }}> 
            
            <div className='text-center mb-4'>
                <span className='small text-white-50 text-uppercase ls-wide'>Total Payable</span>
                <div className='display-5 fw-bold'>₹ 12,500.00</div>
            </div>

            <div className='border-top border-white border-opacity-25 pt-3'>
                <div className='d-flex justify-content-between mb-2 small'>
                    <span className='text-white-50'>Total Items:</span>
                    <span className='fw-semibold'>12</span>
                </div>

                <div className='d-flex justify-content-between mb-2 small'>
                    <span className='text-white-50'>Total Discount:</span>
                    <span className='fw-semibold text-warning'>- ₹ 500.00</span>
                </div>

                <div className='d-flex justify-content-between mb-0 small'>
                    <span className='text-white-50'>Tax Amount:</span>
                    <span className='fw-semibold'>+ ₹ 1,250.00</span>
                </div>
            </div>
        </div>
    </div>
  )
}

export default InvoiceTotal