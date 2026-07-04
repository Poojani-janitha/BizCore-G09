import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Download, Printer } from 'react-feather';
import { generatePDF } from '../../../services/reportGenerator';
import Pagination from '../../../component/common/Pagination';
import { API_ENDPOINTS } from '../../../config/apiEndpoints';

const ExpiryReport = () => {
    const [reportData, setReportData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);

    useEffect(() => {
        axios.get(API_ENDPOINTS.inventory.reports.expiry)
            .then(res => setReportData(res.data.data))
            .catch(err => console.error(err));
    }, []);

    const getStatus = (days) => {
        if (days < 0) return { label: "Expired", class: "bg-dark text-white" };
        if (days <= 7) return { label: "Critical", class: "bg-danger-subtle text-danger" };
        if (days <= 30) return { label: "Warning", class: "bg-warning-subtle text-warning" };
        return { label: "Good", class: "bg-success-subtle text-success" };
    };

    const pagedData = useMemo(
        () => reportData.slice((currentPage - 1) * pageSize, currentPage * pageSize),
        [reportData, currentPage, pageSize]
    );

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
        <div className='p-4 bg-light min-vh-100 no-print' style={{ fontSize: '13px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className='fw-bold text-dark mb-0'>Expiry Report</h6>
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
                                <th className='text-uppercase py-3 ps-4' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Item ID</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Item Name</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Batch No</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Quantity</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Expiry Date</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Days Left</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: '13px' }}>
                            {pagedData.map((item, i) => {
                                const status = getStatus(item.Days_Left);
                                return (
                                    <tr key={i}>
                                        <td className="fw-bold ps-4">{item.P_Code || 'N/A'}</td>
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
                <div className="px-3">
                    <Pagination
                        currentPage={currentPage}
                        totalItems={reportData.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ExpiryReport;
