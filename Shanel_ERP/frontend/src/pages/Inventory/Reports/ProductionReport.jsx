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
        <div className='p-4 bg-light min-vh-100 no-print' style={{ fontSize: '13px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className='fw-bold text-dark mb-0'>Daily Production Report</h6>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary btn-sm rounded-3" onClick={() => window.print()}>
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
                                <th className='text-uppercase py-3 ps-4' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Produced Date</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Item Details</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Batch No</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Target</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Actual</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)', width:'200px' }}>Efficiency</th>
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: '13px' }}>
                            {reportData.map((item, i) => (
                                <tr key={i}>
                                    <td className='ps-4'>{item.Produced_Date}</td>
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