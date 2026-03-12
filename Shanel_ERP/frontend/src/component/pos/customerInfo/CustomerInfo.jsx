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

        {/* Invoice Details pushed to the right */}
        <div className='col-auto ms-auto'>
          <label className='form-label small text-muted mb-1'>Invoice Date</label>
          <input type="text" className='form-control form-control-sm bg-light' value="2024-05-20" readOnly style={{ width: '130px' }} />
        </div>

        <div className='col-auto'>
          <label className='form-label small text-muted mb-1'>Invoice No</label>
          <input type="text" className='form-control form-control-sm bg-light' value="INV-1001" readOnly style={{ width: '130px' }} />
        </div>

        <div className='col-auto'>
          <label className='form-label small text-muted mb-1'>Terminal</label>
          <input type="text" className='form-control form-control-sm text-center bg-light' value="T-01" readOnly style={{ width: '70px' }} />
        </div>
        
      </div>
    </div>
  )
}

export default CustomerInfo