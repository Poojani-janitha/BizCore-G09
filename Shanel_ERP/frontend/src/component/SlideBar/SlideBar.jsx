import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, ShoppingCart, Package, DollarSign, Users, 
  ChevronRight, ChevronDown, Box, Archive, Menu, 
  LogOut, Truck, Settings, FileText, RefreshCw, 
  Sliders, CornerUpLeft, BarChart2, Bell 
} from 'react-feather';
import 'bootstrap/dist/css/bootstrap.min.css';

const SlideBar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [headerHover, setHeaderHover] = useState(false);
    const [openMenus, setOpenMenus] = useState({});
    const location = useLocation();

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
                { label: 'Sales Stock', to: '/inventory/salesStock', icon: <Home size={14} /> },
                { label: 'Purchase Orders', to: '/inventory/purchase-orders', icon: <FileText size={14} /> },
                { label: 'Production', to: '/inventory/production', icon: <Settings size={14} /> },
                { label: 'Stock Transfer', to: '/inventory/refresh-cw', icon: <RefreshCw size={14} /> },
                { label: 'Stock Adjustments', to: '/inventory/stock-adjustments', icon: <Sliders size={14} /> },
                { label: 'Returns', to: '/inventory/return', icon: <CornerUpLeft size={14} /> },
                { label: 'Reports', to: '/inventory/reports', icon: <BarChart2 size={14} /> },
                { label: 'Alerts', to: '/inventory/alerts', icon: <Bell size={14} /> },
            ]
        },
        { label: 'POS', icon: <ShoppingCart size={18} />, to: '/POS' },
        { 
            label: 'HR', 
            icon: <Users size={18} />, 
            to: '/hr',
            subItems: [
                { label: 'Employees', to: '/hr/employees', icon: <Users size={14} /> },
                { label: 'Attendance', to: '/hr/attendance', icon: <FileText size={14} /> },
                { label: 'Payroll', to: '/hr/payroll', icon: <DollarSign size={14} /> },
            ]
        },
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
        setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
    };

    return (
        <div className="d-flex flex-column shadow-lg" 
             style={{ 
                 backgroundColor: colors.sidebarBg, 
                 width: isCollapsed ? '70px' : '240px',
                 transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                 zIndex: 1000,
                 height: '100vh',
                 position: 'sticky',
                 top: 0,
                 overflow: 'hidden',
                 fontSize: '14px' 
             }}>
            
            {/* Header */}
            <div className={`d-flex align-items-center border-bottom ${isCollapsed ? 'justify-content-center' : 'justify-content-between px-3'}`} 
                style={{ height: '65px', minHeight: '65px', cursor: 'pointer', borderColor: colors.borderLine }}
                onMouseEnter={() => setHeaderHover(true)}
                onMouseLeave={() => setHeaderHover(false)}>
                
                <div style={{ opacity: (isCollapsed && headerHover) ? 0 : 1, transition: 'opacity 0.2s ease' }}>
                    <div className="d-flex align-items-center">
                        <div style={{ height: '26px', width: '26px', border: `2px solid ${colors.activeAccent}`, borderRadius: '4px' }}></div>
                        {!isCollapsed && <span className='fw-bold text-white ms-3' style={{ letterSpacing: '1px' }}>SHANEL</span>}
                    </div>
                </div>
                <div onClick={() => setIsCollapsed(!isCollapsed)} style={{ color: colors.textPrimary }}>
                    <Menu size={18} />
                </div>
            </div>

            {/* Scrollable Menu Area */}
            <div className="flex-grow-1 sidebar-scroll-area" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
                <ul className="nav flex-column py-3 px-2">
                    {menuConfig.map((item) => (
                        <li key={item.label} className='nav-item mb-1'>
                            {item.subItems ? (
                                <>
                                    <NavLink to={item.to}
                                        className={({ isActive }) => `nav-link d-flex align-items-center py-2 rounded-2 ${isCollapsed ? 'justify-content-center' : 'justify-content-between px-3'}`}
                                        style={({ isActive }) => ({ 
                                            backgroundColor: (isActive || openMenus[item.label]) ? colors.itemHover : 'transparent',
                                            color: (isActive || openMenus[item.label]) ? colors.textPrimary : colors.textMuted
                                        })}
                                        onClick={() => toggleSubMenu(item.label)}
                                    >
                                        <div className="d-flex align-items-center gap-3">
                                            {item.icon}
                                            {!isCollapsed && <span>{item.label}</span>}
                                        </div>
                                        {!isCollapsed && (
                                            openMenus[item.label] ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                                        )}
                                    </NavLink>
                                    
                                    {openMenus[item.label] && !isCollapsed && (
                                        <ul className="nav flex-column ms-4 mt-1 border-start gap-1" style={{ borderColor: colors.borderLine }}>
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
            </div>

            {/* Logout Footer */}
            <div className="p-3 border-top" style={{ borderColor: colors.borderLine, minHeight: '65px', backgroundColor: colors.sidebarBg }}>
                <NavLink to="/logout" className={`nav-link d-flex align-items-center ${isCollapsed ? 'justify-content-center' : 'gap-3 px-3'}`} style={{ color: '#ff7e67' }}> 
                    <LogOut size={18} />
                    {!isCollapsed && <span className="fw-medium">Logout</span>}
                </NavLink>
            </div>

            <style>
                {`
                    .sidebar-scroll-area::-webkit-scrollbar { width: 4px; }
                    .sidebar-scroll-area::-webkit-scrollbar-track { background: transparent; }
                    .sidebar-scroll-area::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
                    .sidebar-scroll-area::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
                `}
            </style>
        </div>
    );
};

export default SlideBar;