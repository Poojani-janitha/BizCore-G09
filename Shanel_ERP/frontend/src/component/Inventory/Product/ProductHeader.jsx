import React from 'react';
import { Plus, Download } from 'react-feather';

const ProductHeader = ({ title, onAddClick }) => {
    return (
        <div className='d-flex justify-content-between align-items-center mb-3'>
            {title && <h6 className='fw-bold text-dark mb-0'>{title}</h6>}
            <div className='d-flex gap-2 ms-auto'>
                <button className='btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 px-3'>
                    <Download size={14}/> Export
                </button>
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