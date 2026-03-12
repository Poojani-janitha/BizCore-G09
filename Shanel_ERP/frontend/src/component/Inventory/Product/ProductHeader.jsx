import React from 'react';
import { Plus, Download } from 'react-feather';

const ProductHeader = ({ onAddClick }) => {
  return (
    <div className='d-flex justify-content-end align-items-center mb-3'>
        <div className='d-flex gap-2'>
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
  )
}

export default ProductHeader