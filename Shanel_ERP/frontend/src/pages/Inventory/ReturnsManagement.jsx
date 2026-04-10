import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, RotateCcw, AlertCircle, DollarSign, Eye } from 'react-feather';
import { Modal, Button, Table, Badge } from 'react-bootstrap';
import ProcessReturnModal from '../../component/Inventory/Returns/ProcessReturnModal';

const ReturnsManagement = () => {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
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

    // Handle Details button click
    const handleDetailsClick = (returnItem) => {
        // Get all returns for this Ref_ID to show details
        const itemReturns = returns.filter(r => r.Ref_ID === returnItem.Ref_ID && r.P_ID === returnItem.P_ID);
        setSelectedReturn({
            ...returnItem,
            details: itemReturns
        });
        setShowDetailsModal(true);
    };

    // Group returns by item (combine good and bad in same row)
    const groupedReturns = returns.reduce((acc, ret) => {
        const key = `${ret.Ref_ID}-${ret.P_ID}`; // Group by Sale_ID and Product_ID
        
        if (!acc[key]) {
            acc[key] = {
                Return_Date: ret.Return_Date,
                Ref_ID: ret.Ref_ID,
                Invoice_No: ret.Invoice_No || 'N/A',
                Customer_Name: ret.C_Name || 'Unknown',
                Product: ret.Product,
                Return_Type: ret.Return_Type,
                Good_Qty: 0,
                Bad_Qty: 0,
                Total_Refund: 0,
                Status: ret.Status,
                P_ID: ret.P_ID,
                P_Name: ret.P_Name
            };
        }
        
        if (ret.Restock) {
            acc[key].Good_Qty += parseFloat(ret.Qty || 0);
        } else {
            acc[key].Bad_Qty += parseFloat(ret.Qty || 0);
        }
        
        acc[key].Total_Refund += parseFloat(ret.Refund_Amount || 0);
        
        return acc;
    }, {});

    const groupedReturnsList = Object.values(groupedReturns);

    // Calculate metrics from the logs
    const totalRefund = groupedReturnsList.reduce((sum, r) => sum + parseFloat(r.Total_Refund || 0), 0);
    const customerReturnsCount = groupedReturnsList.filter(r => r.Return_Type === 'Customer').length;

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
                <MetricCard title="Total Returns" value={groupedReturnsList.length} icon={<RotateCcw size={20} className="text-danger"/>} borderColor="border-danger" label="All return records" />
                <MetricCard title="Customer Returns" value={customerReturnsCount} icon={<RotateCcw size={20} className="text-primary"/>} borderColor="border-primary" label="From customers" />
                <MetricCard title="Supplier Returns" value={groupedReturnsList.filter(r => r.Return_Type === 'Supplier').length} icon={<RotateCcw size={20} className="text-info"/>} borderColor="border-info" label="To suppliers" />
                <MetricCard title="Total Refund Value" value={`LKR ${totalRefund.toLocaleString()}`} icon={<DollarSign size={20} className="text-success"/>} borderColor="border-success" label="Total refunded" />
            </div>

            {/* Return Logs Table */}
            <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: '13px' }}>
                        <thead>
                            <tr style={{ background: 'linear-gradient(135deg, #004445 0%, #2c7873 100%)' }}>
                                <th className='text-uppercase py-3 px-4 ps-4' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Date</th>
                                <th className='text-uppercase py-3 px-4' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Invoice & Customer</th>
                                <th className='text-uppercase py-3 px-4' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Item Details</th>
                                <th className='text-uppercase py-3 px-4 text-end' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Good Qty</th>
                                <th className='text-uppercase py-3 px-4 text-end' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Bad Qty</th>
                                <th className='text-uppercase py-3 px-4 text-end' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Total Refund</th>
                                <th className='text-uppercase py-3 px-4 text-center' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Status</th>
                                <th className='text-uppercase py-3 px-4 text-center' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupedReturnsList.length > 0 ? groupedReturnsList.map((ret, idx) => (
                                <tr key={`${ret.Ref_ID}-${ret.P_ID}-${idx}`} style={{ borderBottom: '1px solid #e9ecef' }}>
                                    <td className="px-4 py-3 text-muted">{new Date(ret.Return_Date).toLocaleDateString('en-LK')}</td>
                                    <td className="px-4 py-3">
                                        <div className="fw-bold text-primary">{ret.Invoice_No}</div>
                                        <small className="text-muted">{ret.Customer_Name}</small>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="fw-bold text-dark">{ret.P_Name || 'Unknown Product'}</div>
                                        <small className="text-muted">{ret.Return_Type} Return</small>
                                    </td>
                                    <td className="px-4 py-3 text-end">
                                        <span className="fw-bold text-success">
                                            {ret.Good_Qty > 0 ? ret.Good_Qty : '-'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-end">
                                        <span className="fw-bold text-danger">
                                            {ret.Bad_Qty > 0 ? ret.Bad_Qty : '-'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-end fw-bold text-success">
                                        LKR {parseFloat(ret.Total_Refund).toLocaleString('en-LK', {maximumFractionDigits: 2})}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge bg={ret.Status === 'Completed' ? 'success' : ret.Status === 'Pending' ? 'warning' : 'secondary'} className="px-3 py-2" style={{ fontSize: '11px', fontWeight: '600' }}>
                                            {ret.Status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button 
                                            className="btn btn-sm btn-outline-primary rounded-pill px-3"
                                            onClick={() => handleDetailsClick(ret)}
                                            title="View Details"
                                        >
                                            <Eye size={16} className="me-1"/> View
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-5 text-muted">
                                        <p className="mb-1">📋 No return records found</p>
                                        <small>Start by processing a new return</small>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Component */}
            <ProcessReturnModal 
                show={showModal} 
                onHide={() => setShowModal(false)} 
                refresh={fetchReturns} 
            />

            {/* Return Details Modal */}
            {selectedReturn && (
                <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg" centered>
                    <Modal.Header closeButton className="border-0 pb-2">
                        <Modal.Title className="fw-bold">Return Details</Modal.Title>
                    </Modal.Header>
                    
                    <Modal.Body className="py-4">
                        {/* Summary Info */}
                        <div className="row mb-4 p-3 bg-light rounded-3">
                            <div className="col-md-6">
                                <small className="text-muted fw-bold">INVOICE NUMBER</small>
                                <p className="fw-bold text-primary mb-0">{selectedReturn.Invoice_No}</p>
                            </div>
                            <div className="col-md-6">
                                <small className="text-muted fw-bold">CUSTOMER</small>
                                <p className="fw-bold mb-0">{selectedReturn.Customer_Name}</p>
                            </div>
                            <div className="col-md-6 mt-3">
                                <small className="text-muted fw-bold">RETURN DATE</small>
                                <p className="fw-bold mb-0">{new Date(selectedReturn.Return_Date).toLocaleDateString('en-LK')}</p>
                            </div>
                            <div className="col-md-6 mt-3">
                                <small className="text-muted fw-bold">STATUS</small>
                                <p className="mb-0">
                                    <Badge bg={selectedReturn.Status === 'Completed' ? 'success' : 'warning'} className="px-3 py-2">
                                        {selectedReturn.Status}
                                    </Badge>
                                </p>
                            </div>
                        </div>

                        {/* Product Details */}
                        <h6 className="fw-bold mb-3">Product Details</h6>
                        <div className="table-responsive mb-4">
                            <Table hover size="sm" className="mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="fw-bold small">Product</th>
                                        <th className="fw-bold small text-end">Good Qty</th>
                                        <th className="fw-bold small text-end">Bad Qty</th>
                                        <th className="fw-bold small text-end">Total Refund</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="fw-bold">{selectedReturn.Product?.P_Name}</td>
                                        <td className="text-end fw-bold text-success">
                                            {selectedReturn.Good_Qty > 0 ? selectedReturn.Good_Qty : '-'}
                                        </td>
                                        <td className="text-end fw-bold text-danger">
                                            {selectedReturn.Bad_Qty > 0 ? selectedReturn.Bad_Qty : '-'}
                                        </td>
                                        <td className="text-end fw-bold text-success">
                                            LKR {parseFloat(selectedReturn.Total_Refund).toLocaleString('en-LK', {maximumFractionDigits: 2})}
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                        </div>

                        {/* Return Reason Details */}
                        {selectedReturn.details && selectedReturn.details.length > 0 && (
                            <>
                                <h6 className="fw-bold mb-3">Return Reasons</h6>
                                <div className="table-responsive">
                                    <Table hover size="sm" className="mb-0">
                                        <thead className="bg-light">
                                            <tr>
                                                <th className="fw-bold small">Condition</th>
                                                <th className="fw-bold small">Reason</th>
                                                <th className="fw-bold small">Details</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedReturn.details.map((detail, idx) => (
                                                <tr key={idx}>
                                                    <td>
                                                        {detail.Restock ? (
                                                            <Badge bg="success" className="px-2 py-1">Good</Badge>
                                                        ) : (
                                                            <Badge bg="danger" className="px-2 py-1">Bad</Badge>
                                                        )}
                                                    </td>
                                                    <td className="small fw-bold">{detail.Reason || 'N/A'}</td>
                                                    <td className="small">{detail.Reason_Details || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </>
                        )}
                    </Modal.Body>

                    <Modal.Footer className="border-0">
                        <Button variant="secondary" onClick={() => setShowDetailsModal(false)} className="rounded-3 px-4">
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
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