import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Play, Trash2, CheckCircle, Loader } from 'react-feather';
import ProductionModal from '../../component/Inventory/Production/ProductionModal';

const formatStock = (value) => {
    const num = parseFloat(value) || 0;
    return Number.isInteger(num) ? num : num.toFixed(2);
};

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
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className='fw-bold text-dark mb-0'>Work in Progress</h6>
                <button className="btn btn-primary btn-sm d-flex align-items-center gap-2 px-3 shadow-sm" onClick={() => setShowModal(true)}>
                    <Play size={14}/> Start New Batch
                </button>
            </div>

            <ProductionModal show={showModal} onHide={() => setShowModal(false)} refreshData={fetchData} />

            <div className='card border-0 shadow-sm rounded-3 overflow-hidden'>
                <div className='table-responsive'>
                    <table className='table align-middle mb-0'>
                        <thead>
                            <tr style={{ background: 'linear-gradient(135deg, #004445 0%, #2c7873 100%)', textAlign:"center" }}>
                                <th className='text-uppercase py-3 ps-4' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Batch ID</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Product</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Qty</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Production Date</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Expiry Date</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Completion</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Stage</th>
                                <th className='text-uppercase py-3 text-end pe-4' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody style={{textAlign:"center"}}>
                            {workingItems.map((item) => (
                                <tr key={item.PR_ID}>
                                    <td className='text-primary fw-medium ps-4'>{item.Batch_No}</td>
                                    <td className='fw-bold'>{item.P_Name}</td>
                                    <td>{formatStock(item.Total_Qty_Produced)} {item.Base_Unit}</td>
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
                                        {(() => {
                                            const completion = Number(item.Completion || 0);
                                            let stageName = '';
                                            let badgeClass = '';
                                            
                                            if (item.Status === 'Quality_Check') {
                                                stageName = 'Quality Check';
                                                badgeClass = 'bg-info-subtle text-info';
                                            } else if (item.Status === 'Approved') {
                                                stageName = 'Approved';
                                                badgeClass = 'bg-success-subtle text-success';
                                            } else if (item.Status === 'In_Progress') {
                                                if (completion < 50) {
                                                    stageName = 'Start';
                                                    badgeClass = 'bg-warning-subtle text-warning';
                                                } else {
                                                    stageName = 'In Progress';
                                                    badgeClass = 'bg-warning-subtle text-warning';
                                                }
                                            }
                                            
                                            return (
                                                <span
                                                    className={`badge d-inline-block text-center ${badgeClass} px-2`}
                                                    style={{ minWidth: '120px' }}
                                                >
                                                    {stageName}
                                                </span>
                                            );
                                        })()}
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

            <h6 className='fw-bold text-dark mb-2 mt-4'>Approved Batches</h6>
            <div className='card border-0 shadow-sm rounded-3 overflow-hidden'>
                <div className='table-responsive'>
                    <table className='table align-middle mb-0'>
                        <thead>
                            <tr style={{ background: 'linear-gradient(135deg, #004445 0%, #2c7873 100%)', textAlign:"center" }}>
                                <th className='text-uppercase py-3 ps-4' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Batch ID</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Product</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Qty</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Production Date</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Expiry Date</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Days to Expire</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Stage</th>
                            </tr>
                        </thead>
                        <tbody style={{textAlign:"center"}}>
                            {approvedItems.map((item) => {
                                const daysLeft = item.DaysToExpire;
                                let badgeClass = 'bg-success-subtle text-success';
                                if (daysLeft <= 0) badgeClass = 'bg-danger-subtle text-danger';
                                else if (daysLeft <= 7) badgeClass = 'bg-danger-subtle text-danger';
                                else if (daysLeft <= 30) badgeClass = 'bg-warning-subtle text-warning';
                                
                                return (
                                    <tr key={item.PR_ID}>
                                        <td className='text-primary fw-medium ps-4'>{item.Batch_No}</td>
                                        <td className='fw-bold'>{item.P_Name}</td>
                                        <td>{formatStock(item.Total_Qty_Produced)} {item.Base_Unit}</td>
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