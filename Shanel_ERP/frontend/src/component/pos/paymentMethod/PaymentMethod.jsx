import React, { use, useEffect, useMemo, useState } from 'react';
import { CreditCard, Banknote, FileText, Building2, Wallet } from 'lucide-react';
import Card from '../paymentForms/Card';
import Cash from '../paymentForms/Cash';
import Bank from '../paymentForms/Bank';
import Cheque from '../paymentForms/Cheque';
import Credit from '../paymentForms/Credit';
import './PaymentMethod.css';

const PaymentMethod = ({ paymentData, setPaymentData, totalDue }) => {
    const [selectForm, setSelectForm] = useState('cash');
    const [isPartial, setIsPartial] = useState(false);
    const [partialAmount, setPartialAmount] = useState('');
    const [note, setNote] = useState('');

   useEffect(() => {
       
        setPaymentData((prev)=> {
                const cleared = {};
                Object.keys(prev).forEach(key => {
                    cleared[key] ='';
                    });
                return cleared;
        })
    }, [selectForm]);


    const methodValueMap = {
        cash: 'Cash',
        bank: 'Bank_Deposit',
        cheque: 'Cheque',
        card: 'Card',
        credit: 'Credit',
    };

    const paymentMethods = [
        { id: 'cash', label: 'Cash', icon: Banknote, color: '#44c772' },
        { id: 'bank', label: 'Bank Deposit', icon: Building2, color: '#47b5ff' },
        { id: 'cheque', label: 'Cheque', icon: FileText, color: '#f6c453' },
        { id: 'card', label: 'Card', icon: CreditCard, color: '#72a8ff' },
        { id: 'credit', label: 'Credit', icon: Wallet, color: '#f2dc73' },
    ];


    // Validate and parse total due amount
    const dueAmount = useMemo(() => {
        const value = Number.parseFloat(totalDue || 0);
        return Number.isFinite(value) ? value : 0;
    }, [totalDue]);


//     valid number
// not more than total due
    const partialValue = useMemo(() => {
        const value = Number.parseFloat(partialAmount || 0);
        if (!Number.isFinite(value) || value <= 0) return null;
        return Math.min(value, dueAmount);
    }, [partialAmount, dueAmount]);


    // valid number,How much cash customer gave
    const cashTendered = useMemo(() => {
        const value = Number.parseFloat(paymentData?.Cash_Tendered || 0);
        return Number.isFinite(value) ? value : 0;
    }, [paymentData?.Cash_Tendered]);


    //If customer gives more than partial, return balance
    const customerReturnAmount = useMemo(() => {
        if (!isPartial || partialValue === null) return 0;
        return Math.max(cashTendered - partialValue, 0);
    }, [isPartial, partialValue, cashTendered]);


    
    const effectiveCollectedAmount = useMemo(() => {
        if (isPartial && partialValue !== null) {
            return partialValue;
        }

        if (selectForm === 'cash') {
            return Math.min(cashTendered, dueAmount);
        }

        return dueAmount;
    }, [isPartial, partialValue, selectForm, cashTendered, dueAmount]);

    //How much is still unpaid after partial payment
    const remainingDue = useMemo(() => {
        return Math.max(dueAmount - effectiveCollectedAmount, 0);
    }, [dueAmount, effectiveCollectedAmount]);

    useEffect(() => {
        setPaymentData((prev) => ({
            ...prev,
            Payment_Method: methodValueMap[selectForm],
            Notes: note,
            Is_Partial: isPartial,
            is_partial: isPartial,
            Partial_Amount: isPartial ? partialValue : null,
            Remaining_Amount: isPartial ? remainingDue : 0,
            Payment_Amount: effectiveCollectedAmount,
            
            
        }));
    }, [
        selectForm,
        note,
        isPartial,
        partialValue,
        remainingDue,
        effectiveCollectedAmount,
        setPaymentData,
    ]);

    const renderForm = () => {
        switch (selectForm) {
            case 'cash':
                return (
                    <Cash
                        setPaymentData={setPaymentData}
                        totalDue={dueAmount}
                        isPartial={isPartial}
                        partialAmount={partialValue}
                    />
                );
            case 'card': return <Card setPaymentData={setPaymentData} />;
            case 'cheque': return <Cheque setPaymentData={setPaymentData} />;
            case 'bank': return <Bank setPaymentData={setPaymentData} />;
            case 'credit': return <Credit setPaymentData={setPaymentData} />;
            default: return null;
        }
    };

    return (
        <div className='payment-method-shell d-flex flex-column h-100 gap-3'>
            <div className='pm-grid'>
                {paymentMethods.map((m) => (
                    <button 
                        key={m.id} 
                        className={`pm-method-btn ${selectForm === m.id ? 'active' : ''}`}
                        onClick={() => setSelectForm(m.id)}
                        style={selectForm === m.id ? { '--pm-active': m.color } : {}}
                    >
                        <m.icon size={16} />
                        <span>{m.label}</span>
                    </button>
                ))}
            </div>

            <div className='pm-form-host flex-grow-1'>
                {renderForm()}
            </div>

            <div className="mt-auto border-top pt-3">
                <label className='d-flex align-items-center gap-2 mb-2 cursor-pointer'>
                    <input type='checkbox' checked={isPartial} onChange={(e) => setIsPartial(e.target.checked)} />
                    <input
                        type='number'
                        min='0'
                        step='0.01'
                        disabled={!isPartial || paymentData.Payment_Method == 'Credit'}  
                        className='form-control form-control-sm'
                        placeholder='Enter partial amount...'
                        value={partialAmount}
                        onChange={(e) => setPartialAmount(e.target.value)}
                    />
                    <span className="small">Partial Payment (Post remaining to Credit)</span>
                </label>
                {isPartial && (
                    <div className='alert alert-warning py-2 px-3 mb-2 small'>
                        Amount passed to credit: <strong>Rs. {remainingDue.toFixed(2)}</strong>
                    </div>
                )}
                {isPartial && customerReturnAmount > 0 && (
                    <div className='alert alert-success py-2 px-3 mb-2 small'>
                        Customer balance to return: <strong>Rs. {customerReturnAmount.toFixed(2)}</strong>
                    </div>
                )}
                <textarea 
                    className="form-control form-control-sm" 
                    placeholder="Add payment notes..." 
                    value={note} 
                    onChange={(e) => setNote(e.target.value)}
                />
            </div>
        </div>
    );
};

export default PaymentMethod;