import React, { useState } from 'react'
import { CreditCard, Banknote, FileText, Building2, RotateCcw } from 'lucide-react'
import Cash from '../paymentForms/Cash';
import Cheque from '../paymentForms/Cheque';
import Bank from '../paymentForms/Bank';
import Card from '../paymentForms/Card';

const PaymentMethod = () => {
    const [selected, setSelected] = useState();

    const paymentMethods = [
       
        { id: 'cash', label: 'Cash Payment', icon: Banknote, color: 'success' },
        { id: 'cheque', label: 'Cheque Payment', icon: FileText, color: 'primary' },
        { id: 'bank', label: 'Bank Deposit', icon: Building2, color: 'info' },
        { id: 'card', label: 'Card Payment', icon: CreditCard, color: 'primary' }
    ];

  const activeMethod = paymentMethods.find(method => method.id === selected)
    const renderPaymentForm = () => {
        switch (selected) {
            case 'card':
                return <Card color={activeMethod.color} label={activeMethod.label} />
            case 'cheque':
                return <Cheque color={activeMethod.color} label={activeMethod.label} />
            case 'bank':
                return <Bank color={activeMethod.color} label={activeMethod.label} />
            case 'cash':
                return <Cash color={activeMethod.color} label={activeMethod.label} />


        }
    }

    return (
        <div className='d-flex flex-column h-100 w-100' style={{ minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
            <div className='d-flex align-items-center justify-content-between mb-3'>
                <h6 className='mb-0 fw-semibold text-dark'>Payment Method</h6>
                {selected && (
                    <button
                        type='button'
                        onClick={() => setSelected(null)}
                        className='btn btn-link text-decoration-none p-0 d-inline-flex align-items-center gap-1 fw-semibold'
                        style={{ color: '#06a18e', fontSize: '0.9rem' }}
                    >
                        <RotateCcw size={14} />
                        Change
                    </button>
                )}
            </div>

            {!selected ? (
                <div className='row g-2 mx-0 flex-grow-1' style={{ minWidth: 0, maxWidth: '100%' }}>
                    {paymentMethods.map((method) => {
                        return (
                            <div key={method.id} className='col-6 px-1'>
                                <button
                                    onClick={() => setSelected(method.id)}
                                    type='button'
                                    className='btn w-100 h-100 d-flex flex-column align-items-center justify-content-center transition-all btn-outline-secondary'
                                    style={{
                                        minHeight: '80px',
                                        borderStyle: 'dashed',
                                        opacity: 0.8
                                    }}
                                >
                                    <method.icon size={24} className="mb-1" />
                                    <div className='small fw-bold'>{method.label}</div>
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className='flex-grow-1 w-100' style={{ minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
                    {renderPaymentForm()}
                </div>
            )}
        </div>
    )
}

export default PaymentMethod