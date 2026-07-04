import React from 'react'
import { Search, X } from 'react-feather';
import { useTranslation } from 'react-i18next';

const ProductFilters = ({ onSearchChange, onTypeChange, onActiveToggle, searchValue, onSearchReset }) => {
  const { t } = useTranslation();
  
  return (
    <div className='card border-0 shadow-sm p-3 mb-4'>
        <div className='row g-3 align-items-center'>
            {/* Search Bar */}
            <div className='col-md-7'>
                <div className='input-group bg-light rounded-2 border px-2 align-items-center'>
                    <Search size={18} className="text-muted flex-shrink-0"/>
                    <input 
                        type="text"
                        className='form-control border-0 bg-transparent shadow-none py-2'
                        placeholder={t('inventory.filters.search_placeholder', 'Search by product name or barcode...')}
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)} />
                    {searchValue && (
                        <button
                            type='button'
                            className='btn btn-link text-muted border-0 p-1 d-flex align-items-center'
                            onClick={onSearchReset}
                            title='Clear search'
                            style={{ lineHeight: 1 }}
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>
            </div>

            {/* Status Toggle */}
            <div className='col-md-5 text-end'>
                <div className='form-check form-switch d-inline-block'>
                    <input className='form-check-input' type="checkbox" id='activeOnly' onChange={(e) => onActiveToggle(e.target.checked)} style={{cursor: 'pointer'}}/>
                    <label className='form-check-label small fw-medium' htmlFor='activeOnly' style={{ cursor: 'pointer'}}>{t('inventory.filters.active_only', 'In Stock Only')}</label>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ProductFilters