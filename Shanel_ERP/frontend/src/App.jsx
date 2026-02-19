import SlideBar from './component/slideBar/SlideBar.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Inventory_Dashboard from './pages/Inventory/InventoryDashboard'
import POS from './pages/POS/POS'

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
            <Route path="/inventory/stock" element={<div>Stock Management Page</div>} />
            <Route path="/pages/POS" element={<POS />} />
            <Route path="/hr" element={<div>HR Page</div>} />
            <Route path="/finance" element={<div>Finance Page</div>} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App