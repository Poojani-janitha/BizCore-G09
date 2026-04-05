import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Download, Printer, Activity } from 'react-feather';
import { generatePDF } from '../../../services/reportGenerator';

const ProductionReport = () => {
    const [reportData, setReportData] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/inventory/reports/production')
            .then(res => setReportData(res.data.data))
            .catch(err => console.error(err));
    }, []);

    const handleExportPDF = () => {
        const columns = ["Date", "Item Name", "Batch", "Target", "Actual", "Efficiency %"];
        const data = reportData.map(item => [
            item.Produced_Date,
            item.P_Name,
            item.Batch_No,
            item.Target_Qty,
            item.Actual_Qty,
            `${item.Efficiency}%`
        ]);
        generatePDF("Daily Production Report", columns, data, "Production_Report");
    };

    return (
        <div className='p-4 bg-light min-vh-100 no-print'>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className='fw-bold mb-1'>Daily Production Report</h4>
                    <p className='text-muted small'>Production output and efficiency tracking</p>
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
                                <th>Produced Date</th>
                                <th>Item Details</th>
                                <th>Batch No</th>
                                <th>Target</th>
                                <th>Actual</th>
                                <th style={{ width: '200px' }}>Efficiency</th>
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: '13px' }}>
                            {reportData.map((item, i) => (
                                <tr key={i}>
                                    <td>{item.Produced_Date}</td>
                                    <td>
                                        <div className="fw-bold">{item.P_Name}</div>
                                        <small className="text-muted">{item.P_Code}</small>
                                    </td>
                                    <td className="text-muted">{item.Batch_No}</td>
                                    <td className="fw-bold text-primary">{item.Target_Qty}</td>
                                    <td className="fw-bold text-success">{item.Actual_Qty}</td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="progress flex-grow-1" style={{ height: '6px' }}>
                                                <div 
                                                    className={`progress-bar ${item.Efficiency >= 100 ? 'bg-success' : item.Efficiency >= 80 ? 'bg-info' : 'bg-warning'}`} 
                                                    role="progressbar" 
                                                    style={{ width: `${Math.min(item.Efficiency, 100)}%` }}
                                                ></div>
                                            </div>
                                            <span className="fw-bold">{item.Efficiency}%</span>
                                        </div>
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

export default ProductionReport;