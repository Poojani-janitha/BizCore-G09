import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Download, Printer } from 'react-feather';
import { generatePDF } from '../../../services/reportGenerator';

const PurchaseReport = () => {
    const [reportData, setReportData] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/inventory/reports/purchases').then(res => setReportData(res.data.data));
    }, []);

    const handleExportPDF = () => {
        const columns = ["PO No", "Supplier", "Date", "Amount", "Payment", "Status"];
        const data = reportData.map(item => [item.PO_No, item.Supplier, item.PO_Date, `LKR ${item.Total_Amount}`, item.Payment_Status, item.Status]);
        generatePDF("Purchase Order Report", columns, data, "Purchase_Report");
    };

    return (
        <div className='p-4 bg-light min-vh-100 no-print'>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className='fw-bold mb-0'>Purchase Report</h4>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary btn-sm rounded-3" onClick={() => window.print()}>Print</button>
                    <button className="btn btn-primary btn-sm rounded-3 shadow-sm px-3" style={{ backgroundColor: '#f97316', borderColor: '#f97316' }} onClick={handleExportPDF}>Export PDF</button>
                </div>
            </div>
            <div className="card border-0 shadow-sm rounded-4 p-4">
                <table className="table">
                    <thead><tr className="small text-muted text-uppercase"><th>PO No</th><th>Supplier</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
                    <tbody>
                        {reportData.map((item, i) => (
                            <tr key={i}><td>{item.PO_No}</td><td>{item.Supplier}</td><td>{item.PO_Date}</td><td className="fw-bold text-success">LKR {item.Total_Amount}</td><td><span className="badge bg-light text-dark">{item.Status}</span></td></tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default PurchaseReport;