import SlideBar from './component/SlideBar/SlideBar'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Inventory_Dashboard from './component/Inventory_Dashboard';

const App = () => {
  return (
    
    <BrowserRouter>
      <div className="d-flex">
        <SlideBar />
        <div className="flex-grow-1">
          <Routes>
            <Route path="/home" element={<div>Home Page</div>} />
            <Route path="/inventory" element={<Inventory_Dashboard />} />
            <Route path="/sales" element={<div>Sales Page</div>} />
            <Route path="/hr" element={<div>HR Page</div>} />
            <Route path="/finance" element={<div>Finance Page</div>} />
            {/* <Route path="/logout" eleme nt={<div>Logout Page</div>} /> */}
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App