import React from 'react';
import { Building2 } from 'lucide-react';

const Bank = ({ color, label, setPaymentData }) => {
    const handleFocus = (e) => { e.target.style.borderColor = color; };
    const handleBlur = (e) => { e.target.style.borderColor = '#dee2e6'; };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentData(prevData => ({ ...prevData, [name]: value }));
    }

 

    return (
        <div className='d-flex flex-column w-100' style={{ minWidth: 0, maxWidth: '100%', gap: '0.9rem' }}>
            <div>
                <div className='d-flex align-items-center gap-2 px-3 py-2 rounded-3 bg-info bg-opacity-25'>
                    <Building2 size={18} className='text-info' />
                    <span className='fw-semibold'>{label || 'Bank'}</span>
                </div>
            </div>

            <div>
                <label className="form-label fw-semibold mb-1">Bank Name</label>
                <input 
                    name='Bank_Name'
                    type="text" 
                    className="form-control form-control-lg fs-6 shadow-none" 
                    placeholder="Bank name" 
                    style={{ borderRadius: '10px' }} 
                    onFocus={handleFocus} onBlur={handleBlur}
                    onChange={handleInputChange}
                />
            </div>

            <div>
                <label className="form-label fw-semibold mb-1">Deposit Slip Number</label>
                <input 
                    name='Deposit_Slip_No'
                    type="text" 
                    className="form-control form-control-lg fs-6 shadow-none" 
                    placeholder="SLIP123456" 
                    style={{ borderRadius: '10px' }} 
                    onFocus={handleFocus} onBlur={handleBlur}
                    onChange={handleInputChange}
                />
            </div>

            <div>
                <label className="form-label fw-semibold mb-1">Deposited By</label>
                <input 
                    name='Deposited_By'
                    type='number'
                    min='1'
                    className="form-control form-control-lg fs-6 shadow-none" 
                    placeholder="Employee ID" 
                    style={{ borderRadius: '10px' }} 
                    onFocus={handleFocus} onBlur={handleBlur}
                    onChange={handleInputChange}
                />
            </div>

            <div>
                <label className="form-label fw-semibold mb-1">Deposit Date</label>
                <input 
                    name='Deposit_Date'
                    type='date'
                    className="form-control form-control-lg fs-6 shadow-none" 
                    style={{ borderRadius: '10px' }} 
                    onFocus={handleFocus} onBlur={handleBlur}
                    onChange={handleInputChange}
                />
            </div>
        </div>
    );
};

export default Bank;
