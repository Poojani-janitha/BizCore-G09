import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
    TrendingUp, Package, Award, AlertCircle, Users,
    DollarSign, CreditCard, CheckCircle, Download, Calendar, Filter
} from "react-feather";
import { generatePDF } from "../../services/reportGenerator";

const SalesReport = () => {
    const [selectedReport, setSelectedReport] = useState(null);
    const [reportData, setReportData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Filter states
    const [startDate, setStartDate] = useState(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0] // default to first of current month
    );
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [periodType, setPeriodType] = useState("daily"); // daily, monthly, annual
    const [productType, setProductType] = useState("all"); // all, Company, Other, Raw
    const [slowMovingDays, setSlowMovingDays] = useState(30);
    const [customerSearchQuery, setCustomerSearchQuery] = useState("");

    const displayData = useMemo(() => {
        if (!reportData) return [];
        if (customerSearchQuery.trim()) {
            const query = customerSearchQuery.toLowerCase();
            return reportData.filter(row => 
                (row.Customer_Name && row.Customer_Name.toLowerCase().includes(query)) ||
                (row.Customer_Code && row.Customer_Code.toLowerCase().includes(query))
            );
        }
        return reportData;
    }, [reportData, customerSearchQuery]);

    const reportCards = [
        // Sales Reports
        {
            title: "Daily / Monthly / Annual Sales",
            desc: "Aggregate sales summary excluding cancelled sales.",
            icon: <TrendingUp size={20} className="text-primary" />,
            key: "sales-summary",
            endpoint: "/api/sales-management/reports/summary",
            borderColor: "border-primary",
            columns: ["Period", "Total_Orders", "Total_Revenue", "Total_Discount", "Total_Tax"]
        },
        // Product Reports
        {
            title: "Product-wise Sales",
            desc: "Revenue and quantity sold filterable by product type.",
            icon: <Package size={20} className="text-success" />,
            key: "product-wise",
            endpoint: "/api/sales-management/reports/product-wise",
            borderColor: "border-success",
            columns: ["P_Code", "P_Name", "P_Type", "Purchased_Unit", "Total_Qty_Sold", "Total_Revenue"]
        },
        {
            title: "Top Selling Products",
            desc: "Fastest moving items ranked by total units sold.",
            icon: <Award size={20} className="text-warning" />,
            key: "top-selling",
            endpoint: "/api/sales-management/reports/top-selling",
            borderColor: "border-warning",
            columns: ["P_Code", "P_Name", "P_Type", "Purchased_Unit", "Total_Qty_Sold", "Total_Revenue"]
        },
        {
            title: "Slow Moving Products",
            desc: "Identifies items with low sales count (potential overstock).",
            icon: <AlertCircle size={20} className="text-danger" />,
            key: "slow-moving",
            borderColor: "border-danger",
            endpoint: "/api/sales-management/reports/slow-moving",
            columns: ["P_Code", "P_Name", "P_Type", "Purchased_Unit", "Qty_Sold_Last_N_Days", "Current_Stock"]
        },
        // Customer Reports
        {
            title: "Customer-wise Sales",
            desc: "Revenue, average order value, and invoice counts.",
            icon: <Users size={20} className="text-info" />,
            key: "customer-wise",
            endpoint: "/api/sales-management/reports/customer-wise",
            borderColor: "border-info",
            columns: ["Customer_Code", "Customer_Name", "Invoice_Count", "Total_Revenue", "Avg_Order_Value"]
        },
        {
            title: "Outstanding Customer Balances",
            desc: "Consolidated outstanding balances with aging buckets.",
            icon: <DollarSign size={20} className="text-danger" />,
            key: "outstanding-balances",
            endpoint: "/api/sales-management/reports/outstanding-balances",
            borderColor: "border-danger",
            columns: ["Customer_Code", "Customer_Name", "Contact_Info", "Total_Outstanding"]
        },
        // Payment Reports
        {
            title: "Payment Method Report",
            desc: "Collections split across cash, bank transfer, and cheque.",
            icon: <CreditCard size={20} className="text-secondary" />,
            key: "payment-method",
            endpoint: "/api/sales-management/reports/payment-method",
            borderColor: "border-secondary",
            columns: ["Period", "Cash_Collections", "Bank_Collections", "Cheque_Collections", "Credit_Generated", "Total_Collections"]
        },
        {
            title: "Due Collection Report",
            desc: "Collections made against previously outstanding balances.",
            icon: <CheckCircle size={20} className="text-success" />,
            key: "due-collection",
            endpoint: "/api/sales-management/reports/due-collection",
            borderColor: "border-success",
            columns: ["Payment_Date", "Receipt_No", "Invoice_No", "Customer_Name", "Original_Sale_Date", "Payment_Method", "Amount_Collected"]
        }
    ];

    const loadReportData = async (report) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            
            // Apply report-specific filters
            if (report.key === "sales-summary") {
                params.append("type", periodType);
                params.append("startDate", startDate);
                params.append("endDate", endDate);
            } else if (report.key === "product-wise") {
                params.append("category", productType);
                params.append("startDate", startDate);
                params.append("endDate", endDate);
            } else if (report.key === "slow-moving") {
                params.append("days", slowMovingDays);
            } else if (report.key === "outstanding-balances") {
                // aging is calculated relative to current day, no range needed
            } else {
                // customer-wise, top-selling, payment-method, due-collection
                params.append("startDate", startDate);
                params.append("endDate", endDate);
            }

            const response = await axios.get(`${report.endpoint}?${params.toString()}`);
            if (response.data.success) {
                setReportData(response.data.data || []);
            }
        } catch (error) {
            console.error("Error loading report:", error);
            setReportData([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCardClick = (report) => {
        setCustomerSearchQuery("");
        if (selectedReport?.key === report.key) {
            setSelectedReport(null);
            setReportData([]);
        } else {
            setSelectedReport(report);
            loadReportData(report);
        }
    };

    const handleApplyFilters = () => {
        if (selectedReport) {
            loadReportData(selectedReport);
        }
    };

    const handleExportPDF = () => {
        if (!selectedReport || displayData.length === 0) return;
        generatePDF(`${selectedReport.title} Report`, selectedReport.columns, displayData, `${selectedReport.key.replace(/-/g, '_')}_report`);
    };

    const formatColValue = (col, val) => {
        if (val === null || val === undefined) return "—";

        const isCurrency = (col.toLowerCase().includes("revenue") || 
                           col.toLowerCase().includes("amount") || 
                           col.toLowerCase().includes("outstanding") || 
                           col.toLowerCase() === "current" || 
                           col.toLowerCase().includes("overdue") || 
                           col.toLowerCase().includes("collections") || 
                           col.toLowerCase().includes("generated") || 
                           col.toLowerCase().includes("collected") || 
                           col.toLowerCase().includes("discount") || 
                           col.toLowerCase().includes("tax") || 
                           col.toLowerCase().includes("value")) &&
                           !col.toLowerCase().includes("stock");

        if (isCurrency && typeof val === 'number') {
            return `Rs.${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        if (typeof val === 'number') {
            return val.toLocaleString();
        }
        return String(val);
    };

    return (
        <div className="container-fluid p-4 bg-light min-vh-100" style={{ fontFamily: "'Outfit', 'Inter', sans-serif", fontSize: "13px" }}>
            
            {/* Reports Grid Layout matching Inventory style */}
            <div className="row g-3 mb-4 d-print-none">
                {reportCards.map((card, i) => {
                    const isSelected = selectedReport?.key === card.key;
                    return (
                        <div key={i} className="col-lg-3 col-md-4 col-sm-6">
                            <div
                                className={`card border-0 border-top border-4 ${card.borderColor} shadow-sm p-3 h-100`}
                                onClick={() => handleCardClick(card)}
                                style={{
                                    cursor: 'pointer',
                                    backgroundColor: isSelected ? '#f0f9ff' : 'white',
                                    transition: 'all 0.3s ease',
                                    transform: isSelected ? 'translateY(-6px)' : 'translateY(0)',
                                    boxShadow: isSelected ? '0 8px 16px rgba(0,0,0,0.1)' : ''
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-6px)';
                                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedReport?.key !== card.key) {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '';
                                    }
                                }}
                            >
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>{card.title}</small>
                                    <div className="opacity-75">
                                        {card.icon}
                                    </div>
                                </div>
                                <p className="text-muted mb-0" style={{ fontSize: '11px' }}>{card.desc}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Selected Report Controls & Data Display */}
            {selectedReport && (
                <>
                    {/* Filters Section */}
                    <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white d-print-none">
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <Filter size={16} className="text-primary" />
                            <span className="fw-bold text-dark">Report Filters</span>
                        </div>
                        <div className="row g-3 align-items-end">
                            {/* Date range filter for support endpoints */}
                            {selectedReport.key !== "slow-moving" && selectedReport.key !== "outstanding-balances" && (
                                <>
                                    <div className="col-md-3">
                                        <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>Start Date</label>
                                        <input
                                            type="date"
                                            className="form-control form-control-sm rounded-3 shadow-none border"
                                            value={startDate}
                                            onChange={e => setStartDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>End Date</label>
                                        <input
                                            type="date"
                                            className="form-control form-control-sm rounded-3 shadow-none border"
                                            value={endDate}
                                            onChange={e => setEndDate(e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Sales summary period type toggle */}
                            {selectedReport.key === "sales-summary" && (
                                <div className="col-md-3">
                                    <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>Period Type</label>
                                    <select
                                        className="form-select form-select-sm rounded-3 shadow-none border"
                                        value={periodType}
                                        onChange={e => setPeriodType(e.target.value)}
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="annual">Annual</option>
                                    </select>
                                </div>
                            )}

                            {/* Product type filter for product wise sales */}
                            {selectedReport.key === "product-wise" && (
                                <div className="col-md-3">
                                    <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>Product Type</label>
                                    <select
                                        className="form-select form-select-sm rounded-3 shadow-none border"
                                        value={productType}
                                        onChange={e => setProductType(e.target.value)}
                                    >
                                        <option value="all">All Items</option>
                                        <option value="Company">Company Products</option>
                                        <option value="Other">Other Items</option>
                                        <option value="Raw">Raw Materials</option>
                                    </select>
                                </div>
                            )}

                            {/* Slow moving days filter input */}
                            {selectedReport.key === "slow-moving" && (
                                <div className="col-md-3">
                                    <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>Activity Period (Days)</label>
                                    <input
                                        type="number"
                                        className="form-control form-control-sm rounded-3 shadow-none border"
                                        min={1}
                                        value={slowMovingDays}
                                        onChange={e => setSlowMovingDays(parseInt(e.target.value) || 0)}
                                    />
                                </div>
                            )}

                            {/* Search Customer filter */}
                            {(selectedReport.key === "customer-wise" || selectedReport.key === "outstanding-balances") && (
                                <div className="col-md-3">
                                    <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>Search Customer</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm rounded-3 shadow-none border"
                                        placeholder="Search by name or code..."
                                        value={customerSearchQuery}
                                        onChange={e => setCustomerSearchQuery(e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="col-md-3">
                                <button
                                    className="btn btn-primary btn-sm rounded-3 px-4 shadow-sm w-100 fw-bold"
                                    onClick={handleApplyFilters}
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Report Table Header */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="fw-bold text-dark mb-0">
                            {selectedReport.title} Data ({displayData.length === reportData.length ? reportData.length : `${displayData.length} of ${reportData.length}`} records)
                        </h6>
                        <button
                            className="btn btn-primary btn-sm d-flex align-items-center gap-2 px-3 shadow-sm d-print-none rounded-3 fw-bold"
                            onClick={handleExportPDF}
                            disabled={displayData.length === 0}
                        >
                            <Download size={14} /> Export PDF
                        </button>
                    </div>

                    {/* Report Table Card */}
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                        {isLoading ? (
                            <div className="text-center p-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : displayData.length === 0 ? (
                            <div className="text-center p-5 text-muted fw-bold">
                                No records found for the selected filter criteria.
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead>
                                        <tr style={{ background: "linear-gradient(135deg, #004445 0%, #2c7873 100%)" }}>
                                            {selectedReport.columns.map((col, idx) => (
                                                <th
                                                    key={col}
                                                    className={`text-uppercase py-3 ${idx === 0 ? "ps-4" : ""}`}
                                                    style={{
                                                        color: "#fff",
                                                        fontSize: "0.75rem",
                                                        fontWeight: 700,
                                                        letterSpacing: "0.08em",
                                                        background: "transparent",
                                                        borderBottom: "2px solid rgba(255,255,255,0.15)"
                                                    }}
                                                >
                                                    {col.replace(/_/g, " ")}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayData.map((row, rowIdx) => (
                                            <tr key={rowIdx}>
                                                {selectedReport.columns.map((col, idx) => {
                                                    const rawVal = row[col];
                                                    const displayVal = formatColValue(col, rawVal);
                                                    return (
                                                        <td
                                                            key={col}
                                                            className={`${idx === 0 ? "ps-4" : ""} ${
                                                                col.toLowerCase().includes("total") ||
                                                                col.toLowerCase().includes("revenue")
                                                                    ? "fw-bold"
                                                                    : ""
                                                            }`}
                                                        >
                                                            {displayVal}
                                                        </td>
                                                    );
                                                })}
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

export default SalesReport;
