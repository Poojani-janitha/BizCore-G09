import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, AlertTriangle, ShieldOff, Archive, Package, Edit2, Trash2 } from 'react-feather';
import AdjustmentModal from '../../component/Inventory/Adjustment/AdjustmentModal';
import EditAdjustmentModal from '../../component/Inventory/Adjustment/EditAdjustmentModal';

const StockAdjustment = () => {
    const [logs, setLogs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAdjustment, setSelectedAdjustment] = useState(null);
    const [cardTotals, setCardTotals] = useState({ Expired: 0, Damage: 0, Theft: 0 });

    const fetchLogs = () => {
        axios.get('http://localhost:5000/api/inventory/adjustments').then(res => {
            setLogs(res.data.logs);
            
            // Calculate total quantities by adjustment type
            let expiredQty = 0, damageQty = 0, theftQty = 0;
            
            res.data.logs.forEach(log => {
                const qty = Math.abs(parseFloat(log.Difference) || 0);
                if (log.Adjustment_Type === 'Expired') expiredQty += qty;
                else if (log.Adjustment_Type === 'Damage') damageQty += qty;
                else if (log.Adjustment_Type === 'Theft') theftQty += qty;
            });
            
            setCardTotals({ Expired: expiredQty, Damage: damageQty, Theft: theftQty });
        });
    };

    useEffect(() => { fetchLogs(); }, []);

    const handleEdit = (adjustment) => {
        setSelectedAdjustment(adjustment);
        setShowEditModal(true);
    };

    const handleDelete = async (adjustmentId) => {
        if (window.confirm('Are you sure you want to delete this adjustment? Stock will be reversed.')) {
            try {
                const response = await axios.delete(`http://localhost:5000/api/inventory/adjustments/${adjustmentId}`);
                if (response.data.success) {
                    fetchLogs();
                    alert('Adjustment deleted successfully');
                }
            } catch (error) {
                alert(error.response?.data?.message || 'Error deleting adjustment');
            }
        }
    };

    return (
        <div className='p-4 bg-light min-vh-100' style={{ fontSize: '13px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className='fw-bold mb-0'>Stock Adjustment</h4>
                <button className="btn btn-primary rounded-3 px-3 shadow-sm" onClick={() => setShowModal(true)}>
                    <Plus size={16} className="me-2"/> New Adjustment
                </button>
            </div>

            {/* Metric Cards */}
            <div className="row g-3 mb-4">
                <AdjustmentCard title="Expired" value={cardTotals.Expired.toFixed(2)} icon={<Archive color="red"/>} />
                <AdjustmentCard title="Damaged" value={cardTotals.Damage.toFixed(2)} icon={<AlertTriangle color="orange"/>} />
                <AdjustmentCard title="Stolen" value={cardTotals.Theft.toFixed(2)} icon={<ShieldOff color="purple"/>} />
                <AdjustmentCard title="Total Adjustments" value={logs.length} icon={<Package color="blue"/>} />
            </div>

            <div className="card border-0 shadow-sm rounded-4">
                <div className="card-header bg-white border-0 pt-4 px-4">
                    <h6 className="fw-bold mb-0">Adjustment Logs</h6>
                </div>
                <div className="table-responsive p-4">
                    <table className="table align-middle">
                        <thead className="text-muted small text-uppercase">
                            <tr>
                                <th>Date</th>
                                <th>Item</th>
                                <th>Reason</th>
                                <th>Quantity</th>
                                <th>Stock Change</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log.Adjustment_ID}>
                                    <td>{log.Adjustment_Date}</td>
                                    <td>
                                        <div className="fw-bold">{log.Product?.P_Name}</div>
                                        <small className="text-muted">{log.Product?.P_Code}</small>
                                    </td>
                                    <td><span className="badge bg-light text-dark border">{log.Adjustment_Type}</span></td>
                                    <td className={log.Difference < 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                                        {log.Difference}
                                    </td>
                                    <td><small className="text-muted">{log.System_Qty} → {log.Physical_Qty}</small></td>
                                    <td><span className="badge bg-success-subtle text-success">Approved</span></td>
                                    <td>
                                        <button 
                                            className="btn btn-sm btn-light border-0 me-2"
                                            onClick={() => handleEdit(log)}
                                            title="Edit"
                                        >
                                            <Edit2 size={16} className="text-primary" />
                                        </button>
                                        <button 
                                            className="btn btn-sm btn-light border-0"
                                            onClick={() => handleDelete(log.Adjustment_ID)}
                                            title="Delete"
                                        >
                                            <Trash2 size={16} className="text-danger" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AdjustmentModal show={showModal} onHide={() => setShowModal(false)} refresh={fetchLogs} />
            <EditAdjustmentModal 
                show={showEditModal} 
                onHide={() => setShowEditModal(false)} 
                adjustment={selectedAdjustment}
                refresh={fetchLogs} 
            />
        </div>
    );
};

const AdjustmentCard = ({ title, value, icon }) => (
    <div className="col-md-3">
        <div className="card border-0 shadow-sm rounded-4 p-3 h-100">
            <div className="d-flex align-items-center gap-3">
                <div className="p-3 rounded-3 bg-light">{icon}</div>
                <div>
                    <div className="text-muted small fw-bold">{title}</div>
                    <h4 className="fw-bold mb-0">{value}</h4>
                </div>
            </div>
        </div>
    </div>
);

export default StockAdjustment;