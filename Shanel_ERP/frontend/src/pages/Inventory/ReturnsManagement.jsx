import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, RotateCcw, AlertCircle, DollarSign, Eye, Edit2, Trash2 } from 'react-feather';
import { Modal, Button, Table, Badge } from 'react-bootstrap';
import ProcessReturnModal from '../../component/Inventory/Returns/ProcessReturnModal';
import EditReturnModal from '../../component/Inventory/Returns/EditReturnModal';

const ReturnsManagement = () => {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState(null);

    const fetchReturns = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/inventory/returns');
            if (res.data.success) {
                setReturns(res.data.returns);
            }
        } catch (error) {
            console.error("Error fetching returns:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReturns();
    }, []);

    // Handle Edit button click
    const handleEdit = (returnItem) => {
        setSelectedReturn(returnItem);
        setShowEditModal(true);
    };

    // Handle Delete button click
    const handleDelete = async (RT_ID) => {
        if (window.confirm('Are you sure you want to delete this return? Inventory will be reversed if applicable.')) {
            try {
                const response = await axios.delete(`http://localhost:5000/api/inventory/returns/${RT_ID}`);
                if (response.data.success) {
                    fetchReturns();
                    alert('Return deleted successfully');
                }
            } catch (error) {
                alert(error.response?.data?.message || 'Error deleting return');
            }
        }
    };

    // Handle Details button click
    const handleDetailsClick = (returnItem) => {
        setSelectedReturn(returnItem);
        setShowDetailsModal(true);
    };

    // Calculate metrics from the logs
    const totalRefund = returns.reduce((sum, r) => sum + parseFloat(r.Refund_Amount || 0), 0);
    const customerReturnsCount = returns.filter(r => r.Return_Type === 'Customer').length;
    const totalGoodQty = returns.reduce((sum, r) => sum + (r.Restock ? parseFloat(r.Qty) : 0), 0);

    return (
        <div className='p-4 bg-light min-vh-100' style={{ fontSize: '13px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className='fw-bold text-dark mb-0'>Returns Management</h6>
                <button className="btn btn-primary btn-sm d-flex align-items-center gap-2 px-3 shadow-sm"
                        onClick={() => setShowModal(true)}>
                    <Plus size={14}/> Process Return
                </button>
            </div>

            {/* Metrics Row */}
            <div className="row g-3 mb-4">
                <MetricCard title="Total Returns" value={returns.length} icon={<RotateCcw size={20} className="text-danger"/>} borderColor="border-danger" label="All return records" />
                <MetricCard title="Items Restocked" value={totalGoodQty.toFixed(2)} icon={<RotateCcw size={20} className="text-primary"/>} borderColor="border-primary" label="Good items added back" />
                <MetricCard title="Customer Returns" value={customerReturnsCount} icon={<AlertCircle size={20} className="text-info"/>} borderColor="border-info" label="From customers" />
                <MetricCard title="Total Refund Value" value={`LKR ${totalRefund.toLocaleString()}`} icon={<DollarSign size={20} className="text-success"/>} borderColor="border-success" label="Total refunded" />
            </div>

            {/* Return Logs Table */}
            <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: '13px' }}>
                        <thead>
                            <tr style={{ background: 'linear-gradient(135deg, #004445 0%, #2c7873 100%)' }}>
                                <th className='text-uppercase py-3 px-4 ps-4' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)', width: '7%' }}>Return ID</th>
                                <th className='text-uppercase py-3 px-4' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)', width: '9%' }}>Date</th>
                                <th className='text-uppercase py-3 px-4' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)', width: '14%' }}>Invoice & Customer</th>
                                <th className='text-uppercase py-3 px-4' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)', width: '14%' }}>Product</th>
                                <th className='text-uppercase py-3 px-4 text-end' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)', width: '10%' }}>Quantity</th>
                                <th className='text-uppercase py-3 px-4' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)', width: '8%' }}>Type</th>
                                <th className='text-uppercase py-3 px-4 text-end' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)', width: '12%' }}>Refund</th>
                                <th className='text-uppercase py-3 px-4 text-center' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)', width: '10%' }}>Status</th>
                                <th className='text-uppercase py-3 px-4 text-center' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)', width: '16%' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {returns.length > 0 ? returns.map((ret, idx) => (
                                <tr key={`${ret.RT_ID}-${idx}`} style={{ borderBottom: '1px solid #e9ecef' }}>
                                    <td className="px-4 py-3 text-muted">{ret.RT_ID}</td>
                                    <td className="px-4 py-3 text-muted">{new Date(ret.Return_Date).toLocaleDateString('en-LK')}</td>
                                    <td className="px-4 py-3">
                                        <div className="fw-bold text-primary">{ret.Invoice_No}</div>
                                        <small className="text-muted">{ret.C_Name || 'Unknown'}</small>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="fw-bold text-dark">{ret.P_Name || 'Unknown Product'}</div>
                                        <small className="text-muted">{ret.P_Code}</small>
                                    </td>
                                    <td className="px-4 py-3 text-end">
                                        <span className="fw-bold">{parseFloat(ret.Qty).toFixed(2)} {ret.Base_Unit}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`badge ${ret.Restock ? 'bg-success' : 'bg-danger'}`}>
                                            {ret.Restock ? 'Good ✓' : 'Bad ✗'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-end fw-bold text-success">
                                        LKR {parseFloat(ret.Refund_Amount).toLocaleString('en-LK', {maximumFractionDigits: 2})}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge bg={ret.Status === 'Completed' ? 'success' : 'warning'} className="px-3 py-2" style={{ fontSize: '11px', fontWeight: '600' }}>
                                            {ret.Status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button 
                                            className="btn btn-sm btn-light border-0 me-2"
                                            onClick={() => handleEdit(ret)}
                                            title="Edit"
                                        >
                                            <Edit2 size={16} className="text-primary" />
                                        </button>
                                        <button 
                                            className="btn btn-sm btn-light border-0"
                                            onClick={() => handleDelete(ret.RT_ID)}
                                            title="Delete"
                                        >
                                            <Trash2 size={16} className="text-danger" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="9" className="text-center py-5 text-muted">
                                        <p className="mb-1">📋 No return records found</p>
                                        <small>Start by processing a new return</small>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Components */}
            <ProcessReturnModal 
                show={showModal} 
                onHide={() => setShowModal(false)} 
                refresh={fetchReturns} 
            />

            <EditReturnModal 
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                returnItem={selectedReturn}
                refresh={fetchReturns}
            />
        </div>
    );
};

const MetricCard = ({ title, value, icon, borderColor, label }) => (
    <div className="col-md-3">
        <div className={`card border-0 border-top border-4 ${borderColor} shadow-sm p-3 h-100`}>
            <div className="d-flex justify-content-between align-items-start mb-2">
                <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '11px' }}>{title}</small>
                {icon}
            </div>
            <h6 className="fw-bold mb-0">{value}</h6>
            <small className="text-muted" style={{ fontSize: '11px' }}>{label}</small>
        </div>
    </div>
);

export default ReturnsManagement;