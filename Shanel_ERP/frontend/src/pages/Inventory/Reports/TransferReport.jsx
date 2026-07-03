import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { generatePDF } from '../../../services/reportGenerator';
import { API_ENDPOINTS } from '../../../config/apiEndpoints';

const TransferReport = () => {
    const [reportData, setReportData] = useState([]);
    useEffect(() => {
        axios.get(API_ENDPOINTS.inventory.reports.transfers).then(res => setReportData(res.data.data));
    }, []);

    const handleExportPDF = () => {
        const columns = ["ID", "Product", "From", "To", "Qty", "Date"];
        const data = reportData.map(item => [item.ST_ID, item.P_Name, item.From_Location, item.To_Location, item.Qty, item.Transfer_Date]);
        generatePDF("Stock Transfer Report", columns, data, "Transfer_Report");
    };

    return (
        <div className='p-4 bg-light min-vh-100 no-print' style={{ fontSize: '13px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className='fw-bold text-dark mb-0'>Stock Transfer Report</h6>
                <button className="btn btn-primary btn-sm d-flex align-items-center gap-2 px-3 shadow-sm" onClick={handleExportPDF}>Export PDF</button>
            </div>
            <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                <div className="table-responsive">
                <table className="table align-middle mb-0">
                    <thead>
                        <tr style={{ background: 'linear-gradient(135deg, #004445 0%, #2c7873 100%)' }}>
                            <th className='text-uppercase py-3 ps-4' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Date</th>
                            <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Item</th>
                            <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>From</th>
                            <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>To</th>
                            <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Qty</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((item, i) => (
                            <tr key={i}><td className='ps-4'>{item.Transfer_Date}</td><td className="fw-bold">{item.P_Name}</td><td>{item.From_Location}</td><td>{item.To_Location}</td><td className="text-primary">{item.Qty}</td></tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    );
};
export default TransferReport;