import React from 'react'

const CustomerInfo = () => {
  return (
    <div>
        <div className='row g-3 m-3'>
            <div className='col-auto'>
                <label className='form-label small text-muted mb-1' htmlFor="">Customer</label>
                <div className='input-group' style={{width:'300px'}}>
                    <input type="text"
                    className='form-control form-control-sm'
                    value = {0}

                     />

                      <input type="text"
                        className='form-control form-contro-sm'
                        value ={"5555"}
                        style={{width:'150px'}} />

                </div>
             </div>

             <div className='col-auto  ms-auto'>
                <label htmlFor="" className='form-label small text-muted mb-1'>Invoce Date</label>
                <div>
                    <input type="text"
                    className='form-control form-control-sm'
                    value={0} 
                    readOnly
                    style={{width:'150px'}}/>
                </div>
             </div>

             <div className='col-auto'>
                <label htmlFor="" className='form-label small text-muted mb-1'>Invoce No</label>
                <div>
                    <input type="text"
                    className='form-control form-control-sm'
                    value={0} 
                    readOnly
                    style={{width:'150px'}}/>
                </div>
             </div>

             <div className='col-auto'>
                <label htmlFor="" className='form-label small text-muted mb-1'>Invoce No</label>
                <div>
                    <input type="text"
                    className='form-control form-control-sm text-center'
                    value={0} 
                    readOnly
                    style={{width:'80px'}}/>
                </div>
             </div>



                
        </div>
      
    </div>
  )
}

export default CustomerInfo
