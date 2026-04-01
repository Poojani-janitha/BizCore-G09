import React from 'react'

const SalesMetricCard = ({title, value, icon, color}) => {
    <div className='col-md-3'>
        <div className='card border-0 shadow-sm rounded-4 p-3 h-100'>
            <div className='d-flex align-items-center gap-3'>
                <div className='p-3 rounded-3' style={{ backgroundColor: '#f8fafc', color: color}}>
                    {icon}
                </div>
                <div>
                    <p className='text-muted mb-0' style={{ fontSize:'11px', fontWeight:'600'}}>{title}</p>
                    <h5 className='fw-bold mb-0'>{value}</h5>
                </div>
            </div>
        </div>
    </div>
}

export default SalesMetricCard