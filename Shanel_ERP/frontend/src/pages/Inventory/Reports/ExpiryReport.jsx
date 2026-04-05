import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Download, Printer, AlertTriangle } from 'react-feather';
import { generatePDF } from '../../../services/reportGenerator';

const ExpiryReport = () => {
    const [reportData, setReportData] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/inventory/reports/expiry')
            .then(res => setReportData(res.data.data))
            .catch(err => console.error(err));
    }, []);

    const getStatus = (days) => {
        if (days < 0) return { label: "Expired", class: "bg-dark text-white" };
        if (days <= 7) return { label: "Critical", class: "bg-danger-subtle text-danger" };
        if (days <= 30) return { label: "Warning", class: "bg-warning-subtle text-warning" };
        return { label: "Good", class: "bg-success-subtle text-success" };
    };

    const handleExportPDF = () => {
        const columns = ["Item ID", "Item Name", "Batch No", "Quantity", "Expiry Date", "Days Left", "Status"];
        const data = reportData.map(item => [
            item.P_Code || 'N/A',
            item.P_Name,
            item.Batch_No,
            item.Quantity,
            item.Exp_Date,
            item.Days_Left,
            getStatus(item.Days_Left).label
        ]);
        generatePDF("Expiry Report", columns, data, "Expiry_Report");
    };

    return (
        <div className='p-4 bg-light min-vh-100 no-print'>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className='fw-bold mb-1 text-danger'>Expiry Report</h4>
                    <p className='text-muted small'>Items nearing or past expiry date</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary btn-sm rounded-3" onClick={() => window.print()}>
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
                        <thead className="text-muted small text-uppercase" style={{ fontSize: '11px' }}>
                            <tr>
                                <th>Item ID</th>
                                <th>Item Name</th>
                                <th>Batch No</th>
                                <th>Quantity</th>
                                <th>Expiry Date</th>
                                <th>Days Left</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: '13px' }}>
                            {reportData.map((item, i) => {
                                const status = getStatus(item.Days_Left);
                                return (
                                    <tr key={i}>
                                        <td className="fw-bold">{item.P_Code || 'N/A'}</td>
                                        <td className="fw-bold">{item.P_Name}</td>
                                        <td className="text-muted">{item.Batch_No}</td>
                                        <td className="fw-bold">{item.Quantity}</td>
                                        <td>{item.Exp_Date}</td>
                                        <td className={item.Days_Left <= 7 ? 'text-danger fw-bold' : ''}>
                                            {item.Days_Left < 0 ? 'Expired' : `${item.Days_Left} days`}
                                        </td>
                                        <td>
                                            <span className={`badge rounded-pill px-3 py-2 ${status.class}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ExpiryReport;