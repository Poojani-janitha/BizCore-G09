import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, Download, Printer } from 'react-feather';
import { generatePDF } from '../../../services/reportGenerator';

const CurrentStockReport = () => {
    const [reportData, setReportData] = useState([]);

    useEffect(() => {
        // We use the view 'v_current_stock' from your DB dump
        axios.get('http://localhost:5000/api/inventory/reports/current-stock')
            .then(res => setReportData(res.data.data));
    }, []);

    const handleExportPDF = () => {
        const columns = ["Item ID", "Item Name", "Prod. Stock", "Sales Stock", "Total", "Status"];
        const data = reportData.map(item => [
            item.P_Code || `ID-${item.P_ID}`,
            item.P_Name,
            item.productionStock,
            item.salesStock,
            item.Total_Stock,
            item.Status
        ]);
        generatePDF("Current Stock Report", columns, data, "Current_Stock_Report");
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className='p-4 bg-light min-vh-100 no-print'>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className='fw-bold mb-1'>Current Stock Report</h4>
                    <p className='text-muted small'>As of {new Date().toLocaleDateString()}</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary btn-sm rounded-3" onClick={handlePrint}>
                        <Printer size={16} className="me-2"/> Print
                    </button>
                    <button className="btn btn-primary btn-sm rounded-3 shadow-sm px-3" 
                            style={{ backgroundColor: '#f97316', borderColor: '#f97316' }}
                            onClick={handleExportPDF}>
                        <Download size={16} className="me-2"/> Export PDF
                    </button>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive p-4">
                    <table className="table align-middle">
                        <thead className="text-muted small text-uppercase">
                            <tr>
                                <th>Item ID</th>
                                <th>Item Name</th>
                                <th>Production Stock</th>
                                <th>Sales Stock</th>
                                <th>Total Stock</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.map((item, i) => (
                                <tr key={i}>
                                    <td className="fw-bold">{item.P_Code || `P-${item.P_ID}`}</td>
                                    <td>{item.P_Name}</td>
                                    <td>{item.productionStock}</td>
                                    <td>{item.salesStock}</td>
                                    <td className="fw-bold">{item.Total_Stock}</td>
                                    <td>
                                        <span className={`badge rounded-pill px-3 ${item.Total_Stock < 50 ? 'bg-warning-subtle text-warning' : 'bg-success-subtle text-success'}`}>
                                            {item.Total_Stock < 50 ? 'Low' : 'Good'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CurrentStockReport;