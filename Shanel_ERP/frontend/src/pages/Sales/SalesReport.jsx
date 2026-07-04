import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import {
    TrendingUp, Package, Award, AlertCircle, Users,
    DollarSign, CreditCard, CheckCircle, Download, Calendar, Filter
} from "react-feather";
import { generatePDF } from "../../services/reportGenerator";

const SalesReport = () => {
    const { t } = useTranslation();
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
            title: t("sales.reports.daily_monthly_annual_title"),
            desc: t("sales.reports.daily_monthly_annual_desc"),
            icon: <TrendingUp size={20} className="text-primary" />,
            key: "sales-summary",
            endpoint: "/api/sales-management/reports/summary",
            borderColor: "border-primary",
            columns: ["Period", "Total_Orders", "Total_Revenue", "Total_Discount", "Total_Tax"]
        },
        // Product Reports
        {
            title: t("sales.reports.product_wise_title"),
            desc: t("sales.reports.product_wise_desc"),
            icon: <Package size={20} className="text-success" />,
            key: "product-wise",
            endpoint: "/api/sales-management/reports/product-wise",
            borderColor: "border-success",
            columns: ["P_Code", "P_Name", "P_Type", "Purchased_Unit", "Total_Qty_Sold", "Total_Revenue"]
        },
        {
            title: t("sales.reports.top_selling_title"),
            desc: t("sales.reports.top_selling_desc"),
            icon: <Award size={20} className="text-warning" />,
            key: "top-selling",
            endpoint: "/api/sales-management/reports/top-selling",
            borderColor: "border-warning",
            columns: ["P_Code", "P_Name", "P_Type", "Purchased_Unit", "Total_Qty_Sold", "Total_Revenue"]
        },
        {
            title: t("sales.reports.slow_moving_title"),
            desc: t("sales.reports.slow_moving_desc"),
            icon: <AlertCircle size={20} className="text-danger" />,
            key: "slow-moving",
            borderColor: "border-danger",
            endpoint: "/api/sales-management/reports/slow-moving",
            columns: ["P_Code", "P_Name", "P_Type", "Purchased_Unit", "Qty_Sold_Last_N_Days", "Current_Stock"]
        },
        // Customer Reports
        {
            title: t("sales.reports.customer_wise_title"),
            desc: t("sales.reports.customer_wise_desc"),
            icon: <Users size={20} className="text-info" />,
            key: "customer-wise",
            endpoint: "/api/sales-management/reports/customer-wise",
            borderColor: "border-info",
            columns: ["Customer_Code", "Customer_Name", "Invoice_Count", "Total_Revenue", "Avg_Order_Value"]
        },
        {
            title: t("sales.reports.outstanding_balances_title"),
            desc: t("sales.reports.outstanding_balances_desc"),
            icon: <DollarSign size={20} className="text-danger" />,
            key: "outstanding-balances",
            endpoint: "/api/sales-management/reports/outstanding-balances",
            borderColor: "border-danger",
            columns: ["Customer_Code", "Customer_Name", "Contact_Info", "Total_Outstanding"]
        },
        // Payment Reports
        {
            title: t("sales.reports.payment_method_title"),
            desc: t("sales.reports.payment_method_desc"),
            icon: <CreditCard size={20} className="text-secondary" />,
            key: "payment-method",
            endpoint: "/api/sales-management/reports/payment-method",
            borderColor: "border-secondary",
            columns: ["Period", "Cash_Collections", "Bank_Collections", "Cheque_Collections", "Credit_Generated", "Total_Collections"]
        },
        {
            title: t("sales.reports.due_collection_title"),
            desc: t("sales.reports.due_collection_desc"),
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
    };    const getColHeaderLabel = (col) => {
        const mappings = {
            "period": t("sales.date") || "Period",
            "total_orders": t("sales.dashboard.number_of_sales") || "Total Orders",
            "total_revenue": t("sales.dashboard.gross_revenue") || "Total Revenue",
            "total_discount": t("sales.reports.discount") || "Total Discount",
            "total_tax": t("sales.tax") || "Total Tax",
            "p_code": t("sales.customer_list.col_code") || "Product Code",
            "p_name": t("itemTable.item") || "Product Name",
            "p_type": t("sales.type") || "Product Type",
            "purchased_unit": t("itemTable.unit") || "Unit",
            "total_qty_sold": t("sales.reports.qty_sold") || "Qty Sold",
            "qty_sold_last_n_days": t("sales.reports.qty_sold") || "Qty Sold",
            "current_stock": t("sales.reports.current_stock") || "Current Stock",
            "customer_code": t("sales.customer_list.col_code") || "Customer Code",
            "customer_name": t("sales.customer_name") || "Customer Name",
            "invoice_count": t("sales.customer_detail.invoices_count") || "Invoices",
            "avg_order_value": t("sales.reports.avg_order") || "Avg Order Value",
            "contact_info": t("sales.details.customer_info") || "Contact Info",
            "total_outstanding": t("sales.customer_list.outstanding_balance") || "Total Outstanding",
            "cash_collections": t("sales.cash_rcvd") || "Cash Collections",
            "bank_collections": t("sales.bank_rcvd") || "Bank Collections",
            "cheque_collections": t("sales.cheque_rcvd") || "Cheque Collections",
            "credit_generated": t("sales.reports.credit_generated") || "Credit Generated",
            "total_collections": t("sales.collection_summary") || "Total Collections",
            "payment_date": t("sales.date") || "Payment Date",
            "receipt_no": t("sales.reports.receipt_no") || "Receipt No",
            "invoice_no": t("sales.invoice_no") || "Invoice No",
            "original_sale_date": t("sales.reports.original_date") || "Original Date",
            "payment_method": t("sales.reports.payment_method") || "Payment Method",
            "amount_collected": t("sales.reports.amount_collected") || "Amount Collected"
        };
        return mappings[col.toLowerCase()] || col.replace(/_/g, " ");
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
                            <span className="fw-bold text-dark">{t('sales.reports.report_filters')}</span>
                        </div>
                        <div className="row g-3 align-items-end">
                            {/* Date range filter for support endpoints */}
                            {selectedReport.key !== "slow-moving" && selectedReport.key !== "outstanding-balances" && (
                                <>
                                    <div className="col-md-3">
                                        <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>{t('sales.reports.start_date')}</label>
                                        <input
                                            type="date"
                                            className="form-control form-control-sm rounded-3 shadow-none border"
                                            value={startDate}
                                            onChange={e => setStartDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>{t('sales.reports.end_date')}</label>
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
                                    <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>{t('sales.reports.period_type')}</label>
                                    <select
                                        className="form-select form-select-sm rounded-3 shadow-none border"
                                        value={periodType}
                                        onChange={e => setPeriodType(e.target.value)}
                                    >
                                        <option value="daily">{t('sales.reports.daily')}</option>
                                        <option value="monthly">{t('sales.reports.monthly')}</option>
                                        <option value="annual">{t('sales.reports.annual')}</option>
                                    </select>
                                </div>
                            )}

                            {/* Product type filter for product wise sales */}
                            {selectedReport.key === "product-wise" && (
                                <div className="col-md-3">
                                    <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>{t('sales.reports.product_type')}</label>
                                    <select
                                        className="form-select form-select-sm rounded-3 shadow-none border"
                                        value={productType}
                                        onChange={e => setProductType(e.target.value)}
                                    >
                                        <option value="all">{t('sales.reports.all_items')}</option>
                                        <option value="Company">{t('sales.reports.company_products')}</option>
                                        <option value="Other">{t('sales.reports.other_items')}</option>
                                        <option value="Raw">{t('sales.reports.raw_materials')}</option>
                                    </select>
                                </div>
                            )}

                            {/* Slow moving days filter input */}
                            {selectedReport.key === "slow-moving" && (
                                <div className="col-md-3">
                                    <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>{t('sales.reports.activity_period')}</label>
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
                                    <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>{t('sales.reports.search_customer')}</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm rounded-3 shadow-none border"
                                        placeholder={t('sales.customer_list.search_placeholder')}
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
                                    {t('sales.reports.apply_filters')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Report Table Header */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="fw-bold text-dark mb-0">
                            {selectedReport.title} {t('sales.reports.records_found').replace('records', 'Data')} ({displayData.length === reportData.length ? reportData.length : `${displayData.length} of ${reportData.length}`} {t('sales.reports.records_found')})
                        </h6>
                        <button
                            className="btn btn-primary btn-sm d-flex align-items-center gap-2 px-3 shadow-sm d-print-none rounded-3 fw-bold"
                            onClick={handleExportPDF}
                            disabled={displayData.length === 0}
                        >
                            <Download size={14} /> {t('sales.reports.export_pdf')}
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
                                {t('sales.reports.no_records_found')}
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
                                                    {getColHeaderLabel(col)}
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
                                                            className={`${idx === 0 ? "ps-4" : ""} ${col.toLowerCase().includes("total") ||
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
