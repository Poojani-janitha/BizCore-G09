import React from 'react'
import { Search, Filter } from 'react-feather';

const ProductFilters = ({ onSearchChange, onTypeChange }) => {
  return (
    <div className='card border-0 shadow-sm p-3 mb-4'>
        <div className='row g-3 align-items-center'>
            {/* Search Bar */}
            <div className='col-md-7'>
                <div className='input-group bg-light rounded-2 border px-2 align-items-center'>
                    <Search size={18} className="text-muted"/>
                    <input 
                        type="text"
                        className='form-control border-0 bg-transparent shadow-none py-2'
                        placeholder='Search by product name, SKU or barcode...'
                        onChange={(e) => onSearchChange(e.target.value)} />
                </div>
            </div>

            {/* Filter Dropdown */}
            <div className='col-md-3'>
                <div className='d-flex align-items-center gap-2'>
                    <Filter size={16} className="text-muted" />
                    <select 
                        className='form-select border-1 shadow-none bg-white'
                        onChange={ (e) => onTypeChange(e.target.value)}>
                        <option value="">All Products</option>
                        <option value="Finished">Finished Goods</option>
                        <option value="Raw">Raw Materials</option>
                        <option value="Packaging">Packaging</option>
                    </select>
                </div>
            </div>

            {/* Status Toggle */}
            <div className='col-md-2 text-end'>
                <div className='form-check form-switch d-inline-block'>
                    <input className='form-check-input' type="checkbox" id='activeOnly' defaultChecked />
                    <label className='form-check-label small fw-medium' htmlFor='activeOnly'>Active Only</label>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ProductFilters