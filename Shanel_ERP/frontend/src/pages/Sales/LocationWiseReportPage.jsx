/**
 * LocationWiseReportPage
 * 
 * Sales report broken down by physical location
 * Compare performance across Shop, Production, and Main Warehouse
 */

import React, { useState, useEffect } from 'react';
import { MapPin, Download, Filter } from 'react-feather';
import {
    fetchLocationWiseReport,
    formatCurrency
} from '../../services/salesManagementService';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import './ReportPages.css';

const LocationWiseReportPage = () => {
    const [selectedLocation, setSelectedLocation] = useState('Shop');
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    const locations = ['Shop', 'Production', 'Main_Warehouse'];
    const locationColors = {
        'Shop': '#0d6efd',
        'Production': '#17a2b8',
        'Main_Warehouse': '#ffc107'
    };

    useEffect(() => {
        loadReport();
    }, [selectedLocation, month, year]);

    const loadReport = async () => {
        try {
            setLoading(true);
            const response = await fetchLocationWiseReport(selectedLocation, month, year);
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
                    <p className="text-muted mt-2 small fw-bold text-uppercase">Loading location wise report...</p>
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
                        <MapPin size={24} className="text-warning" /> Location-wise Sales Report
                    </h4>
                    <p className="text-muted small">Compare sales performance across all locations</p>
                </div>
                <button className="btn btn-dark btn-sm shadow-sm rounded-3 px-3 d-flex align-items-center gap-2 fw-bold">
                    <Download size={16} /> Export PDF
                </button>
            </div>

            {/* Location Selection & Filters */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
                <div className="row g-3 align-items-end">
                    {/* Location Tabs */}
                    <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted text-uppercase mb-2" style={{fontSize: '10px'}}>Select Location</label>
                        <div className="btn-group w-100 shadow-sm rounded-3 overflow-hidden border" role="group">
                            {locations.map((loc) => (
                                <button
                                    key={loc}
                                    type="button"
                                    className={`btn btn-sm fw-bold ${selectedLocation === loc ? 'btn-primary' : 'btn-light'}`}
                                    onClick={() => setSelectedLocation(loc)}
                                >
                                    {loc.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Month & Year */}
                    <div className="col-md-3">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{fontSize: '10px'}}>Month</label>
                        <select 
                            className="form-select form-select-sm shadow-sm rounded-3 border"
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                        >
                            {[...Array(12)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(2026, i).toLocaleString('default', { month: 'short' })}
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
                </div>
            </div>

            {report && (
                <>
                    {/* Summary Cards */}
                    <div className="row g-4 mb-4">
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                <small className="text-muted fw-bold text-uppercase d-block mb-2" style={{fontSize: '10px'}}>Total Sales</small>
                                <h5 className="fw-bold text-dark mb-0">Rs.{formatCurrency(report.totalSales || 0)}</h5>
                                <small className="text-muted mt-2 d-block">{selectedLocation} location</small>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                <small className="text-muted fw-bold text-uppercase d-block mb-2" style={{fontSize: '10px'}}>Avg Daily</small>
                                <h5 className="fw-bold text-dark mb-0">Rs.{formatCurrency(report.avgDailySales || 0)}</h5>
                                <small className="text-muted mt-2 d-block">Average daily sales</small>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                <small className="text-muted fw-bold text-uppercase d-block mb-2" style={{fontSize: '10px'}}>Transactions</small>
                                <h5 className="fw-bold text-dark mb-0">{report.transactionCount || 0}</h5>
                                <small className="text-muted mt-2 d-block">Total transactions</small>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                <small className="text-muted fw-bold text-uppercase d-block mb-2" style={{fontSize: '10px'}}>Avg Bill</small>
                                <h5 className="fw-bold text-dark mb-0">Rs.{formatCurrency(report.avgBillValue || 0)}</h5>
                                <small className="text-muted mt-2 d-block">Average bill value</small>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="row g-4 mb-4">
                        {/* Daily Sales */}
                        <div className="col-lg-8">
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                <h6 className="fw-bold text-dark mb-3">Daily Sales Breakdown</h6>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={report.dailyData || []}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                                        <Tooltip 
                                            contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                            formatter={(value) => [`Rs.${formatCurrency(value)}`, 'Sales']}
                                        />
                                        <Bar dataKey="sales" fill={locationColors[selectedLocation]} radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Payment Status Distribution */}
                        <div className="col-lg-4">
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                <h6 className="fw-bold text-dark mb-3">Payment Status</h6>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Paid', value: report.paidCount || 0 },
                                                { name: 'Unpaid', value: report.unpaidCount || 0 },
                                                { name: 'Partial', value: report.partialCount || 0 }
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            <Cell fill="#28a745" />
                                            <Cell fill="#dc3545" />
                                            <Cell fill="#ffc107" />
                                        </Pie>
                                        <Legend />
                                        <Tooltip formatter={(value) => value} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Products Sold */}
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                        <h6 className="fw-bold text-dark mb-3">Top Products Sold at {selectedLocation}</h6>
                        <div className="table-responsive">
                            <table className="table table-sm table-hover align-middle">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="py-2 fw-bold text-uppercase text-muted" style={{fontSize: '11px'}}>Product Name</th>
                                        <th className="py-2 fw-bold text-uppercase text-muted text-end" style={{fontSize: '11px'}}>Quantity</th>
                                        <th className="py-2 fw-bold text-uppercase text-muted text-end" style={{fontSize: '11px'}}>Sales Value</th>
                                        <th className="py-2 fw-bold text-uppercase text-muted text-end" style={{fontSize: '11px'}}>% of Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.productData?.map((product, idx) => (
                                        <tr key={idx}>
                                            <td className="fw-medium text-dark">{product.P_Name}</td>
                                            <td className="text-end">{product.quantity}</td>
                                            <td className="fw-bold text-end">Rs.{formatCurrency(product.sales)}</td>
                                            <td className="text-end text-muted">{((product.sales / (report.totalSales || 1)) * 100).toFixed(1)}%</td>
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

export default LocationWiseReportPage;
