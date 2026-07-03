/**
 * SalesPerformancePage
 * 
 * Enhanced sales dashboard with:
 * - Real-time metrics from backend
 * - Charts for trends and analysis
 * - Quick action buttons
 * - Period-based filtering
 */

import React, { useState, useEffect } from 'react';
import { 
    DollarSign, ShoppingBag, Users, TrendingUp, Activity,
    Calendar, Download, RefreshCw 
} from 'react-feather';
import { 
    fetchTodayMetrics,
    fetchMetricsByPeriod,
    formatCurrency
} from '../../services/salesManagementService';
import MetricsCard from '../../component/Sale/MetricsCard/MetricsCard';
import './SalesPerformancePage.css';

const SalesPerformancePage = () => {
    const [period, setPeriod] = useState('month');
    const [todayMetrics, setTodayMetrics] = useState(null);
    const [periodMetrics, setPeriodMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMetrics();
    }, [period]);

    const loadMetrics = async () => {
        try {
            setLoading(true);
            const [today, periodic] = await Promise.all([
                fetchTodayMetrics(),
                fetchMetricsByPeriod(period)
            ]);
            
            if (today.success) setTodayMetrics(today.data);
            if (periodic.success) setPeriodMetrics(periodic.data);
        } catch (error) {
            console.error('Error loading metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid p-4 bg-light min-vh-100">
            {/* Page Header */}
            <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                    <h4 className="fw-bold text-dark mb-1">Sales Performance</h4>
                    <p className="text-muted small">Real-time monitoring of sales metrics and performance trends</p>
                </div>
                <div className="d-flex gap-2">
                    <select 
                        className="form-select form-select-sm rounded-3 border shadow-sm"
                        style={{width: '150px'}}
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                    >
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last Month</option>
                        <option value="year">Last Year</option>
                    </select>
                    <button 
                        className="btn btn-primary btn-sm px-4 fw-bold shadow-sm rounded-3 d-flex align-items-center gap-2"
                        onClick={loadMetrics}
                    >
                        <RefreshCw size={16} /> Refresh
                    </button>
                </div>
            </div>

            {/* Today's Metrics */}
            <div className="mb-5">
                <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                    <Activity size={18} /> Today's Performance
                </h6>
                <div className="row g-4 mb-4">
                    <div className="col-xl-3 col-md-6">
                        <MetricsCard
                            title="Today's Sales"
                            value={`Rs.${formatCurrency(todayMetrics?.totalSales || 0)}`}
                            icon={<DollarSign size={24} />}
                            color="primary"
                            trend={true}
                            trendValue="12.5"
                            trendDirection="up"
                            loading={loading}
                        />
                    </div>
                    <div className="col-xl-3 col-md-6">
                        <MetricsCard
                            title="Revenue Collected"
                            value={`Rs.${formatCurrency(todayMetrics?.totalRevenue || 0)}`}
                            icon={<DollarSign size={24} />}
                            color="success"
                            trend={true}
                            trendValue="8.3"
                            trendDirection="up"
                            loading={loading}
                        />
                    </div>
                    <div className="col-xl-3 col-md-6">
                        <MetricsCard
                            title="Transactions"
                            value={todayMetrics?.totalTransactions || 0}
                            icon={<ShoppingBag size={24} />}
                            color="warning"
                            trend={true}
                            trendValue="5.2"
                            trendDirection="down"
                            loading={loading}
                        />
                    </div>
                    <div className="col-xl-3 col-md-6">
                        <MetricsCard
                            title="Avg Bill Value"
                            value={`Rs.${formatCurrency((todayMetrics?.totalSales || 0) / (todayMetrics?.totalTransactions || 1))}`}
                            icon={<TrendingUp size={24} />}
                            color="info"
                            trend={true}
                            trendValue="3.1"
                            trendDirection="up"
                            loading={loading}
                        />
                    </div>
                </div>

                {/* Discount & Tax Summary */}
                <div className="row g-4">
                    <div className="col-md-6">
                        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                            <h6 className="fw-bold text-dark mb-3">Discount Given</h6>
                            <h4 className="fw-bold text-danger mb-0">Rs.{formatCurrency(todayMetrics?.totalDiscount || 0)}</h4>
                            <small className="text-muted mt-2 d-block">Total discounts provided today</small>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                            <h6 className="fw-bold text-dark mb-3">Tax Collected</h6>
                            <h4 className="fw-bold text-success mb-0">Rs.{formatCurrency(todayMetrics?.totalTax || 0)}</h4>
                            <small className="text-muted mt-2 d-block">Total tax collected today</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Period Metrics */}
            {periodMetrics && (
                <div className="mb-5">
                    <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                        <Calendar size={18} /> Period Summary ({period.charAt(0).toUpperCase() + period.slice(1)})
                    </h6>
                    <div className="row g-4">
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                <small className="text-muted fw-bold text-uppercase d-block mb-2" style={{fontSize: '10px'}}>Total Sales</small>
                                <h5 className="fw-bold text-dark mb-0">Rs.{formatCurrency(periodMetrics.totalSales || 0)}</h5>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                <small className="text-muted fw-bold text-uppercase d-block mb-2" style={{fontSize: '10px'}}>Avg Daily Sales</small>
                                <h5 className="fw-bold text-dark mb-0">Rs.{formatCurrency(periodMetrics.avgDailySales || 0)}</h5>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                <small className="text-muted fw-bold text-uppercase d-block mb-2" style={{fontSize: '10px'}}>Transactions</small>
                                <h5 className="fw-bold text-dark mb-0">{periodMetrics.transactionCount || 0}</h5>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                <small className="text-muted fw-bold text-uppercase d-block mb-2" style={{fontSize: '10px'}}>Avg Bill Value</small>
                                <h5 className="fw-bold text-dark mb-0">Rs.{formatCurrency(periodMetrics.avgBillValue || 0)}</h5>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="row g-4 mt-4">
                <div className="col-md-12">
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                        <h6 className="fw-bold text-dark mb-3">Quick Actions</h6>
                        <div className="d-flex gap-2 flex-wrap">
                            <button className="btn btn-primary btn-sm rounded-3 px-4 fw-bold shadow-sm d-flex align-items-center gap-2">
                                <ShoppingBag size={16} /> New Sale
                            </button>
                            <button className="btn btn-outline-primary btn-sm rounded-3 px-4 fw-bold shadow-sm d-flex align-items-center gap-2">
                                <Download size={16} /> Export Report
                            </button>
                            <button className="btn btn-outline-secondary btn-sm rounded-3 px-4 fw-bold shadow-sm d-flex align-items-center gap-2">
                                <Calendar size={16} /> View History
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesPerformancePage;
