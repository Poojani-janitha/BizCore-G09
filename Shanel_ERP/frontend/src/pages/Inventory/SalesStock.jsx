import React, {useEffect,useState} from 'react';
import axios from 'axios';
import { Package, CheckCircle, DollarSign, Clock, TrendingUp, TrendingDown } from 'react-feather';
import SalesMetricCard from '../../component/Inventory/Sales/SalesMetricCard';
import { useTranslation } from 'react-i18next';

const SalesStock = () => {
    const [data, setData] = useState({ tableData:[], metrics:{}});
    const [stockInData, setStockInData] = useState([]);
    const [stockOutData, setStockOutData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t, i18n } = useTranslation();
    const isSinhala = i18n.language?.startsWith('si');

    useEffect(() => {
        Promise.all([
            axios.get('/api/inventory/sales/stock-overview'),
            axios.get('/api/inventory/sales/recent-stock-in'),
            axios.get('/api/inventory/sales/recent-stock-out')
        ])
        .then(([res1, res2, res3]) => {
            if(res1.data.success) setData(res1.data);
            if(res2.data.success) setStockInData(res2.data.data || []);
            if(res3.data.success) setStockOutData(res3.data.data || []);
            setLoading(false);
        })
        .catch(err => console.error(err));
    }, []);

    return (
        <div className='p-4 bg-light min-vh-100' style={{ fontSize: '13px' }}>
            {/* Metrics Row */}
            <div className='row g-3 mb-4'>
                <SalesMetricCard title={t('inventory.pages.sales_stock.metric_total_items')} value={data.metrics.totalItems} icon={<Package size={20} className="text-warning"/>} borderColor="border-warning" label={t('inventory.pages.sales_stock.metric_total_items_label')} />
                <SalesMetricCard title={t('inventory.pages.sales_stock.metric_available')} value={data.metrics.availableUnits} icon={<CheckCircle size={20} className="text-success"/>} borderColor="border-success" label={t('inventory.pages.sales_stock.metric_available_label')} />
                <SalesMetricCard title={t('inventory.pages.sales_stock.metric_value')} value={`LKR ${data.metrics.totalValue ? data.metrics.totalValue.toLocaleString() : '0'}`} icon={<DollarSign size={20} className="text-info"/>} borderColor="border-info" label={t('inventory.pages.sales_stock.metric_value_label')} />
                <SalesMetricCard title={t('inventory.pages.sales_stock.metric_reserved')} value={data.metrics.totalReserved} icon={<Clock size={20} className="text-danger"/>} borderColor="border-danger" label={t('inventory.pages.sales_stock.metric_reserved_label')} />
            </div>

            {/* Inventory Table */}
            <h6 className='fw-bold text-dark mb-2'>{t('inventory.pages.sales_stock.finished_goods')}</h6>
            <div className='card border-0 shadow-sm rounded-3 overflow-hidden mb-4'>
                <div className='table-responsive'>
                    <table className='table align-middle mb-0'>
                        <thead>
                            <tr style={{ background: 'linear-gradient(135deg, #004445 0%, #2c7873 100%)' }}>
                                <th className='text-uppercase py-3 ps-4' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>{t('inventory.pages.sales_stock.col_item')}</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>{t('inventory.pages.sales_stock.col_type')}</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>{t('inventory.pages.sales_stock.col_total_qty')}</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>{t('inventory.pages.sales_stock.col_reserved')}</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>{t('inventory.pages.sales_stock.col_available')}</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>{t('inventory.pages.sales_stock.col_value')}</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>{t('inventory.pages.sales_stock.col_expiry')}</th>
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: '13px'}}>
                            {data.tableData.map((item, index) => (
                                <tr key={index}>
                                    <td className='ps-4'>
                                        <div className='fw-bold text-dark'>{(isSinhala && item.nameSinhala) ? item.nameSinhala : item.name}</div>
                                        <div className='text-muted' style={{fontSize:'11px'}}>{item.code}</div>
                                        <div className='text-muted' style={{fontSize:'10px'}}>{t('inventory.pages.sales_stock.batch_prefix')} {item.batchNo}</div>
                                    </td>
                                    <td>
                                        <span className={`badge ${item.type === 'Company' ? 'bg-warning-subtle text-warning' : 'bg-success-subtle text-success'} px-2`}>
                                            {item.type} Item
                                        </span>
                                    </td>
                                    <td className='fw-medium'>{item.totalqty} {t('inventory.pages.sales_stock.units')}</td>
                                    <td className='text-danger fw-bold'>{item.reserved} {t('inventory.pages.sales_stock.units')}</td>
                                    <td className='text-success fw-bold'>{item.available} {t('inventory.pages.sales_stock.units')}</td>
                                    <td className='fw-bold'>LKR {item.stockValue.toLocaleString()}</td>
                                    <td className='text-muted'>{item.expiry}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Stock In and Out Tables */}
            <div className='row g-4'>
                {/* Recent Stock In */}
                <div className='col-lg-6'>
                    <h6 className='fw-bold text-dark mb-2'>{t('inventory.pages.sales_stock.recent_stock_in')}</h6>
                    <div className='card border-0 shadow-sm rounded-3 overflow-hidden'>
                        <div className='table-responsive'>
                            <table className='table table-sm align-middle mb-0'>
                                <thead style={{ background: 'linear-gradient(135deg, #004445 0%, #2c7873 100%)' }}>
                                    <tr>
                                        <th className='text-uppercase py-2 ps-4 border-0' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>{t('inventory.pages.sales_stock.col_product')}</th>
                                        <th className='text-uppercase py-2 border-0' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>{t('inventory.pages.sales_stock.col_source')}</th>
                                        <th className='text-uppercase py-2 text-end border-0' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>{t('inventory.pages.sales_stock.col_qty')}</th>
                                        <th className='text-uppercase py-2 text-end pe-4 border-0' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>{t('inventory.pages.sales_stock.col_date')}</th>
                                    </tr>
                                </thead>
                                <tbody style={{ fontSize: '12px'}}>
                                    {stockInData.length > 0 ? (
                                        stockInData.map((item, idx) => (
                                            <tr key={idx} className='border-bottom'>
                                                <td className='ps-4'>
                                                    <div className='fw-medium text-dark'>{(isSinhala && item.productNameSinhala) ? item.productNameSinhala : item.productName}</div>
                                                    <small className='text-muted'>{item.productType}</small>
                                                </td>
                                                <td>
                                                    <span className='badge bg-info-subtle text-info'>{item.source}</span>
                                                </td>
                                                <td className='text-end fw-bold text-success'>+{item.quantity}</td>
                                                <td className='text-end pe-4 text-muted'>{item.date}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className='text-center text-muted py-4'>
                                                {t('inventory.pages.sales_stock.no_stock_in')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Recent Stock Out */}
                <div className='col-lg-6'>
                    <h6 className='fw-bold text-dark mb-2'>{t('inventory.pages.sales_stock.recent_stock_out')}</h6>
                    <div className='card border-0 shadow-sm rounded-3 overflow-hidden'>
                        <div className='table-responsive'>
                            <table className='table table-sm align-middle mb-0'>
                                <thead style={{ background: 'linear-gradient(135deg, #004445 0%, #2c7873 100%)' }}>
                                    <tr>
                                        <th className='text-uppercase py-2 ps-4 border-0' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>{t('inventory.pages.sales_stock.col_product')}</th>
                                        <th className='text-uppercase py-2 border-0' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>{t('inventory.pages.sales_stock.col_to')}</th>
                                        <th className='text-uppercase py-2 text-end border-0' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>{t('inventory.pages.sales_stock.col_qty')}</th>
                                        <th className='text-uppercase py-2 text-end pe-4 border-0' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>{t('inventory.pages.sales_stock.col_date')}</th>
                                    </tr>
                                </thead>
                                <tbody style={{ fontSize: '12px'}}>
                                    {stockOutData.length > 0 ? (
                                        stockOutData.map((item, idx) => (
                                            <tr key={idx} className='border-bottom'>
                                                <td className='ps-4'>
                                                    <div className='fw-medium text-dark'>{(isSinhala && item.productNameSinhala) ? item.productNameSinhala : item.productName}</div>
                                                    <small className='text-muted'>{item.productType}</small>
                                                </td>
                                                <td>
                                                    <span className={`badge ${item.destination === 'Sales' ? 'bg-success-subtle text-success' : item.destination === 'Damage' ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning'}`}>
                                                        {item.destination}
                                                    </span>
                                                </td>
                                                <td className='text-end fw-bold text-danger'>-{item.quantity}</td>
                                                <td className='text-end pe-4 text-muted'>{item.date}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className='text-center text-muted py-4'>
                                                {t('inventory.pages.sales_stock.no_stock_out')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SalesStock
