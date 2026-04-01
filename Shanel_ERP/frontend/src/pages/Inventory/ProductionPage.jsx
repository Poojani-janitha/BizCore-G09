import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Play, Trash2, CheckCircle, Loader } from 'react-feather';
import ProductionModal from '../../component/Inventory/Production/ProductionModal';

const ProductionPage = () => {
    const [wip, setWip] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

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
        if (window.confirm(`Mark batch as ${status}?`)) {
            await axios.put(`http://localhost:5000/api/production/update/${id}`, { status });
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
                            <tr>
                                <th>Batch ID</th>
                                <th>Product</th>
                                <th>Qty</th>
                                <th>Completion</th>
                                <th>Stage</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {wip.map((item) => (
                                <tr key={item.PR_ID}>
                                    <td className='text-primary fw-medium'>{item.Batch_No}</td>
                                    <td className='fw-bold'>{item.P_Name}</td>
                                    <td>{item.Total_Qty_Produced}</td>
                                    <td style={{ minWidth: '150px' }}>
                                        <div className="d-flex align-items-center">
                                            <div className="progress flex-grow-1 me-2" style={{ height: '8px', borderRadius: '10px' }}>
                                                <div className={`progress-bar ${item.Completion >= 90 ? 'bg-success' : 'bg-warning'}`} 
                                                     style={{ width: `${item.Completion}%` }}></div>
                                            </div>
                                            <span className="fw-bold">{item.Completion}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${item.Status === 'Quality_Check' ? 'bg-info-subtle text-info' : 'bg-warning-subtle text-warning'} px-2`}>
                                            {item.Status.replace('_', ' ')}
                                        </span> 
                                    </td>
                                    <td className="text-end">
                                        <button className="btn btn-link text-info p-0 me-3" title="Move to QC" onClick={() => handleStatusUpdate(item.PR_ID, 'Quality_Check')}>QC</button>
                                        <button className="btn btn-link text-success p-0 me-3" title="Approve & Sync Stock" onClick={() => handleStatusUpdate(item.PR_ID, 'Approved')}><CheckCircle size={16}/></button>
                                        <button className="btn btn-link text-danger p-0" title="Delete"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductionPage;
