import React, { useState } from 'react'
import { CreditCard, Banknote, FileText, Building2 } from 'lucide-react'

const PaymentMethod = () => {
    // State to track which button is clicked
    const [selected, setSelected] = useState('cash'); // Default to 'cash'

    const paymentMethods = [
        { id: 'card', label: 'Card', icon: CreditCard, color: 'primary' },
        { id: 'cash', label: 'Cash', icon: Banknote, color: 'success' },
        { id: 'cheque', label: 'Cheque', icon: FileText, color: 'warning' }, // Fixed label
        { id: 'bank', label: 'Bank', icon: Building2, color: 'info' },       // Fixed label
    ];

    return (
        <div className='d-flex flex-column h-100'>
            <h6 className='mb-3 fw-semibold text-dark'>Payment Method</h6>
            <div className='row g-2 flex-grow-1'>
                {paymentMethods.map((method) => {
                    const isSelected = selected === method.id;
                    return (
                        <div key={method.id} className='col-6'>
                            <button
                                onClick={() => setSelected(method.id)}
                                className={`btn w-100 h-100 d-flex flex-column align-items-center justify-content-center transition-all
                                    ${isSelected ? `btn-${method.color} shadow` : 'btn-outline-secondary border-dashed'}`}
                                style={{ 
                                    minHeight: '80px', 
                                    opacity: isSelected ? 1 : 0.7,
                                    borderStyle: isSelected ? 'solid' : 'dashed'
                                }}
                            >
                                <method.icon size={24} className="mb-1" />
                                <div className='small fw-bold'>{method.label}</div>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

export default PaymentMethod