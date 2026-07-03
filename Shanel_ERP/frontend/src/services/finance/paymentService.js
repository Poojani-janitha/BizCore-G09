import axios from 'axios';
import { API_ENDPOINTS } from '../../config/apiEndpoints';

const INCOME_API = API_ENDPOINTS.incomes.root;
const EXPENSE_API = API_ENDPOINTS.expenses.root;

const extractData = (response) => response?.data?.data || [];

export const fetchIncomeList = async (limit = 500) => {
  const response = await axios.get(`${INCOME_API}?limit=${limit}`);
  return extractData(response);
};

export const fetchExpenseList = async (limit = 500) => {
  const response = await axios.get(`${EXPENSE_API}?limit=${limit}`);
  return extractData(response);
};

export const fetchPaymentManagementData = async (limit = 500) => {
  const [incomes, expenses] = await Promise.all([
    fetchIncomeList(limit),
    fetchExpenseList(limit)
  ]);

  return { incomes, expenses };
};

const formatNumber = (value) => Number(value || 0).toLocaleString('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const monthKey = (dateValue) => {
  const date = new Date(dateValue);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const percentageDelta = (current, previous) => {
  if (!previous && current) {
    return 100;
  }

  if (!previous && !current) {
    return 0;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
};

export const buildPaymentSummary = (incomes, expenses) => {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonth = `${previousMonthDate.getFullYear()}-${String(previousMonthDate.getMonth() + 1).padStart(2, '0')}`;

  const totalReceived = incomes.reduce((sum, row) => sum + Number(row.Amount || 0), 0);
  const totalPaid = expenses.reduce((sum, row) => sum + Number(row.Amount || 0), 0);

  const currentReceived = incomes
    .filter((row) => monthKey(row.Income_Date) === currentMonth)
    .reduce((sum, row) => sum + Number(row.Amount || 0), 0);

  const previousReceived = incomes
    .filter((row) => monthKey(row.Income_Date) === previousMonth)
    .reduce((sum, row) => sum + Number(row.Amount || 0), 0);

  const currentPaid = expenses
    .filter((row) => monthKey(row.Expense_Date) === currentMonth)
    .reduce((sum, row) => sum + Number(row.Amount || 0), 0);

  const previousPaid = expenses
    .filter((row) => monthKey(row.Expense_Date) === previousMonth)
    .reduce((sum, row) => sum + Number(row.Amount || 0), 0);

  const netCash = totalReceived - totalPaid;
  const currentNet = currentReceived - currentPaid;
  const previousNet = previousReceived - previousPaid;

  return {
    received: {
      amount: totalReceived,
      count: incomes.length,
      percentage: percentageDelta(currentReceived, previousReceived)
    },
    paid: {
      amount: totalPaid,
      count: expenses.length,
      percentage: percentageDelta(currentPaid, previousPaid)
    },
    netCash: {
      amount: netCash,
      percentage: percentageDelta(currentNet, previousNet)
    }
  };
};

export const buildPaymentTransactions = (incomes, expenses) => {
  const incomeTransactions = incomes.map((row) => ({
    id: `IN-${row.Income_ID}`,
    type: 'IN',
    date: row.Income_Date,
    party: row.Source || 'Unknown Source',
    description: row.Description || `${row.Income_Category} income`,
    method: row.Income_Category,
    amount: `+ Rs. ${formatNumber(row.Amount)}`,
    amountColor: '#008236',
    rawDate: row.Income_Date,
    createdAt: row.Created_At
  }));

  const expenseTransactions = expenses.map((row) => ({
    id: `OUT-${row.Expense_ID}`,
    type: 'OUT',
    date: row.Expense_Date,
    party: row.Paid_To || 'Unknown Payee',
    description: row.Description || `${row.Expense_Category} expense`,
    method: row.Payment_Method || 'N/A',
    amount: `- Rs. ${formatNumber(row.Amount)}`,
    amountColor: '#C10007',
    rawDate: row.Expense_Date,
    createdAt: row.Created_At
  }));

  return [...incomeTransactions, ...expenseTransactions]
    .sort((a, b) => {
      const dateCompare = new Date(b.rawDate) - new Date(a.rawDate);
      if (dateCompare !== 0) return dateCompare;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
};

export const filterTransactionsByTab = (transactions, activeTab) => {
  if (activeTab === 'received') {
    return transactions.filter((item) => item.type === 'IN');
  }

  if (activeTab === 'paid') {
    return transactions.filter((item) => item.type === 'OUT');
  }

  return transactions;
};

export const fetchDashboardStats = async () => {
  const response = await axios.get(API_ENDPOINTS.financeDashboard.stats);
  return response?.data || { success: false };
};

export const getPaymentManagementData = async (limit = 500) => {
  const [baseData, dashboardData] = await Promise.all([
    fetchPaymentManagementData(limit),
    fetchDashboardStats()
  ]);

  const { incomes, expenses } = baseData;

  return {
    summaryData: dashboardData.success ? dashboardData.summary : buildPaymentSummary(incomes, expenses),
    cashFlow: dashboardData.success ? dashboardData.cashFlow : [],
    distribution: dashboardData.success ? dashboardData.distribution : { income: [], expense: [] },
    transactions: buildPaymentTransactions(incomes, expenses)
  };
};

export const getPaymentManagementError = (error) => {
  return error?.response?.data?.message || 'Failed to load finance overview data.';
};
