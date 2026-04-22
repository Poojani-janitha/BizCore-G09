import React from 'react'
import { Plus, X, Printer, CreditCard, Pause } from 'lucide-react'

const ActionButtons = ({ setAction }) => {

  const handleAction = (actionType) => {
    setAction(actionType);
    console.log("Selected Action:", actionType);
  };
  return (
    <div className='d-flex flex-column h-100'>
      <h6 className='mb-3 fw-semibold text-primary'>Action </h6>
      <div className='row g-2 flex-grow-1'>

        <div className='col-6'>
          <button className='btn btn-success text-white w-100 h-100 d-flex flex-column align-items-center justify-content-center action-btn' style={{ minHeight: '60px' }} onClick={() => handleAction('proceedToPayment')}>

            <CreditCard size={18} className='mb-1' />
            <div className='small '>Proceed to Payment</div>
          </button>
        </div>
        
        <div className='col-6'>
          <button className='btn btn-secondary text-white w-100 h-100 d-flex flex-column align-items-center justify-content-center action-btn' style={{ minHeight: '60px' }} onClick={() => handleAction('printInvoice')}>
            <Printer size={18} className='mb-1' />
            <div className='small '>Print Invoice</div>
          </button>
        </div>

        <div className='col-6'>
          <button className='btn btn-danger text-white w-100 h-100 d-flex flex-column align-items-center justify-content-center action-btn' style={{ minHeight: '60px' }} onClick={() => handleAction('clear')}>
            <X size={18} className='mb-1' />
            <div className='small '>Clear</div>
          </button>
        </div>

        <div className='col-6'>
          <button className='btn btn-warning text-white w-100 h-100 d-flex flex-column align-items-center justify-content-center action-btn' style={{ minHeight: '60px' }} onClick={() => handleAction('holdInvoice')}>
            <Pause size={18} className='mb-1' />
            <div className='small '>Hold Invoice</div>
          </button>
        </div>

        <div className='col-6'>
          <button className='btn btn-info text-white w-100 h-100 d-flex flex-column align-items-center justify-content-center action-btn' style={{ minHeight: '60px' }} onClick={() => handleAction('print')}>
            <Pause size={18} className='mb-1' />
            <div className='small '>Print</div>

          </button>
        </div>

          <div className='col-6'>
          <button className='btn btn-dark text-white w-100 h-100 d-flex flex-column align-items-center justify-content-center action-btn' style={{ minHeight: '60px' }} onClick={() => handleAction('print')}>
            <Pause size={18} className='mb-1' />
            <div className='small '>Print</div>

          </button>
        </div>

      </div>
    </div>
  )
}

export default ActionButtons
