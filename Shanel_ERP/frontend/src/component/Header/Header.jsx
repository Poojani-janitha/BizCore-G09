import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, ChevronDown } from 'react-feather';

const Header = () => {
    const location = useLocation();

    // Function to generate page title from URL path
    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/home') return 'Home';
        if (path === '/inventory') return 'Inventory Dashboard';
        if (path.includes('/inventory/products')) return 'Products Management';
        if (path.includes('/inventory/raw-materials')) return 'Raw Materials';
        if (path.includes('/inventory/finished-goods')) return 'Finished Goods';
        if (path === '/sales') return 'Sales';
        if (path === '/hr') return 'Human Resources';
        if (path === '/finance') return 'Finance';
        return 'Dashboard';
    };

    return (
        <header className="d-flex align-items-center justify-content-between px-4 py-2 bg-white border-bottom shadow-sm w-100" style={{ height: '70px' }}>
            
            {/* Left: Dynamic Page Name */}
            <div className="d-flex align-items-center">
                <h4 className="mb-0 fw-bold" style={{ color: '#1e293b' }}>{getPageTitle()}</h4>
            </div>

            {/* Center: Search Bar */}
            <div className="flex-grow-1 mx-5" style={{ maxWidth: '400px' }}>
                <div className="input-group bg-light rounded-3 px-2 border">
                    <span className="input-group-text bg-transparent border-0 text-muted">
                        <Search size={18} />
                    </span>
                    <input 
                        type="text" 
                        className="form-control bg-transparent border-0 shadow-none py-2" 
                        placeholder="Search anything..." 
                        style={{ fontSize: '14px' }}
                    />
                </div>
            </div>

            {/* Right: Notifications & User Profile (Moved from Sidebar) */}
            <div className="d-flex align-items-center gap-3">
                
                {/* Notification Icon */}
                <div className="position-relative p-2 rounded-circle hover-light cursor-pointer text-muted">
                    <Bell size={20} />
                    <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle" style={{ marginTop: '8px', marginLeft: '-8px' }}></span>
                </div>

                {/* Vertical Divider */}
                <div className="border-start h-100 mx-2" style={{ height: '30px' }}></div>

                {/* User Profile Info */}
                <div className="d-flex align-items-center gap-3 ps-2 cursor-pointer">
                    <div className="text-end d-none d-sm-block">
                        <div className="fw-bold small text-dark" style={{ lineHeight: '1.2' }}>Shanel Admin</div>
                        <div className="text-muted small" style={{ fontSize: '11px' }}>Manager</div>
                    </div>
                    <div className="rounded-circle bg-info overflow-hidden shadow-sm" style={{ width: '40px', height: '40px' }}>
                        <img 
                            src="https://ui-avatars.com/api/?name=Shanel+Admin&background=0ea5e9&color=fff" 
                            alt="user" 
                            className="w-100 h-100"
                        />
                    </div>
                    <ChevronDown size={14} className="text-muted" />
                </div>
            </div>
        </header>
    );
};

export default Header;