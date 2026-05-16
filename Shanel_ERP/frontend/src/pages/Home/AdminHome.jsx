import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import {
    Package, AlertTriangle, DollarSign, TrendingUp, Users, Shield,
    ShoppingCart, BarChart2, ArrowUpRight, ArrowDownRight, RefreshCw,
    Bell, Settings, FileText, PieChart, Box, ChevronRight
} from 'react-feather';
import {
    LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { getFullName } from '../../utils/auth';

const COLORS = ['#004445', '#2c7873', '#41b883', '#6ab04c', '#f9ca24', '#eb4d4b'];

const KPICard = ({ title, value, subtitle, icon, color, trend, trendVal }) => (
    <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6">
        <div className="card border-0 shadow-sm h-100 rounded-3 overflow-hidden">
            <div className="card-body p-2">
                <div className="d-flex justify-content-between align-items-start mb-1">
                    <span className="small fw-bold text-uppercase text-muted" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>{title}</span>
                    <span className={`p-1 rounded-2`} style={{ background: `${color}18` }}>
                        {React.cloneElement(icon, { size: 14, color })}
                    </span>
                </div>
                <h4 className="fw-bold mb-1" style={{ color: '#1e293b', fontSize: '1.2rem' }}>{value}</h4>
                {trendVal !== undefined && (
                    <div className="d-flex align-items-center gap-1">
                        {trend === 'up'
                            ? <ArrowUpRight size={12} className="text-success" />
                            : <ArrowDownRight size={12} className="text-danger" />}
                        <span className={`small fw-semibold ${trend === 'up' ? 'text-success' : 'text-danger'}`} style={{ fontSize: '11px' }}>
                            {trendVal}%
                        </span>
                        <span className="text-muted" style={{ fontSize: '11px' }}>vs last month</span>
                    </div>
                )}
                {subtitle && <p className="text-muted mb-0" style={{ fontSize: '10px' }}>{subtitle}</p>}
            </div>
        </div>
    </div>
);

const QuickTile = ({ label, icon, to, color, navigate }) => (
    <div className="col-6 col-sm-4 col-lg-3 col-xl-auto flex-xl-fill">
        <div
            className="card border-0 shadow-sm rounded-4 p-3 text-center h-100"
            style={{ cursor: 'pointer', transition: 'all 0.25s ease', minWidth: '110px' }}
            onClick={() => navigate(to)}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
        >
            <div className="mb-2 mx-auto d-flex align-items-center justify-content-center rounded-3"
                style={{ width: 44, height: 44, background: `${color}18` }}>
                {React.cloneElement(icon, { size: 20, color })}
            </div>
            <p className="mb-0 fw-semibold" style={{ fontSize: '12px', color: '#334155' }}>{label}</p>
        </div>
    </div>
);

const AdminHome = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const fullName = getFullName();
    const hour = new Date().getHours();
    const greeting = hour < 12 ? t('home.greeting_morning') : hour < 17 ? t('home.greeting_afternoon') : t('home.greeting_evening');

    const [inv, setInv] = useState(null);
    const [finance, setFinance] = useState(null);
    const [sales, setSales] = useState([]);
    const [employees, setEmployees] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [invRes, finRes, salesRes, hrRes] = await Promise.allSettled([
                    axios.get('/api/inventory/dashboard-stats'),
                    axios.get('/api/finance/dashboard/stats'),
                    axios.get('/api/sales/all'),
                    axios.get('/api/hr/employees'),
                ]);
                if (invRes.status === 'fulfilled' && invRes.value.data.success) setInv(invRes.value.data);
                if (finRes.status === 'fulfilled' && finRes.value.data.success) setFinance(finRes.value.data);
                if (salesRes.status === 'fulfilled' && salesRes.value.data.success) setSales(salesRes.value.data.data || []);
                if (hrRes.status === 'fulfilled') {
                    const d = hrRes.value.data;
                    // Extract count from data array
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

    const todaySales = sales.reduce((s, r) => s + (parseFloat(r.total_amount) || 0), 0);
    const pendingPayments = sales.filter(s => s.payment_status !== 'Paid').length;

    const modules = [
        { label: t('home.modules.pos'), icon: <ShoppingCart />, to: '/POS', color: '#41b883' },
        { label: t('home.modules.inventory'), icon: <Package />, to: '/inventory', color: '#004445' },
        { label: t('home.modules.production'), icon: <Box />, to: '/inventory/production-stock', color: '#2c7873' },
        { label: t('home.modules.sales'), icon: <TrendingUp />, to: '/inventory/salesStock', color: '#6ab04c' },
        { label: t('home.modules.finance'), icon: <DollarSign />, to: '/finance', color: '#f9ca24' },
        { label: t('home.modules.reports'), icon: <BarChart2 />, to: '/inventory/reports', color: '#0984e3' },
        { label: t('home.modules.hr'), icon: <Users />, to: '/hr', color: '#6c5ce7' },
        { label: t('home.modules.alerts'), icon: <Bell />, to: '/inventory/alerts', color: '#e17055' },
        { label: t('home.modules.users'), icon: <Shield />, to: '/user-management', color: '#d63031' },
    ];

    return (
        <div className="min-vh-100" style={{ background: '#f1f5f9', fontSize: '13px' }}>

            {/* Welcome Banner */}
            <div className="rounded-4 mb-4 px-4 py-4 d-flex align-items-center justify-content-between"
                style={{ background: 'linear-gradient(135deg, #004445 0%, #2c7873 60%, #41b883 100%)', minHeight: '110px' }}>
                <div>
                    <p className="mb-1 text-white opacity-75 small">{greeting},</p>
                    <h4 className="fw-bold text-white mb-1">{fullName} 👋</h4>
                    <p className="mb-0 text-white opacity-75 small">
                        {new Date().toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="text-end d-none d-md-block">
                    <p className="text-white opacity-75 small mb-1">{t('home.role')}</p>
                    <span className="badge px-3 py-2 fw-bold" style={{ background: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>
                        🔐 {t('home.admin')}
                    </span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="row g-2 mb-4">
                <KPICard title={t('home.kpi.company_products')} value={loading ? '—' : inv?.summary?.companyItems ?? '—'} icon={<Package />} color="#004445" subtitle={t('home.kpi.company_products_subtitle')} />
                <KPICard title={t('home.kpi.other_products')} value={loading ? '—' : inv?.summary?.otherItems ?? '—'} icon={<Package />} color="#004445" subtitle={t('home.kpi.other_products_subtitle')} />
                <KPICard title={t('home.kpi.stock_alerts')} value={loading ? '—' : inv?.summary?.alertsCount ?? 0} icon={<AlertTriangle />} color="#e17055" subtitle={t('home.kpi.stock_alerts_subtitle')} />
                <KPICard title={t('home.kpi.monthly_income')} value={loading || !finance ? '—' : `LKR ${(finance.summary?.received?.amount || 0).toLocaleString('en-LK', { maximumFractionDigits: 0 })}`}
                    icon={<TrendingUp />} color="#41b883"
                    trend={parseFloat(finance?.summary?.received?.percentage || 0) >= 0 ? 'up' : 'down'}
                    trendVal={Math.abs(parseFloat(finance?.summary?.received?.percentage || 0)).toFixed(1)} />
                <KPICard title={t('home.kpi.net_cash_flow')} value={loading || !finance ? '—' : `LKR ${(finance.summary?.net?.amount || 0).toLocaleString('en-LK', { maximumFractionDigits: 0 })}`}
                    icon={<DollarSign />} color="#6ab04c"
                    trend={parseFloat(finance?.summary?.net?.percentage || 0) >= 0 ? 'up' : 'down'}
                    trendVal={Math.abs(parseFloat(finance?.summary?.net?.percentage || 0)).toFixed(1)} />
                <KPICard title={t('home.kpi.all_employees')} value={loading ? '—' : employees} icon={<Users />} color="#6c5ce7" subtitle={t('home.kpi.all_employees_subtitle')} />
                <KPICard title={t('home.kpi.pending_payments')} value={loading ? '—' : pendingPayments} icon={<FileText />} color="#fdcb6e" subtitle={t('home.kpi.pending_payments_subtitle')} />
            </div>

            {/* Module Quick-Access */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-4">
                    <h6 className="fw-bold text-dark mb-3">{t('home.quick_access')}</h6>
                    <div className="row g-2 flex-xl-nowrap">
                        {modules.map((m, i) => <QuickTile key={i} {...m} navigate={navigate} />)}
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="row g-3 mb-4">
                {/* Cash Flow Line Chart */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <h6 className="fw-bold text-dark mb-1">{t('home.charts.cash_flow_title')}</h6>
                            <p className="text-muted small mb-3">{t('home.charts.cash_flow_subtitle')}</p>
                            {loading || !finance ? (
                                <div className="d-flex align-items-center justify-content-center" style={{ height: 220 }}>
                                    <div className="spinner-border text-primary" role="status" />
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <LineChart data={finance.cashFlow || []} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                                        <Tooltip formatter={v => `LKR ${v.toLocaleString()}`} />
                                        <Legend />
                                        <Line type="monotone" dataKey="income" stroke="#41b883" strokeWidth={2.5} dot={{ r: 4 }} name={t('home.charts.income')} />
                                        <Line type="monotone" dataKey="expense" stroke="#e17055" strokeWidth={2.5} dot={{ r: 4 }} name={t('home.charts.expense')} />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>

                {/* Inventory Pie */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <h6 className="fw-bold text-dark mb-1">{t('home.charts.inventory_distribution')}</h6>
                            <p className="text-muted small mb-3">{t('home.charts.distribution_subtitle')}</p>
                            {loading || !inv ? (
                                <div className="d-flex align-items-center justify-content-center" style={{ height: 220 }}>
                                    <div className="spinner-border text-primary" role="status" />
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <RePieChart>
                                        <Pie data={inv.distribution || []} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                            {(inv.distribution || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                    </RePieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row — Lists */}
            <div className="row g-3 mb-4">
                {/* Stock Alerts */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="fw-bold text-dark mb-0">{t('home.sections.stock_alerts')}</h6>
                                <button className="btn btn-sm btn-outline-secondary px-2 py-1" style={{ fontSize: '11px' }} onClick={() => navigate('/inventory/alerts')}>{t('home.sections.view_all')} <ChevronRight size={12} /></button>
                            </div>
                            {loading ? <div className="text-center py-3"><div className="spinner-border spinner-border-sm text-primary" /></div> :
                                (inv?.alerts || []).length === 0 ? <p className="text-muted small text-center py-3">{t('home.sections.no_alerts')}</p> :
                                    (inv.alerts || []).map((a, i) => (
                                        <div key={i} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                                            <div>
                                                <p className="mb-0 fw-semibold" style={{ fontSize: '12px' }}>{a.name}</p>
                                                <small className="text-muted">{a.type}</small>
                                            </div>
                                            <span className={`badge ${a.current <= 0 ? 'bg-danger' : 'bg-warning text-dark'}`} style={{ fontSize: '10px' }}>
                                                {a.current <= 0 ? t('home.sections.out_of_stock') : t('home.sections.low_stock')}
                                            </span>
                                        </div>
                                    ))
                            }
                        </div>
                    </div>
                </div>

                {/* Recent Transfers */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="fw-bold text-dark mb-0">{t('home.sections.recent_transfers')}</h6>
                                <button className="btn btn-sm btn-outline-secondary px-2 py-1" style={{ fontSize: '11px' }} onClick={() => navigate('/inventory/stock-transfers')}>{t('home.sections.view_all')} <ChevronRight size={12} /></button>
                            </div>
                            {loading ? <div className="text-center py-3"><div className="spinner-border spinner-border-sm text-primary" /></div> :
                                (inv?.transfers || []).length === 0 ? <p className="text-muted small text-center py-3">{t('home.sections.no_transfers')}</p> :
                                    (inv.transfers || []).map((transfer, i) => (
                                        <div key={i} className="py-2 border-bottom">
                                            <div className="d-flex justify-content-between">
                                                <p className="mb-0 fw-semibold" style={{ fontSize: '12px' }}>{transfer.name}</p>
                                                <span className={`badge ${transfer.Status === 'Completed' ? 'bg-success' : 'bg-warning text-dark'}`} style={{ fontSize: '10px' }}>{transfer.Status}</span>
                                            </div>
                                            <small className="text-muted">{transfer.From_Location} {t('home.sections.from_to')} {transfer.To_Location} · {transfer.Qty} {t('home.sections.units')}</small>
                                        </div>
                                    ))
                            }
                        </div>
                    </div>
                </div>

                {/* Recent Sales */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="fw-bold text-dark mb-0">{t('home.sections.recent_sales')}</h6>
                                <span className="badge bg-primary px-2" style={{ fontSize: '10px' }}>{t('home.sections.days_7')}</span>
                            </div>
                            {loading ? <div className="text-center py-3"><div className="spinner-border spinner-border-sm text-primary" /></div> :
                                sales.length === 0 ? <p className="text-muted small text-center py-3">{t('home.sections.no_sales')}</p> :
                                    sales.slice(0, 5).map((s, i) => (
                                        <div key={i} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                                            <div>
                                                <p className="mb-0 fw-semibold" style={{ fontSize: '12px' }}>{s.invoice_no}</p>
                                                <small className="text-muted">{s.customer_name}</small>
                                            </div>
                                            <div className="text-end">
                                                <p className="mb-0 fw-bold text-success" style={{ fontSize: '12px' }}>LKR {parseFloat(s.total_amount).toLocaleString()}</p>
                                                <span className={`badge ${s.payment_status === 'Paid' ? 'bg-success' : 'bg-warning text-dark'}`} style={{ fontSize: '9px' }}>{s.payment_status}</span>
                                            </div>
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

export default AdminHome;
