/**
 * Sales Management API Service
 * 
 * Centralized API calls for all sales management endpoints
 * Handles all GET/POST requests to /api/sales-management/*
 * 
 * Structure:
 * - Dashboard Metrics
 * - Sales History & Retrieval
 * - Search & Filtering
 * - Analytics & Reporting
 * - Write Operations
 */

import axios from 'axios';

const API_BASE = '/api/sales-management';

// ============================================================================
// SECTION 1: DASHBOARD METRICS
// ============================================================================

/**
 * Get today's sales metrics
 * Returns: totalSales, totalRevenue, totalDiscount, totalTax, totalTransactions
 */
export const fetchTodayMetrics = async () => {
    try {
        const response = await axios.get(`${API_BASE}/metrics/today`);
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching today metrics:', error);
        throw error;
    }
};

/**
 * Get sales metrics for a specific period
 * @param {string} period - 'week' | 'month' | 'year'
 */
export const fetchMetricsByPeriod = async (period = 'month') => {
    try {
        const response = await axios.get(`${API_BASE}/metrics/period`, {
            params: { period }
        });
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching period metrics:', error);
        throw error;
    }
};

/**
 * Get sales performance metrics
 * Returns: conversion rate, avg ticket, growth rate, etc.
 */
export const fetchPerformanceMetrics = async () => {
    try {
        const response = await axios.get(`${API_BASE}/metrics/performance`);
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching performance metrics:', error);
        throw error;
    }
};

// ============================================================================
// SECTION 2: SALES HISTORY & RETRIEVAL
// ============================================================================

/**
 * Get sales history with pagination
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 */
export const fetchSalesHistory = async (page = 1, limit = 20) => {
    try {
        const response = await axios.get(`${API_BASE}/history`, {
            params: { page, limit }
        });
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching sales history:', error);
        throw error;
    }
};

/**
 * Get single sale details by ID
 * @param {number} saleId - Sale ID
 */
export const fetchSaleDetails = async (saleId) => {
    try {
        const response = await axios.get(`${API_BASE}/${saleId}`);
        return response.data;
    } catch (error) {
        console.error(`❌ Error fetching sale ${saleId}:`, error);
        throw error;
    }
};

/**
 * Get sale items for a specific sale
 * @param {number} saleId - Sale ID
 */
export const fetchSaleItems = async (saleId) => {
    try {
        const response = await axios.get(`${API_BASE}/${saleId}/items`);
        return response.data;
    } catch (error) {
        console.error(`❌ Error fetching sale items for ${saleId}:`, error);
        throw error;
    }
};

// ============================================================================
// SECTION 3: SEARCH & FILTERING
// ============================================================================

/**
 * Search sales by multiple criteria
 * @param {Object} filters - { query, startDate, endDate, paymentStatus, location, page, limit }
 */
export const searchSales = async (filters = {}) => {
    try {
        const { 
            query = '', 
            startDate = '', 
            endDate = '', 
            paymentStatus = '', 
            location = '',
            page = 1,
            limit = 20 
        } = filters;

        const response = await axios.get(`${API_BASE}/search`, {
            params: {
                query,
                startDate,
                endDate,
                paymentStatus,
                location,
                page,
                limit
            }
        });
        return response.data;
    } catch (error) {
        console.error('❌ Error searching sales:', error);
        throw error;
    }
};

/**
 * Filter sales by date range
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 */
export const filterByDateRange = async (startDate, endDate, page = 1, limit = 20) => {
    try {
        const response = await axios.get(`${API_BASE}/filter/date-range`, {
            params: { startDate, endDate, page, limit }
        });
        return response.data;
    } catch (error) {
        console.error('❌ Error filtering by date range:', error);
        throw error;
    }
};

/**
 * Filter sales by payment status
 * @param {string} paymentStatus - 'Paid' | 'Unpaid' | 'Partially_Paid'
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 */
export const filterByPaymentStatus = async (paymentStatus, page = 1, limit = 20) => {
    try {
        const response = await axios.get(`${API_BASE}/filter/payment-status`, {
            params: { paymentStatus, page, limit }
        });
        return response.data;
    } catch (error) {
        console.error('❌ Error filtering by payment status:', error);
        throw error;
    }
};

