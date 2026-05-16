import React from 'react';
import { CreditCard } from 'lucide-react';

const Card = ({ color, setPaymentData }) => {
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className='d-flex flex-column w-100' style={{ gap: '0.9rem' }}>
            <div className='d-flex align-items-center gap-2 px-3 py-2 rounded-3 bg-primary bg-opacity-25 text-primary'>
                <CreditCard size={18} />
                <span className='fw-semibold'>Card Payment</span>
            </div>
            <div>
                <label className='form-label fw-semibold mb-1'>Card Last 4 Digits</label>
                <input
                    name='Card_Last_4_Digits'
                    type='text'
                    maxLength='4'
                    className='form-control shadow-none'
                    placeholder='xxxx'
                    onChange={handleInputChange}
                />
            </div>
            <div>
                <label className='form-label fw-semibold mb-1'>Transaction ID / Reference</label>
                <input
                    name='Card_Transaction_ID'
                    type='text'
                    className='form-control shadow-none'
                    placeholder='TXN123456'
                    onChange={handleInputChange}
                />
            </div>
        </div>
    );
};

export default Card;
