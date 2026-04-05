import SlideBar from './component/SlideBar/SlideBar.jsx'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Inventory_Dashboard from './pages/Inventory/InventoryDashboard';
import Hrdashboardpage from './pages/HR/Hrdashboardpage';
import EmployeesPage from './pages/HR/EmployeesPage';
import EmployeeDetail from './pages/HR/EmployeeDetail';
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
import './App.css';
import POS from './pages/POS/POS.jsx';


const App = () => {
  return (


    <div className="d-flex w-100" style={{ height: '100vh', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
      <SlideBar />

      {/* Main content Wrapper */}
      <div className="flex-grow-1 d-flex flex-column main-content-wrapper" style={{ height: '100vh', overflow: 'hidden' }}>
        <Header />

        <main className='p-4 flex-grow-1' style={{ overflowY: 'auto' }}>
          <Routes>
            <Route path="/home" element={<div>Home Page</div>} />

            <Route path="/inventory" element={<Inventory_Dashboard />} />
            <Route path="/inventory/company-items" element={<ProductPage pageTitle="Company Items" typeFilter="Company" />} />
            <Route path="/inventory/other-items" element={<ProductPage pageTitle="Other Items" typeFilter="Other" />} />
            <Route path="/inventory/raw-materials" element={<ProductPage pageTitle="Raw Materials" typeFilter="Raw" />} />
            <Route path="/inventory/production-stock" element={<ProductionStock />} />
            <Route path="/inventory/salesStock" element={<SalesStock />} />
            <Route path="/inventory/stock-transfers" element={<StockTransfer />} />
            <Route path="/inventory/stock-adjustments" element={<StockAdjustment />} />
            <Route path="/inventory/returns" element={<ReturnsManagement />} />
            <Route path="/inventory/reports" element={<InventoryReports />} />
            <Route path="/inventory/reports/current-stock" element={<CurrentStockReport />} />
            <Route path="/inventory/reports/expiry" element={<ExpiryReport />} />
            <Route path="/inventory/reports/daily-production" element={<ProductionReport />} />
            <Route path="/inventory/reports/purchases" element={<PurchaseReport />} />
            <Route path="/inventory/reports/supplier-purchases" element={<SupplierPurchaseReport />} />
            <Route path="/inventory/reports/transfers" element={<TransferReport />} />

            <Route path="/hr/employees" element={<EmployeesPage />} />
            <Route path="/hr/employees/:id" element={<EmployeeDetail />} />
            <Route path="/POS" element={<POS />} />
            <Route path="/hr" element={<div>HR Page</div>} />
            <Route path="/finance" element={<div>Finance Page</div>} />
            <Route path="/logout" element={<div>Logout Page</div>} />
          </Routes>
        </main>
      </div>
    </div>

  )
}

export default App