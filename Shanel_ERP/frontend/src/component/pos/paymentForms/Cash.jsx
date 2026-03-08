import React from 'react'
import { Banknote } from 'lucide-react'

const Cash = ({ color, label }) => {

    const handleFocus = (e) => {
        e.target.style.borderColor = color;
    }

    const handleBlur = (e) => {
        e.target.style.borderColor = '#dee2e6';
    }
    
    return (
        <div className='d-flex flex-column w-100' style={{ minWidth: 0, maxWidth: '100%', gap: '0.9rem' }}>
            <div>
                <div className='d-flex align-items-center gap-2 px-3 py-2 rounded-3 bg-success bg-opacity-25'>
                    <Banknote size={18} className='text-success' />
                    <span className='fw-semibold'>{label}</span>
                </div>
            </div>

            <div>
                <label className="form-label fw-semibold mb-1">Cash Amount</label>
                <input type="number" className="form-control form-control-lg fs-6 shadow-none" placeholder="0.00" style={{ borderRadius: '10px' }} onFocus={handleFocus} onBlur={handleBlur} />
            </div>


            <div>
                <label className="form-label fw-semibold mb-1">Change</label>
                <input type="text" className="form-control form-control-lg fs-6 shadow-none bg-light" placeholder="0.00" readOnly style={{ borderRadius: '10px' }} />
            </div>
        </div>
    )
}

export default Cash;