const express = require('express');
const router = express.Router();
const {
    // Today's Metrics
    getTodayMetrics,

    // Sales History
    getSalesHistory,
    getSaleDetails,
    getSaleItemsBySaleId,

    // Search & Filter
    searchSales,
    filterSalesByDateRange,
    getSalesByPaymentStatus,
    getSalesByLocation,

    // Analytics
    getSalesMetricsByPeriod,
    getTopSellingProducts,
    getCustomerSalesSummary,
    getPaymentMethodBreakdown,
    getSalesBySaleType,
    getDueSales,

    // Reports
    getMonthlySalesReport,
    getSalesPerformanceMetrics
} = require('../../controllers/salesManagement/SalesManagementController');

// ============================================================================
// DASHBOARD & METRICS ROUTES
// ============================================================================

/**
 * GET /api/sales-management/metrics/today
 * Get today's metrics (sales, revenue, discount, tax, transactions)
 */
router.get('/metrics/today', getTodayMetrics);

/**
 * GET /api/sales-management/metrics/period
 * Get sales metrics for a period (week/month/year)
 * Query params: period (week|month|year)
 */
router.get('/metrics/period', getSalesMetricsByPeriod);

/**
 * GET /api/sales-management/metrics/performance
 * Get sales performance metrics (conversion rate, avg ticket, etc.)
 */
router.get('/metrics/performance', getSalesPerformanceMetrics);

// ============================================================================
// SALES HISTORY & RETRIEVAL ROUTES
// ============================================================================

/**
 * GET /api/sales-management/history
 * Get sales history with pagination
 * Query params: page, limit
 */
router.get('/history', getSalesHistory);

/**
 * GET /api/sales-management/:saleId
 * Get sale details by ID
 */
router.get('/:saleId', getSaleDetails);

/**
 * GET /api/sales-management/:saleId/items
 * Get sale items by sale ID
 */
router.get('/:saleId/items', getSaleItemsBySaleId);

// ============================================================================
// SEARCH & FILTERING ROUTES
// ============================================================================

/**
 * GET /api/sales-management/search
 * Search sales by multiple criteria
 * Query params: query, startDate, endDate, paymentStatus, location
 */
router.get('/search', searchSales);

/**
 * GET /api/sales-management/filter/date-range
 * Filter sales by date range
 * Query params: startDate, endDate, page, limit
 */
router.get('/filter/date-range', filterSalesByDateRange);

/**
 * GET /api/sales-management/filter/payment-status
 * Filter sales by payment status
 * Query params: paymentStatus (Paid|Unpaid|Partially_Paid), page, limit
 */
router.get('/filter/payment-status', getSalesByPaymentStatus);

/**
 * GET /api/sales-management/filter/location
 * Filter sales by location
 * Query params: location (Shop|Production|Main_Warehouse), page, limit
 */
router.get('/filter/location', getSalesByLocation);

/**
 * GET /api/sales-management/filter/due-sales
 * Get due/pending payments
 * Query params: page, limit
 */
router.get('/filter/due-sales', getDueSales);

// ============================================================================
// ANALYTICS ROUTES
// ============================================================================

/**
 * GET /api/sales-management/analytics/top-products
 * Get top selling products
 * Query params: limit, period (week|month|year)
 */
router.get('/analytics/top-products', getTopSellingProducts);

/**
 * GET /api/sales-management/analytics/customer-summary
 * Get customer-wise sales summary
 * Query params: limit, page
 */
router.get('/analytics/customer-summary', getCustomerSalesSummary);

/**
 * GET /api/sales-management/analytics/payment-method
 * Get payment method breakdown
 * Query params: startDate, endDate
 */
router.get('/analytics/payment-method', getPaymentMethodBreakdown);

/**
 * GET /api/sales-management/analytics/by-type
 * Get sales by type (Retail/Wholesale)
 */
router.get('/analytics/by-type', getSalesBySaleType);

// ============================================================================
// REPORTS ROUTES
// ============================================================================

/**
 * GET /api/sales-management/reports/monthly
 * Get monthly sales report
 * Query params: month (1-12), year
 */
router.get('/reports/monthly', getMonthlySalesReport);

module.exports = router;
