import React from 'react'

const CustomerInfo = () => {
  return (
    <div className="container-fluid p-0">
      <div className='row g-3 align-items-end'> {/* align-items-end keeps all inputs level */}
        
        {/* Customer Input Group */}
        <div className='col-12 col-md-auto'>
          <label className='form-label small text-muted mb-1'>Customer</label>
          <div className='input-group input-group-sm' style={{ maxWidth: '400px' }}>
            <input type="text" className='form-control' defaultValue="C001" style={{ width: '80px' }} readOnly />
            <input type="text" className='form-control' defaultValue="Walk-in Customer" />
          </div>
        </div>

                    

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
    </div>
  )
}

export default CustomerInfo
