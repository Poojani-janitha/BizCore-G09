import React from 'react'
import CustomerInfo from '../../component/pos/customerInfo/CustomerInfo'

const POS = () => {
  return (
    <div>
      <div className='flex-grow-1 overflow-auto'>
        <div className='container-fluid p-4'>
          <CustomerInfo />
        </div>
      </div>
      
    </div>
  )
}

export default POS
