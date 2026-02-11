import React from 'react';
import { useNavigate, NavLink, useNavigation } from 'react-router-dom';//use navigate pages usinsg javascript instead buttons or links

import { Home, ShoppingCart, Package, DollarSign, Users, PlusCircle, LogOut } from 'react-feather';
import 'bootstrap/dist/css/bootstrap.min.css'



const SlideBar = () => {
    const navigate = useNavigate();

    //create array of objects to store menu items and their corresponding icons and paths
    const menuItems = [
        { name: 'Home', icon: <Home size={18} />, path: '/home' },
        { name: 'Inventory', icon: <Package size={18} />, path: '/inventory' },
        { name: 'Sales', icon: <ShoppingCart size={18} />, path: '/sales' },
        { name: 'HR', icon: <Users size={18} />, path: '/hr' },
        { name: 'Finance', icon: <DollarSign size={18} />, path: '/finance' },
       
    ];

    return (
        <div className="d-flex">
            {/* SlideBar */}
            <div className="d-flex flex-column flex-shrink-0 p-3 vh-100 border-end" style={{ backgroundColor: '#f5f3f0' }}>
                {/* brand Header */}
                <div className='d-flex align-items-center mb-4 ps-2'>
                    <div className='rounded-1 me-2' style={{ height: '30px', width: '30px', background: 'linear-gradient(to bottom, #f59e0b, #ea580c)' }}></div>
                    <span className='fs-4 fw-bold'>Shanel Products</span>
                </div>
                {/* Navigation Menu  */}
                <ul className="nav flex-column mb-auto">
                    {menuItems.map((item) => (
                        <li key={item.name} className='nav-item mb-3'>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => `nav-link d-flex align-items-center gap-3 border-0 py-2 px-2 ${isActive ? 'fw-semibold' : ''}`}
                                style={{ color: '#7c5d47' }}>
                                    { item.icon }
                                    {item.name}

                            </NavLink>
                  
                        </li>
                    ))}
            </ul>


        </div>
        </div >
    )
}

export default SlideBar
