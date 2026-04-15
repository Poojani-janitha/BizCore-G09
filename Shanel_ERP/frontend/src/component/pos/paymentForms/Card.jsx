import React from 'react'
import { CreditCard } from 'lucide-react'

const Card = ({ color, label }) => {
  const handleFocus = (e) => {
    e.target.style.borderColor = color;
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = '#dee2e6';
  };

  return (
    <div className='d-flex flex-column w-100' style={{ minWidth: 0, maxWidth: '100%', gap: '0.9rem' }}>
        <div>
          <div className='d-flex align-items-center gap-2 px-3 py-2 rounded-3 bg-primary bg-opacity-25'>
            <CreditCard size={18} className='text-primary' />
            <span className='fw-semibold'>{label || 'Card'}</span>
          </div>
        </div>

        <div>
          <label className='form-label fw-semibold mb-1'>Card Number</label>
          <input type='text' className='form-control form-control-lg fs-6 shadow-none' placeholder='1234 5678 9012 3456' style={{ borderRadius: '10px' }} onFocus={handleFocus} onBlur={handleBlur} />
        </div>

        <div>
          <label className='form-label fw-semibold mb-1'>Card Holder Name</label>
          <input type='text' className='form-control form-control-lg fs-6 shadow-none' placeholder='Name on card' style={{ borderRadius: '10px' }} onFocus={handleFocus} onBlur={handleBlur} />
        </div>

        <div className='d-flex w-100 gap-2'>
          <div className='flex-grow-1'>
            <label className='form-label fw-semibold mb-1'>Expiry Date</label>
            <input type='text' className='form-control form-control-lg fs-6 shadow-none w-100' placeholder='mm/yy' style={{ borderRadius: '10px' }} onFocus={handleFocus} onBlur={handleBlur} />
          </div>

          <div className='flex-grow-1'>
            <label className='form-label fw-semibold mb-1'>CVV</label>
            <input type='text' className='form-control form-control-lg fs-6 shadow-none w-100' placeholder='123' style={{ borderRadius: '10px' }} onFocus={handleFocus} onBlur={handleBlur} />
          </div>
        </div>
    </div>
  )
}

export default Card
