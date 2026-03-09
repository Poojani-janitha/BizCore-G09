import SlideBar from './component/SlideBar/SlideBar.jsx'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Inventory_Dashboard from './pages/Inventory/InventoryDashboard';
import Hrdashboardpage from './pages/HR/Hrdashboardpage';
import EmployeesPage from './pages/HR/EmployeesPage';
import Attendance from './pages/HR/AttendancePage.jsx';
import Header from './component/Header/Header';
import ProductPage from './pages/Inventory/ProductPage.jsx';
import './App.css';
import POS from './pages/POS/POS.jsx';


const App = () => {
  return (


    <div className="d-flex w-100" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <SlideBar />

      {/* Main content Wrapper - minWidth:0 prevents flex overflow over sidebar */}
      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0, overflow: 'auto' }}>
        <Header />

        <main className='p-4 flex-grow-1' style={{ minWidth: 0, overflow: 'auto' }}>
          <Routes>
            <Route path="/home" element={<div>Home Page</div>} />

            <Route path="/inventory" element={<Inventory_Dashboard />} />
            <Route path="/inventory/company-items" element={<ProductPage pageTitle="Company Items" typeFilter="Company" />} />
            <Route path="/inventory/other-items" element={<ProductPage pageTitle="Other Items" typeFilter="Other" />} />
            <Route path="/inventory/raw-materials" element={<ProductPage pageTitle="Raw Materials" typeFilter="Raw" />} />
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