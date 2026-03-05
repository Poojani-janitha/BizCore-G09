import React from 'react';
import { Plus, Download } from 'react-feather';

const ProductHeader = ({ onAddClick }) => {
  return (
    <div className='d-flex justify-content-between align-items-center mb-4'>
        <div>
            <h2 className='fw-bold text-dark mb-1'>Product Catalog</h2>
            <nav aria-label='breadcrumb'>
                <ol className='breadcrumb mb-0' style={{ fontSize: '13px' }}>
                    <li className='breadcrumb-item text-muted'>Inventory</li>
                    <li className='breadcrumb-item active fw-medium' aria-current="page text-dark">Products</li>
                </ol>
            </nav>
        </div>

        <div className='d-flex gap-2'>
            <button className='btn btn-outline-secondary d-flex align-items-center gap-2 px-3'>
                <Download size={16}/> Export
            </button>
            <button 
                className='btn btn-dark d-flex align-items-center gap-2 px-4 shadow-sm' 
                onClick={onAddClick}>
                <Plus size={18}/> Add New Product
            </button>
        </div>

    </div>
  )
}

export default ProductHeader