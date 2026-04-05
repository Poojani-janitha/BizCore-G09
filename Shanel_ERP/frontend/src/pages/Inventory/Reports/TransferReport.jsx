import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { generatePDF } from '../../../services/reportGenerator';

const TransferReport = () => {
    const [reportData, setReportData] = useState([]);
    useEffect(() => {
        axios.get('http://localhost:5000/api/inventory/reports/transfers').then(res => setReportData(res.data.data));
    }, []);

    const handleExportPDF = () => {
        const columns = ["ID", "Product", "From", "To", "Qty", "Date"];
        const data = reportData.map(item => [item.ST_ID, item.P_Name, item.From_Location, item.To_Location, item.Qty, item.Transfer_Date]);
        generatePDF("Stock Transfer Report", columns, data, "Transfer_Report");
    };

    return (
        <div className='p-4 bg-light min-vh-100 no-print'>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className='fw-bold mb-0'>Stock Transfer Report</h4>
                <button className="btn btn-primary btn-sm rounded-3 shadow-sm px-3" style={{ backgroundColor: '#f97316', borderColor: '#f97316' }} onClick={handleExportPDF}>Export PDF</button>
            </div>
            <div className="card border-0 shadow-sm rounded-4 p-4">
                <table className="table">
                    <thead><tr className="small text-muted text-uppercase"><th>Date</th><th>Item</th><th>From</th><th>To</th><th>Qty</th></tr></thead>
                    <tbody>
                        {reportData.map((item, i) => (
                            <tr key={i}><td>{item.Transfer_Date}</td><td className="fw-bold">{item.P_Name}</td><td>{item.From_Location}</td><td>{item.To_Location}</td><td className="text-primary">{item.Qty}</td></tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default TransferReport;