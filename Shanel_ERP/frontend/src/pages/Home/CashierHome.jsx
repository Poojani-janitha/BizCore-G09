import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, FileText, DollarSign, Clock, ChevronRight, TrendingUp, ArrowUpRight } from 'react-feather';
import { useNavigate } from 'react-router-dom';
import { getFullName } from '../../utils/auth';
import { API_ENDPOINTS } from '../../config/apiEndpoints';

const KPICard = ({ title, value, subtitle, icon, color, trend, trendVal }) => (
    <div className="col-xl-4 col-md-6">
        <div className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden transition-all"
            style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '';
            }}>
            <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="small fw-bold text-uppercase text-muted" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>{title}</span>
                    <span className="p-2 rounded-3" style={{ background: `${color}18` }}>
                        {React.cloneElement(icon, { size: 16, color })}
                    </span>
                </div>
                <h3 className="fw-bold mb-2" style={{ color: '#1e293b', fontSize: '1.6rem' }}>{value}</h3>
                {trendVal !== undefined && (
                    <div className="d-flex align-items-center gap-1">
                        <ArrowUpRight size={14} className="text-success" />
                        <span className="text-success fw-semibold" style={{ fontSize: '12px' }}>
                            {trendVal}%
                        </span>
                        <span className="text-muted" style={{ fontSize: '11px' }}>vs last week</span>
                    </div>
                )}
                {subtitle && <p className="text-muted mb-0 mt-2" style={{ fontSize: '11px' }}>{subtitle}</p>}
            </div>
        </div>
    </div>
);

