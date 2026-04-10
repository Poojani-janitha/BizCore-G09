import React from 'react'
import { Search, Filter } from 'react-feather';

const ProductFilters = ({ onSearchChange, onTypeChange , onActiveToggle={setActiveOnly}}) => {
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

            

            {/* Status Toggle */}
            <div className='col-md-5 text-end'>
                <div className='form-check form-switch d-inline-block'>
                    <input className='form-check-input' type="checkbox" id='activeOnly'  onChange={(e) => onActiveToggle(e.target.checked)} style={{cursor: 'pointer'}}/>
                    <label className='form-check-label small fw-medium' htmlFor='activeOnly' style={{ cursor: 'pointer'}}>In Stock Only</label>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ProductFilters