import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { generatePDF } from '../../../services/reportGenerator';

const SupplierPurchaseReport = () => {
    const [reportData, setReportData] = useState([]);
    useEffect(() => {
        axios.get('http://localhost:5000/api/inventory/reports/supplier-purchases').then(res => setReportData(res.data.data));
    }, []);

    const handleExportPDF = () => {
        const columns = ["Code", "Supplier Name", "Total Orders", "Total Spent"];
        const data = reportData.map(item => [item.S_Code, item.S_Name, item.Total_Orders, `LKR ${item.Total_Spent}`]);
        generatePDF("Supplier Purchase Summary", columns, data, "Supplier_Report");
    };

    return (
        <div className='p-4 bg-light min-vh-100 no-print'>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className='fw-bold mb-0'>Supplier Purchase Report</h4>
                <button className="btn btn-primary btn-sm rounded-3 shadow-sm px-3" style={{ backgroundColor: '#f97316', borderColor: '#f97316' }} onClick={handleExportPDF}>Export PDF</button>
            </div>
            <div className="card border-0 shadow-sm rounded-4 p-4">
                <table className="table align-middle">
                    <thead><tr className="small text-muted text-uppercase"><th>Supplier</th><th>Total Orders</th><th>Total Expenditure</th></tr></thead>
                    <tbody>
                        {reportData.map((item, i) => (
                            <tr key={i}><td className="fw-bold">{item.S_Name}</td><td>{item.Total_Orders} orders</td><td className="fw-bold text-dark">LKR {parseFloat(item.Total_Spent || 0).toLocaleString()}</td></tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default SupplierPurchaseReport;