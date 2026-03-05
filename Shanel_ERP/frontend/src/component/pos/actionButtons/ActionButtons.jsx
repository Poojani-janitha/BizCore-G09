import React from 'react'
import { Plus, X, Printer, CreditCard, Pause, Save, RotateCcw } from 'lucide-react'

const ActionButtons = () => {
  return (
    <div className='d-flex flex-column h-100'>
      <h6 className='mb-3 fw-semibold text-dark'>Quick Actions</h6>
      <div className='row g-2 flex-grow-1'>

        {/* Primary Action - Success */}
        <div className='col-6'>
          <button className='btn btn-success text-white w-100 h-100 d-flex flex-column align-items-center justify-content-center border-0 shadow-sm' style={{ minHeight: '80px' }}>
            <CreditCard size={20} className='mb-1' />
            <div style={{ fontSize: '12px', fontWeight: '600' }}>PAYMENT</div>
          </button>
        </div>
        
        {/* Secondary Action - Secondary */}
        <div className='col-6'>
          <button className='btn btn-secondary text-white w-100 h-100 d-flex flex-column align-items-center justify-content-center border-0' style={{ minHeight: '80px' }}>
            <Printer size={20} className='mb-1' />
            <div style={{ fontSize: '12px', fontWeight: '600' }}>PRINT</div>
          </button>
        </div>

        {/* Hold Action - Warning */}
        <div className='col-6'>
          <button className='btn btn-warning text-white w-100 h-100 d-flex flex-column align-items-center justify-content-center border-0' style={{ minHeight: '80px' }}>
            <Pause size={20} className='mb-1' />
            <div style={{ fontSize: '12px', fontWeight: '600' }}>HOLD</div>
          </button>
        </div>

        {/* Save/Draft Action - Info */}
        <div className='col-6'>
          <button className='btn btn-info text-white w-100 h-100 d-flex flex-column align-items-center justify-content-center border-0' style={{ minHeight: '80px' }}>
            <Save size={20} className='mb-1' />
            <div style={{ fontSize: '12px', fontWeight: '600' }}>DRAFT</div>
          </button>
        </div>

        {/* Reset Action - Dark */}
        <div className='col-6'>
          <button className='btn btn-dark text-white w-100 h-100 d-flex flex-column align-items-center justify-content-center border-0' style={{ minHeight: '80px' }}>
            <RotateCcw size={20} className='mb-1' />
            <div style={{ fontSize: '12px', fontWeight: '600' }}>RESET</div>
          </button>
        </div>

        {/* Danger Action - Clear */}
        <div className='col-6'>
          <button className='btn btn-danger text-white w-100 h-100 d-flex flex-column align-items-center justify-content-center border-0' style={{ minHeight: '80px' }}>
            <X size={20} className='mb-1' />
            <div style={{ fontSize: '12px', fontWeight: '600' }}>CANCEL</div>
          </button>
        </div>

      </div>
    </div>
  )
}

export default ActionButtons