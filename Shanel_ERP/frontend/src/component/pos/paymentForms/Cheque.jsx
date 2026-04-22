import React from 'react';
import { FileText } from 'lucide-react';

const Cheque = ({ color, setPaymentData }) => {
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className='d-flex flex-column w-100' style={{ gap: '0.9rem' }}>
            <div className='d-flex align-items-center gap-2 px-3 py-2 rounded-3 bg-warning bg-opacity-25 text-warning-emphasis'>
                <FileText size={18} />
                <span className='fw-semibold'>Cheque Details</span>
            </div>
            <div>
                <label className='form-label fw-semibold mb-1'>Cheque Number</label>
                <input name='Cheque_No' type='text' className='form-control mb-2' placeholder='Cheque Number' onChange={handleInputChange} />
            </div>
            <div>
                <label className='form-label fw-semibold mb-1'>Bank Name</label>
                <input name='Cheque_Bank' type='text' className='form-control mb-2' placeholder='Bank Name' onChange={handleInputChange} />
            </div>
            <div>
                <label className='form-label fw-semibold mb-1'>Cheque Date</label>
                <input name='Cheque_Date' type='date' className='form-control' onChange={handleInputChange} />
            </div>
        </div>
    );
};

export default Cheque;