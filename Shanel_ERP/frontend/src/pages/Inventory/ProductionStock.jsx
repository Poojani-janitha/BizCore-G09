import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Play, Trash2, CheckCircle, Loader } from 'react-feather';
import ProductionModal from '../../component/Inventory/Production/ProductionModal';

const ProductionStock = () => {
    const [wip, setWip] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const workingItems = wip.filter((item) => item.Status !== 'Approved');
    const approvedItems = wip.filter((item) => item.Status === 'Approved');

    // Format days into readable format (years, months, days)
    const formatDaysToExpiry = (days) => {
        if (days === null) return 'N/A';
        if (days < 0) return 'EXPIRED';
        
        const years = Math.floor(days / 365);
        const remainingDaysAfterYears = days % 365;
        const months = Math.floor(remainingDaysAfterYears / 30);
        const remainingDays = remainingDaysAfterYears % 30;
        
        let result = [];
        if (years > 0) result.push(`${years} year${years > 1 ? 's' : ''}`);
        if (months > 0) result.push(`${months} month${months > 1 ? 's' : ''}`);
        if (remainingDays > 0) result.push(`${remainingDays} day${remainingDays > 1 ? 's' : ''}`);
        
        return result.length > 0 ? result.join(' ') : '0 days';
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/production/stock-overview');
            if (res.data.success) setWip(res.data.wip);
        } catch (error) { console.error(error); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const handleStatusUpdate = async (id, status) => {
        await axios.put(`http://localhost:5000/api/production/update/${id}`, { status });
        fetchData();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this batch?')) {
            await axios.delete(`http://localhost:5000/api/production/${id}`);
            fetchData();
        }
    };

    if (loading) return <div className='vh-100 d-flex justify-content-center align-items-center'><Loader className="spinner-border text-primary"/></div>;

    return (
        <div className='p-4 bg-light min-vh-100' style={{ fontSize: '13px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className='fw-bold mb-0'>Work in Progress</h4>
                <button className="btn btn-primary btn-sm rounded-3 shadow-sm px-3" onClick={() => setShowModal(true)}>
                    <Play size={14} className="me-2"/> Start New Batch
                </button>
            </div>

            <ProductionModal show={showModal} onHide={() => setShowModal(false)} refreshData={fetchData} />

            <div className='card border-0 shadow-sm rounded-4 overflow-hidden'>
                <div className='table-responsive p-4'>
                    <table className='table align-middle mt-2'>
                        <thead className='text-muted small text-uppercase'>
                            <tr style={{textAlign:"center"}}>
                                <th>Batch ID</th>
                                <th>Product</th>
                                <th>Qty</th>
                                <th>Production Date</th>
                                <th>Expiry Date</th>
                                <th>Completion</th>
                                <th>Stage</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody style={{textAlign:"center"}}>
                            {workingItems.map((item) => (
                                <tr key={item.PR_ID}>
                                    <td className='text-primary fw-medium'>{item.Batch_No}</td>
                                    <td className='fw-bold'>{item.P_Name}</td>
                                    <td>{item.Total_Qty_Produced}</td>
                                    <td>{item.Production_Date ? new Date(item.Production_Date).toLocaleDateString() : 'N/A'}</td>
                                    <td>{item.Exp_Date ? new Date(item.Exp_Date).toLocaleDateString() : 'N/A'}</td>
                                    <td style={{ minWidth: '150px' }}>
                                        {(() => {
                                            const completion = Number(item.Completion || 0);
                                            return (
                                        <div className="d-flex align-items-center">
                                            <div className="progress flex-grow-1 me-2" style={{ height: '8px', borderRadius: '10px' }}>
                                                <div className={`progress-bar ${completion >= 90 ? 'bg-success' : 'bg-warning'}`} 
                                                     style={{ width: `${completion}%` }}></div>
                                            </div>
                                            <span className="fw-bold">{completion}%</span>
                                        </div>
                                            );
                                        })()}
                                    </td>
                                    <td className="text-center align-middle">
                                        <span
                                            className={`badge d-inline-block text-center ${item.Status === 'Quality_Check' ? 'bg-info-subtle text-info' : 'bg-warning-subtle text-warning'} px-2`}
                                            style={{ minWidth: '120px' }}
                                        >
                                            {item.Status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="text-end">
                                        {Number(item.Completion || 0) < 50 && item.Status === 'In_Progress' && (
                                            <button className="btn btn-link text-primary p-0 me-3" title="Move to In Progress" onClick={() => handleStatusUpdate(item.PR_ID, 'In_Progress')}>In Progress</button>
                                        )}
                                        {Number(item.Completion || 0) >= 50 && item.Status === 'In_Progress' && (
                                            <button className="btn btn-link text-info p-0 me-3" title="Move to QC" onClick={() => handleStatusUpdate(item.PR_ID, 'Quality_Check')}>QC</button>
                                        )}
                                        {item.Status === 'Quality_Check' && (
                                            <button className="btn btn-link text-success p-0 me-3" title="Approve & Sync Stock" onClick={() => handleStatusUpdate(item.PR_ID, 'Approved')}><CheckCircle size={16}/></button>
                                        )}
                                        <button className="btn btn-link text-danger p-0" title="Delete" onClick={() => handleDelete(item.PR_ID)}><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                            {workingItems.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="text-center text-muted py-4">No work in progress items</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className='card border-0 shadow-sm rounded-4 overflow-hidden mt-4'>
                <div className='card-header bg-white border-0 p-4 pb-0'>
                    <h5 className='fw-bold mb-0'>Approved Batches</h5>
                </div>
                <div className='table-responsive p-4'>
                    <table className='table align-middle mt-2'>
                        <thead className='text-muted small text-uppercase'>
                            <tr style={{textAlign:"center"}}>
                                <th>Batch ID</th>
                                <th>Product</th>
                                <th>Qty</th>
                                <th>Production Date</th>
                                <th>Expiry Date</th>
                                <th>Days to Expire</th>
                                <th>Stage</th>
                            </tr>
                        </thead>
                        <tbody style={{textAlign:"center"}}>
                            {approvedItems.map((item) => {
                                const daysLeft = item.DaysToExpire;
                                let badgeClass = 'bg-success-subtle text-success'; // Green
                                if (daysLeft <= 0) badgeClass = 'bg-danger-subtle text-danger'; // Red - Expired
                                else if (daysLeft <= 7) badgeClass = 'bg-danger-subtle text-danger'; // Red - Expiring soon
                                else if (daysLeft <= 30) badgeClass = 'bg-warning-subtle text-warning'; // Yellow - Medium
                                
                                return (
                                    <tr key={item.PR_ID}>
                                        <td className='text-primary fw-medium'>{item.Batch_No}</td>
                                        <td className='fw-bold'>{item.P_Name}</td>
                                        <td>{item.Total_Qty_Produced}</td>
                                        <td>{item.Production_Date ? new Date(item.Production_Date).toLocaleDateString() : 'N/A'}</td>
                                        <td>{item.Exp_Date ? new Date(item.Exp_Date).toLocaleDateString() : 'N/A'}</td>
                                        <td>
                                            <span className={`badge d-inline-block text-center ${badgeClass} px-3 py-2`} style={{ minWidth: '120px', fontWeight: '600' }}>
                                                {formatDaysToExpiry(daysLeft)}
                                            </span>
                                        </td>
                                        <td className="text-center align-middle">
                                            <span className="badge d-inline-block text-center bg-success-subtle text-success px-2" style={{ minWidth: '120px' }}>
                                                Approved
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {approvedItems.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center text-muted py-4">No approved items yet</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductionStock;