import SlideBar from './component/SlideBar/SlideBar.jsx'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Inventory_Dashboard from './pages/Inventory/InventoryDashboard';
import Hrdashboardpage from './pages/HR/Hrdashboardpage';
import EmployeesPage from './pages/HR/EmployeesPage';
import Attendance from './pages/HR/AttendancePage.jsx';
import Payroll from './pages/HR/Payroll.jsx';
import Leave from './pages/HR/Leave.jsx';
import Reports from './pages/HR/Reports.jsx';
import Header from './component/Header/Header';
import ProductPage from './pages/Inventory/ProductPage.jsx';
import ProductionStock from './pages/Inventory/ProductionStock.jsx';
import SalesStock from './pages/Inventory/SalesStock.jsx';
import StockTransfer from './pages/Inventory/StockTransfer.jsx';
import StockAdjustment from './pages/Inventory/StockAdjustment.jsx';
import ReturnsManagement from './pages/Inventory/ReturnsManagement.jsx';
import CurrentStockReport from './pages/Inventory/Reports/CurrentStockReport.jsx';
import InventoryReports from './pages/Inventory/Reports/InventoryReports.jsx';
import ExpiryReport from './pages/Inventory/Reports/ExpiryReport.jsx';
import ProductionReport from './pages/Inventory/Reports/ProductionReport.jsx';
import PurchaseReport from './pages/Inventory/Reports/PurchaseReport.jsx';
import SupplierPurchaseReport from './pages/Inventory/Reports/SupplierPurchaseReport.jsx';
import TransferReport from './pages/Inventory/Reports/TransferReport.jsx';
import AlertsPage from './pages/Inventory/AlertsPage.jsx';
import POS from './pages/POS/POS.jsx';
import PaymentManagementPage from './pages/Finance/PaymentManagementPage.jsx';
import ReceivePaymentPage from './pages/Finance/ReceivePaymentPage.jsx';
import MakePaymentPage from './pages/Finance/MakePaymentPage.jsx';
import GeneralLedgerPage from './pages/Finance/GeneralLedgerPage.jsx';
import ChartOfAccountsPage from './pages/Finance/ChartOfAccountsPage.jsx';
import AccountLedgerPage from './pages/Finance/AccountLedgerPage.jsx';
import CreateAccountPage from './pages/Finance/CreateAccountPage.jsx';
import EditTransactionsPage from './pages/Finance/EditTransactionsPage.jsx';
import ReportsPage from './pages/Finance/ReportsPage.jsx';
import LoginForm from './pages/User/LoginForm.jsx';
import UserDashboard from './pages/User/userDashboard.jsx';
import Logout from './pages/User/Logout.jsx';
import './App.css';
import { useState } from 'react';

const App = () => {

  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <div className="d-flex w-100" style={{ height: '100vh', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
      {isAuthenticated && <SlideBar />}

      {/* Main content Wrapper */}
      <div className="flex-grow-1 d-flex flex-column main-content-wrapper" style={{ height: '100vh', overflow: 'hidden' }}>
        {isAuthenticated && <Header />}

        <main className='p-4 flex-grow-1' style={{ overflowY: 'auto' }}>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            
            <Route path="/home" element={isAuthenticated ? <div>Home Page</div> : <Navigate to="/login" />} />

            <Route path="/inventory" element={<Inventory_Dashboard />} />
            <Route path="/inventory/company-items" element={<ProductPage pageTitle="Company Items" typeFilter="Company" />} />
            <Route path="/inventory/other-items" element={<ProductPage pageTitle="Other Items" typeFilter="Other" />} />
            <Route path="/inventory/raw-materials" element={<ProductPage pageTitle="Raw Materials" typeFilter="Raw" />} />
            <Route path="/inventory/production-stock" element={<ProductionStock />} />
            <Route path="/inventory/salesStock" element={<SalesStock />} />
            <Route path="/inventory/stock-transfers" element={<StockTransfer />} />
            <Route path="/inventory/stock-adjustments" element={<StockAdjustment />} />
            <Route path="/inventory/returns" element={<ReturnsManagement />} />
            <Route path="/inventory/alerts" element={<AlertsPage />} />
            <Route path="/inventory/reports" element={<InventoryReports />} />
            <Route path="/inventory/reports/current-stock" element={<CurrentStockReport />} />
            <Route path="/inventory/reports/expiry" element={<ExpiryReport />} />
            <Route path="/inventory/reports/daily-production" element={<ProductionReport />} />
            <Route path="/inventory/reports/purchases" element={<PurchaseReport />} />
            <Route path="/inventory/reports/supplier-purchases" element={<SupplierPurchaseReport />} />
            <Route path="/inventory/reports/transfers" element={<TransferReport />} />

            <Route path="/hr/employees" element={<EmployeesPage />} />
            <Route path="/hr/attendance" element={<Attendance />} />
            <Route path="/hr/payroll" element={<Payroll />} />
            <Route path="/hr/leave" element={<Leave />} />
            <Route path="/hr/reports" element={<Reports />} />
            <Route path="/POS" element={<POS />} />
            <Route path="/hr" element={<Hrdashboardpage />} />
            
            <Route path="/finance" element={<PaymentManagementPage />} />
            <Route path="/finance/receive-payment" element={<ReceivePaymentPage />} />
            <Route path="/finance/make-payment" element={<MakePaymentPage />} />
            <Route path="/finance/general-ledger" element={<GeneralLedgerPage />} />
            <Route path="/finance/chart-of-accounts" element={<ChartOfAccountsPage />} />
            <Route path="/finance/ledger/:accountCode" element={<AccountLedgerPage />} />
            <Route path="/finance/create-account" element={<CreateAccountPage />} />
            <Route path="/finance/reports" element={<ReportsPage />} />
            <Route path="/finance/edit-transactions" element={<EditTransactionsPage />} />
            
            <Route path="/user-management" element={<UserDashboard />} />
            
            <Route path="/logout" element={<Logout />} />
            <Route path="/" element={<Navigate to={isAuthenticated ? "/home" : "/login"} />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App