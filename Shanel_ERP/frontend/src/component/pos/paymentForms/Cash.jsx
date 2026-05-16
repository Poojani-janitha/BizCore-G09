import React, { useEffect, useMemo, useState } from 'react';

const Cash = ({ setPaymentData, totalDue, isPartial, partialAmount }) => {
    const [cashTendered, setCashTendered] = useState('');

    const tenderedSafe = useMemo(() => {
        const tendered = parseFloat(cashTendered || 0);
        return Number.isFinite(tendered) ? tendered : 0;
    }, [cashTendered]);

    const partialSafe = useMemo(() => {
        const partial = parseFloat(partialAmount || 0);
        return Number.isFinite(partial) ? partial : 0;
    }, [partialAmount]);

    const effectiveTendered = useMemo(() => {
        return isPartial ? partialSafe : tenderedSafe;
    }, [isPartial, partialSafe, tenderedSafe]);

    const customerReturnAmount = useMemo(() => {
        if (!isPartial) return 0;
        return Math.max(tenderedSafe - partialSafe, 0);
    }, [isPartial, tenderedSafe, partialSafe]);

    const partialCollectionShort = useMemo(() => {
        if (!isPartial) return 0;
        return Math.max(partialSafe - tenderedSafe, 0);
    }, [isPartial, partialSafe, tenderedSafe]);

    const { shortAmount, changeAmount } = useMemo(() => {
        const tendered = effectiveTendered;
        const due = parseFloat(totalDue || 0);
        const balance = due - tendered;

        return {
            shortAmount: Math.max(balance, 0),
            changeAmount: Math.max(tendered - due, 0),
        };
    }, [effectiveTendered, totalDue]);

    const { displayBalanceAmount, displayIsShort } = useMemo(() => {
        const compareAgainst = isPartial ? partialSafe : parseFloat(totalDue || 0);
        const balance = compareAgainst - tenderedSafe;

        return {
            displayBalanceAmount: Math.abs(balance),
            displayIsShort: balance > 0,
        };
    }, [isPartial, partialSafe, totalDue, tenderedSafe]);

    useEffect(() => {
        setPaymentData(prev => ({
            ...prev,
            Cash_Tendered: tenderedSafe,
            Cash_Change: isPartial ? customerReturnAmount : changeAmount,
            Cash_Short: isPartial ? partialCollectionShort : shortAmount,
        }));
    }, [
        tenderedSafe,
        isPartial,
        customerReturnAmount,
        partialCollectionShort,
        changeAmount,
        shortAmount,
        setPaymentData,
    ]);


    const handleOnFocus = () => {
        setCashTendered('');
    };
    return (
        <div className='d-flex flex-column w-100' style={{ gap: '0.8rem' }}>
            <div>
                <label className='form-label fw-semibold mb-2'>Cash Tendered (Rs.)</label>
                <input
                    type='number'
                    min='0'
                    step='0.01'
                    className='form-control form-control-lg shadow-none'
                    placeholder='0.00'
                    onFocus={handleOnFocus}
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                />
            </div>
            <div className={`p-3 rounded-3 ${displayIsShort ? 'bg-danger bg-opacity-10' : 'bg-success bg-opacity-10'}`}>
                <span className='d-block small fw-bold text-uppercase'>{displayIsShort ? 'Short Amount' : 'Change to Return'}</span>
                <strong className={`fs-5 ${displayIsShort ? 'text-danger' : 'text-success'}`}>
                    Rs. {displayBalanceAmount.toFixed(2)}
                </strong>
            </div>
            {isPartial && (
                <div className='small text-warning-emphasis'>
                    Customer balance is calculated against partial amount entered.
                </div>
            )}
        </div>
    );
};

export default Cash;
