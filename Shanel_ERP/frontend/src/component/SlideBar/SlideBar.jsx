import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, ShoppingCart, Package, DollarSign, Users, 
  ChevronRight, ChevronDown, Box, RefreshCcw, Bell, Archive, Menu, LogOut, Truck 
} from 'react-feather';
import 'bootstrap/dist/css/bootstrap.min.css';

const SlideBar = () => {
    const [inventoryOpen, setInventoryOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [headerHover, setHeaderHover] = useState(false);
    const navigate = useNavigate();

    // Professional Slate Palette
    const colors = {
        sidebarBg: '#004445',   // Your requested Dark Slate/Blue-Green
        itemHover: '#2c3e50',   // Slightly darker for hover states
        activeAccent: '#41b883', // A soft emerald accent (Vue-style) that pairs perfectly with your color
        textPrimary: '#ffffff',
        textMuted: '#94a3b8',   // Muted slate for inactive text
        borderLine: 'rgba(255, 255, 255, 0.1)' 
    };

    const handleInventoryClick = () => {
        if (isCollapsed) {
            setIsCollapsed(false); 
            setInventoryOpen(true); 
        } else {
            setInventoryOpen(!inventoryOpen);
        }
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
            
            {/* Header Section: Logo to Menu Swap on Hover */}
            <div 
                className={`d-flex align-items-center mb-4 border-bottom ${isCollapsed ? 'justify-content-center' : 'justify-content-between px-3'}`} 
                style={{ height: '65px', cursor: 'pointer', position: 'relative', borderColor: colors.borderLine }}
                onMouseEnter={() => setHeaderHover(true)}
                onMouseLeave={() => setHeaderHover(false)}
            >
                {/* Logo & Brand Area */}
                <div className="d-flex align-items-center" style={{ 
                    opacity: (isCollapsed && headerHover) ? 0 : 1, 
                    transition: 'opacity 0.2s ease',
                    visibility: (isCollapsed && headerHover) ? 'hidden' : 'visible'
                }}>
                    <div style={{ 
                        height: '26px', width: '26px', minWidth: '26px',
                        border: `2px solid ${colors.activeAccent}`, 
                        borderRadius: '4px',
                        backgroundColor: 'transparent'
                    }}></div>
                    {!isCollapsed && (
                        <span className='fw-bold text-white ms-3 text-nowrap' style={{ letterSpacing: '1px', fontSize: '15px' }}>
                            SHANEL
                        </span>
                    )}
                </div>
                
                {/* Menu Icon (Swaps in when hovered in collapsed mode) */}
                <div 
                    onClick={() => setIsCollapsed(!isCollapsed)} 
                    style={{ 
                        position: isCollapsed ? 'absolute' : 'relative',
                        opacity: isCollapsed ? (headerHover ? 1 : 0) : 1,
                        visibility: isCollapsed ? (headerHover ? 'visible' : 'hidden') : 'visible',
                        transition: 'opacity 0.2s ease',
                        color: colors.textPrimary
                    }}
                >
                    <Menu size={18} />
                </div>
            </div>

            {/* Navigation Menu */}
            <ul className="nav flex-column mb-auto px-2">
                
                {/* Home */}
                <li className='nav-item mb-1'>
                    <NavLink to="/home" className={({ isActive }) => 
                        `nav-link d-flex align-items-center py-2 rounded-2 ${isCollapsed ? 'justify-content-center' : 'gap-3 px-3'}`}
                        style={({ isActive }) => ({ 
                            backgroundColor: isActive ? colors.itemHover : 'transparent',
                            color: isActive ? colors.textPrimary : colors.textMuted,
                            transition: 'all 0.2s'
                        })}>
                        <Home size={18} />
                        {!isCollapsed && <span>Home</span>}
                    </NavLink>
                </li>

                {/* Inventory with Expansion Logic */}
                <li className='nav-item mb-1'>
                    <div className={`d-flex align-items-center rounded-2 ${isCollapsed ? 'justify-content-center' : 'justify-content-between px-3'}`}
                         style={{ 
                             backgroundColor: (inventoryOpen && !isCollapsed) ? colors.itemHover : 'transparent',
                             cursor: 'pointer',
                             color: (inventoryOpen && !isCollapsed) ? colors.textPrimary : colors.textMuted,
                             transition: 'all 0.2s'
                         }}
                         onClick={handleInventoryClick}>
                        
                        <div className={`d-flex align-items-center py-2 ${isCollapsed ? '' : 'gap-3'}`}>
                            <Package size={18} />
                            {!isCollapsed && <span>Inventory</span>}
                        </div>

                        {!isCollapsed && (
                            <div style={{ opacity: 0.5 }}>
                                {inventoryOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </div>
                        )}
                    </div>

                    {/* Sub-menu */}
                    {inventoryOpen && !isCollapsed && (
                        <ul className="nav flex-column ms-4 mt-1 border-start gap-1" style={{ borderColor: colors.borderLine }}>
                            {[
                                { to: "/inventory/products", icon: <Box size={14}/>, label: "Products" },
                                { to: "/inventory/raw-materials", icon: <Archive size={14}/>, label: "Raw Materials" },
                                { to: "/inventory/finished-goods", icon: <Truck size={14}/>, label: "Finished Goods" },
                            ].map((item) => (
                                <li key={item.label}>
                                    <NavLink to={item.to} className="nav-link py-1 d-flex align-items-center gap-2"
                                             style={({ isActive }) => ({ 
                                                 color: isActive ? colors.activeAccent : colors.textMuted,
                                                 fontSize: '13px' 
                                             })}>
                                        {item.icon} {item.label}
                                    </NavLink>
                                </li>
                            ))}
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

            {/* Logout */}
            <div className="mt-auto p-3 border-top" style={{ borderColor: colors.borderLine }}>
                <NavLink to="/logout" className={`nav-link d-flex align-items-center transition-all ${isCollapsed ? 'justify-content-center' : 'gap-3 px-3'}`}
                         style={{ color: '#e74c3c' }}> {/* Professional Red */}
                    <LogOut size={18} />
                    {!isCollapsed && <span className="fw-medium">Logout</span>}
                </NavLink>
            </div>
        </div>
    );
};

export default SlideBar;