/**
 * Filter sales by location
 * @param {string} location - 'Shop' | 'Production' | 'Main_Warehouse'
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 */
export const filterByLocation = async (location, page = 1, limit = 20) => {
    try {
        const response = await axios.get(`${API_BASE}/filter/location`, {
            params: { location, page, limit }
        });
        return response.data;
    } catch (error) {
        console.error('❌ Error filtering by location:', error);
        throw error;
    }
};

/**
 * Get due/pending payments
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 */
export const fetchDueSales = async (page = 1, limit = 20) => {
    try {
        const response = await axios.get(`${API_BASE}/filter/due-sales`, {
            params: { page, limit }
        });
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching due sales:', error);
        throw error;
    }
};

// ============================================================================
// SECTION 4: ANALYTICS & REPORTING
// ============================================================================

/**
 * Get top selling products
 * @param {number} limit - Number of products to return
 * @param {string} period - 'week' | 'month' | 'year'
 */
export const fetchTopSellingProducts = async (limit = 10, period = 'month') => {
    try {
        const response = await axios.get(`${API_BASE}/analytics/top-products`, {
            params: { limit, period }
        });
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching top selling products:', error);
        throw error;
    }
};

/**
 * Get payment method breakdown
 * @param {string} period - 'week' | 'month' | 'year'
 */
export const fetchPaymentMethodBreakdown = async (period = 'month') => {
    try {
        const response = await axios.get(`${API_BASE}/analytics/payment-method`, {
            params: { period }
        });
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching payment method breakdown:', error);
        throw error;
    }
};

/**
 * Get customer-wise sales summary
 * @param {number} limit - Number of customers
 * @param {number} page - Page number
 */
export const fetchCustomerSalesSummary = async (limit = 10, page = 1) => {
    try {
        const response = await axios.get(`${API_BASE}/analytics/customer-summary`, {
            params: { limit, page }
        });
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching customer summary:', error);
        throw error;
    }
};

/**
 * Get sales breakdown by type
 * @param {string} saleType - 'Retail' | 'Wholesale'
 */
export const fetchSalesByType = async (saleType) => {
    try {
        const response = await axios.get(`${API_BASE}/analytics/by-type`, {
            params: { saleType }
        });
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching sales by type:', error);
        throw error;
    }
};

/**
 * Get sales breakdown by location
 */
export const fetchLocationSalesBreakdown = async () => {
    try {
        const response = await axios.get(`${API_BASE}/analytics/location-sales`);
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching location sales breakdown:', error);
        throw error;
    }
};

// ============================================================================
// SECTION 5: DETAILED REPORTS
// ============================================================================

/**
 * Get monthly sales report
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (YYYY)
 */
export const fetchMonthlySalesReport = async (month, year) => {
    try {
        const response = await axios.get(`${API_BASE}/reports/monthly`, {
            params: { month, year }
        });
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching monthly report:', error);
        throw error;
    }
};

/**
 * Get company items sales report
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (YYYY)
 */
export const fetchCompanyItemsReport = async (month, year) => {
    try {
        const response = await axios.get(`${API_BASE}/reports/company-sales`, {
            params: { month, year }
        });
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching company items report:', error);
        throw error;
    }
};

/**
 * Get other items sales report
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (YYYY)
 */
export const fetchOtherItemsReport = async (month, year) => {
    try {
        const response = await axios.get(`${API_BASE}/reports/other-sales`, {
            params: { month, year }
        });
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching other items report:', error);
        throw error;
    }
};

/**
 * Get location-wise sales report
 * @param {string} location - 'Shop' | 'Production' | 'Main_Warehouse'
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (YYYY)
 */
export const fetchLocationWiseReport = async (location, month, year) => {
    try {
        const response = await axios.get(`${API_BASE}/reports/location-wise`, {
            params: { location, month, year }
        });
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching location-wise report:', error);
        throw error;
    }
};

