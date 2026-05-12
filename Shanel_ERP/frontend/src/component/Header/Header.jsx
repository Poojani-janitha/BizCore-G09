import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, Globe, Home, LogOut } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { getFullName, getUserType } from '../../utils/auth';

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const fullName = getFullName() || 'User';
    const userType = getUserType() || '';
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showDropdown]);

    const handleLogout = () => {
        setShowDropdown(false);
        navigate('/logout');
    };

    const handleGoHome = () => {
        navigate('/home');
        setShowDropdown(false);
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/home') return t('header.home', 'Home');
        if (path === '/inventory') return t('inventory.dashboard.title', 'Inventory Dashboard');
        if (path.includes('/inventory/company-items')) return t('inventory.company_items', 'Company Items');
        if (path.includes('/inventory/other-items')) return t('inventory.other_items', 'Other Items');
        if (path.includes('/inventory/products')) return t('inventory.product_mgmt', 'Products Management');
        if (path.includes('/inventory/raw-materials')) return t('inventory.raw_materials', 'Raw Materials');
        if (path.includes('/inventory/production-stock')) return t('inventory.production_stock', 'Production Stock');
        if (path.includes('/inventory/salesStock')) return t('inventory.sales_stock', 'Sales Stock');
        if (path.includes('/inventory/stock-transfers')) return t('inventory.stock_transfer', 'Stock Transfer');
        if (path.includes('/inventory/stock-adjustments')) return t('inventory.stock_adjustments', 'Stock Adjustments');
        if (path.includes('/inventory/returns')) return t('inventory.returns', 'Returns Management');
        if (path.includes('/inventory/alerts')) return t('inventory.alerts', 'Alerts & Notifications');
        if (path.includes('/inventory/reports')) return t('inventory.reports', 'Inventory Reports');
        if (path === '/POS') return t('header.pos', 'Point of Sale');
        if (path === '/hr') return t('header.hr', 'Human Resources');
        if (path.includes('/hr/employees')) return t('header.employees', 'Employees');
        if (path.includes('/hr/attendance')) return t('header.attendance', 'Attendance');
        if (path === '/finance') return t('header.finance', 'Finance & Accounting');
        if (path.includes('/finance/make-payment')) return t('header.expense_mgmt', 'Expense Management');
        if (path.includes('/finance/receive-payment')) return t('header.receive_payment', 'Receive Payment');
        if (path.includes('/finance/general-ledger')) return t('header.general_ledger', 'General Ledger');
        if (path.includes('/finance/payments')) return t('header.payments', 'Payments');
        if (path.includes('/finance/reports')) return t('header.finance_reports', 'Finance Reports');
        if (path === '/logout') return t('header.logout', 'Logout');
        return t('header.dashboard', 'Dashboard');
    };

    return (
        <header className="d-flex align-items-center px-4 py-2 bg-white border-bottom shadow-sm w-100" style={{ height: '70px' }}>

            {/* Left: Dynamic Page Name */}
            <div style={{ width: '250px' }}>
                <h4 className="mb-0 fw-bold" style={{ color: '#1e293b', fontSize: '1.25rem' }}>{getPageTitle()}</h4>
            </div>

            {/* Center: Search Bar */}
            <div className="flex-grow-1 d-flex justify-content-center">
                <div className="input-group bg-light rounded-3 px-2 border" style={{ maxWidth: '400px' }}>
                    <span className="input-group-text bg-transparent border-0 text-muted">
                        <Search size={18} />
                    </span>
                    <input
                        type="text"
                        className="form-control bg-transparent border-0 shadow-none py-2"
                        placeholder={t('header.search')}
                        style={{ fontSize: '14px' }}
                    />
                </div>
            </div>

            {/* Right: Language Toggle, Notifications & Profile */}
            <div className="d-flex align-items-center justify-content-end gap-3" style={{ width: '350px' }}>
                
                {/* Language Toggle */}
                <div className="d-flex bg-light rounded-pill p-1 border shadow-sm">
                    <button 
                        onClick={() => changeLanguage('en')}
                        className={`btn btn-sm rounded-pill px-3 py-1 border-0 fw-bold transition-all ${i18n.language.startsWith('en') ? 'bg-primary text-white shadow-sm' : 'text-muted'}`}
                        style={{ fontSize: '11px' }}
                    >
                        EN
                    </button>
                    <button 
                        onClick={() => changeLanguage('si')}
                        className={`btn btn-sm rounded-pill px-3 py-1 border-0 fw-bold transition-all ${i18n.language.startsWith('si') ? 'bg-primary text-white shadow-sm' : 'text-muted'}`}
                        style={{ fontSize: '11px' }}
                    >
                        සිං
                    </button>
                </div>

                <div className="position-relative p-2 rounded-circle cursor-pointer text-muted hover-bg-light">
                    <Bell size={20} />
                    <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle" style={{ marginTop: '8px', marginLeft: '-8px' }}></span>
                </div>

                <div className="border-start mx-1" style={{ height: '30px' }}></div>

                {/* User Profile with Dropdown */}
                <div className="position-relative" ref={dropdownRef}>
                    <div 
                        className="d-flex align-items-center gap-2"
                        onClick={() => setShowDropdown(!showDropdown)}
                        style={{ 
                            cursor: 'pointer',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            transition: 'all 0.2s ease',
                            backgroundColor: showDropdown ? '#f1f5f9' : 'transparent'
                        }}
                        onMouseEnter={e => {
                            if (!showDropdown) e.currentTarget.style.backgroundColor = '#f8fafc';
                        }}
                        onMouseLeave={e => {
                            if (!showDropdown) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        <div className="text-end d-none d-sm-block">
                            <div className="fw-bold small text-dark" style={{ lineHeight: '1.2', fontSize: '14px' }}>{fullName}</div>
                        </div>
                        <div className="rounded-circle bg-info overflow-hidden shadow-sm" style={{ width: '36px', height: '36px', border: '2px solid #004445' }}>
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=004445&color=fff`}
                                alt="user"
                                className="w-100 h-100"
                            />
                        </div>
                        <ChevronDown size={16} className="text-muted" style={{ transition: 'all 0.2s ease', transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)', color: showDropdown ? '#004445' : '#94a3b8' }} />
                    </div>

                    {/* Dropdown Menu */}
                    {showDropdown && (
                        <div 
                            className="position-absolute end-0 mt-2 bg-white rounded-4"
                            style={{ 
                                minWidth: '200px', 
                                zIndex: 1000, 
                                top: '100%',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                                animation: 'slideDown 0.2s ease-out'
                            }}
                        >
                            <button 
                                onClick={handleGoHome}
                                className="w-100 text-start border-0 bg-white d-flex align-items-center gap-3"
                                style={{ 
                                    padding: '12px 16px',
                                    fontSize: '14px', 
                                    cursor: 'pointer',
                                    color: '#334155',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease',
                                    borderTopLeftRadius: '1rem',
                                    borderTopRightRadius: '1rem'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                                    e.currentTarget.style.color = '#004445';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.backgroundColor = 'white';
                                    e.currentTarget.style.color = '#334155';
                                }}
                            >
                                <Home size={18} color="currentColor" />
                                <span>Home</span>
                            </button>
                            
                            <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }}></div>
                            
                            <button 
                                onClick={handleLogout}
                                className="w-100 text-start border-0 bg-white d-flex align-items-center gap-3"
                                style={{ 
                                    padding: '12px 16px',
                                    fontSize: '14px', 
                                    cursor: 'pointer',
                                    color: '#dc2626',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease',
                                    borderBottomLeftRadius: '1rem',
                                    borderBottomRightRadius: '1rem'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.backgroundColor = '#fee2e2';
                                    e.currentTarget.style.color = '#991b1b';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.backgroundColor = 'white';
                                    e.currentTarget.style.color = '#dc2626';
                                }}
                            >
                                <LogOut size={18} color="currentColor" />
                                <span>Logout</span>
                            </button>

                            <style>{`
                                @keyframes slideDown {
                                    from {
                                        opacity: 0;
                                        transform: translateY(-8px);
                                    }
                                    to {
                                        opacity: 1;
                                        transform: translateY(0);
                                    }
                                }
                            `}</style>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;