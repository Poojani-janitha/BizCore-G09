import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Plus, RefreshCcw, CheckCircle, AlertCircle, XCircle, Edit2, ChevronLeft, ChevronRight } from 'react-feather';
import NewTransferModal from '../../component/Inventory/Transfer/NewTransferModal';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

const PAGE_SIZE_HISTORY = 10;
const PAGE_SIZE_STOCK   = 10;

const thStyle = {
    color: '#fff', fontSize: '0.72rem', fontWeight: 700,
    letterSpacing: '0.08em', background: 'transparent',
    borderBottom: '2px solid rgba(255,255,255,0.15)'
};

// ── Pagination helper ──────────────────────────────────────────────────────────
const Pagination = ({ total, page, pageSize, onChange }) => {
    const totalPages = Math.ceil(total / pageSize);
    if (totalPages <= 1) return null;
    return (
        <div className="d-flex align-items-center justify-content-between px-1 pt-3 pb-1">
            <small className="text-muted">
                Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total}
            </small>
            <div className="d-flex gap-1">
                <button
                    className="btn btn-sm btn-light border px-2 py-1"
                    disabled={page === 1}
                    onClick={() => onChange(page - 1)}
                >
                    <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce((acc, p, i, arr) => {
                        if (i > 0 && p - arr[i - 1] > 1) acc.push('…');
                        acc.push(p);
                        return acc;
                    }, [])
                    .map((p, i) =>
                        p === '…' ? (
                            <span key={`ellipsis-${i}`} className="btn btn-sm btn-light border px-2 py-1 disabled">…</span>
                        ) : (
                            <button
                                key={p}
                                className={`btn btn-sm px-2 py-1 ${page === p ? 'btn-dark' : 'btn-light border'}`}
                                onClick={() => onChange(p)}
                            >
                                {p}
                            </button>
                        )
                    )}
                <button
                    className="btn btn-sm btn-light border px-2 py-1"
                    disabled={page === totalPages}
                    onClick={() => onChange(page + 1)}
                >
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
const StockTransfer = () => {
    const [data, setData]           = useState({ transfers: [], metrics: { totalTransfers: 0, pending: 0, completedToday: 0, totalItems: 0 } });
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editTransfer, setEditTransfer] = useState(null);

    // Tab: 'history' | 'stock'
    const [activeTab, setActiveTab] = useState('history');

    // Pagination
    const [historyPage, setHistoryPage] = useState(1);
    const [stockPage, setStockPage]     = useState(1);

    const { t, i18n } = useTranslation();
    const isSinhala   = i18n.language?.startsWith('si');
    const location    = useLocation();
    const navigate    = useNavigate();

    const fetchData = () => {
        axios.get('http://localhost:5000/api/inventory/transfers/history')
            .then(res => {
                if (res.data?.transfers) setData(res.data);
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
            const products = Array.isArray(productsRes.data) ? productsRes.data : productsRes.data?.products || [];
            if (products.length > 0) {
                const withLoc = await Promise.all(products.map(async (product) => {
                    try {
                        const locRes = await axios.get(`http://localhost:5000/api/inventory/product/${product.id}/locations`);
                        return { ...product, locationInventory: locRes.data || { Shop: 0, Production: 0 } };
                    } catch {
                        return { ...product, locationInventory: { Shop: 0, Production: 0 } };
                    }
                }));
                setInventory(withLoc);
            } else {
                setInventory([]);
            }
        } catch {
            setInventory([]);
        }
    };

    useEffect(() => { fetchData(); fetchInventory(); }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('new') === '1') {
            setEditTransfer(null);
            setShowModal(true);
            navigate('/inventory/stock-transfers', { replace: true });
        }
    }, [location.search, navigate]);

    const handleEditTransfer = (transfer) => { setEditTransfer(transfer); setShowModal(true); };
    const handleCloseModal   = () => { setShowModal(false); setEditTransfer(null); fetchData(); fetchInventory(); };

    // Paginated slices
    const pagedHistory = useMemo(() => {
        const all = data.transfers || [];
        return all.slice((historyPage - 1) * PAGE_SIZE_HISTORY, historyPage * PAGE_SIZE_HISTORY);
    }, [data.transfers, historyPage]);

    const pagedStock = useMemo(() => {
        return inventory.slice((stockPage - 1) * PAGE_SIZE_STOCK, stockPage * PAGE_SIZE_STOCK);
    }, [inventory, stockPage]);

    if (loading) return (
        <div className='p-4 bg-light min-vh-100 d-flex justify-content-center align-items-center'>
            <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading…</span></div>
        </div>
    );
    if (error) return (
        <div className='p-4 bg-light min-vh-100'>
            <div className="alert alert-danger">Error loading transfers: {error}</div>
        </div>
    );

    return (
        <div className='p-4 bg-light min-vh-100' style={{ fontSize: '13px' }}>

            {/* ── Top bar ── */}
            <div className="d-flex justify-content-end align-items-center mb-3">
                <button className="btn btn-primary btn-sm d-flex align-items-center gap-2 px-3 shadow-sm" onClick={() => setShowModal(true)}>
                    <Plus size={14} /> {t('inventory.pages.stock_transfer.btn_new')}
                </button>
            </div>

            {/* ── Metrics ── */}
            <div className="row g-3 mb-4">
                <MetricBox title={t('inventory.pages.stock_transfer.metric_total')}     value={data.metrics?.totalTransfers || 0} borderColor="border-primary" label={t('inventory.pages.stock_transfer.metric_total_label')} />
                <MetricBox title={t('inventory.pages.stock_transfer.metric_pending')}   value={data.metrics?.pending || 0}        borderColor="border-danger"  label={t('inventory.pages.stock_transfer.metric_pending_label')} />
                <MetricBox title={t('inventory.pages.stock_transfer.metric_completed')} value={data.metrics?.completedToday || 0} borderColor="border-success" label={t('inventory.pages.stock_transfer.metric_completed_label')} />
                <MetricBox title={t('inventory.pages.stock_transfer.metric_items')}     value={data.metrics?.totalItems || 0}     borderColor="border-warning" label={t('inventory.pages.stock_transfer.metric_items_label')} />
            </div>

            {/* ── Tab switcher ── */}
            <div className="card border-0 shadow-sm rounded-3 overflow-hidden mb-4">
                {/* Tab headers */}
                <div className="d-flex border-bottom bg-white">
                    <button
                        className={`flex-fill py-3 border-0 fw-semibold ${activeTab === 'history' ? 'bg-white text-dark border-bottom border-2 border-dark' : 'bg-light text-muted'}`}
                        style={{ fontSize: '13px', borderBottom: activeTab === 'history' ? '2px solid #1e293b' : '2px solid transparent' }}
                        onClick={() => setActiveTab('history')}
                    >
                        📋 Transfer History
                        <span className={`ms-2 badge rounded-pill ${activeTab === 'history' ? 'bg-dark' : 'bg-secondary-subtle text-secondary'}`} style={{ fontSize: '11px' }}>
                            {data.transfers?.length || 0}
                        </span>
                    </button>
                    <button
                        className={`flex-fill py-3 border-0 fw-semibold ${activeTab === 'stock' ? 'bg-white text-dark' : 'bg-light text-muted'}`}
                        style={{ fontSize: '13px', borderBottom: activeTab === 'stock' ? '2px solid #1e293b' : '2px solid transparent' }}
                        onClick={() => setActiveTab('stock')}
                    >
                        📦 Current Stock by Location
                        <span className={`ms-2 badge rounded-pill ${activeTab === 'stock' ? 'bg-dark' : 'bg-secondary-subtle text-secondary'}`} style={{ fontSize: '11px' }}>
                            {inventory.length}
                        </span>
                    </button>
                </div>

                {/* ── Transfer History Tab ── */}
                {activeTab === 'history' && (
                    <div className="p-3">
                        {data.transfers?.length > 0 ? (
                            <>
                                {pagedHistory.map(transfer => (
                                    <TransferCard
                                        key={transfer.ST_ID}
                                        transfer={transfer}
                                        inventory={inventory}
                                        onEdit={handleEditTransfer}
                                        isSinhala={isSinhala}
                                    />
                                ))}
                                <Pagination
                                    total={data.transfers.length}
                                    page={historyPage}
                                    pageSize={PAGE_SIZE_HISTORY}
                                    onChange={p => { setHistoryPage(p); }}
                                />
                            </>
                        ) : (
                            <div className="text-center py-5 text-muted">
                                <RefreshCcw size={32} className="mb-2 opacity-25" />
                                <p className="mb-0">{t('inventory.pages.stock_transfer.no_transfers')}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Current Stock Tab ── */}
                {activeTab === 'stock' && (
                    <div>
                        <div className="d-flex justify-content-end px-3 pt-3 pb-2">
                            <button className="btn btn-sm btn-outline-secondary rounded-3" onClick={fetchInventory}>
                                <RefreshCcw size={13} className="me-1" style={{ display: 'inline' }} />
                                {t('inventory.pages.stock_transfer.btn_refresh')}
                            </button>
                        </div>
                        {inventory.length > 0 ? (
                            <>
                                <div className="table-responsive">
                                    <table className="table table-sm table-hover mb-0">
                                        <thead>
                                            <tr style={{ background: 'linear-gradient(135deg, #004445 0%, #2c7873 100%)' }}>
                                                <th className='text-uppercase py-3 ps-4 text-center' style={thStyle}>{t('inventory.pages.stock_transfer.col_id')}</th>
                                                <th className='text-uppercase py-3 ps-3' style={thStyle}>{t('inventory.pages.stock_transfer.col_product')}</th>
                                                <th className='text-uppercase py-3' style={thStyle}>{t('inventory.pages.stock_transfer.col_production')}</th>
                                                <th className='text-uppercase py-3' style={thStyle}>{t('inventory.pages.stock_transfer.col_shop')}</th>
                                                <th className='text-uppercase py-3' style={thStyle}>{t('inventory.pages.stock_transfer.col_total')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pagedStock.map(item => {
                                                const shop       = parseFloat(item.locationInventory?.Shop || 0);
                                                const production = parseFloat(item.locationInventory?.Production || 0);
                                                const total      = shop + production;
                                                const baseUnit   = item.baseUnit || 'units';
                                                return (
                                                    <tr key={item.id}>
                                                        <td className="fw-semibold text-center ps-4" style={{ fontSize: '13px' }}>{item.id}</td>
                                                        <td className="fw-semibold ps-3" style={{ fontSize: '13px' }}>
                                                            {(isSinhala && item.nameSinhala) ? item.nameSinhala : item.name}
                                                            <span className="ms-2 badge bg-secondary-subtle text-secondary border" style={{ fontSize: '10px' }}>{item.type}</span>
                                                        </td>
                                                        <td style={{ fontSize: '13px' }}>{production.toFixed(2)} {baseUnit}</td>
                                                        <td style={{ fontSize: '13px' }}>{shop.toFixed(2)} {baseUnit}</td>
                                                        <td className="fw-bold" style={{ fontSize: '13px' }}>{total.toFixed(2)} {baseUnit}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="px-3">
                                    <Pagination
                                        total={inventory.length}
                                        page={stockPage}
                                        pageSize={PAGE_SIZE_STOCK}
                                        onChange={p => setStockPage(p)}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-5 text-muted">
                                <p className="mb-0">No inventory data available.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <NewTransferModal
                show={showModal}
                onHide={handleCloseModal}
                refreshData={() => { fetchData(); fetchInventory(); }}
                editTransfer={editTransfer}
            />
        </div>
    );
};

// ── Metric Box ─────────────────────────────────────────────────────────────────
const MetricBox = ({ title, value, borderColor, label }) => (
    <div className="col-md-3">
        <div className={`card border-0 border-top border-4 ${borderColor} shadow-sm p-3 h-100`}>
            <small className="text-muted fw-bold text-uppercase mb-2" style={{ fontSize: '11px' }}>{title}</small>
            <h6 className="fw-bold mb-0">{value}</h6>
            <small className="text-muted" style={{ fontSize: '11px' }}>{label}</small>
        </div>
    </div>
);

// ── Transfer Card ──────────────────────────────────────────────────────────────
const TransferCard = ({ transfer, inventory, onEdit, isSinhala }) => {
    const { t } = useTranslation();
    if (!transfer) return null;

    const product     = inventory?.find(p => p.id === transfer.P_ID);
    const productName = product ? ((isSinhala && product.nameSinhala) ? product.nameSinhala : product.name) : 'Unknown Product';
    const baseUnit    = product?.baseUnit || 'units';
    const baseQty     = transfer.Qty ? parseInt(transfer.Qty) : 0;

    return (
        <div className="card border-0 shadow-sm rounded-4 p-3 mb-3">
            <div className="d-flex align-items-start gap-3">
                <div className="p-2 rounded-3 bg-light text-primary">
                    <RefreshCcw size={16} />
                </div>
                <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <span className="fw-bold d-block" style={{ fontSize: '14px' }}>{transfer.ST_Code || `ST-${transfer.ST_ID}`}</span>
                            <span className="text-muted d-block" style={{ fontSize: '12px' }}>
                                {transfer.Transfer_Date ? new Date(transfer.Transfer_Date).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                        <div className="d-flex gap-2 align-items-start">
                            <button className="btn btn-sm btn-outline-primary rounded-3" onClick={() => onEdit(transfer)} title="Edit Transfer">
                                <Edit2 size={14} />
                            </button>
                            <StatusBadge status={transfer.Status} />
                        </div>
                    </div>

                    {/* From → To */}
                    <div className="d-flex align-items-center gap-2 mt-2">
                        <span className="badge bg-secondary-subtle text-secondary border px-2 py-1" style={{ fontSize: '12px' }}>
                            {transfer.From_Location || 'N/A'}
                        </span>
                        <span className="text-muted" style={{ fontSize: '12px' }}>→</span>
                        <span className="badge bg-primary-subtle text-primary border px-2 py-1" style={{ fontSize: '12px' }}>
                            {transfer.To_Location || 'N/A'}
                        </span>
                    </div>

                    {/* Item transferred */}
                    <div className="bg-light rounded-3 px-3 py-2 mt-2">
                        <span className="text-muted" style={{ fontSize: '12px' }}>Item: </span>
                        <strong style={{ fontSize: '13px' }}>{productName}</strong>
                        <span className="text-muted ms-1" style={{ fontSize: '11px' }}>(#{transfer.P_ID})</span>

                        {/* Qty — show what the user actually entered, plus base unit equivalent */}
                        <div className="mt-1 d-flex flex-wrap align-items-center gap-2">
                            {/* Primary: base qty */}
                            <span className="badge bg-dark text-white px-2 py-1" style={{ fontSize: '12px' }}>
                                {baseQty} {baseUnit}
                            </span>
                            {/* Alt unit equivalents */}
                            {(product?.units || []).filter(u => !u.isBaseUnit).map((u, idx) => {
                                const rate = parseFloat(u.conversionRate) || 1;
                                const converted = baseQty / rate;
                                if (converted < 0.01) return null;
                                return (
                                    <span key={idx} className="badge bg-secondary-subtle text-secondary border px-2 py-1" style={{ fontSize: '11px' }}>
                                        = {Number.isInteger(converted) ? converted : converted.toFixed(2)} {u.unitName}
                                    </span>
                                );
                            })}
                        </div>

                        {transfer.Reason && (
                            <div className="text-muted mt-1" style={{ fontSize: '12px' }}>
                                Reason: <em>{transfer.Reason}</em>
                            </div>
                        )}
                    </div>

                    <div className="d-flex justify-content-between mt-2 border-top pt-2">
                        <span className="text-muted" style={{ fontSize: '12px' }}>
                            {t('inventory.pages.stock_transfer.transferred_by')} <b>{transfer.Transferred_By || 'N/A'}</b>
                        </span>
                        <span className="text-muted" style={{ fontSize: '12px' }}>
                            {t('inventory.pages.stock_transfer.received_by')} <b>{transfer.Received_By || '—'}</b>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Status Badge ───────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const config = {
        Completed: { color: 'text-success', icon: <CheckCircle size={13} />, bg: 'bg-success-subtle' },
        Pending:   { color: 'text-warning', icon: <AlertCircle size={13} />, bg: 'bg-warning-subtle' },
        Rejected:  { color: 'text-danger',  icon: <XCircle size={13} />,    bg: 'bg-danger-subtle'  },
    };
    const current = config[status] || config.Pending;
    return (
        <span className={`badge ${current.bg} ${current.color} border-0 rounded-pill px-2 py-1 d-flex align-items-center gap-1`} style={{ fontSize: '12px' }}>
            {current.icon} {status}
        </span>
    );
};

export default StockTransfer;
