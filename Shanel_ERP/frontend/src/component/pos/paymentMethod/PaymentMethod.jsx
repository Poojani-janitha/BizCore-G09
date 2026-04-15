import React from 'react'
import { ArrowLeft, CreditCard,Banknote,FileText,Building2  } from 'lucide-react'
import { useState } from 'react'
import Card from '../paymentForms/Card'
import Cash from '../paymentForms/Cash'
import Bank from '../paymentForms/Bank'
import Cheque from '../paymentForms/Cheque'

const PaymentMethod = () => {

    const [selectForm,setSelectForm] = useState(null);
    const paymentMethods =[
        {id:'card',label:'Card',icon:CreditCard,color:'primary',focusColor:'#0d6efd'},
        {id:'cash',label:'Cash',icon:Banknote,color:'success',focusColor:'#198754'},
        {id:'cheque',label:'Cheque',icon:FileText,color:'warning',focusColor:'#ffc107'},
        {id:'bank',label:'Bank',icon:Building2,color:'info',focusColor:'#0dcaf0'},
    ];

    const loadForm = (method, onBack) => {
        if (!method) return null;

        if (method.id === 'card') return <Card color={method.focusColor} label={method.label} onBack={onBack} />;
        if (method.id === 'cash') return <Cash color={method.focusColor} label={method.label} onBack={onBack} />; 
        if (method.id === 'cheque') return <Cheque color={method.focusColor} label={method.label} onBack={onBack} />;
        if (method.id === 'bank') return <Bank color={method.focusColor} label={method.label} onBack={onBack} />;
        return null;
    };

    const selectedMethod = paymentMethods.find((method) => method.id === selectForm);
   
  return (
    <div className='d-flex flex-column h-100'>
        <div className='d-flex align-items-center justify-content-between mb-3'>
            <h6 className='mb-0 fw-semibold text-primary'>Payment Method</h6>
            {selectForm && (
                <button
                    type='button'
                    className='btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1'
                    onClick={() => setSelectForm(null)}
                >
                    <ArrowLeft size={14} />
                    Back
                </button>
            )}
        </div>
        {!selectForm && (
            <div className='row g-2 flex-grow-1'>
                {paymentMethods.map((method) => {
                    return (
                        <div key={method.id} className='col-6'>
                            <button
                                className={`btn btn-${method.color} text-white w-100 h-100 d-flex flex-column align-items-center justify-content-center payment-btn`}
                                style={{minHeight:'60px'}}
                                onClick={() => setSelectForm(method.id)}
                            >
                              <method.icon size={20} className="mb-1" /> 
                              <div className='small fw-semibold'>{method.label}</div>
                            </button>
                        </div>
                    );
                })}
            </div>
        )}

        {selectForm && (
            <div className='mt-2 flex-grow-1'>
                {loadForm(selectedMethod, null)}
            </div>
        )}

    </div>
  )
}

export default PaymentMethod
