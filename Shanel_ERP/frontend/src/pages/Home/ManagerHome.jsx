import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import {
    Package, AlertTriangle, Truck, ShoppingBag, Users,
    RefreshCw, BarChart2, ChevronRight, ArrowUpRight, ArrowDownRight, Box
} from 'react-feather';
import {
    BarChart, Bar, PieChart as RePieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { getFullName } from '../../utils/auth';

const COLORS = ['#004445', '#2c7873', '#41b883', '#6ab04c', '#f9ca24'];

const KPICard = ({ title, value, subtitle, icon, color }) => (
    <div className="col-xl-3 col-md-6">
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
                    <span className="small fw-bold text-uppercase text-muted" style={{ fontSize: '10px', letterSpacing: '0.6px' }}>{title}</span>
                    <span className="p-2 rounded-3" style={{ background: `${color}18` }}>
                        {React.cloneElement(icon, { size: 16, color })}
                    </span>
                </div>
                <h4 className="fw-bold mb-1" style={{ color: '#1e293b', fontSize: '1.4rem' }}>{value}</h4>
                {subtitle && <p className="text-muted mb-0" style={{ fontSize: '11px' }}>{subtitle}</p>}
            </div>
        </div>
    </div>
);

const QuickTile = ({ label, icon, to, color, navigate }) => (
    <div className="col-6 col-sm-3">
        <div className="card border-0 shadow-sm rounded-4 p-3 text-center h-100"
            style={{ cursor: 'pointer', transition: 'all 0.25s ease' }}
            onClick={() => navigate(to)}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
            <div className="mb-2 mx-auto d-flex align-items-center justify-content-center rounded-3"
                style={{ width: 44, height: 44, background: `${color}18` }}>
                {React.cloneElement(icon, { size: 20, color })}
            </div>
            <p className="mb-0 fw-semibold" style={{ fontSize: '12px', color: '#334155' }}>{label}</p>
        </div>
    </div>
);

const ManagerHome = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const fullName = getFullName();
    const hour = new Date().getHours();
    const greeting = hour < 12 ? t('manager.greeting_morning') : hour < 17 ? t('manager.greeting_afternoon') : t('manager.greeting_evening');

    const [inv, setInv] = useState(null);
    const [employees, setEmployees] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [invRes, hrRes] = await Promise.allSettled([
                    axios.get('/api/inventory/dashboard-stats'),
                    axios.get('/api/hr/employees'),
                ]);
                if (invRes.status === 'fulfilled' && invRes.value.data.success) setInv(invRes.value.data);
                if (hrRes.status === 'fulfilled') {
                    const d = hrRes.value.data;
                    const empCount = Array.isArray(d.data) ? d.data.length : (d.employees?.length ?? d.users?.length ?? 0);
                    setEmployees(empCount);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const modules = [
        { label: t('manager.sections.inventory'), icon: <Package />, to: '/inventory', color: '#004445' },
        { label: t('manager.sections.production'), icon: <Box />, to: '/inventory/production-stock', color: '#2c7873' },
        { label: t('manager.sections.hr'), icon: <Users />, to: '/hr', color: '#6c5ce7' },
        { label: t('manager.sections.reports'), icon: <BarChart2 />, to: '/inventory/reports', color: '#0984e3' },
    ];

    return (
        <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #f1f5f9 0%, #e8f4f8 100%)', fontSize: '13px' }}>

            {/* Welcome Banner */}
            <div className="rounded-4 mb-4 px-4 py-5 d-flex align-items-center justify-content-between"
                style={{ 
                    background: 'linear-gradient(135deg, #1a3a5c 0%, #2d6a9f 50%, #4a9fd5 100%)', 
                    minHeight: '120px',
                    boxShadow: '0 8px 24px rgba(45, 106, 159, 0.3)'
                }}>
                <div>
                    <p className="mb-1 text-white opacity-85 small fw-semibold">{greeting},</p>
                    <h4 className="fw-bold text-white mb-1" style={{ fontSize: '1.8rem' }}>{fullName} 👋</h4>
                    <p className="mb-0 text-white opacity-80 small">
                        {new Date().toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="text-end d-none d-md-block">
                    <p className="text-white opacity-80 small mb-1">{t('manager.role')}</p>
                    <span className="badge px-3 py-2 fw-bold" style={{ background: 'rgba(255,255,255,0.25)', fontSize: '12px', backdropFilter: 'blur(10px)' }}>
                        {t('manager.manager')}
                    </span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="row g-3 mb-4">
                <KPICard 
                    title={t('manager.kpi.company_products')} 
                    value={loading ? '—' : inv?.summary?.companyItems ?? '—'} 
                    icon={<Package />} 
                    color="#004445" 
                    subtitle={t('manager.kpi.company_products_subtitle')} 
                />
                <KPICard 
                    title={t('manager.kpi.other_products')} 
                    value={loading ? '—' : inv?.summary?.otherItems ?? '—'} 
                    icon={<Package />} 
                    color="#004445" 
                    subtitle={t('manager.kpi.other_products_subtitle')} 
                />
                <KPICard 
                    title={t('manager.kpi.stock_alerts')} 
                    value={loading ? '—' : inv?.summary?.alertsCount ?? 0} 
                    icon={<AlertTriangle />} 
                    color="#e17055" 
                    subtitle={t('manager.kpi.stock_alerts_subtitle')} 
                />
                <KPICard 
                    title={t('manager.kpi.all_employees')} 
                    value={loading ? '—' : employees} 
                    icon={<Users />} 
                    color="#6c5ce7" 
                    subtitle={t('manager.kpi.all_employees_subtitle')} 
                />
            </div>

            {/* Quick Access */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-4">
                    <h6 className="fw-bold text-dark mb-3">{t('manager.sections.quick_access')}</h6>
                    <div className="row g-2">
                        {modules.map((m, i) => <QuickTile key={i} {...m} navigate={navigate} />)}
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="row g-3 mb-4">
                {/* Stock Level Bar Chart */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <h6 className="fw-bold text-dark mb-1">{t('manager.charts.stock_levels')}</h6>
                            <p className="text-muted small mb-3">{t('manager.charts.stock_levels_subtitle')}</p>
                            {loading ? (
                                <div className="d-flex align-items-center justify-content-center" style={{ height: 220 }}>
                                    <div className="spinner-border text-primary" role="status" />
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={inv?.stockLevel || []} margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip />
                                        <Bar dataKey="current" fill="#004445" name={t('manager.charts.current')} radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="min" fill="#e17055" name={t('manager.charts.min_required')} radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>

                {/* Inventory Pie */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <h6 className="fw-bold text-dark mb-1">{t('manager.charts.inventory_distribution')}</h6>
                            <p className="text-muted small mb-3">{t('manager.charts.distribution_subtitle')}</p>
                            {loading ? (
                                <div className="d-flex align-items-center justify-content-center" style={{ height: 220 }}>
                                    <div className="spinner-border text-primary" role="status" />
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <RePieChart>
                                        <Pie data={inv?.distribution || []} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                            {(inv?.distribution || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                    </RePieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Lists Row */}
            <div className="row g-3 mb-4">
                {/* Stock Alerts Panel */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="fw-bold text-dark mb-0">{t('manager.sections.stock_alerts')}</h6>
                                <button className="btn btn-sm btn-outline-secondary px-2 py-1" style={{ fontSize: '11px' }} onClick={() => navigate('/inventory/alerts')}>
                                    {t('manager.sections.view_all')} <ChevronRight size={12} />
                                </button>
                            </div>
                            {loading ? <div className="text-center py-3"><div className="spinner-border spinner-border-sm text-primary" /></div> :
                                (inv?.alerts || []).length === 0
                                    ? <p className="text-muted small text-center py-3">{t('manager.sections.no_alerts')}</p>
                                    : (inv.alerts || []).map((a, i) => (
                                        <div key={i} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                                            <div>
                                                <p className="mb-0 fw-semibold" style={{ fontSize: '12px' }}>{a.name}</p>
                                                <small className="text-muted">{a.type} · {t('manager.sections.alert_details', { type: a.type, current: a.current, min: a.min })}</small>
                                            </div>
                                            <span className={`badge ${a.current <= 0 ? 'bg-danger' : 'bg-warning text-dark'}`} style={{ fontSize: '10px' }}>
                                                {a.current <= 0 ? t('manager.sections.out_of_stock') : t('manager.sections.low_stock')}
                                            </span>
                                        </div>
                                    ))
                            }
                        </div>
                    </div>
                </div>

                {/* Recent Transfers Panel */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="fw-bold text-dark mb-0">{t('manager.sections.recent_transfers')}</h6>
                                <button className="btn btn-sm btn-outline-secondary px-2 py-1" style={{ fontSize: '11px' }} onClick={() => navigate('/inventory/stock-transfers')}>
                                    {t('manager.sections.view_all')} <ChevronRight size={12} />
                                </button>
                            </div>
                            {loading ? <div className="text-center py-3"><div className="spinner-border spinner-border-sm text-primary" /></div> :
                                (inv?.transfers || []).length === 0
                                    ? <p className="text-muted small text-center py-3">{t('manager.sections.no_transfers')}</p>
                                    : (inv.transfers || []).map((trans, i) => (
                                        <div key={i} className="py-2 border-bottom">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <p className="mb-0 fw-semibold" style={{ fontSize: '12px' }}>{trans.name}</p>
                                                <span className={`badge ${trans.Status === 'Completed' ? 'bg-success' : 'bg-warning text-dark'}`} style={{ fontSize: '10px' }}>{trans.Status}</span>
                                            </div>
                                            <small className="text-muted">{trans.From_Location} {t('manager.sections.transfer_route')} {trans.To_Location} · {trans.Qty} {t('manager.sections.transfer_units')}</small>
                                        </div>
                                    ))
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerHome;