// ============================================================================
// SECTION 6: WRITE OPERATIONS (POST)
// ============================================================================

/**
 * Create new sale with line items
 * @param {Object} saleData - Sale details with items array
 */
export const createSale = async (saleData) => {
    try {
        const response = await axios.post(`${API_BASE}/sales/create`, saleData);
        return response.data;
    } catch (error) {
        console.error('❌ Error creating sale:', error);
        throw error;
    }
};

/**
 * Add payment to existing sale
 * @param {number} saleId - Sale ID
 * @param {Object} paymentData - Payment details
 */
export const addPaymentToSale = async (saleId, paymentData) => {
    try {
        const response = await axios.post(`${API_BASE}/sales/${saleId}/payment`, paymentData);
        return response.data;
    } catch (error) {
        console.error(`❌ Error adding payment to sale ${saleId}:`, error);
        throw error;
    }
};

/**
 * Void/cancel a sale
 * @param {number} saleId - Sale ID
 */
export const voidSale = async (saleId) => {
    try {
        const response = await axios.post(`${API_BASE}/sales/${saleId}/void`);
        return response.data;
    } catch (error) {
        console.error(`❌ Error voiding sale ${saleId}:`, error);
        throw error;
    }
};

/**
 * Mark sale as printed
 * @param {number} saleId - Sale ID
 */
export const printSale = async (saleId) => {
    try {
        const response = await axios.post(`${API_BASE}/sales/${saleId}/print`);
        return response.data;
    } catch (error) {
        console.error(`❌ Error printing sale ${saleId}:`, error);
        throw error;
    }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format currency for display
 */
export const formatCurrency = (amount) => {
    return parseFloat(amount || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

/**
 * Format date for display
 */
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
    });
};

/**
 * Get payment status badge class
 */
export const getPaymentStatusClass = (status) => {
    switch (status) {
        case 'Paid':
            return 'bg-success-subtle text-success border-success';
        case 'Partially_Paid':
            return 'bg-warning-subtle text-warning border-warning';
        case 'Unpaid':
            return 'bg-danger-subtle text-danger border-danger';
        default:
            return 'bg-secondary-subtle text-secondary border-secondary';
    }
};

/**
 * Get location badge class
 */
export const getLocationClass = (location) => {
    switch (location) {
        case 'Shop':
            return 'bg-primary-subtle text-primary';
        case 'Production':
            return 'bg-info-subtle text-info';
        case 'Main_Warehouse':
            return 'bg-warning-subtle text-warning';
        default:
            return 'bg-secondary-subtle text-secondary';
    }
};

/**
 * Get sale type badge class
 */
export const getSaleTypeClass = (type) => {
    switch (type) {
        case 'Retail':
            return 'bg-success-subtle text-success';
        case 'Wholesale':
            return 'bg-info-subtle text-info';
        default:
            return 'bg-secondary-subtle text-secondary';
    }
};

export default {
    // Dashboard Metrics
    fetchTodayMetrics,
    fetchMetricsByPeriod,
    fetchPerformanceMetrics,

    // Sales History
    fetchSalesHistory,
    fetchSaleDetails,
    fetchSaleItems,

    // Search & Filtering
    searchSales,
    filterByDateRange,
    filterByPaymentStatus,
    filterByLocation,
    fetchDueSales,

    // Analytics
    fetchTopSellingProducts,
    fetchPaymentMethodBreakdown,
    fetchCustomerSalesSummary,
    fetchSalesByType,
    fetchLocationSalesBreakdown,

    // Reports
    fetchMonthlySalesReport,
    fetchCompanyItemsReport,
    fetchOtherItemsReport,
    fetchLocationWiseReport,

    // Write Operations
    createSale,
    addPaymentToSale,
    voidSale,
    printSale,

    // Utilities
    formatCurrency,
    formatDate,
    getPaymentStatusClass,
    getLocationClass,
    getSaleTypeClass
};
