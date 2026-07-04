import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    DollarSign, ShoppingBag, TrendingUp, Users,
    AlertCircle, CheckCircle, XCircle, Clock, ArrowUpRight,
    ArrowRight, RefreshCw, BarChart2, Filter, Calendar, Award,
    CreditCard
} from 'react-feather';
import {
    AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const CHART_COLORS = ['#004445', '#2c7873', '#41b883', '#6ab04c', '#f9ca24', '#eb4d4b'];

// ─── Header Badge Component ──────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const config = {
        Pending: 'bg-warning-subtle text-warning border-warning-subtle',
        Cleared: 'bg-success-subtle text-success border-success-subtle',
        Bounced: 'bg-danger-subtle text-danger border-danger-subtle'
    };
    return (
        <span className={`badge border rounded-pill px-2 py-1 ${config[status] || 'bg-secondary-subtle'}`} style={{ fontSize: '10px' }}>
            {status}
        </span>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const SalesDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [period, setPeriod] = useState('thisMonth');
    const [trendType, setTrendType] = useState('daily');
    const [recentSales, setRecentSales] = useState([]);
    
    // Aggregated Dashboard State
    const [data, setData] = useState({
        today: { totalSales: 0, salesCount: 0, grossRevenue: 0 },
        outstanding: { totalDue: 0, overdue: 0, notYetDue: 0 },
        cheques: { pending: [], expiring: [], bounced: [] },
        topCustomers: [],
        topProducts: [],
        trend: { points: [], growthPercent: 0, growthAbsolute: 0 },
        totalCustomers: 0,
        totalChequeAlerts: 0,
        dueSalesCount: 0
    });

    const fetchDashboardData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            // Fetch aggregated data
            const res = await axios.get(`/api/sales-management/dashboard/aggregator?period=${period}&trendType=${trendType}`);
            if (res.data.success) {
                setData(res.data.data);
            }
            
            // Fetch recent sales (last 10)
            const recentRes = await axios.get('/api/sales-management/history?limit=10');
            if (recentRes.data.success) {
                setRecentSales(recentRes.data.data);
            }
        } catch (e) {
            console.error('Error fetching dashboard data:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [period, trendType]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh', backgroundColor: '#f8fafc' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} />
                    <p className="text-muted small fw-bold text-uppercase tracking-wider">{t('sales.dashboard.loading')}</p>
                </div>
            </div>
        );
    }

    const cardData = [
        {
            title: t('sales.dashboard.todays_sales'),
            value: `Rs.${(data.today?.totalSales || 0).toLocaleString()}`,
            label: t('sales.dashboard.todays_sales_desc'),
            icon: <DollarSign className="text-primary" size={20} />,
            color: "border-primary",
            onClick: () => navigate('/sales/history')
        },
        {
            title: t('sales.dashboard.number_of_sales'),
            value: data.today?.salesCount || '0',
            label: t('sales.dashboard.number_of_sales_desc'),
            icon: <ShoppingBag className="text-info" size={20} />,
            color: "border-info",
            onClick: () => navigate('/sales/history')
        },
        {
            title: t('sales.dashboard.gross_revenue'),
            value: `Rs.${(data.today?.grossRevenue || 0).toLocaleString()}`,
            label: t('sales.dashboard.gross_revenue_desc'),
            icon: <TrendingUp className="text-success" size={20} />,
            color: "border-success",
            onClick: () => navigate('/sales/history')
        },
        {
            title: t('sales.customer_list.outstanding_balance'),
            value: `Rs.${(data.outstanding?.totalDue || 0).toLocaleString()}`,
            label: `${t('sales.overdue')}: Rs.${(data.outstanding?.overdue || 0).toLocaleString()}`,
            icon: <AlertCircle className="text-danger" size={20} />,
            color: "border-danger",
            onClick: () => navigate('/sales/due')
        },
        {
            title: t('sales.dashboard.cheque_risks'),
            value: data.totalChequeAlerts || '0',
            label: t('sales.dashboard.cheque_risks_desc'),
            icon: <CreditCard className="text-warning" size={20} />,
            color: "border-warning",
            onClick: () => navigate('/sales/cheques')
        },
        {
            title: t('sales.due_sales_title'),
            value: data.dueSalesCount || '0',
            label: t('sales.dashboard.due_sales_desc'),
            icon: <Clock className="text-danger" size={20} />,
            color: "border-danger",
            onClick: () => navigate('/sales/due')
        }
    ];

    const pieData = data.topProducts.map(p => ({ name: p.name, value: p.revenue }));

    return (
        <div className="container-fluid p-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Outfit', 'Inter', sans-serif" }}>
            
            {/* Header Area - Title and Refresh removed for global navbar consistency */}

            {/* Top Metric Tiles (Unified flex row layout styled exactly like InventoryMetrics) */}
            <div className="d-flex gap-2 mb-4" style={{ width: '100%' }}>
                {cardData.map((card, index) => (
                    <div key={index} style={{ flex: 1, minWidth: 0 }}>
                        <div 
                            className={`card border-0 border-top border-4 ${card.color} shadow-sm p-3 h-100`}
                            style={{ 
                                cursor: 'pointer', 
                                transition: 'all 0.3s ease'
                            }}
                            onClick={card.onClick}
                            role="button"
                            tabIndex="0"
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-6px)';
                                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '';
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                                    {card.title}
                                </small>
                                <div className="opacity-75">
                                    {card.icon}
                                </div>
                            </div>
                            
                            <div className="d-flex align-items-center gap-2 mb-1">
                                <h5 className="fw-bold mb-0" style={{ fontSize: '24px', color: '#1e293b' }}>
                                    {card.value}
                                </h5>
                            </div>
                            
                            <small className="text-muted d-block text-truncate" style={{ fontSize: '11px' }}>
                                {card.label}
                            </small>
                        </div>
                    </div>
                ))}
            </div>

            {/* Middle Row: Revenue Growth Trend LineChart + Top Products PieChart */}
            <div className="row g-4 mb-4">
                {/* Revenue Growth & Trend Chart */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h6 className="fw-bold text-dark mb-0">{t('sales.dashboard.revenue_growth_trend')}</h6>
                                <small className="text-muted">{t('sales.dashboard.revenue_growth_trend_desc')}</small>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                {data.trend.growthAbsolute !== 0 && (
                                    <span className={`badge ${data.trend.growthAbsolute >= 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} rounded-pill px-3 py-2 fw-bold`}>
                                        {data.trend.growthAbsolute >= 0 ? '+' : ''}Rs.{data.trend.growthAbsolute.toLocaleString()} ({data.trend.growthPercent}%)
                                    </span>
                                )}
                                <div className="d-flex bg-light rounded-pill p-1 border shadow-sm">
                                    {['daily', 'weekly', 'monthly'].map(type => (
                                        <button
                                            key={type}
                                            className={`btn btn-sm rounded-pill px-3 py-1 border-0 fw-bold transition-all ${trendType === type ? 'bg-primary text-white shadow-sm' : 'text-muted'}`}
                                            style={{ fontSize: '11px' }}
                                            onClick={() => setTrendType(type)}
                                        >
                                            {type.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Professional Recharts AreaChart with sleek wave effects */}
                        <div style={{ height: '240px', width: '100%' }}>
                            {data.trend.points.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data.trend.points} margin={{ top: 10, right: 15, bottom: 5, left: 10 }}>
                                        <defs>
                                            <linearGradient id="salesTrendGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2c7873" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#2c7873" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis 
                                            dataKey="date" 
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                                            tickFormatter={d => trendType === 'daily' ? new Date(d).toLocaleDateString(undefined, {month:'short', day:'numeric'}) : d}
                                            dy={5}
                                        />
                                        <YAxis 
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                                            tickFormatter={v => `Rs.${(v / 1000).toFixed(0)}k`} 
                                        />
                                        <Tooltip 
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: 'none',
                                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                                padding: '12px'
                                            }}
                                            formatter={v => [`Rs. ${v.toLocaleString()}`, t('sales.total')]} 
                                        />
                                        <Legend />
                                        <Area 
                                            type="monotone" 
                                            dataKey="revenue" 
                                            stroke="#2c7873" 
                                            strokeWidth={3} 
                                            fillOpacity={1}
                                            fill="url(#salesTrendGradient)"
                                            name={t('sales.total')} 
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="d-flex align-items-center justify-content-center h-100 text-muted small">{t('sales.dashboard.no_trend_data')}</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Top Performing Products (PieChart styled exactly like user provided reference) */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white d-flex flex-column">
                        <div className="pt-2 px-2">
                            <div>
                                <h6 className="fw-bold text-dark mb-0">{t('sales.dashboard.top_products')}</h6>
                                <small className="text-muted">{t('sales.dashboard.top_products_desc')}</small>
                            </div>
                        </div>
                        
                        <div style={{ height: '220px', width: '100%' }} className="my-auto">
                            {pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie 
                                            data={pieData} 
                                            cx="50%" 
                                            cy="50%" 
                                            outerRadius={65} 
                                            dataKey="value" 
                                            nameKey="name" 
                                            startAngle={90}
                                            endAngle={-270}
                                            labelLine={false}
                                            label={({ name, percent }) => `${name.substring(0, 10)} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {pieData.map((_, i) => (
                                                <Cell 
                                                    key={`cell-${i}`} 
                                                    fill={CHART_COLORS[i % CHART_COLORS.length]} 
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={v => `Rs. ${v.toLocaleString()}`} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="d-flex align-items-center justify-content-center h-100 text-muted small">{t('sales.dashboard.no_products_found')}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: 3 visual cards side by side */}
            <div className="row g-4">
                {/* Bottom Card 1: Top Customers */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 bg-white h-100">
                        <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center border-bottom" style={{ borderColor: '#f1f5f9' }}>
                            <div className="d-flex align-items-center gap-2">
                                <Users className="text-secondary" size={16} />
                                <span className="fw-bold text-dark" style={{ fontSize: '13px' }}>{t('sales.dashboard.top_customers')}</span>
                            </div>
                            <button 
                                className="btn btn-white btn-xs border text-muted px-2 py-1 rounded shadow-sm bg-white" 
                                style={{ fontSize: '10px', fontWeight: 'bold' }}
                                onClick={() => navigate('/sales/customers')}
                            >
                                {t('sales.dashboard.view_all')} &gt;
                            </button>
                        </div>
                        <div className="card-body px-4 py-3">
                            {data.topCustomers.length === 0 ? (
                                <p className="text-muted small text-center py-4">{t('sales.dashboard.no_customers_found')}</p>
                            ) : data.topCustomers.map((c, i) => (
                                <div key={i} className="d-flex align-items-center gap-3 py-2 border-bottom" style={{ borderColor: '#f1f5f9' }}>
                                    <div className="fw-bold text-primary small" style={{ minWidth: 15 }}>{i + 1}</div>
                                    <div className="flex-grow-1 min-w-0">
                                        <div className="fw-bold text-dark small text-truncate">{c.name}</div>
                                        <small className="text-muted" style={{ fontSize: '9px' }}>{t('sales.dashboard.last_order')}: {c.lastPurchase ? new Date(c.lastPurchase).toLocaleDateString() : '—'}</small>
                                    </div>
                                    <div className="text-end">
                                        <div className="fw-bold text-dark small">Rs.{c.totalPurchases.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                                        {c.outstanding > 0 && (
                                            <span className="badge bg-danger-subtle text-danger rounded-pill px-2 py-0" style={{ fontSize: '9px' }}>Rs.{c.outstanding.toLocaleString()} {t('sales.dashboard.due')}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Card 2: Expired and Date Near to Expired Cheque List */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 bg-white h-100">
                        <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center border-bottom" style={{ borderColor: '#f1f5f9' }}>
                            <div className="d-flex align-items-center gap-2">
                                <AlertCircle className="text-danger" size={16} />
                                <span className="fw-bold text-dark" style={{ fontSize: '13px' }}>{t('sales.dashboard.cheque_risks_title')}</span>
                            </div>
                            <button 
                                className="btn btn-white btn-xs border text-muted px-2 py-1 rounded shadow-sm bg-white" 
                                style={{ fontSize: '10px', fontWeight: 'bold' }}
                                onClick={() => navigate('/sales/cheques')}
                            >
                                {t('sales.dashboard.view_all')} &gt;
                            </button>
                        </div>
                        <div className="card-body px-4 py-3">
                            {/* Merge Bounced (Expired) and Expiring Soon cheques */}
                            {[...data.cheques.bounced, ...data.cheques.expiring].length === 0 ? (
                                <div className="text-center py-4 text-muted small">
                                    <CheckCircle size={24} className="text-success mb-2 opacity-50" />
                                    <p className="mb-0">{t('sales.dashboard.no_risk_cheques')}</p>
                                </div>
                            ) : [...data.cheques.bounced, ...data.cheques.expiring].slice(0, 5).map((ch, idx) => {
                                const isBounced = ch.Cheque_Status === 'Bounced';
                                return (
                                    <div key={idx} className="d-flex align-items-center gap-3 py-2 border-bottom" style={{ borderColor: '#f1f5f9' }}>
                                        <div className={`p-1.5 rounded-circle ${isBounced ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning'}`}>
                                            {isBounced ? <XCircle size={12} /> : <Clock size={12} />}
                                        </div>
                                        <div className="flex-grow-1 min-w-0">
                                            <div className="fw-bold text-dark small text-truncate">{ch.Cheque_No}</div>
                                            <small className="text-muted d-block text-truncate" style={{ fontSize: '9px' }}>
                                                {ch.Customer?.C_Name || 'Customer'} · {t('sales.due_amount')}: {new Date(ch.Cheque_Date).toLocaleDateString()}
                                            </small>
                                        </div>
                                        <div className="text-end">
                                            <div className="fw-bold text-dark small">Rs.{parseFloat(ch.Amount).toLocaleString()}</div>
                                            <span className={`badge ${isBounced ? 'bg-danger text-white' : 'bg-warning text-dark'} rounded-pill`} style={{ fontSize: '8px' }}>
                                                {isBounced ? t('sales.bounced') : t('sales.dashboard.near_expire')}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Bottom Card 3: Recent Sales */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 bg-white h-100">
                        <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center border-bottom" style={{ borderColor: '#f1f5f9' }}>
                            <div className="d-flex align-items-center gap-2">
                                <ShoppingBag className="text-secondary" size={16} />
                                <span className="fw-bold text-dark" style={{ fontSize: '13px' }}>{t('sales.dashboard.recent_sales')}</span>
                            </div>
                            <button 
                                className="btn btn-white btn-xs border text-muted px-2 py-1 rounded shadow-sm bg-white" 
                                style={{ fontSize: '10px', fontWeight: 'bold' }}
                                onClick={() => navigate('/sales/history')}
                            >
                                {t('sales.dashboard.view_all')} &gt;
                            </button>
                        </div>
                        <div className="card-body px-4 py-3">
                            {recentSales.length === 0 ? (
                                <p className="text-muted small text-center py-4">{t('sales.no_transactions')}</p>
                            ) : recentSales.slice(0, 5).map((sale, idx) => (
                                <div key={idx} className="d-flex align-items-center gap-3 py-2 border-bottom" style={{ borderColor: '#f1f5f9' }}>
                                    <div className="fw-bold text-primary small">{sale.Invoice_No}</div>
                                    <div className="flex-grow-1 min-w-0">
                                        <div className="fw-bold text-dark small text-truncate">{sale.Customer?.C_Name || 'Walking Customer'}</div>
                                        <small className="text-muted" style={{ fontSize: '9px' }}>{new Date(sale.Sale_Date).toLocaleDateString()} {sale.Sale_Time}</small>
                                    </div>
                                    <div className="text-end">
                                        <div className="fw-bold text-dark small">Rs.{parseFloat(sale.Total_Amount).toLocaleString()}</div>
                                        <span className={`badge ${
                                            sale.Payment_Status === 'Paid' ? 'bg-success-subtle text-success' :
                                            sale.Payment_Status === 'Partially_Paid' ? 'bg-warning-subtle text-warning' :
                                            'bg-danger-subtle text-danger'
                                        } rounded-pill`} style={{ fontSize: '8px' }}>
                                            {sale.Payment_Status === 'Paid' ? t('sales.paid') : sale.Payment_Status === 'Partially_Paid' ? t('sales.partially_paid') : t('sales.unpaid')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Embedded styles for spinning icon */}
            <style>
                {`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    .spin {
                        animation: spin 1s linear infinite;
                    }
                    .transition-all {
                        transition: all 0.25s ease-in-out;
                    }
                    .hover-translate:hover {
                        transform: translateY(-3px);
                    }
                `}
            </style>
        </div>
    );
};

export default SalesDashboard;
