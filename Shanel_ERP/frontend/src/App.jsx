import SlideBar from './component/SlideBar/SlideBar.jsx'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Inventory_Dashboard from './pages/Inventory/InventoryDashboard';
import Hrdashboardpage from './pages/HR/Hrdashboardpage';
import EmployeesPage from './pages/HR/EmployeesPage';
import Attendance from './pages/HR/AttendancePage.jsx';
import Header from './component/Header/Header';
import ProductPage from './pages/Inventory/ProductPage.jsx';
import ProductionStock from './pages/Inventory/ProductionStock.jsx';
import './App.css';
import POS from './pages/POS/POS.jsx';


const App = () => {
  return (


    <div className="d-flex w-100" style={{ height: '100vh', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
      <SlideBar />

      {/* Main content Warapper */}
      <div className="flex-grow-1 d-flex flex-column" style={{ height: '100vh', overflow: 'hidden' }}>
        <Header />

        <main className='p-4 flex-grow-1' style={{ overflowY: 'auto' }}>
          <Routes>
            <Route path="/home" element={<div>Home Page</div>} />

            <Route path="/inventory" element={<Inventory_Dashboard />} />
            <Route path="/inventory/company-items" element={<ProductPage pageTitle="Company Items" typeFilter="Company" />} />
            <Route path="/inventory/other-items" element={<ProductPage pageTitle="Other Items" typeFilter="Other" />} />
            <Route path="/inventory/raw-materials" element={<ProductPage pageTitle="Raw Materials" typeFilter="Raw" />} />
            <Route path="/inventory/production-stock" element={<ProductionStock />} />

            <Route path="/hr/employees" element={<EmployeesPage />} />
            <Route path="/POS" element={<POS />} />
            <Route path="/hr" element={<Hrdashboardpage />} />
            <Route path="/hr/attendance" element={<Attendance />} />
            <Route path="/finance" element={<div>Finance Page</div>} />
            <Route path="/logout" element={<div>Logout Page</div>} />
          </Routes>
        </main>
      </div>
    </div>

  )
}

export default App