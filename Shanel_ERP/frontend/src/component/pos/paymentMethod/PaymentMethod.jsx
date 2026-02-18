import React from 'react'
import { CreditCard,Banknote,FileText,Building2  } from 'lucide-react'

const PaymentMethod = () => {

    const paymentMethods =[
        {id:'card',label:'Card',icon:CreditCard,color:'primary'},
        {id:'cash',label:'Cash' ,icon:Banknote,color:'success'},
        {id:'cheque',label:'Cash' ,icon:FileText,color:'warning'},
        {id:'bank',label:'Cash' ,icon:Building2,color:'info'},
        
    ]
   
  return (
    <div className='d-flex flex-column h-100'>
        <h6 className='mb-3 fw-semibold text-primary'>Payment Method</h6>
        <div className='row g-2 flex-grow-1'>
            {paymentMethods.map((method) => {
                return (
                    <div key={method.id} className='col-6'>
                        <button
                            className={`btn btn-${method.color} text-white w-100 h-100 d-flex flex-column align-items-center justify-content-center payment-btn`}
                            style={{minHeight:'60px'}}
                        
                        >
                          <method.icon size={20} className="mb-1" /> 
                          <div className='small fw-semibold'>{method.label}</div>
                        </button>


                    </div>
                );
            })}
        </div>

      
    </div>
  )
}

export default PaymentMethod
