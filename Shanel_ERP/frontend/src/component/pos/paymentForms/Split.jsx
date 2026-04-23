import React, { useEffect, useMemo, useState } from 'react'

const Split = ({ setPaymentData, totalDue = 0 }) => {
    const [cashTendered, setCashTendered] = useState('');
 


    
    return (
        <div className='d-flex flex-column w-100' style={{ minWidth: 0, maxWidth: '100%', gap: '0.8rem' }}>
            <div>
                <label className='pm-field-label mb-2'>Cash tendered (Rs.)</label>
                <input
                    type='number'
                    min='0'
                    step='0.01'
                    className='form-control pm-cash-input shadow-none'
                    placeholder='0.00'
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                />
            </div>

            <div className={`pm-balance-chip ${isShort ? 'is-short' : 'is-change'}`}>
                <span className='pm-balance-label'>Change to return</span>
                <strong>
                    {isShort ? `Short Rs. ${balanceAmount.toFixed(2)}` : `Change Rs. ${balanceAmount.toFixed(2)}`}
                </strong>
            </div>

        </div>
    )
}

export default Split