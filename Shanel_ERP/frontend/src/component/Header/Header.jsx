import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, ChevronDown } from 'react-feather';

const Header = () => {
    const location = useLocation();

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/home') return 'Home';
        if (path === '/inventory') return 'Inventory Dashboard';
        if (path.includes('/inventory/company-items')) return 'Company Items';
        if (path.includes('/inventory/other-items')) return 'Other Items';
        if (path.includes('/inventory/raw-materials')) return 'Raw Materials';
        if (path.includes('/inventory/production-stock')) return 'Production Stock';
        if (path === '/POS') return 'Point of Sale';
        if (path === '/hr') return 'Human Resources';
        if (path.includes('/hr/employees')) return 'Employees';
        if (path.includes('/hr/attendance')) return 'Attendance';
        if (path === '/finance') return 'Finance';
        if (path === '/logout') return 'Logout';
        return 'Dashboard';
    };

    return (
        <header className="d-flex align-items-center px-4 py-2 bg-white border-bottom shadow-sm w-100" style={{ height: '70px' }}>
            
            {/* Left: Dynamic Page Name - Fixed Width so center stays center */}
            <div style={{ width: '250px' }}>
                <h4 className="mb-0 fw-bold" style={{ color: '#1e293b', fontSize: '1.25rem' }}>{getPageTitle()}</h4>
            </div>

            {/* Center: Search Bar - Locked in Position */}
            <div className="flex-grow-1 d-flex justify-content-center">
                <div className="input-group bg-light rounded-3 px-2 border" style={{ maxWidth: '400px' }}>
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

            {/* Right: Notifications & Profile - Fixed Width */}
            <div className="d-flex align-items-center justify-content-end gap-3" style={{ width: '250px' }}>
                <div className="position-relative p-2 rounded-circle cursor-pointer text-muted">
                    <Bell size={20} />
                    <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle" style={{ marginTop: '8px', marginLeft: '-8px' }}></span>
                </div>

                <div className="border-start mx-2" style={{ height: '30px' }}></div>

                <div className="d-flex align-items-center gap-2 cursor-pointer">
                    <div className="text-end d-none d-sm-block">
                        <div className="fw-bold small text-dark" style={{ lineHeight: '1.2' }}>Shanel Admin</div>
                        <div className="text-muted small" style={{ fontSize: '11px' }}>Manager</div>
                    </div>
                    <div className="rounded-circle bg-info overflow-hidden shadow-sm" style={{ width: '38px', height: '38px' }}>
                        <img 
                            src="https://ui-avatars.com/api/?name=Shanel+Admin&background=004445&color=fff" 
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