const CashierHome = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const fullName = getFullName();
    const hour = new Date().getHours();
    const greeting = hour < 12 ? t('cashier.greeting_morning') : hour < 17 ? t('cashier.greeting_afternoon') : t('cashier.greeting_evening');

    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [time, setTime] = useState(new Date());

    // Live clock
    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        axios.get(API_ENDPOINTS.sales.all)
            .then(res => { if (res.data.success) setSales(res.data.data || []); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const totalRevenue = sales.reduce((s, r) => s + (parseFloat(r.total_amount) || 0), 0);
    const pendingCount = sales.filter(s => s.payment_status !== 'Paid').length;

    return (
        <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #f1f5f9 0%, #e8f4f8 100%)', fontSize: '13px' }}>

            {/* Welcome Banner */}
            <div className="rounded-4 mb-4 px-4 py-5 d-flex align-items-center justify-content-between"
                style={{
                    background: 'linear-gradient(135deg, #00704a 0%, #00a86b 50%, #41b883 100%)',
                    minHeight: '120px',
                    boxShadow: '0 8px 24px rgba(0, 112, 74, 0.3)'
                }}>
                <div>
                    <p className="mb-1 text-white opacity-85 small fw-semibold">{greeting},</p>
                    <h4 className="fw-bold text-white mb-1" style={{ fontSize: '1.8rem' }}>{fullName} 👋</h4>
                    <p className="mb-0 text-white opacity-80 small">
                        {new Date().toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="text-end d-none d-md-block">
                    <p className="text-white opacity-80 small mb-2 d-flex align-items-center justify-content-end gap-1">
                        <Clock size={13} />
                        {t('cashier.current_time')}
                    </p>
                    <h5 className="fw-bold text-white mb-2" style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '1.5px', fontSize: '1.5rem' }}>
                        {time.toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </h5>
                    <span className="badge px-3 py-2 fw-bold" style={{ background: 'rgba(255,255,255,0.25)', fontSize: '12px', backdropFilter: 'blur(10px)' }}>
                        {t('cashier.cashier')}
                    </span>
                </div>
            </div>

            {/* Hero CTA */}
            <div className="card border-0 rounded-4 mb-4 overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, #004445 0%, #2c7873 50%, #41b883 100%)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 8px 24px rgba(0, 68, 69, 0.25)',
                    transform: 'scale(1)'
                }}
                onClick={() => navigate('/POS')}
                onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 16px 48px rgba(0, 68, 69, 0.4)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 68, 69, 0.25)';
                }}>
                <div className="card-body p-4 d-flex align-items-center justify-content-between">
                    <div>
                        <h5 className="fw-bold text-white mb-2" style={{ fontSize: '1.3rem' }}>{t('cashier.cta_open_pos')}</h5>
                        <p className="text-white opacity-85 mb-0 small">{t('cashier.cta_start_transactions')}</p>
                    </div>
                    <div className="d-flex align-items-center gap-4">
                        <div className="rounded-4 p-4" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                            <ShoppingCart size={40} color="#fff" strokeWidth={1.5} />
                        </div>
                        <ChevronRight size={28} color="rgba(255,255,255,0.8)" />
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="row g-3 mb-4">
                <KPICard 
                    title={t('cashier.kpi.invoices_7d')} 
                    value={loading ? '—' : sales.length}
                    icon={<FileText />} 
                    color="#004445" 
                    subtitle={t('cashier.kpi.invoices_7d_subtitle')}
                    trend="up"
                    trendVal="12"
                />
                <KPICard 
                    title={t('cashier.kpi.revenue_7d')} 
                    value={loading ? '—' : `LKR ${totalRevenue.toLocaleString('en-LK', { maximumFractionDigits: 0 })}`}
                    icon={<DollarSign />} 
                    color="#41b883"
                    subtitle={t('cashier.kpi.revenue_7d_subtitle')}
                    trend="up"
                    trendVal="8"
                />
                <KPICard 
                    title={t('cashier.kpi.pending_payments')} 
                    value={loading ? '—' : pendingCount}
                    icon={<Clock />} 
                    color="#e17055"
                    subtitle={t('cashier.kpi.pending_payments_subtitle')}
                />
            </div>

            {/* Recent Sales Table */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '1.1rem' }}>{t('cashier.sections.recent_sales')}</h6>
                            <p className="text-muted small mb-0">Latest transactions from your point of sale</p>
                        </div>
                        <button className="btn btn-success btn-sm px-4 py-2 rounded-3 fw-semibold" 
                            style={{ transition: 'all 0.2s' }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(65, 184, 131, 0.4)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '';
                            }}
                            onClick={() => navigate('/POS')}>
                            <ShoppingCart size={14} className="me-2" /> {t('cashier.cta_new_sale')}
                        </button>
                    </div>
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-success" role="status" />
                            <p className="text-muted mt-2 small">Loading sales data...</p>
                        </div>
                    ) : sales.length === 0 ? (
                        <div className="text-center py-5">
                            <ShoppingCart size={48} className="text-muted opacity-50 mb-3" />
                            <p className="text-muted mb-0">{t('cashier.sections.no_sales')}</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-dark">
                                    <tr>
                                        <th className="ps-4 pe-2 py-4 fw-bold" style={{ fontSize: '0.9rem' }}>{t('cashier.sections.table.invoice_no')}</th>
                                        <th className="px-2 py-4 fw-bold" style={{ fontSize: '0.9rem' }}>{t('cashier.sections.table.customer')}</th>
                                        <th className="px-2 py-4 fw-bold" style={{ fontSize: '0.9rem' }}>{t('cashier.sections.table.date')}</th>
                                        <th className="px-2 py-4 fw-bold text-end" style={{ fontSize: '0.9rem' }}>{t('cashier.sections.table.amount')}</th>
                                        <th className="ps-2 pe-4 py-4 fw-bold text-center" style={{ fontSize: '0.9rem' }}>{t('cashier.sections.table.status')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sales.slice(0, 10).map((s, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', transition: 'all 0.2s' }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.background = '#f9fafb';
                                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.background = '';
                                                e.currentTarget.style.boxShadow = '';
                                            }}>
                                            <td className="px-3 py-3 fw-bold" style={{ color: '#004445', fontSize: '13px' }}>{s.invoice_no}</td>
                                            <td className="px-3 py-3 text-muted" style={{ fontSize: '13px' }}>{s.customer_name}</td>
                                            <td className="px-3 py-3 text-muted" style={{ fontSize: '13px' }}>{s.sale_date}</td>
                                            <td className="px-3 py-3 fw-bold text-end" style={{ color: '#41b883', fontSize: '13px' }}>
                                                LKR {parseFloat(s.total_amount).toLocaleString()}
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <span className={`badge ${s.payment_status === 'Paid' ? 'bg-success' : s.payment_status === 'Partially_Paid' ? 'bg-warning text-dark' : 'bg-danger'}`}
                                                    style={{ fontSize: '11px', fontWeight: 600 }}>
                                                    {s.payment_status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CashierHome;
