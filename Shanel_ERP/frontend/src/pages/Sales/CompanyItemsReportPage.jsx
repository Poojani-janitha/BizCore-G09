/**
 * CompanyItemsReportPage
 * 
 * Detailed report for company product sales
 * Shows daily breakdown, customer analysis, and trends
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Download, Filter, Package } from 'react-feather';
import {
    fetchCompanyItemsReport,
    formatCurrency,
    formatDate
} from '../../services/salesManagementService';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import './ReportPages.css';

const CompanyItemsReportPage = () => {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReport();
    }, [month, year]);

    const loadReport = async () => {
        try {
            setLoading(true);
            const response = await fetchCompanyItemsReport(month, year);
            if (response.success) {
                setReport(response.data);
            }
        } catch (error) {
            console.error('Error loading report:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container-fluid p-4 bg-light min-vh-100 d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="text-muted mt-2 small fw-bold text-uppercase">Loading company items report...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid p-4 bg-light min-vh-100">
            {/* Header */}
            <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                    <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                        <Package size={24} className="text-primary" /> Company Items Sales Report
                    </h4>
                    <p className="text-muted small">Comprehensive analysis of company product sales</p>
                </div>
                <button className="btn btn-dark btn-sm shadow-sm rounded-3 px-3 d-flex align-items-center gap-2 fw-bold">
                    <Download size={16} /> Export PDF
                </button>
            </div>

            {/* Period Filter */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
                <div className="row g-3 align-items-end">
                    <div className="col-md-3">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{fontSize: '10px'}}>Month</label>
                        <select 
                            className="form-select form-select-sm shadow-sm rounded-3 border"
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                        >
                            {[...Array(12)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(2026, i).toLocaleString('default', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{fontSize: '10px'}}>Year</label>
                        <select 
                            className="form-select form-select-sm shadow-sm rounded-3 border"
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                        >
                            {[2024, 2025, 2026].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-6 ms-auto">
                        <button 
                            className="btn btn-primary btn-sm fw-bold shadow-sm rounded-3 px-4"
                            onClick={loadReport}
                        >
                            <Filter size={16} className="me-2" /> Apply Filter
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            {report && (
                <>
                    <div className="row g-4 mb-4">
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                <small className="text-muted fw-bold text-uppercase d-block mb-2" style={{fontSize: '10px'}}>Total Sales</small>
                                <h5 className="fw-bold text-primary mb-0">Rs.{formatCurrency(report.totalSales || 0)}</h5>
                                <small className="text-muted mt-2 d-block">{report.daysCount || 0} sales days</small>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                <small className="text-muted fw-bold text-uppercase d-block mb-2" style={{fontSize: '10px'}}>Avg Daily Sales</small>
                                <h5 className="fw-bold text-success mb-0">Rs.{formatCurrency(report.avgDailySales || 0)}</h5>
                                <small className="text-muted mt-2 d-block">Per selling day</small>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                <small className="text-muted fw-bold text-uppercase d-block mb-2" style={{fontSize: '10px'}}>Items Sold</small>
                                <h5 className="fw-bold text-warning mb-0">{report.totalItems || 0}</h5>
                                <small className="text-muted mt-2 d-block">Total units sold</small>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                <small className="text-muted fw-bold text-uppercase d-block mb-2" style={{fontSize: '10px'}}>Transactions</small>
                                <h5 className="fw-bold text-info mb-0">{report.transactionCount || 0}</h5>
                                <small className="text-muted mt-2 d-block">Total transactions</small>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="row g-4 mb-4">
                        {/* Daily Sales Trend */}
                        <div className="col-lg-8">
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                                <h6 className="fw-bold text-dark mb-3">Daily Sales Trend</h6>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={report.dailyData || []}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                                        <Tooltip 
                                            contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                            formatter={(value) => [`Rs.${formatCurrency(value)}`, 'Sales']}
                                        />
                                        <Line type="monotone" dataKey="sales" stroke="#0d6efd" strokeWidth={2} dot={{fill: '#0d6efd'}} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Top Products */}
                        <div className="col-lg-4">
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                                <h6 className="fw-bold text-dark mb-3">Top Products</h6>
                                <div className="list-group list-group-flush">
                                    {report.topProducts?.slice(0, 5).map((product, idx) => (
                                        <div key={idx} className="list-group-item border-0 px-0 py-2 d-flex justify-content-between">
                                            <small className="text-dark fw-medium">{product.P_Name}</small>
                                            <small className="fw-bold text-primary">{product.quantity} units</small>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Breakdown */}
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                        <h6 className="fw-bold text-dark mb-3">Customer-wise Sales</h6>
                        <div className="table-responsive">
                            <table className="table table-sm table-hover align-middle">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="py-2 fw-bold text-uppercase text-muted" style={{fontSize: '11px'}}>Customer Name</th>
                                        <th className="py-2 fw-bold text-uppercase text-muted text-end" style={{fontSize: '11px'}}>Sales Amount</th>
                                        <th className="py-2 fw-bold text-uppercase text-muted text-end" style={{fontSize: '11px'}}>Items</th>
                                        <th className="py-2 fw-bold text-uppercase text-muted text-end" style={{fontSize: '11px'}}>Transactions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.customerData?.map((customer, idx) => (
                                        <tr key={idx}>
                                            <td className="fw-medium text-dark">{customer.C_Name || 'Walking Customer'}</td>
                                            <td className="fw-bold text-end">Rs.{formatCurrency(customer.totalSales)}</td>
                                            <td className="text-end">{customer.totalItems}</td>
                                            <td className="text-end">{customer.transactionCount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CompanyItemsReportPage;
