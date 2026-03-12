import React, { useState, useRef, useEffect } from 'react';
import { Plus, Printer, ChevronDown } from 'react-feather';

const ProductHeader = ({ title, onAddClick, onPrintWithName, onPrintBarcodesOnly }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target))
                setShowDropdown(false);
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, []);

    return (
        <div className='d-flex justify-content-between align-items-center mb-3'>
            {title && <h6 className='fw-bold text-dark mb-0'>{title}</h6>}
            <div className='d-flex gap-2 ms-auto'>

                {/* Export / Print dropdown */}
                <div className='position-relative' ref={dropdownRef}>
                    <button
                        className='btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 px-3'
                        onClick={() => setShowDropdown(v => !v)}>
                        <Printer size={14}/> Export <ChevronDown size={12}/>
                    </button>
                    {showDropdown && (
                        <div
                            className='position-absolute end-0 mt-1 bg-white border rounded-2 shadow-sm'
                            style={{ zIndex: 200, minWidth: '230px' }}>
                            <button
                                className='dropdown-item py-2 px-3 small d-flex align-items-center gap-2'
                                onClick={() => { onPrintWithName(); setShowDropdown(false); }}>
                                <Printer size={13} className='text-muted'/> Print All Barcodes with Name
                            </button>
                            <button
                                className='dropdown-item py-2 px-3 small d-flex align-items-center gap-2'
                                onClick={() => { onPrintBarcodesOnly(); setShowDropdown(false); }}>
                                <Printer size={13} className='text-muted'/> Barcodes Only
                            </button>
                        </div>
                    )}
                </div>

                <button
                    className='btn btn-dark btn-sm d-flex align-items-center gap-2 px-3 shadow-sm'
                    onClick={onAddClick}>
                    <Plus size={14}/> Add New Product
                </button>
            </div>
        </div>
    );
};

export default ProductHeader