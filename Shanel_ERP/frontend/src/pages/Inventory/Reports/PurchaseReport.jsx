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
        <div className='p-4 bg-light min-vh-100 no-print' style={{ fontSize: '13px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className='fw-bold text-dark mb-0'>Purchase Report</h6>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary btn-sm rounded-3" onClick={() => window.print()}>Print</button>
                    <button className="btn btn-primary btn-sm d-flex align-items-center gap-2 px-3 shadow-sm" onClick={handleExportPDF}>Export PDF</button>
                </div>
            </div>
            <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                <div className="table-responsive">
                <table className="table align-middle mb-0">
                    <thead>
                        <tr style={{ background: 'linear-gradient(135deg, #004445 0%, #2c7873 100%)' }}>
                            <th className='text-uppercase py-3 ps-4' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>PO No</th>
                            <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Supplier</th>
                            <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Date</th>
                            <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Amount</th>
                            <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((item, i) => (
                            <tr key={i}><td className='ps-4'>{item.PO_No}</td><td>{item.Supplier}</td><td>{item.PO_Date}</td><td className="fw-bold text-success">LKR {item.Total_Amount}</td><td><span className="badge bg-light text-dark">{item.Status}</span></td></tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    );
};
export default PurchaseReport;