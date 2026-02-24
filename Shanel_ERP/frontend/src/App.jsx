import SlideBar from './component/SlideBar/SlideBar.jsx'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Inventory_Dashboard from './pages/Inventory/InventoryDashboard';
import Header from './component/Header/Header';
import './App.css';
import POS from './pages/POS/POS.jsx';


const App = () => {
  return (


    <div className="d-flex w-100" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <SlideBar />

      {/* Main content Warapper */}
      <div className="flex-grow-1 d-flex flex-column">
        <Header />

        <main className='p-4 flex-grow-1'>
          <Routes>
            <Route path="/home" element={<div>Home Page</div>} />

            <Route path="/inventory" element={<Inventory_Dashboard />} />
            <Route path="/inventory/products" element={<div>Products Management Table</div>} />
            <Route path="/inventory/raw-materials" element={<div>Raw Materials Page</div>} />
            <Route path="/inventory/finished-goods" element={<div>Finished Goods Page</div>} />

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