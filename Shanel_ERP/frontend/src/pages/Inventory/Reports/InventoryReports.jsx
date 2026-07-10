import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { Box, Activity, ShoppingCart, RefreshCcw, AlertCircle, Users, Download, ChevronDown } from 'react-feather';
import { generatePDF } from '../../../services/reportGenerator';
import { API_ENDPOINTS } from '../../../config/apiEndpoints';
import { useTranslation } from 'react-i18next';

const InventoryReports = () => {
    const [selectedReport, setSelectedReport] = useState(null);
    const [reportData, setReportData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const { t } = useTranslation();

    const reportCards = [
        { title: "Current Stock", desc: "Real-time inventory", icon: <Box size={20} className="text-success"/>, key: "current-stock", endpoint: API_ENDPOINTS.inventory.reports.currentStock, borderColor: "border-success" },
        { title: "Production", desc: "Daily production output", icon: <Activity size={20} className="text-primary"/>, key: "daily-production", endpoint: API_ENDPOINTS.inventory.reports.production, borderColor: "border-primary" },
        { title: "Purchase", desc: "Supplier purchases", icon: <ShoppingCart size={20} className="text-info"/>, key: "purchases", endpoint: API_ENDPOINTS.inventory.reports.purchases, borderColor: "border-info" },
        { title: "Stock Transfer", desc: "Stock movements", icon: <RefreshCcw size={20} className="text-warning"/>, key: "transfers", endpoint: API_ENDPOINTS.inventory.reports.transfers, borderColor: "border-warning" },
        { title: "Expiry", desc: "Items nearing expiry", icon: <AlertCircle size={20} className="text-danger"/>, key: "expiry", endpoint: API_ENDPOINTS.inventory.reports.expiry, borderColor: "border-danger" },
        { title: "Supplier Spend", desc: "Purchase by supplier", icon: <Users size={20} className="text-secondary"/>, key: "supplier-purchases", endpoint: API_ENDPOINTS.inventory.reports.supplierPurchases, borderColor: "border-secondary" },
        
        // { title: t('inventory.pages.reports.cards.current_stock'), desc: t('inventory.pages.reports.cards.current_stock_desc'), icon: <Box size={20} className="text-success"/>, key: "current-stock", endpoint: "/api/inventory/reports/current-stock", borderColor: "border-success" },
        // { title: t('inventory.pages.reports.cards.production'), desc: t('inventory.pages.reports.cards.production_desc'), icon: <Activity size={20} className="text-primary"/>, key: "daily-production", endpoint: "/api/inventory/reports/production", borderColor: "border-primary" },
        // { title: t('inventory.pages.reports.cards.purchase'), desc: t('inventory.pages.reports.cards.purchase_desc'), icon: <ShoppingCart size={20} className="text-info"/>, key: "purchases", endpoint: "/api/inventory/reports/purchases", borderColor: "border-info" },
        // { title: t('inventory.pages.reports.cards.transfers'), desc: t('inventory.pages.reports.cards.transfers_desc'), icon: <RefreshCcw size={20} className="text-warning"/>, key: "transfers", endpoint: "/api/inventory/reports/transfers", borderColor: "border-warning" },
        // { title: t('inventory.pages.reports.cards.expiry'), desc: t('inventory.pages.reports.cards.expiry_desc'), icon: <AlertCircle size={20} className="text-danger"/>, key: "expiry", endpoint: "/api/inventory/reports/expiry", borderColor: "border-danger" },
        // { title: t('inventory.pages.reports.cards.supplier_spend'), desc: t('inventory.pages.reports.cards.supplier_spend_desc'), icon: <Users size={20} className="text-secondary"/>, key: "supplier-purchases", endpoint: "/api/inventory/reports/supplier-purchases", borderColor: "border-secondary" },
    ];

    const loadReport = async (report) => {
        if (selectedReport?.key === report.key) {
            setSelectedReport(null);
            return;
        }

        setIsLoading(true);
        setSelectedReport(report);
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
        setStatusFilter('');
        try {
            const response = await axios.get(`${report.endpoint}`);
            setReportData(response.data.data || []);
        } catch (error) {
            console.error('Error loading report:', error);
            setReportData([]);
        } finally {
            setIsLoading(false);
        }
    };

    const uniqueStatuses = useMemo(() => {
        const statuses = new Set();
        reportData.forEach(row => {
            if (row.Status) statuses.add(row.Status);
            if (row.Payment_Status) statuses.add(row.Payment_Status);
        });
        return Array.from(statuses);
    }, [reportData]);

    const hasDateFilter = useMemo(() => {
        if (reportData.length === 0) return false;
        const firstRow = reportData[0];
        return !!(firstRow.Production_Date || firstRow.PO_Date || firstRow.Transfer_Date || firstRow.Exp_Date);
    }, [reportData]);

    const filteredReportData = useMemo(() => {
        if (!selectedReport) return [];
        return reportData.filter(row => {
            // Search filter
            if (searchTerm.trim() !== '') {
                const searchLower = searchTerm.toLowerCase();
                const matchesSearch = Object.values(row).some(val => 
                    val !== null && val !== undefined && String(val).toLowerCase().includes(searchLower)
                );
                if (!matchesSearch) return false;
            }

            // Date filter
            const dateField = row.Production_Date ? 'Production_Date' :
                              row.PO_Date ? 'PO_Date' :
                              row.Transfer_Date ? 'Transfer_Date' :
                              row.Exp_Date ? 'Exp_Date' : null;
            if (dateField) {
                const rowDateStr = row[dateField];
                if (rowDateStr) {
                    const rowDate = new Date(rowDateStr);
                    if (startDate) {
                        const start = new Date(startDate);
                        start.setHours(0,0,0,0);
                        if (rowDate < start) return false;
                    }
                    if (endDate) {
                        const end = new Date(endDate);
                        end.setHours(23,59,59,999);
                        if (rowDate > end) return false;
                    }
                }
            }

            // Status filter
            if (statusFilter) {
                const rowStatus = (row.Status || row.Payment_Status || '').toLowerCase();
                if (rowStatus !== statusFilter.toLowerCase()) return false;
            }

            return true;
        });
    }, [selectedReport, reportData, searchTerm, startDate, endDate, statusFilter]);

    const getTableColumns = (reportKey) => {
        const columnMap = {
            'current-stock': ['P_Code', 'P_Name', 'Base_Unit', 'productionStock', 'salesStock', 'Total_Stock'],
            'daily-production': ['P_Code', 'P_Name', 'Base_Unit', 'Batch_No', 'Actual_Qty', 'Production_Date', 'Cost_Per_Unit', 'Status'],
            'purchases': ['PO_No', 'Supplier', 'PO_Date', 'Total_Amount', 'Payment_Status', 'Status'],
            'transfers': ['ST_ID', 'P_Name', 'Base_Unit', 'From_Location', 'To_Location', 'Qty', 'Transfer_Date', 'Status'],
            'expiry': ['P_Code', 'P_Name', 'Base_Unit', 'Batch_No', 'Exp_Date', 'Days_Left'],
            'supplier-purchases': ['S_Code', 'S_Name', 'Total_Orders', 'Total_Spent']
        };
        return columnMap[reportKey] || [];
    };

    const handleExportPDF = () => {
        if (!selectedReport || filteredReportData.length === 0) return;
        
        const columns = getTableColumns(selectedReport.key);
        generatePDF(`${selectedReport.title} Report`, columns, filteredReportData, `${selectedReport.title}_Report`);
    };

    return (
        <div className='p-4 bg-light min-vh-100' style={{ fontSize: '13px' }}>

            {/* Report Cards Grid - Hide on print */}
            <div className="row g-3 mb-5 d-print-none">
                {reportCards.map((card, i) => (
                    <div key={i} className="col-lg-2 col-md-3 col-sm-4 col-6">
                        <div
                            className={`card border-0 border-top border-4 ${selectedReport?.key === card.key ? card.borderColor : 'border-transparent'} shadow-sm p-3 h-100`}
                            onClick={() => loadReport(card)}
                            style={{
                                cursor: 'pointer',
                                backgroundColor: selectedReport?.key === card.key ? '#f0f9ff' : 'white',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '11px' }}>{card.title}</small>
                                {card.icon}
                            </div>
                            <p className="text-muted mb-0" style={{ fontSize: '11px' }}>{card.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Report Data Display */}
            {selectedReport && (
                <>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold text-dark mb-0">{selectedReport.title} {t('inventory.pages.reports.report_suffix')}</h6>
                    <button className="btn btn-primary btn-sm d-flex align-items-center gap-2 px-3 shadow-sm d-print-none" onClick={handleExportPDF}>
                        <Download size={14}/> {t('inventory.pages.reports.btn_export')}
                    </button>
                </div>

                {/* Filters Row - Hide on print */}
                {!isLoading && reportData.length > 0 && (
                    <div className="card border-0 shadow-sm rounded-3 p-3 mb-3 d-print-none bg-white border-top border-4 border-primary">
                        <div className="row g-2 align-items-end">
                            {/* Search Input */}
                            <div className="col-md-4">
                                <label className="form-label fw-semibold text-muted mb-1" style={{ fontSize: '11px' }}>Search Report</label>
                                <input 
                                    type="text" 
                                    className="form-control form-control-sm border" 
                                    placeholder="Type to search..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Date Filters */}
                            {hasDateFilter && (
                                <>
                                    <div className="col-md-2 col-sm-6">
                                        <label className="form-label fw-semibold text-muted mb-1" style={{ fontSize: '11px' }}>From Date</label>
                                        <input 
                                            type="date" 
                                            className="form-control form-control-sm border" 
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-2 col-sm-6">
                                        <label className="form-label fw-semibold text-muted mb-1" style={{ fontSize: '11px' }}>To Date</label>
                                        <input 
                                            type="date" 
                                            className="form-control form-control-sm border" 
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Status Filter */}
                            {uniqueStatuses.length > 0 && (
                                <div className="col-md-2">
                                    <label className="form-label fw-semibold text-muted mb-1" style={{ fontSize: '11px' }}>Status</label>
                                    <select 
                                        className="form-select form-select-sm border" 
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="">All Statuses</option>
                                        {uniqueStatuses.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Clear Filters Button */}
                            {(searchTerm || startDate || endDate || statusFilter) && (
                                <div className="col-md-2">
                                    <button 
                                        className="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setStartDate('');
                                            setEndDate('');
                                            setStatusFilter('');
                                        }}
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                    {/* Loading State */}
                    {isLoading ? (
                        <div className="text-center p-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : reportData.length === 0 ? (
                        <div className="text-center p-5 text-muted">
                            <p>{t('inventory.pages.reports.no_data')}</p>
                        </div>
                    ) : filteredReportData.length === 0 ? (
                        <div className="text-center p-5 text-muted">
                            <p>No records match your filters.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table align-middle mb-0">
                                <thead>
                                    <tr style={{ background: 'linear-gradient(135deg, #004445 0%, #2c7873 100%)' }}>
                                        {getTableColumns(selectedReport.key).map((col, idx) => (
                                            <th key={col} className={`text-uppercase py-3 ${idx === 0 ? 'ps-4' : ''}`} style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>
                                                {col.replace(/_/g, ' ')}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredReportData.map((row, i) => (
                                        <tr key={i}>
                                            {getTableColumns(selectedReport.key).map((col, idx) => (
                                                <td key={col} className={`${idx === 0 ? 'ps-4' : ''} ${col === 'Total_Stock' || col === 'Total_Spent' ? 'fw-bold' : ''}`}>
                                                    {typeof row[col] === 'number' ? row[col].toFixed(2) : row[col]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                </>
            )}
        </div>
    );
};

export default InventoryReports;