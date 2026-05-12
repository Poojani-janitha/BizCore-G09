import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    DollarSign, ShoppingBag, Users, TrendingUp, 
    ArrowUpRight, ArrowDownRight, Activity 
} from 'react-feather';
import SalesTreandChart from '../../component/Sale/salesTreandChart/SalesTreandChart';
import PaymentMethodChart from '../../component/Sale/paymentMethodChart/PaymentMethodChart';
import RecentSalesTable from '../../component/Sale/recentSalesTable/RecentSalesTable';

const SalesDashboard = () => {
    const [metrics, setMetrics] = useState({
        totalSales: 0,
        totalRevenue: 0,
        transactionCount: 0,
        avgBillValue: 0,
        todaySales: 0,
        growth: 12.5
    });
    const [loading, setLoading] = useState(true);

    const fetchDashboardMetrics = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/sales-management/metrics/today');
            if (response.data.success) {
                const data = response.data.data;
                setMetrics({
                    totalSales: data.totalSales || 0,
                    totalRevenue: data.totalRevenue || 0,
                    transactionCount: data.totalTransactions || 0,
                    avgBillValue: data.totalTransactions > 0 ? (data.totalSales / data.totalTransactions) : 0,
                    todaySales: data.totalSales || 0,
                    growth: 8.2 // Mock growth for UI aesthetic
                });
            }
        } catch (error) {
            console.error("Error fetching dashboard metrics:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardMetrics();
    }, []);

    const MetricCard = ({ title, value, icon, color, trend, trendValue }) => (
        <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-start mb-3">
                <div className={`p-2 rounded-3 bg-${color}-subtle text-${color}`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`d-flex align-items-center gap-1 small fw-bold text-${trend === 'up' ? 'success' : 'danger'}`}>
                        {trend === 'up' ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
                        {trendValue}%
                    </div>
                )}
            </div>
            <p className="text-muted small fw-bold text-uppercase mb-1" style={{fontSize: '10px', letterSpacing: '0.5px'}}>{title}</p>
            <h4 className="fw-bold text-dark mb-0">{value}</h4>
        </div>
    );

    if (loading) {
        return (
            <div className="container-fluid p-4 bg-light min-vh-100 d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="text-muted mt-2 small fw-bold text-uppercase">Preparing your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid p-4 bg-light min-vh-100">
            {/* Header */}
            <div className="mb-4 d-flex justify-content-between align-items-center">
                <div>
                    <h4 className="fw-bold text-dark mb-1">Sales Dashboard</h4>
                    <p className="text-muted small">Real-time monitoring of sales and revenue metrics</p>
                </div>
                <button className="btn btn-primary btn-sm px-4 fw-bold shadow-sm rounded-3 d-flex align-items-center gap-2" onClick={fetchDashboardMetrics}>
                    <Activity size={16} /> Refresh Metrics
                </button>
            </div>

            {/* Metric Cards Row */}
            <div className="row g-4 mb-4">
                <div className="col-xl-3 col-md-6">
                    <MetricCard 
                        title="Today's Sales" 
                        value={`Rs.${metrics.todaySales.toLocaleString()}`} 
                        icon={<DollarSign size={20}/>} 
                        color="primary"
                        trend="up"
                        trendValue="12"
                    />
                </div>
                <div className="col-xl-3 col-md-6">
                    <MetricCard 
                        title="Total Transactions" 
                        value={metrics.transactionCount.toLocaleString()} 
                        icon={<ShoppingBag size={20}/>} 
                        color="success"
                        trend="up"
                        trendValue="5"
                    />
                </div>
                <div className="col-xl-3 col-md-6">
                    <MetricCard 
                        title="Avg. Bill Value" 
                        value={`Rs.${Math.round(metrics.avgBillValue).toLocaleString()}`} 
                        icon={<TrendingUp size={20}/>} 
                        color="warning"
                        trend="down"
                        trendValue="2"
                    />
                </div>
                <div className="col-xl-3 col-md-6">
                    <MetricCard 
                        title="Sales Growth" 
                        value={`${metrics.growth}%`} 
                        icon={<Users size={20}/>} 
                        color="info"
                        trend="up"
                        trendValue="8"
                    />
                </div>
            </div>

            {/* Charts Row */}
            <div className="row g-4 mb-4">
                <div className="col-lg-8">
                    <SalesTreandChart />
                </div>
                <div className="col-lg-4">
                    <PaymentMethodChart />
                </div>
            </div>

            {/* Recent Sales Table */}
            <div className="row">
                <div className="col-12">
                    <RecentSalesTable title="Live Transactions Feed" />
                </div>
            </div>
        </div>
    );
};

export default SalesDashboard;
