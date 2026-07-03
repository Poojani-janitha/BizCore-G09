/**
 * FilterBar Component
 * 
 * Reusable filter interface for sales pages
 * Supports: search, date range, payment status, location, and custom filters
 */

import React from 'react';
import { Search, Filter, Calendar, RotateCcw } from 'react-feather';
import './FilterBar.css';

const FilterBar = ({
    filters,
    onFilterChange,
    onReset,
    showSearch = true,
    showDateRange = true,
    showPaymentStatus = true,
    showLocation = true,
    customFilters = []
}) => {
    return (
        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
            <div className="row g-3 align-items-end">
                {/* Search Input */}
                {showSearch && (
                    <div className="col-md-3">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{fontSize: '10px'}}>
                            Search Invoice
                        </label>
                        <div className="input-group input-group-sm shadow-sm rounded-3 overflow-hidden border">
                            <span className="input-group-text bg-white border-0">
                                <Search size={14} className="text-muted" />
                            </span>
                            <input 
                                type="text" 
                                className="form-control border-0 ps-0" 
                                placeholder="INV-2026..."
                                value={filters.query || ''}
                                onChange={(e) => onFilterChange({ ...filters, query: e.target.value, page: 1 })}
                            />
                        </div>
                    </div>
                )}

                {/* Start Date */}
                {showDateRange && (
                    <div className="col-md-2">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{fontSize: '10px'}}>
                            Start Date
                        </label>
                        <div className="input-group input-group-sm shadow-sm rounded-3 overflow-hidden border">
                            <span className="input-group-text bg-white border-0">
                                <Calendar size={14} className="text-muted" />
                            </span>
                            <input 
                                type="date" 
                                className="form-control border-0 ps-0" 
                                value={filters.startDate || ''}
                                onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value, page: 1 })}
                            />
                        </div>
                    </div>
                )}

                {/* End Date */}
                {showDateRange && (
                    <div className="col-md-2">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{fontSize: '10px'}}>
                            End Date
                        </label>
                        <div className="input-group input-group-sm shadow-sm rounded-3 overflow-hidden border">
                            <span className="input-group-text bg-white border-0">
                                <Calendar size={14} className="text-muted" />
                            </span>
                            <input 
                                type="date" 
                                className="form-control border-0 ps-0" 
                                value={filters.endDate || ''}
                                onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value, page: 1 })}
                            />
                        </div>
                    </div>
                )}

                {/* Payment Status */}
                {showPaymentStatus && (
                    <div className="col-md-2">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{fontSize: '10px'}}>
                            Payment Status
                        </label>
                        <select 
                            className="form-select form-select-sm shadow-sm rounded-3 border"
                            value={filters.paymentStatus || ''}
                            onChange={(e) => onFilterChange({ ...filters, paymentStatus: e.target.value, page: 1 })}
                        >
                            <option value="">All Status</option>
                            <option value="Paid">Paid</option>
                            <option value="Unpaid">Unpaid</option>
                            <option value="Partially_Paid">Partially Paid</option>
                        </select>
                    </div>
                )}

                {/* Location */}
                {showLocation && (
                    <div className="col-md-2">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{fontSize: '10px'}}>
                            Location
                        </label>
                        <select 
                            className="form-select form-select-sm shadow-sm rounded-3 border"
                            value={filters.location || ''}
                            onChange={(e) => onFilterChange({ ...filters, location: e.target.value, page: 1 })}
                        >
                            <option value="">All Locations</option>
                            <option value="Shop">Shop</option>
                            <option value="Production">Production</option>
                            <option value="Main_Warehouse">Main Warehouse</option>
                        </select>
                    </div>
                )}

                {/* Custom Filters */}
                {customFilters.map((filter, idx) => (
                    <div className="col-md-2" key={idx}>
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{fontSize: '10px'}}>
                            {filter.label}
                        </label>
                        {filter.type === 'select' ? (
                            <select 
                                className="form-select form-select-sm shadow-sm rounded-3 border"
                                value={filters[filter.key] || ''}
                                onChange={(e) => onFilterChange({ ...filters, [filter.key]: e.target.value, page: 1 })}
                            >
                                <option value="">All</option>
                                {filter.options.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        ) : (
                            <input 
                                type={filter.type || 'text'}
                                className="form-control form-control-sm shadow-sm rounded-3 border"
                                value={filters[filter.key] || ''}
                                onChange={(e) => onFilterChange({ ...filters, [filter.key]: e.target.value, page: 1 })}
                            />
                        )}
                    </div>
                ))}

                {/* Reset Button */}
                <div className="col-md-auto ms-auto">
                    <button 
                        className="btn btn-light border shadow-sm rounded-3 text-danger fw-bold px-3 d-flex align-items-center gap-2"
                        onClick={onReset}
                    >
                        <RotateCcw size={14} /> Reset
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterBar;
