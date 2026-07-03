import React from 'react';

const formatStock = (value) => {
    const num = parseFloat(value) || 0;
    return Number.isInteger(num) ? num : num.toFixed(2);
};

const StockTable = ({ title, icon, columns, data, type }) => {
    return (
        <div className='card border-0 shadow-sm rounded-4 mb-4 overflow-hidden'>
            <div className='card-header bg-white border-0 pt-4 px-4'>
                <h6 className='fw-bold'>{icon}{title}</h6>
            </div>
            <div className='table-responsive px-4 pb-4'>
                <table className='table align-middle mt-2'>
                    <thead className='text-muted small text-uppercase'>
                        <tr>
                            {columns.map((col, index) => <th key={index}>{col}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? data.map((item, idx) => (
                            <tr key={idx}>
                                {type === 'raw' ? (
                                    <>
                                        <td className='text-primary small fw-medium'>RM-{item.P_ID}</td>
                                        <td className='fw-bold'>{item.P_Name}</td>
                                        <td>{formatStock(item.Qty)} {item.Base_Unit}</td>
                                        <td>
                                            <span className={`badge ${parseFloat(item.Qty) <= parseFloat(item.Min_Stock) ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'} px-2`}>
                                                {parseFloat(item.Qty) <= parseFloat(item.Min_Stock) ? 'Low Stock' : 'Sufficient'}
                                            </span>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className='text-primary small fw-medium'>{item.Batch_No}</td>
                                        <td className='fw-bold'>{item.P_Name}</td>
                                        <td>{formatStock(item.Total_Qty_Produced)} {item.Base_Unit}</td>
                                        {/* PROGRESS BAR COLUMN */}
                                        <td style={{ minWidth: '150px' }}>
                                            <div className="d-flex align-items-center">
                                                <div className="progress flex-grow-1 me-2" style={{ height: '8px', borderRadius: '10px', backgroundColor: '#e9ecef' }}>
                                                    <div
                                                        className={`progress-bar ${item.Completion >= 90 ? 'bg-success' : 'bg-warning'}`}
                                                        role="progressbar"
                                                        style={{ width: `${item.Completion}%`, borderRadius: '10px' }}
                                                    ></div>
                                                </div>
                                                <span className="small fw-bold">{item.Completion}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${item.Status === 'Quality_Check' ? 'bg-info-subtle text-info' : 'bg-warning-subtle text-warning'} px-2`}>
                                                {item.Status.replace('_', ' ')}
                                            </span>
                                        </td>
                                    </>
                                )}
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={columns.length} className='text-center text-muted py-3'>
                                    No data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default StockTable;