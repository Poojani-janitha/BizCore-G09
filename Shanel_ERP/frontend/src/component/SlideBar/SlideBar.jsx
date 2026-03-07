import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, ShoppingCart, Package, DollarSign, Users, 
  ChevronRight, ChevronDown, Box, Archive, Menu, 
  LogOut, Truck, Settings, FileText, RefreshCw, 
  Sliders, CornerUpLeft, BarChart2, Bell, PieChart 
} from 'react-feather';
import 'bootstrap/dist/css/bootstrap.min.css';


const SlideBar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [headerHover, setHeaderHover] = useState(false);
    const [openMenus, setOpenMenus] = useState({}); // Dynamic toggle state
    const location = useLocation();

    // --- ERP MENU CONFIGURATION ---
    // Add or remove sub-items here, and the UI will update automatically.
    const menuConfig = [
        { label: 'Home', icon: <Home size={18} />, to: '/home' },
        { 
            label: 'Inventory', 
            icon: <Package size={18} />, 
            to: '/inventory',
            subItems: [
                { label: 'Company Items', to: '/inventory/company-items', icon: <Box size={14} /> },
                { label: 'Other Items', to: '/inventory/other-items', icon: <Box size={14} /> },
                { label: 'Raw Materials', to: '/inventory/raw-materials', icon: <Archive size={14} /> },
                { label: 'Production Stock', to: '/inventory/production-stock', icon: <Truck size={14} /> },
                { label: 'Sales Stock', to: '/inventory/sales-stock', icon: <Home size={14} /> },
                { label: 'Suppliers', to: '/inventory/suppliers', icon: <Users size={14} /> },
                { label: 'Purchase Orders', to: '/inventory/purchase-orders', icon: <FileText size={14} /> },
                { label: 'Production', to: '/inventory/production', icon: <Settings size={14} /> },
                { label: 'Stock Transfer', to: '/inventory/refresh-cw', icon: <RefreshCw size={14} /> },
                { label: 'Stock Adjustments', to: '/inventory/stock-adjustments', icon: <Sliders size={14} /> },
                { label: 'Returns', to: '/inventory/return', icon: <CornerUpLeft size={14} /> },
                { label: 'Reports', to: '/inventory/reports', icon: <BarChart2 size={14} /> },
                { label: 'Alerts', to: '/inventory/alerts', icon: <Bell size={14} /> },
            ]
        },
        { 
            label: 'POS', 
            icon: <ShoppingCart size={18} />, 
            to: '/POS',
            // subItems: [
            //     { label: 'Orders', to: '/sales/orders', icon: <PieChart size={14} /> },
            //     { label: 'Customers', to: '/sales/customers', icon: <Users size={14} /> },
            // ]
        },
        { label: 'HR', icon: <Users size={18} />, to: '/hr' },
        { label: 'Finance', icon: <DollarSign size={18} />, to: '/finance' },
    ];

    const colors = {
        sidebarBg: '#004445', 
        itemHover: '#2c7873', 
        activeAccent: '#41b883', 
        textPrimary: '#ffffff',
        textMuted: '#94a3b8', 
        borderLine: 'rgba(255, 255, 255, 0.1)' 
    };

    // Sync menu expansion with the current URL path
    useEffect(() => {
        const currentPath = location.pathname;
        const newOpenMenus = {};
        menuConfig.forEach(item => {
            if (item.subItems && currentPath.startsWith(item.to)) {
                newOpenMenus[item.label] = true;
            }
        });
        setOpenMenus(newOpenMenus);
    }, [location.pathname]);

    const toggleSubMenu = (label) => {
        if (isCollapsed) setIsCollapsed(false);
        setOpenMenus(prev => ({
            ...prev,
            [label]: !prev[label]
        }));
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
            <div className={`d-flex align-items-center mb-4 border-bottom ${isCollapsed ? 'justify-content-center' : 'justify-content-between px-3'}`} 
                style={{ height: '65px', cursor: 'pointer', position: 'relative', borderColor: colors.borderLine }}
                onMouseEnter={() => setHeaderHover(true)}
                onMouseLeave={() => setHeaderHover(false)}>
                
                <div style={{ opacity: (isCollapsed && headerHover) ? 0 : 1, transition: 'opacity 0.2s ease' }}>
                    <div className="d-flex align-items-center">
                        <div style={{ height: '26px', width: '26px', border: `2px solid ${colors.activeAccent}`, borderRadius: '4px' }}></div>
                        {!isCollapsed && <span className='fw-bold text-white ms-3' style={{ letterSpacing: '1px' }}>SHANEL</span>}
                    </div>
                </div>
                <div onClick={() => setIsCollapsed(!isCollapsed)} style={{ position: isCollapsed ? 'absolute' : 'relative', opacity: isCollapsed ? (headerHover ? 1 : 0) : 1, color: colors.textPrimary }}>
                    <Menu size={18} />
                </div>
            </div>

            {/* Navigation Menu - Generated from Config */}
            <ul className="nav flex-column mb-auto px-2">
                {menuConfig.map((item) => (
                    <li key={item.label} className='nav-item mb-1'>
                        {/* If the item has sub-items, render a toggle. Otherwise, a simple NavLink */}
                        {item.subItems ? (
                            <>
                                <NavLink to={item.to} 
                                    className={({ isActive }) => `nav-link d-flex align-items-center py-2 rounded-2 ${isCollapsed ? 'justify-content-center' : 'justify-content-between px-3'}`}
                                    style={({ isActive }) => ({ 
                                        backgroundColor: (isActive || openMenus[item.label]) ? colors.itemHover : 'transparent',
                                        color: (isActive || openMenus[item.label]) ? colors.textPrimary : colors.textMuted
                                    })}
                                    onClick={(e) => {
                                        // Prevents navigation if just toggling the arrow, or allow navigation and toggle
                                        toggleSubMenu(item.label);
                                    }}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        {item.icon}
                                        {!isCollapsed && <span>{item.label}</span>}
                                    </div>
                                    {!isCollapsed && (
                                        openMenus[item.label] ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                                    )}
                                </NavLink>
                                
                                {/* Sub-menu Render */}
                                {openMenus[item.label] && !isCollapsed && (
                                    <ul className="nav flex-column ms-4 mt-1 border-start gap-1 animate-slide-down" style={{ borderColor: colors.borderLine }}>
                                        {item.subItems.map(sub => (
                                            <NavLink key={sub.label} to={sub.to} className="nav-link py-1 d-flex align-items-center gap-2"
                                                style={({ isActive }) => ({ color: isActive ? colors.activeAccent : colors.textMuted, fontSize: '13px' })}>
                                                {sub.icon} {sub.label}
                                            </NavLink>
                                        ))}
                                    </ul>
                                )}
                            </>
                        ) : (
                            <NavLink to={item.to} end={item.to === '/home'} 
                                className={({ isActive }) => `nav-link d-flex align-items-center py-2 rounded-2 ${isCollapsed ? 'justify-content-center' : 'gap-3 px-3'}`}
                                style={({ isActive }) => ({ 
                                    backgroundColor: isActive ? colors.itemHover : 'transparent',
                                    color: isActive ? colors.textPrimary : colors.textMuted
                                })}>
                                {item.icon}
                                {!isCollapsed && <span>{item.label}</span>}
                            </NavLink>
                        )}
                    </li>
                ))}
            </ul>

            {/* Logout */}
            <div className="mt-auto p-3 border-top" style={{ borderColor: colors.borderLine }}>
                <NavLink to="/logout" className={`nav-link d-flex align-items-center ${isCollapsed ? 'justify-content-center' : 'gap-3 px-3'}`} style={{ color: '#ff7e67' }}> 
                    <LogOut size={18} />
                    {!isCollapsed && <span className="fw-medium">Logout</span>}
                </NavLink>
            </div>
        </div>
    );
};

export default SlideBar;