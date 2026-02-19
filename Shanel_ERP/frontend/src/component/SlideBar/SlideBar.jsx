import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, ShoppingCart, Package, DollarSign, Users, 
  ChevronRight, ChevronDown, Box, Layers, Truck, 
  RefreshCcw, Bell, Archive, Menu, LogOut 
} from 'react-feather';
import 'bootstrap/dist/css/bootstrap.min.css';

const SlideBar = () => {
    const [inventoryOpen, setInventoryOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false); // Sidebar collapse state

    // Colors based on your requested palette
    const colors = {
        sidebarBg: '#1e293b', // Deep Dark Slate
        activeBlue: '#0ea5e9', // Vibrant Cyan
        textMuted: '#94a3b8', // Slate Grey
        hoverBg: '#334155'    // Slightly lighter slate
    };

    return (
        <div className="d-flex flex-column vh-100 shadow-lg transition-all duration-300" 
             style={{ 
                 backgroundColor: colors.sidebarBg, 
                 width: isCollapsed ? '80px' : '260px',
                 transition: 'width 0.3s ease'
             }}>
            
            {/* Header: Brand & Toggle */}
            <div className='d-flex align-items-center justify-content-between p-3 mb-4 border-bottom border-secondary'>
                {!isCollapsed && (
                    <div className='d-flex align-items-center animate-fade-in'>
                        <div className='rounded-circle me-2' style={{ 
                            height: '32px', width: '32px', 
                            background: 'linear-gradient(135deg, #0ea5e9, #2563eb)' 
                        }}></div>
                        <span className='fs-5 fw-bold text-white'>Shanel</span>
                    </div>
                )}
                <Menu 
                    className="text-white cursor-pointer" 
                    size={20} 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    style={{ cursor: 'pointer' }}
                />
            </div>

            {/* Navigation Menu */}
            <ul className="nav flex-column mb-auto px-2">
                
                {/* Home */}
                <li className='nav-item mb-2'>
                    <NavLink to="/home" className={({ isActive }) => 
                        `nav-link d-flex align-items-center gap-3 py-2 rounded-3 transition-all ${isActive ? 'text-white bg-primary' : 'text-slate-400'}`}
                        style={({ isActive }) => ({
                            color: isActive ? '#fff' : colors.textMuted,
                            backgroundColor: isActive ? colors.hoverBg : 'transparent'
                        })}>
                        <Home size={20} />
                        {!isCollapsed && <span>Home</span>}
                    </NavLink>
                </li>

                {/* Inventory with Sub-menu */}
                <li className='nav-item mb-2'>
                    <div className="d-flex align-items-center justify-content-between rounded-3 px-1 transition-all"
                        style={{ backgroundColor: inventoryOpen && !isCollapsed ? colors.hoverBg : 'transparent' }}>
                        
                        {/* NavLink to navigate to /inventory */}
                        <NavLink 
                            to="/inventory" 
                            className={({ isActive }) => 
                                `nav-link d-flex align-items-center gap-3 py-2 flex-grow-1 border-0 ${isActive ? 'text-white fw-bold' : 'text-slate-400'}`}
                            style={{ color: 'inherit' }}
                        >
                            <Package size={20} />
                            {!isCollapsed && <span>Inventory</span>}
                        </NavLink>

                        {/* Separate toggle button for the chevron */}
                        {!isCollapsed && (
                            <div 
                                className="p-2 cursor-pointer transition-all" 
                                onClick={(e) => {
                                    e.preventDefault(); // Stop navigation when just clicking the arrow
                                    setInventoryOpen(!inventoryOpen);
                                }}
                                style={{ 
                                    cursor: 'pointer', 
                                    color: inventoryOpen ? '#fff' : '#94a3b8', // White when open, Slate when closed
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                {inventoryOpen ? (
                                    <ChevronDown size={16} strokeWidth={3} /> // Increased weight for better visibility
                                ) : (
                                    <ChevronRight size={16} strokeWidth={3} />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sub-menu items */}
                    {inventoryOpen && !isCollapsed && (
                        <ul className="nav flex-column ms-4 mt-1 border-start border-secondary gap-1">
                            {[
                                { to: "/inventory/products", icon: <Box size={14}/>, label: "Products" },
                                { to: "/inventory/raw-materials", icon: <Archive size={14}/>, label: "Raw Materials" },
                                { to: "/inventory/finished-goods", icon: <Truck size={14}/>, label: "Finished Goods" },
                                { to: "/inventory/stock-transfer", icon: <RefreshCcw size={14}/>, label: "Stock Transfer" },
                                { to: "/inventory/alerts", icon: <Bell size={14}/>, label: "Alerts" }
                            ].map((item) => (
                                <li key={item.label}>
                                    <NavLink to={item.to} className="nav-link py-1 small d-flex align-items-center gap-2"
                                            style={({ isActive }) => ({ 
                                                color: isActive ? colors.activeBlue : '#94a3b8',
                                                transition: 'color 0.2s' 
                                            })}>
                                        {item.icon} {item.label}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    )}
                </li>

                {/* Main Modules Loop */}
                {[
                    { to: "/sales", icon: <ShoppingCart size={20} />, label: "Sales" },
                    { to: "/hr", icon: <Users size={20} />, label: "HR" },
                    { to: "/finance", icon: <DollarSign size={20} />, label: "Finance" }
                ].map((item) => (
                    <li className='nav-item mb-2' key={item.label}>
                        <NavLink to={item.to} className="nav-link d-flex align-items-center gap-3 py-2 text-slate-400"
                                 style={({ isActive }) => ({ color: isActive ? '#fff' : colors.textMuted })}>
                            {item.icon}
                            {!isCollapsed && <span>{item.label}</span>}
                        </NavLink>
                    </li>
                ))}
            </ul>

            {/* Bottom Profile Section */}
            <div className="mt-auto p-3 border-top border-secondary">
                <div className={`d-flex align-items-center ${isCollapsed ? 'justify-content-center' : 'gap-3'}`}>
                    <div className="rounded-circle bg-info overflow-hidden" style={{ width: '38px', height: '38px' }}>
                         <img src="https://ui-avatars.com/api/?name=Shanel+User&background=0ea5e9&color=fff" alt="user" />
                    </div>
                    {!isCollapsed && (
                        <div className="d-flex flex-column overflow-hidden animate-fade-in">
                            <span className="text-white small fw-bold">Shanel Admin</span>
                            <span className="text-muted" style={{ fontSize: '10px' }}>Manager</span>
                        </div>
                    )}
                </div>
                {!isCollapsed && (
                    <button className="btn btn-link text-danger p-0 mt-3 d-flex align-items-center gap-2 text-decoration-none small">
                        <LogOut size={16} /> Logout
                    </button>
                )}
            </div>
        </div>
    );
};

export default SlideBar;
