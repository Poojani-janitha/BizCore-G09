import React from 'react'

const SalesMetricCard = ({title, value, icon, borderColor, label}) => {
    return(
        <div className='col-md-3'>
            <div className={`card border-0 border-top border-4 ${borderColor} shadow-sm p-3 h-100`}>
                <div className='d-flex justify-content-between align-items-start mb-2'>
                    <small className='text-muted fw-bold text-uppercase' style={{ fontSize: '11px' }}>{title}</small>
                    {icon}
                </div>
                <h6 className='fw-bold mb-0'>{value}</h6>
                <small className='text-muted' style={{ fontSize: '11px' }}>{label}</small>
            </div>
        </div>
    );   
};

export default SalesMetricCard