import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, ShoppingCart, Package, DollarSign, Users, 
  ChevronRight, ChevronDown, Box, Archive, Menu, LogOut, Truck 
} from 'react-feather';
import 'bootstrap/dist/css/bootstrap.min.css';

const SlideBar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [headerHover, setHeaderHover] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Automatically keep inventory open if we are on an inventory sub-page
    const [inventoryOpen, setInventoryOpen] = useState(location.pathname.startsWith('/inventory'));

    // Update sub-menu state when location changes (fixes the "stuck" color)
    useEffect(() => {
        if (location.pathname.startsWith('/inventory')) {
            setInventoryOpen(true);
        } else {
            setInventoryOpen(false);
        }
    }, [location]);

    const colors = {
        sidebarBg: '#004445', 
        itemHover: '#2c7873', 
        activeAccent: '#41b883', 
        textPrimary: '#ffffff',
        textMuted: '#94a3b8', 
        borderLine: 'rgba(255, 255, 255, 0.1)' 
    };

    return (
        <div className="d-flex flex-column shadow-lg transition-all" 
             style={{ 
                 backgroundColor: colors.sidebarBg, 
                 width: isCollapsed ? '70px' : '240px',
                 transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                 zIndex: 1000,
                 minHeight: '100vh',
                 position: 'sticky',
                 top: 0,
                 overflowX: 'hidden',
                 fontSize: '14px' 
             }}>
            
            {/* Header Section */}
            <div 
                className={`d-flex align-items-center mb-4 border-bottom ${isCollapsed ? 'justify-content-center' : 'justify-content-between px-3'}`} 
                style={{ height: '65px', cursor: 'pointer', position: 'relative', borderColor: colors.borderLine }}
                onMouseEnter={() => setHeaderHover(true)}
                onMouseLeave={() => setHeaderHover(false)}
            >
                <div className="d-flex align-items-center" style={{ 
                    opacity: (isCollapsed && headerHover) ? 0 : 1, 
                    transition: 'opacity 0.2s ease',
                    visibility: (isCollapsed && headerHover) ? 'hidden' : 'visible'
                }}>
                    <div style={{ height: '26px', width: '26px', minWidth: '26px', border: `2px solid ${colors.activeAccent}`, borderRadius: '4px' }}></div>
                    {!isCollapsed && <span className='fw-bold text-white ms-3 text-nowrap' style={{ letterSpacing: '1px' }}>SHANEL</span>}
                </div>
                
                <div onClick={() => setIsCollapsed(!isCollapsed)} 
                    style={{ position: isCollapsed ? 'absolute' : 'relative', opacity: isCollapsed ? (headerHover ? 1 : 0) : 1, visibility: isCollapsed ? (headerHover ? 'visible' : 'hidden') : 'visible', color: colors.textPrimary }}>
                    <Menu size={18} />
                </div>
            </div>

            <ul className="nav flex-column mb-auto px-2">
                {/* Home - used 'end' to prevent it from being active on all pages */}
                <li className='nav-item mb-1'>
                    <NavLink to="/home" end className={({ isActive }) => 
                        `nav-link d-flex align-items-center py-2 rounded-2 ${isCollapsed ? 'justify-content-center' : 'gap-3 px-3'}`}
                        style={({ isActive }) => ({ 
                            backgroundColor: isActive ? colors.itemHover : 'transparent',
                            color: isActive ? colors.textPrimary : colors.textMuted
                        })}>
                        <Home size={18} />
                        {!isCollapsed && <span>Home</span>}
                    </NavLink>
                </li>

                {/* Inventory Parent */}
                <li className='nav-item mb-1'>
                    <NavLink to="/inventory" className={({ isActive }) => 
                        `nav-link d-flex align-items-center py-2 rounded-2 ${isCollapsed ? 'justify-content-center' : 'justify-content-between px-3'}`}
                        style={({ isActive }) => ({ 
                            backgroundColor: isActive ? colors.itemHover : 'transparent',
                            color: (isActive || (inventoryOpen && !isCollapsed)) ? colors.textPrimary : colors.textMuted
                        })}
                        onClick={(e) => {
                            if (isCollapsed) setIsCollapsed(false);
                            // Sub-menu toggle logic handled by useEffect, but we navigate here
                        }}
                    >
                        <div className="d-flex align-items-center gap-3">
                            <Package size={18} />
                            {!isCollapsed && <span>Inventory</span>}
                        </div>
                        {!isCollapsed && (
                            <div onClick={(e) => { e.preventDefault(); setInventoryOpen(!inventoryOpen); }}>
                                {inventoryOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </div>
                        )}
                    </NavLink>

                    {inventoryOpen && !isCollapsed && (
                        <ul className="nav flex-column ms-4 mt-1 border-start gap-1" style={{ borderColor: colors.borderLine }}>
                            <NavLink to="/inventory/products" className="nav-link py-1 d-flex align-items-center gap-2"
                                style={({ isActive }) => ({ color: isActive ? colors.activeAccent : colors.textMuted, fontSize: '13px' })}>
                                <Box size={14}/> Products
                            </NavLink>
                            <NavLink to="/inventory/raw-materials" className="nav-link py-1 d-flex align-items-center gap-2"
                                style={({ isActive }) => ({ color: isActive ? colors.activeAccent : colors.textMuted, fontSize: '13px' })}>
                                <Archive size={14}/> Raw Materials
                            </NavLink>
                        </ul>
                    )}
                </li>

                {/* Other Modules */}
                {[
                    { to: "/sales", icon: <ShoppingCart size={18} />, label: "Sales" },
                    { to: "/hr", icon: <Users size={18} />, label: "HR" },
                    { to: "/finance", icon: <DollarSign size={18} />, label: "Finance" }
                ].map((item) => (
                    <li className='nav-item mb-1' key={item.label}>
                        <NavLink to={item.to} className={`nav-link d-flex align-items-center py-2 rounded-2 ${isCollapsed ? 'justify-content-center' : 'gap-3 px-3'}`}
                                 style={({ isActive }) => ({ 
                                     color: isActive ? colors.textPrimary : colors.textMuted,
                                     backgroundColor: isActive ? colors.itemHover : 'transparent'
                                 })}>
                            {item.icon}
                            {!isCollapsed && <span>{item.label}</span>}
                        </NavLink>
                    </li>
                ))}
            </ul>

            <div className="mt-auto p-3 border-top" style={{ borderColor: colors.borderLine }}>
                <NavLink to="/logout" className={`nav-link d-flex align-items-center transition-all ${isCollapsed ? 'justify-content-center' : 'gap-3 px-3'}`}
                         style={{ color: '#ff7e67' }}> 
                    <LogOut size={18} />
                    {!isCollapsed && <span className="fw-medium">Logout</span>}
                </NavLink>
            </div>
        </div>
    );
};

export default SlideBar;