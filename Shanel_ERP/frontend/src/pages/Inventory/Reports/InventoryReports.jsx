import React, { useState } from 'react';
import axios from 'axios';
import { Box, Activity, ShoppingCart, RefreshCcw, AlertCircle, Users, Download, ChevronDown } from 'react-feather';
import { generatePDF } from '../../../services/reportGenerator';

const InventoryReports = () => {
    const [selectedReport, setSelectedReport] = useState(null);
    const [reportData, setReportData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const reportCards = [
        { title: "Current Stock", desc: "Real-time inventory", icon: <Box color="#10b981"/>, key: "current-stock", endpoint: "/api/inventory/reports/current-stock" },
        { title: "Production", desc: "Daily production output", icon: <Activity color="#3b82f6"/>, key: "daily-production", endpoint: "/api/inventory/reports/production" },
        { title: "Purchase", desc: "Supplier purchases", icon: <ShoppingCart color="#6366f1"/>, key: "purchases", endpoint: "/api/inventory/reports/purchases" },
        { title: "Stock Transfer", desc: "Stock movements", icon: <RefreshCcw color="#a855f7"/>, key: "transfers", endpoint: "/api/inventory/reports/transfers" },
        { title: "Expiry", desc: "Items nearing expiry", icon: <AlertCircle color="#ef4444"/>, key: "expiry", endpoint: "/api/inventory/reports/expiry" },
        { title: "Supplier Spend", desc: "Purchase by supplier", icon: <Users color="#f59e0b"/>, key: "supplier-purchases", endpoint: "/api/inventory/reports/supplier-purchases" },
    ];

    const loadReport = async (report) => {
        if (selectedReport?.key === report.key) {
            setSelectedReport(null);
            return;
        }

        setIsLoading(true);
        setSelectedReport(report);
        try {
            const response = await axios.get(`http://localhost:5000${report.endpoint}`);
            setReportData(response.data.data || []);
        } catch (error) {
            console.error('Error loading report:', error);
            setReportData([]);
        } finally {
            setIsLoading(false);
        }
    };

    const getTableColumns = (reportKey) => {
        const columnMap = {
            'current-stock': ['P_Code', 'P_Name', 'productionStock', 'salesStock', 'Total_Stock'],
            'daily-production': ['P_Code', 'P_Name', 'Batch_No', 'Actual_Qty', 'Production_Date', 'Cost_Per_Unit', 'Status'],
            'purchases': ['PO_No', 'Supplier', 'PO_Date', 'Total_Amount', 'Payment_Status', 'Status'],
            'transfers': ['ST_ID', 'P_Name', 'From_Location', 'To_Location', 'Qty', 'Transfer_Date', 'Status'],
            'expiry': ['P_Code', 'P_Name', 'Batch_No', 'Exp_Date', 'Days_Left'],
            'supplier-purchases': ['S_Code', 'S_Name', 'Total_Orders', 'Total_Spent']
        };
        return columnMap[reportKey] || [];
    };

    const handleExportPDF = () => {
        if (!selectedReport || reportData.length === 0) return;
        
        const columns = getTableColumns(selectedReport.key);
        generatePDF(`${selectedReport.title} Report`, columns, reportData, `${selectedReport.title}_Report`);
    };

    return (
        <div className='p-4 bg-light min-vh-100'>
            <h4 className='fw-bold mb-1 d-print-none'>Inventory Reports</h4>
            <p className='text-muted small mb-4 d-print-none'>Click any report card to view data</p>

            {/* Report Cards Grid - Hide on print */}
            <div className="row g-3 mb-5 d-print-none">
                {reportCards.map((card, i) => (
                    <div key={i} className="col-lg-2 col-md-3 col-sm-4 col-6">
                        <div 
                            className={`card border-0 rounded-3 p-3 h-100 cursor-pointer report-card transition-all ${selectedReport?.key === card.key ? 'shadow-lg' : 'shadow-sm'}`}
                            onClick={() => loadReport(card)}
                            style={{ 
                                cursor: 'pointer',
                                backgroundColor: selectedReport?.key === card.key ? '#e8f5ff' : 'white',
                                borderLeft: selectedReport?.key === card.key ? '4px solid #3b82f6' : 'none',
                                minHeight: '100px',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <div className="d-flex flex-column align-items-center text-center">
                                <div className="p-2 rounded-2 mb-2" style={{ backgroundColor: '#f8fafc' }}>
                                    {card.icon}
                                </div>
                                <h6 className="fw-bold mb-1 report-card-title small">{card.title}</h6>
                                <p className="text-muted small mb-0">{card.desc}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Report Data Display */}
            {selectedReport && (
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="fw-bold mb-0">{selectedReport.title} Report</h5>
                            <p className="text-muted small mb-0">Generated on {new Date().toLocaleDateString()}</p>
                        </div>
                        <div className="d-flex gap-2 d-print-none">
                            <button className="btn btn-primary btn-sm rounded-3 shadow-sm px-3" 
                                    style={{ backgroundColor: '#f97316', borderColor: '#f97316' }}
                                    onClick={handleExportPDF}>
                                <Download size={16} className="me-2"/> Export PDF
                            </button>
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoading ? (
                        <div className="text-center p-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : reportData.length === 0 ? (
                        <div className="text-center p-5 text-muted">
                            <p>No data available for this report</p>
                        </div>
                    ) : (
                        <div className="table-responsive p-4">
                            <table className="table align-middle mb-0">
                                <thead className="text-muted small text-uppercase">
                                    <tr>
                                        {getTableColumns(selectedReport.key).map(col => (
                                            <th key={col}>{col.replace(/_/g, ' ')}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.map((row, i) => (
                                        <tr key={i}>
                                            {getTableColumns(selectedReport.key).map(col => (
                                                <td key={col} className={col === 'Total_Stock' || col === 'Total_Spent' ? 'fw-bold' : ''}>
                                                    {typeof row[col] === 'number' ? row[col].toFixed(2) : row[col]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default InventoryReports;