import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend 
} from "recharts";
import { TrendingUp, Package, MapPin, Download } from "react-feather";

const SalesReport = () => {
    const [topProducts, setTopProducts] = useState([]);
    const [locationData, setLocationData] = useState([]);
    const [loading, setLoading] = useState(true);

    const COLORS = ['#2c7873', '#fb8c00', '#00acc1', '#8e24aa', '#d81b60'];

    const fetchReportData = async () => {
        try {
            setLoading(true);
            const [productsRes, locationRes] = await Promise.all([
                axios.get('/api/sales-management/analytics/top-products'),
                axios.get('/api/sales-management/analytics/location-sales')
            ]);

            if (productsRes.data.success) setTopProducts(productsRes.data.data);
            if (locationRes.data.success) setLocationData(locationRes.data.data);
        } catch (error) {
            console.error("Error fetching report data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportData();
    }, []);

    if (loading) {
        return (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                <div className="spinner-border text-primary m-auto" role="status"></div>
                <p className="text-muted mt-2 small fw-bold text-uppercase">Loading analytical data...</p>
            </div>
        );
    }

    return (
        <div className="container-fluid p-4 bg-light min-vh-100">
            <div className="mb-4 d-flex justify-content-between align-items-center">
                <div>
                    <h4 className="fw-bold text-dark mb-1">Sales Performance Reports</h4>
                    <p className="text-muted small">In-depth analysis of products and locations</p>
                </div>
                <button className="btn btn-dark btn-sm d-flex align-items-center gap-2 px-3 shadow-sm rounded-3">
                    <Download size={16} /> Export PDF
                </button>
            </div>

            <div className="row g-4 mb-4">
                {/* Top Selling Products - Bar Chart */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
                        <div className="d-flex align-items-center gap-2 mb-4">
                            <Package className="text-primary" size={20} />
                            <h6 className="fw-bold text-dark mb-0">Top 5 Selling Products</h6>
                        </div>
                        <div style={{ width: '100%', height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topProducts}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="Product_Name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="totalQuantity" fill="#2c7873" radius={[6, 6, 0, 0]} barSize={45} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Location-wise Sales - Pie Chart */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
                        <div className="d-flex align-items-center gap-2 mb-4">
                            <MapPin className="text-warning" size={20} />
                            <h6 className="fw-bold text-dark mb-0">Sales by Location</h6>
                        </div>
                        <div style={{ width: '100%', height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={locationData}
                                        dataKey="totalSales"
                                        nameKey="Location"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={5}
                                    >
                                        {locationData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Insights */}
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                <div className="d-flex align-items-center gap-2 mb-4">
                    <TrendingUp className="text-success" size={20} />
                    <h6 className="fw-bold text-dark mb-0">Performance Insights</h6>
                </div>
                <div className="row g-3">
                    <div className="col-md-6">
                        <div className="p-4 rounded-4 bg-light border-start border-primary border-5 h-100">
                            <p className="small text-muted fw-bold text-uppercase mb-2" style={{letterSpacing: '0.5px'}}>Highest Demand Product</p>
                            <h5 className="fw-bold text-dark mb-0">{topProducts[0]?.Product_Name || 'N/A'}</h5>
                            <p className="text-muted small mt-2 mb-0">Total Units Sold: <span className="fw-bold text-primary">{topProducts[0]?.totalQuantity || 0}</span></p>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="p-4 rounded-4 bg-light border-start border-success border-5 h-100">
                            <p className="small text-muted fw-bold text-uppercase mb-2" style={{letterSpacing: '0.5px'}}>Most Profitable Location</p>
                            <h5 className="fw-bold text-dark mb-0">{locationData[0]?.Location || 'N/A'}</h5>
                            <p className="text-muted small mt-2 mb-0">Total Revenue: <span className="fw-bold text-success">Rs.{parseFloat(locationData[0]?.totalSales || 0).toLocaleString()}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesReport;
