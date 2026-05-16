import React from 'react';
import { Wallet } from 'lucide-react';

const Credit = ({ setPaymentData }) => {
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentData((prevData) => ({ ...prevData, [name]: value }));
    };

    return (
        <div className='d-flex flex-column w-100' style={{ minWidth: 0, maxWidth: '100%', gap: '0.9rem' }}>
            <div className='d-flex align-items-center gap-2 px-3 py-2 rounded-3 bg-warning bg-opacity-25'>
                <Wallet size={18} className='text-warning-emphasis' />
                <span className='fw-semibold'>Credit Terms</span>
            </div>

            <div>
                <label className='form-label fw-semibold mb-1'>Credit Terms</label>
                <input
                    name='Credit_Terms'
                    type='text'
                    className='form-control form-control-lg fs-6 shadow-none'
                    placeholder='e.g. 30 days'
                    onChange={handleInputChange}
                />
            </div>

            <div>
                <label className='form-label fw-semibold mb-1'>Credit Note No</label>
                <input
                    name='Credit_Note_No'
                    type='text'
                    className='form-control form-control-lg fs-6 shadow-none'
                    placeholder='CN-0001'
                    onChange={handleInputChange}
                />
            </div>

            <div>
                <label className='form-label fw-semibold mb-1'>Reference No</label>
                <input
                    name='Reference_No'
                    type='text'
                    className='form-control form-control-lg fs-6 shadow-none'
                    placeholder='Optional reference'
                    onChange={handleInputChange}
                />
            </div>
        </div>
    );
};

export default Credit;
