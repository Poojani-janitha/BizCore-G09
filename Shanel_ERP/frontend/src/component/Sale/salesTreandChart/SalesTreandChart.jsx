import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const SalesTreandChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTrendData = async () => {
        try {
            setLoading(true);
            const now = new Date();
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear();

            //Route: /api/sales-management/reports/monthly
            //Controller: getMonthlySalesReport

            const response = await axios.get(`/api/sales-management/reports/monthly?month=${currentMonth}&year=${currentYear}`);

            if (response.data.success) {
                // Format the data for Recharts (Format date to "15 May" style)
                const formattedData = response.data.data.map(item => ({
                    name: new Date(item.Sale_Date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
                    total: parseFloat(item.total) || 0,
                    count: parseInt(item.salesCount) || 0
                }));
                setData(formattedData);
            }
        } catch (error) {
            console.error("Error fetching trend data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrendData();
    }, []);

    if (loading) {
        return (
            <div className="card border-0 shadow-sm rounded-3 p-5 text-center bg-white" style={{ height: '400px' }}>
                <div className="spinner-border text-primary m-auto" role="status"></div>
                <p className="text-muted mt-2">Analyzing sales trends...</p>
            </div>
        );
    }

    return (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white overflow-hidden" style={{ height: '420px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h6 className="fw-bold text-dark mb-0">Monthly Sales Trend</h6>
                    <small className="text-muted">Daily performance for the current month</small>
                </div>
                <div className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill">
                    Live Data
                </div>
            </div>

            <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2c7873" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#2c7873" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                            tickFormatter={(value) => `Rs.${value >= 1000 ? (value / 1000) + 'k' : value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                padding: '12px'
                            }}
                            formatter={(value) => [`Rs.${value.toLocaleString()}`, 'Revenue']}
                        />
                        <Area
                            type="monotone"
                            dataKey="total"
                            stroke="#2c7873"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorTotal)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SalesTreandChart;