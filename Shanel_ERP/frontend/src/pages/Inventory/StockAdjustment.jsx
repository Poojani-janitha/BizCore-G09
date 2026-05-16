import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, AlertTriangle, ShieldOff, Archive, Package, Edit2, Trash2 } from 'react-feather';
import { useTranslation } from 'react-i18next';
import AdjustmentModal from '../../component/Inventory/Adjustment/AdjustmentModal';
import EditAdjustmentModal from '../../component/Inventory/Adjustment/EditAdjustmentModal';

const StockAdjustment = () => {
    const [logs, setLogs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAdjustment, setSelectedAdjustment] = useState(null);
    const [cardTotals, setCardTotals] = useState({ Expired: 0, Damage: 0, Theft: 0 });
    const { t, i18n } = useTranslation();
    const isSinhala = i18n.language?.startsWith('si');

    const fetchLogs = () => {
        axios.get('/api/inventory/adjustments').then(res => {
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
                const response = await axios.delete(`/api/inventory/adjustments/${adjustmentId}`);
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
            <div className="d-flex justify-content-end align-items-center mb-3">
                <button className="btn btn-primary btn-sm d-flex align-items-center gap-2 px-3 shadow-sm" onClick={() => setShowModal(true)}>
                    <Plus size={14}/> {t('inventory.pages.adjustments.btn_new')}
                </button>
            </div>

            {/* Metric Cards */}
            <div className="row g-3 mb-4">
                <AdjustmentCard title={t('inventory.pages.adjustments.metric_expired')} value={cardTotals.Expired.toFixed(2)} icon={<Archive size={20} className="text-danger"/>} borderColor="border-danger" label={t('inventory.pages.adjustments.metric_expired_label')} />
                <AdjustmentCard title={t('inventory.pages.adjustments.metric_damaged')} value={cardTotals.Damage.toFixed(2)} icon={<AlertTriangle size={20} className="text-warning"/>} borderColor="border-warning" label={t('inventory.pages.adjustments.metric_damaged_label')} />
                <AdjustmentCard title={t('inventory.pages.adjustments.metric_stolen')} value={cardTotals.Theft.toFixed(2)} icon={<ShieldOff size={20} className="text-info"/>} borderColor="border-info" label={t('inventory.pages.adjustments.metric_stolen_label')} />
                <AdjustmentCard title={t('inventory.pages.adjustments.metric_total')} value={logs.length} icon={<Package size={20} className="text-primary"/>} borderColor="border-primary" label={t('inventory.pages.adjustments.metric_total_label')} />
            </div>

            <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                <div className="table-responsive">
                    <table className="table align-middle mb-0" style={{ minWidth: '900px' }}>
                        <thead>
                            <tr style={{ background: 'linear-gradient(135deg, #004445 0%, #2c7873 100%)' }}>
                                <th className='text-uppercase py-3 ps-4' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)', width: '12%' }}>{t('inventory.pages.adjustments.col_date')}</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)', width: '18%' }}>{t('inventory.pages.adjustments.col_item')}</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)', width: '20%' }}>{t('inventory.pages.adjustments.col_reason')}</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)', width: '12%' }}>{t('inventory.pages.adjustments.col_quantity')}</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)', width: '18%' }}>{t('inventory.pages.adjustments.col_stock_change')}</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)', width: '10%' }}>{t('inventory.pages.adjustments.col_status')}</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)', width: '10%' }}>{t('inventory.pages.adjustments.col_actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log.Adjustment_ID}>
                                    <td className='ps-4'>{log.Adjustment_Date}</td>
                                    <td>
                                        <div className="fw-bold">{(isSinhala && log.Product?.P_Name_Sinhala) ? log.Product?.P_Name_Sinhala : log.Product?.P_Name}</div>
                                        <small className="text-muted">{log.Product?.P_Code}</small>
                                    </td>
                                    <td>
                                        <small className="text-muted">{log.Reason || log.Adjustment_Type}</small>
                                        <br />
                                        <span className="badge bg-light text-dark border" style={{ fontSize: '10px' }}>{log.Adjustment_Type}</span>
                                    </td>
                                    <td className={log.Difference < 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                                        {Math.abs(log.Difference)} {log.Product?.Base_Unit || 'units'}
                                    </td>
                                    <td>
                                        <div title={`Before: ${log.System_Qty} → After: ${log.Physical_Qty}`}>
                                            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#6c757d' }}>{parseFloat(log.System_Qty || 0).toFixed(2)}</span>
                                            <span className="mx-2" style={{ fontSize: '13px', fontWeight: 'bold', color: '#495057' }}>→</span>
                                            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#0d6efd' }}>{parseFloat(log.Physical_Qty || 0).toFixed(2)}</span>
                                            <span className="ms-2" style={{ fontSize: '12px', color: '#6c757d' }}>{log.Product?.Base_Unit || 'units'}</span>
                                        </div>
                                    </td>
                                    <td><span className="badge bg-success-subtle text-success">{t('inventory.pages.adjustments.badge_approved')}</span></td>
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

const AdjustmentCard = ({ title, value, icon, borderColor, label }) => (
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

export default StockAdjustment;
