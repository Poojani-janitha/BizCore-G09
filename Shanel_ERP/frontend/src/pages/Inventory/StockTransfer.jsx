import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, RefreshCcw, CheckCircle, AlertCircle, XCircle, Edit2 } from 'react-feather';
import NewTransferModal from '../../component/Inventory/Transfer/NewTransferModal';

const StockTransfer = () => {
    const [data, setData] = useState({ transfers: [], metrics: { totalTransfers: 0, pending: 0, completedToday: 0, totalItems: 0 } });
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editTransfer, setEditTransfer] = useState(null);

    const fetchData = () => {
        axios.get('http://localhost:5000/api/inventory/transfers/history')
            .then(res => {
                if (res.data && res.data.transfers) {
                    setData(res.data);
                }
                setLoading(false);
            })
            .catch(err => {
                setError(err.message || 'Failed to load transfers');
                setLoading(false);
            });
    };

    const fetchInventory = async () => {
        try {
            const productsRes = await axios.get('http://localhost:5000/api/inventory/products');
            
            // API returns array directly or wrapped in .products
            const products = Array.isArray(productsRes.data) ? productsRes.data : productsRes.data?.products || [];
            
            if (products.length > 0) {
                const productsWithInventory = await Promise.all(
                    products.map(async (product) => {
                        try {
                            const productId = product.P_ID || product.id;
                            const locationRes = await axios.get(
                                `http://localhost:5000/api/inventory/product/${productId}/locations`
                            );
                            return {
                                P_ID: product.P_ID || product.id,
                                P_Name: product.P_Name || product.name,
                                ...product,
                                locationInventory: locationRes.data || { Main_Warehouse: 0, Shop: 0, Production: 0 }
                            };
                        } catch (err) {
                            console.error(`Failed to fetch locations for product ${product.id || product.P_ID}:`, err);
                            return {
                                P_ID: product.P_ID || product.id,
                                P_Name: product.P_Name || product.name,
                                ...product,
                                locationInventory: { Main_Warehouse: 0, Shop: 0, Production: 0 }
                            };
                        }
                    })
                );
                setInventory(productsWithInventory);
            }
        } catch (err) {
            console.error('Failed to load products:', err);
            setInventory([]);
        }
    };

    useEffect(() => {
        fetchData();
        fetchInventory();
    }, []);

    const handleEditTransfer = (transfer) => {
        setEditTransfer(transfer);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditTransfer(null);
    };

    if (loading) {
        return <div className='p-4 bg-light min-vh-100 d-flex justify-content-center align-items-center'>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>;
    }

    if (error) {
        return <div className='p-4 bg-light min-vh-100'>
            <div className="alert alert-danger" role="alert">
                Error loading transfers: {error}
            </div>
        </div>;
    }

    return (
        <div className='p-4 bg-light min-vh-100' style={{ fontSize: '13px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className='fw-bold mb-1'>Stock Transfer</h4>
                    <p className='text-muted small mb-0'>Transfer inventory between locations and stock types</p>
                </div>
                <button className="btn btn-primary rounded-3 shadow-sm px-3 d-flex align-items-center" onClick={() => setShowModal(true)}>
                    <Plus size={16} className="me-2"/> New Transfer
                </button>
            </div>

            {/* Metrics Row */}
            <div className="row g-3 mb-4">
                <MetricBox title="Total Transfers" value={data.metrics?.totalTransfers || 0} color="text-dark" />
                <MetricBox title="Pending Approval" value={data.metrics?.pending || 0} color="text-danger" />
                <MetricBox title="Completed Today" value={data.metrics?.completedToday || 0} color="text-success" />
                <MetricBox title="Items Transferred" value={data.metrics?.totalItems || 0} color="text-dark" />
            </div>

            {/* Inventory Breakdown by Location */}
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <h5 className="fw-bold mb-0 text-dark">Current Stock by Location</h5>
                <button className="btn btn-sm btn-outline-secondary rounded-3" onClick={fetchInventory}>
                    <RefreshCcw size={14} className="me-1" style={{display: 'inline'}} /> Refresh
                </button>
            </div>
            {inventory && inventory.length > 0 ? (
                <div className="table-responsive mb-4">
                    <table className="table table-sm table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="fw-bold" style={{fontSize: '13px', borderBottom: '2px solid #333'}}>PRODUCT</th>
                                <th className="text-center fw-bold" style={{fontSize: '13px', borderBottom: '2px solid #333'}}>MAIN WAREHOUSE</th>
                                <th className="text-center fw-bold" style={{fontSize: '13px', borderBottom: '2px solid #333'}}>SHOP</th>
                                <th className="text-center fw-bold" style={{fontSize: '13px', borderBottom: '2px solid #333'}}>PRODUCTION</th>
                                <th className="text-center fw-bold" style={{fontSize: '13px', borderBottom: '2px solid #333'}}>TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventory.map(item => {
                                const warehouse = parseFloat(item.locationInventory?.Main_Warehouse || 0);
                                const shop = parseFloat(item.locationInventory?.Shop || 0);
                                const production = parseFloat(item.locationInventory?.Production || 0);
                                const total = warehouse + shop + production;
                                
                                return (
                                    <tr key={item.P_ID}>
                                        <td className="fw-semibold" style={{fontSize: '13px'}}>{item.P_Name}</td>
                                        <td className="text-center" style={{fontSize: '13px'}}>
                                            {warehouse.toFixed(2)}
                                        </td>
                                        <td className="text-center" style={{fontSize: '13px'}}>
                                            {shop.toFixed(2)}
                                        </td>
                                        <td className="text-center" style={{fontSize: '13px'}}>
                                            {production.toFixed(2)}
                                        </td>
                                        <td className="text-center fw-bold" style={{fontSize: '13px'}}>
                                            {total.toFixed(2)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="alert alert-warning mb-4" role="alert">
                    <small>No inventory data loaded. Click "Refresh" to load data or check backend connection.</small>
                </div>
            )}

            <h6 className="fw-bold mb-3 text-muted small text-uppercase">Transfer History</h6>

            {/* Transfer Cards */}
            {data.transfers && data.transfers.length > 0 ? (
                data.transfers.map((transfer) => (
                    <TransferCard key={transfer.ST_ID} transfer={transfer} inventory={inventory} onEdit={handleEditTransfer} />
                ))
            ) : (
                <div className="alert alert-info" role="alert">
                    No transfers found yet. Start by creating a new transfer.
                </div>
            )}
            <NewTransferModal 
                show={showModal}
                onHide={handleCloseModal}
                refreshData={fetchData}
                editTransfer={editTransfer}
            />
        </div>
    );
};

const MetricBox = ({ title, value, color }) => (
    <div className="col-md-3">
        <div className="card border-0 shadow-sm rounded-4 p-3 h-100">
            <p className="text-muted mb-1 fw-semibold" style={{ fontSize: '10px' }}>{title.toUpperCase()}</p>
            <h4 className={`fw-bold mb-0 ${color}`}>{value}</h4>
        </div>
    </div>
);

const TransferCard = ({ transfer, inventory, onEdit }) => {
    if (!transfer) return null;
    
    // Find product name from inventory
    const product = inventory?.find(p => p.P_ID === transfer.P_ID || p.id === transfer.P_ID);
    const productName = product?.P_Name || product?.name || 'Unknown Product';
    
    return (
    <div className="card border-0 shadow-sm rounded-4 p-4 mb-3 position-relative">
        <div className="d-flex align-items-start gap-3">
            <div className="p-2 rounded-3 bg-light text-primary">
                <RefreshCcw size={18} />
            </div>
            <div className="flex-grow-1">
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <span className="fw-bold d-block" style={{ fontSize: '16px' }}>{transfer.ST_Code || `ST-${transfer.ST_ID}`}</span>
                        <span className="text-muted d-block" style={{ fontSize: '14px' }}>{transfer.Transfer_Date ? new Date(transfer.Transfer_Date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="d-flex gap-2 align-items-start">
                        <button className="btn btn-sm btn-outline-primary rounded-3" onClick={() => onEdit(transfer)} title="Edit Transfer">
                            <Edit2 size={16} />
                        </button>
                        <StatusBadge status={transfer.Status} />
                    </div>
                </div>

                <div className="row mt-3">
                    <div className="col-md-5">
                        <span className="text-muted d-block" style={{ fontSize: '14px' }}>From: <span className="text-dark fw-bold">{transfer.From_Location || 'N/A'}</span></span>
                    </div>
                    <div className="col-md-5">
                        <span className="text-muted d-block" style={{ fontSize: '14px' }}>To: <span className="text-dark fw-bold">{transfer.To_Location || 'N/A'}</span></span>
                    </div>
                </div>

                <div className="bg-light rounded-3 p-3 mt-3">
                    <span className="fw-bold d-block mb-2" style={{ fontSize: '15px' }}>Items Transferred:</span>
                    <span className="text-muted d-block" style={{ fontSize: '14px' }}><strong>{productName}</strong> (ID: {transfer.P_ID || 'N/A'}) • Qty: {transfer.Qty ? parseInt(transfer.Qty) : 'N/A'} units</span>
                    {transfer.Reason && <span className="text-muted d-block mt-1" style={{ fontSize: '13px' }}>Reason: <em>{transfer.Reason}</em></span>}
                </div>

                <div className="d-flex justify-content-between mt-3 border-top pt-3">
                    <span className="text-muted" style={{ fontSize: '14px' }}>Transferred by: <b>{transfer.Transferred_By || 'N/A'}</b></span>
                    <span className="text-muted" style={{ fontSize: '14px' }}>Received by: <b>{transfer.Received_By || '-'}</b></span>
                </div>
            </div>
        </div>
    </div>
    );
};

const StatusBadge = ({ status }) => {
    const config = {
        Completed: { color: 'text-success', icon: <CheckCircle size={14} />, bg: 'bg-success-subtle' },
        Pending: { color: 'text-warning', icon: <AlertCircle size={14} />, bg: 'bg-warning-subtle' },
        Rejected: { color: 'text-danger', icon: <XCircle size={14} />, bg: 'bg-danger-subtle' },
    };
    const current = config[status] || config.Pending;
    return (
        <span className={`badge ${current.bg} ${current.color} border-0 rounded-pill px-3 py-2 d-flex align-items-center gap-1`}>
            {current.icon} {status}
        </span>
    );
};

export default StockTransfer;