import React, { useState, useEffect } from 'react';
import { TrendingUp, X } from 'lucide-react';

const RecentSale = () => {
    const [recentSales, setRecentSales] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchRecentSales = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/sales/all');
            const data = await res.json();
            if (data.success) {
                setRecentSales(data.data);
            } else {
                console.error('Failed to fetch recent sales');
            }
        } catch (error) {
            console.error('Error fetching recent sales:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchRecentSales();
        }
    }, [isOpen]);

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#007bff',
                    border: 'none',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0, 123, 255, 0.4)',
                    zIndex: 999,
                    transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#0056b3';
                    e.target.style.boxShadow = '0 6px 16px rgba(0, 123, 255, 0.6)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#007bff';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.4)';
                }}
            >
                <TrendingUp size={24} />
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'flex-end',
                    }}
                >
                    {/* Modal Panel */}
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: '#fff',
                            width: '100%',
                            maxHeight: '80vh',
                            borderRadius: '20px 20px 0 0',
                            padding: '20px',
                            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            zIndex: 1001,
                            animation: 'slideUp 0.3s ease-out'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px',
                            paddingBottom: '15px',
                            borderBottom: '1px solid #e0e0e0'
                        }}>
                            <h5 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1a1a2e' }}>
                                Recent Sales (Last 7 days)
                            </h5>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '5px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#6c757d'
                                }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div style={{ overflowY: 'auto', flex: 1 }}>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                                    Loading recent sales...
                                </div>
                            ) : recentSales.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                                    No recent sales found
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {recentSales.map((sale) => (
                                        <div
                                            key={sale.invoice_no}
                                            style={{
                                                padding: '12px 15px',
                                                backgroundColor: '#f8f9fa',
                                                borderRadius: '8px',
                                                border: '1px solid #e0e0e0',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#e7f5ff';
                                                e.currentTarget.style.borderColor = '#74c0fc';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = '#f8f9fa';
                                                e.currentTarget.style.borderColor = '#e0e0e0';
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                <span style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '15px' }}>
                                                    {sale.invoice_no}
                                                </span>
                                                <span style={{
                                                    padding: '3px 10px',
                                                    backgroundColor: sale.payment_status === 'Paid' ? '#d4edda' : '#fff3cd',
                                                    color: sale.payment_status === 'Paid' ? '#155724' : '#856404',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: '500'
                                                }}>
                                                    {sale.payment_status}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6c757d', marginBottom: '6px' }}>
                                                <span>{sale.customer_name}</span>
                                                <span>{sale.sale_date} {sale.sale_time}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '500' }}>
                                                <span style={{ color: '#1a1a2e' }}>Total: Rs {parseFloat(sale.total_amount).toFixed(2)}</span>
                                                <span style={{ color: sale.balance > 0 ? '#dc3545' : '#28a745' }}>
                                                    Balance: Rs {parseFloat(sale.balance).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideUp {
                    from {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </>
    );
};

export default RecentSale;
