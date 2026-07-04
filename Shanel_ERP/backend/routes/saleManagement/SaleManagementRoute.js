const express = require('express');
const router = express.Router();
const {
    // Section 1: Dashboard Metrics
    getTodayMetrics,
    getSalesMetricsByPeriod,
    getSalesPerformanceMetrics,

    // Section 2: Sales History & Retrieval
    getSalesHistory,
    getSaleDetails,
    getSaleItemsBySaleId,

    // Section 3: Search & Filtering
    searchSales,
    filterSalesByDateRange,
    getSalesByPaymentStatus,
    getSalesByLocation,
    getDueSales,

    // Section 4: Analytics
    getTopSellingProducts,
    getPaymentMethodBreakdown,
    getCustomerSalesSummary,
    getSalesBySaleType,

    // Section 5: Detailed Reports
    getMonthlySalesReport,
    getCompanyItemSalesReport,
    getOtherItemSalesReport,
    getLocationWiseSalesReport,
    getLocationSalesBreakdown,

    // Section 6: Write Operations
    createSale,
    addPaymentToSale,
    voidSale,
    printSale,

    // Section 7: Sales Management Module Extensions
    getDueSalesFixed,
    getTopCustomers,
    getRevenueTrend,
    getOutstandingDueAmount,
    voidSaleWithAudit,
    getSalesReport,
    getSalesDashboardAggregator
} = require('../../controllers/salesManagement/SalesManagementController_FIXED');

const {
    getAllCheques,
    getChequesSummary,
    clearCheque,
    bounceCheque
} = require('../../controllers/salesManagement/ChequeController');

const {
    getSalesSummaryReport,
    getProductWiseSalesReport,
    getTopSellingProductsReport,
    getSlowMovingProductsReport,
    getCustomerWiseSalesReport,
    getOutstandingBalancesReport,
    getPaymentMethodReport,
    getDueCollectionReport
} = require('../../controllers/salesManagement/SalesReportController');

// ============================================================================
// DASHBOARD & METRICS ROUTES
// ============================================================================
router.get('/metrics/today', getTodayMetrics);
router.get('/metrics/period', getSalesMetricsByPeriod);
router.get('/metrics/performance', getSalesPerformanceMetrics);

// ── Sales Management Dashboard Extras ────────────────────────────────────────
router.get('/dashboard/aggregator', getSalesDashboardAggregator);
router.get('/dashboard/top-customers', getTopCustomers);
router.get('/dashboard/revenue-trend', getRevenueTrend);
router.get('/dashboard/outstanding-due', getOutstandingDueAmount);
router.get('/dashboard/cheques-summary', getChequesSummary);

// ============================================================================
// DUE SALES
// ============================================================================
/** GET /api/sales-management/due — paginated due/partial invoices */
router.get('/due', getDueSalesFixed);

// ============================================================================
// CHEQUE MANAGEMENT
// ============================================================================
/** GET /api/sales-management/cheques?status=Pending|Cleared|Bounced|all */
router.get('/cheques/summary', getChequesSummary);
router.get('/cheques', getAllCheques);
router.post('/cheques/:id/clear', clearCheque);
router.post('/cheques/:id/bounce', bounceCheque);

// ============================================================================
// SALES HISTORY & RETRIEVAL ROUTES
// ============================================================================
router.get('/history', getSalesHistory);

// ============================================================================
// SEARCH & FILTERING ROUTES (MUST BE BEFORE /:saleId CATCH-ALL)
// ============================================================================
router.get('/search', searchSales);
router.get('/filter/date-range', filterSalesByDateRange);
router.get('/filter/payment-status', getSalesByPaymentStatus);
router.get('/filter/location', getSalesByLocation);
router.get('/filter/due-sales', getDueSales);

// ============================================================================
// ANALYTICS ROUTES
// ============================================================================
router.get('/analytics/top-products', getTopSellingProducts);
router.get('/analytics/location-sales', getLocationSalesBreakdown);
router.get('/analytics/customer-summary', getCustomerSalesSummary);
router.get('/analytics/payment-method', getPaymentMethodBreakdown);
router.get('/analytics/by-type', getSalesBySaleType);

// ============================================================================
// REPORTS ROUTES
// ============================================================================
router.get('/reports/monthly', getMonthlySalesReport);
router.get('/reports/company-sales', getCompanyItemSalesReport);
router.get('/reports/other-sales', getOtherItemSalesReport);
router.get('/reports/location-wise', getLocationWiseSalesReport);
router.get('/reports/sales', getSalesReport);

// Enhanced Sales Report Section Routes
router.get('/reports/summary', getSalesSummaryReport);
router.get('/reports/product-wise', getProductWiseSalesReport);
router.get('/reports/top-selling', getTopSellingProductsReport);
router.get('/reports/slow-moving', getSlowMovingProductsReport);
router.get('/reports/customer-wise', getCustomerWiseSalesReport);
router.get('/reports/outstanding-balances', getOutstandingBalancesReport);
router.get('/reports/payment-method', getPaymentMethodReport);
router.get('/reports/due-collection', getDueCollectionReport);

// ============================================================================
// SPECIFIC SALE ROUTES (BEFORE CATCH-ALL :saleId)
// ============================================================================
router.get('/:saleId/items', getSaleItemsBySaleId);

// ============================================================================
// CATCH-ALL SALE DETAILS ROUTE (:saleId — MUST BE LAST GET)
// ============================================================================
router.get('/:saleId', getSaleDetails);

// ============================================================================
// WRITE OPERATIONS ROUTES (POST)
// ============================================================================
router.post('/sales/create', createSale);
router.post('/sales/:id/payment', addPaymentToSale);
router.post('/sales/:id/void', voidSale);
router.post('/sales/:id/print', printSale);

/** POST /api/sales-management/sales/:id/void-audit — void with full audit trail */
router.post('/sales/:saleId/void-audit', voidSaleWithAudit);

module.exports = router;

