import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, Download, Printer } from 'react-feather';
import { generatePDF } from '../../../services/reportGenerator';

const CurrentStockReport = () => {
    const [reportData, setReportData] = useState([]);

    useEffect(() => {
        // We use the view 'v_current_stock' from your DB dump
        axios.get('/api/inventory/reports/current-stock')
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
        <div className='p-4 bg-light min-vh-100 no-print' style={{ fontSize: '13px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className='fw-bold text-dark mb-0'>Current Stock Report</h6>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary btn-sm rounded-3" onClick={handlePrint}>
                        <Printer size={14} className="me-1"/> Print
                    </button>
                    <button className="btn btn-primary btn-sm d-flex align-items-center gap-2 px-3 shadow-sm" onClick={handleExportPDF}>
                        <Download size={14}/> Export PDF
                    </button>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                <div className="table-responsive">
                    <table className="table align-middle mb-0">
                        <thead>
                            <tr style={{ background: 'linear-gradient(135deg, #004445 0%, #2c7873 100%)' }}>
                                <th className='text-uppercase py-3 ps-4' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Item ID</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Item Name</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Production Stock</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Sales Stock</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Total Stock</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.map((item, i) => (
                                <tr key={i}>
                                    <td className="fw-bold ps-4">{item.P_Code || `P-${item.P_ID}`}</td>
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
