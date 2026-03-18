import React from 'react';
import { Building2 } from 'lucide-react';

const Bank = ({ color, label }) => {
    const handleFocus = (e) => { e.target.style.borderColor = color; };
    const handleBlur = (e) => { e.target.style.borderColor = '#dee2e6'; };

    return (
        <div className='d-flex flex-column w-100' style={{ minWidth: 0, maxWidth: '100%', gap: '0.9rem' }}>
            <div>
                <div className='d-flex align-items-center gap-2 px-3 py-2 rounded-3 bg-info bg-opacity-25'>
                    <Building2 size={18} className='text-info' />
                    <span className='fw-semibold'>{label}</span>
                </div>
            </div>

            <div>
                <label className="form-label fw-semibold mb-1">Bank Name</label>
                <input 
                    type="text" 
                    className="form-control form-control-lg fs-6 shadow-none" 
                    placeholder="Bank name" 
                    style={{ borderRadius: '10px' }} 
                    onFocus={handleFocus} onBlur={handleBlur}
                />
            </div>

            <div>
                <label className="form-label fw-semibold mb-1">Deposit Slip Number</label>
                <input 
                    type="text" 
                    className="form-control form-control-lg fs-6 shadow-none" 
                    placeholder="SLIP123456" 
                    style={{ borderRadius: '10px' }} 
                    onFocus={handleFocus} onBlur={handleBlur}
                />
            </div>

            <div>
                <label className="form-label fw-semibold mb-1">Deposited By</label>
                <input 
                    type="text" 
                    className="form-control form-control-lg fs-6 shadow-none" 
                    placeholder="Employee name" 
                    style={{ borderRadius: '10px' }} 
                    onFocus={handleFocus} onBlur={handleBlur}
                />
            </div>

            <div>
                <label className="form-label fw-semibold mb-1">Deposit Date</label>
                <input 
                    type="text" 
                    className="form-control form-control-lg fs-6 shadow-none" 
                    placeholder="mm/dd/yyyy"
                    style={{ borderRadius: '10px' }} 
                    onFocus={handleFocus} onBlur={handleBlur}
                />
            </div>
        </div>
    );
};

export default Bank;