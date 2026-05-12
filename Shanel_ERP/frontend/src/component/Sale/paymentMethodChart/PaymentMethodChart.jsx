import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const PaymentMethodChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Professional Color Palette
    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

    const fetchPaymentData = async () => {
        try {
            setLoading(true);
            // Route: /api/sales-management/analytics/payment-method
            // Controller: getPaymentMethodBreakdown
            const response = await axios.get('/api/sales-management/analytics/payment-method');
            
            if (response.data.success) {
                // Map data for Recharts
                const formattedData = response.data.data.map(item => ({
                    name: item.Payment_Method || 'Unknown',
                    value: parseFloat(item.total) || 0,
                    count: item.count || 0
                }));
                setData(formattedData);
            }
        } catch (error) {
            console.error("Error fetching payment method data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPaymentData();
    }, []);

    if (loading) {
        return (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white h-100" style={{ minHeight: '400px' }}>
                <div className="spinner-border text-primary m-auto" role="status"></div>
                <p className="text-muted mt-2 small fw-bold text-uppercase">Mapping payments...</p>
            </div>
        );
    }

    return (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 overflow-hidden" style={{ minHeight: '420px' }}>
            <div className="mb-4">
                <h6 className="fw-bold text-dark mb-0">Payment Methods</h6>
                <small className="text-muted">Revenue distribution by channel</small>
            </div>

            <div style={{ width: '100%', height: '300px' }}>
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={85}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                formatter={(value) => `Rs.${value.toLocaleString()}`}
                            />
                            <Legend 
                                iconType="circle" 
                                verticalAlign="bottom" 
                                layout="horizontal" 
                                align="center"
                                wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 600 }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="d-flex align-items-center justify-content-center h-100 text-muted small fw-medium">
                        No payment data available for today
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentMethodChart;
