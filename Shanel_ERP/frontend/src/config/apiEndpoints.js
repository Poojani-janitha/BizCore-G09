export const API_URL = '/api'
//export const API_URL = 'http://localhost:5000/api'

export const API_ENDPOINTS = {
  root: API_URL,
  health: `${API_URL}/?name=Shanel`,
  accounts: {
    list: `${API_URL}/accounts`,
    create: `${API_URL}/accounts/create`,
    nextCode: (type) => `${API_URL}/accounts/next-code/${type}`,
    ledger: (accountCode) => `${API_URL}/accounts/ledger/${accountCode}`,
    activeExpense: `${API_URL}/accounts?active=true&type=Expense`,
    activeRevenue: `${API_URL}/accounts?active=true&type=Revenue`,
  },
  banks: {
    list: `${API_URL}/banks/banks`,
    branches: (bankId) => `${API_URL}/banks/banks/${bankId}/branches`,
  },
  creditPayments: {
    root: `${API_URL}/credit-payments`,
  },
  customer: {
    root: `${API_URL}/customer`,
    byId: (id) => `${API_URL}/customer/${id}`,
    search: `${API_URL}/customer/search`,
  },
  expenses: {
    root: `${API_URL}/expenses`,
  },
  financeDashboard: {
    stats: `${API_URL}/finance/dashboard/stats`,
    profitLoss: (startDate, endDate) => `${API_URL}/finance/dashboard/profit-loss?startDate=${startDate}&endDate=${endDate}`,
    balanceSheet: (asOfDate) => `${API_URL}/finance/dashboard/balance-sheet?asOfDate=${asOfDate}`,
  },
  fiscalPeriods: {
    root: `${API_URL}/fiscal-periods`,
    status: (id) => `${API_URL}/fiscal-periods/${id}/status`,
  },
  hr: {
    root: `${API_URL}/hr`,
    employees: `${API_URL}/hr/employees`,
  },
  incomes: {
    root: `${API_URL}/incomes`,
  },
  inventory: {
    products: `${API_URL}/inventory/products`,
    productById: (id) => `${API_URL}/inventory/products/${id}`,
    productLocations: (productId) => `${API_URL}/inventory/product/${productId}/locations`,
    availableBaseUnits: `${API_URL}/inventory/available-base-units`,
    availableAlternativeUnits: `${API_URL}/inventory/available-alternative-units`,
    invoiceByNo: (invoiceNo) => `${API_URL}/inventory/invoice/${invoiceNo}`,
    invoiceDetails: (saleId) => `${API_URL}/inventory/invoice-details/${saleId}`,
    dashboardStats: `${API_URL}/inventory/dashboard-stats`,
    suppliers: `${API_URL}/inventory/suppliers`,
    adjustments: {
      root: `${API_URL}/inventory/adjustments`,
      adjust: `${API_URL}/inventory/adjustments/adjust`,
      byId: (adjustmentId) => `${API_URL}/inventory/adjustments/${adjustmentId}`,
    },
    reports: {
      currentStock: `${API_URL}/inventory/reports/current-stock`,
      expiry: `${API_URL}/inventory/reports/expiry`,
      production: `${API_URL}/inventory/reports/production`,
      purchases: `${API_URL}/inventory/reports/purchases`,
      supplierPurchases: `${API_URL}/inventory/reports/supplier-purchases`,
      transfers: `${API_URL}/inventory/reports/transfers`,
    },
    returns: {
      root: `${API_URL}/inventory/returns`,
      process: `${API_URL}/inventory/returns/process`,
      byId: (returnId) => `${API_URL}/inventory/returns/${returnId}`,
    },
    sales: {
      stockOverview: `${API_URL}/inventory/sales/stock-overview`,
      recentStockIn: `${API_URL}/inventory/sales/recent-stock-in`,
      recentStockOut: `${API_URL}/inventory/sales/recent-stock-out`,
      search: `${API_URL}/inventory/sales/search`,
    },
    transfers: {
      create: `${API_URL}/inventory/transfers/create`,
      history: `${API_URL}/inventory/transfers/history`,
      byId: (transferId) => `${API_URL}/inventory/transfers/${transferId}`,
    },
  },
  journalEntries: {
    list: (pageNum, limit = 10) => `${API_URL}/journal-entries?page=${pageNum}&limit=${limit}`,
    create: `${API_URL}/journal-entries/create`,
    correctionsList: (pageNum, limit = 10) => `${API_URL}/journal-entries/correction/list?page=${pageNum}&limit=${limit}`,
    correctionsSubmit: `${API_URL}/journal-entries/correction/submit`,
  },
  production: {
    stockOverview: `${API_URL}/production/stock-overview`,
    start: `${API_URL}/production/start`,
    byId: (id) => `${API_URL}/production/${id}`,
    update: (id) => `${API_URL}/production/update/${id}`,
  },
  sales: {
    root: `${API_URL}/sales/`,
    all: `${API_URL}/sales/all`,
    generateInvoiceNo: `${API_URL}/sales/generate-invoice-no`,
    updatePrintStatus: (invoiceNo) => `${API_URL}/sales/update-print-status/${invoiceNo}`,
    productQuantity: (productId) => `${API_URL}/sales/product-quantity/${productId}`,
    search: (value) => `${API_URL}/sales/search?q=${value}`,
    units: (productId) => `${API_URL}/sales/units?productId=${productId}`,
  },
  users: {
    login: `${API_URL}/users/login`,
    logout: `${API_URL}/users/logout`,
    all: `${API_URL}/users/all`,
    register: `${API_URL}/users/register`,
    update: `${API_URL}/users/update`,
    delete: `${API_URL}/users/delete`,
    models: `${API_URL}/users/models`,
    search: (q) => `${API_URL}/users/search?q=${q}`,
  },
  salesManagement: {
    metricsToday: `${API_URL}/sales-management/metrics/today`,
  },
  supplierPayments: {
    root: `${API_URL}/supplier-payments`,
    billsBySupplier: (id) => `${API_URL}/supplier-payments/bills/${id}`,
    payCredit: `${API_URL}/supplier-payments/pay-credit`,
  },
}
