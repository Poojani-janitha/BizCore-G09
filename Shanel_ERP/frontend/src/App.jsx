import SlideBar from './component/SlideBar/SlideBar.jsx'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Inventory_Dashboard from './pages/Inventory/InventoryDashboard';

const App = () => {
  return (
    
    <BrowserRouter>
      <div className="d-flex">
        <SlideBar />
        <div className="flex-grow-1">
          <Routes>
            <Route path="/home" element={<div>Home Page</div>} />
            <Route path="/inventory" element={<Inventory_Dashboard />} />
              <Route path="/inventory/products" element={<div>Products Management Table</div>} />
              <Route path="/inventory/raw-materials" element={<div>Raw Materials Page</div>} />
              <Route path="/inventory/finished-goods" element={<div>Finished Goods Page</div>} />
            <Route path="/sales" element={<div>Sales Page</div>} />
            <Route path="/hr" element={<div>HR Page</div>} />
            <Route path="/finance" element={<div>Finance Page</div>} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App