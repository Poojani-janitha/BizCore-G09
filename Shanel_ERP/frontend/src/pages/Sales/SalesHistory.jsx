import React, { useState, useEffect } from "react";
import axios from "axios";
import RecentSalesTable from "../../component/Sale/recentSalesTable/RecentSalesTable";
import { Search, Filter, Calendar, XCircle, Package } from "react-feather";

const SalesHistory = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        pages: 0,
        limit: 20
    });
    const [filters, setFilters] = useState({
        query: '',
        startDate: '',
        endDate: '',
        paymentStatus: '',
        productType: '', // Added productType filter
        page: 1
    });

    // Function to fetch filtered sales
    const fetchFilteredSales = async () => {
        try {
            setLoading(true);
            const { query, startDate, endDate, paymentStatus, productType, page } = filters;
            
            // Build query string
            let url = `/api/sales-management/search?page=${page}&limit=20`;
            if (query) url += `&query=${encodeURIComponent(query)}`;
            if (startDate) url += `&startDate=${startDate}`;
            if (endDate) url += `&endDate=${endDate}`;
            if (paymentStatus) url += `&paymentStatus=${paymentStatus}`;
            if (productType) url += `&productType=${productType}`;

            const response = await axios.get(url);
            if (response.data.success) {
                setSales(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error("Error searching sales:", error);
        } finally {
            setLoading(false);
        }
    };

    // Trigger search when filters change (with debouncing for text input)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchFilteredSales();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [filters]);

    const handleReset = () => {
        setFilters({
            query: '',
            startDate: '',
            endDate: '',
            paymentStatus: '',
            productType: '',
            page: 1
        });
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    return (
        <div className="container-fluid p-4 bg-light min-vh-100">
            {/* Page Header */}
            <div className="mb-4 d-flex justify-content-between align-items-center">
                <div>
                    <h4 className="fw-bold text-dark mb-1">Sales History</h4>
                    <p className="text-muted small">Browse and filter all past transactions with analytical insights</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
                <div className="row g-3 align-items-end">
                    {/* Search by Invoice */}
                    <div className="col-md-2">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{fontSize: '10px'}}>Search Invoice</label>
                        <div className="input-group input-group-sm shadow-sm rounded-3 overflow-hidden border">
                            <span className="input-group-text bg-white border-0"><Search size={14} className="text-muted" /></span>
                            <input 
                                type="text" 
                                className="form-control border-0 ps-0" 
                                placeholder="INV-2026..."
                                value={filters.query}
                                onChange={(e) => setFilters({...filters, query: e.target.value, page: 1})}
                            />
                        </div>
                    </div>

                    {/* Start Date */}
                    <div className="col-md-2">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{fontSize: '10px'}}>From Date</label>
                        <div className="input-group input-group-sm shadow-sm rounded-3 overflow-hidden border">
                            <span className="input-group-text bg-white border-0"><Calendar size={14} className="text-muted" /></span>
                            <input 
                                type="date" 
                                className="form-control border-0 ps-0"
                                value={filters.startDate}
                                onChange={(e) => setFilters({...filters, startDate: e.target.value, page: 1})}
                            />
                        </div>
                    </div>

                    {/* End Date */}
                    <div className="col-md-2">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{fontSize: '10px'}}>To Date</label>
                        <div className="input-group input-group-sm shadow-sm rounded-3 overflow-hidden border">
                            <span className="input-group-text bg-white border-0"><Calendar size={14} className="text-muted" /></span>
                            <input 
                                type="date" 
                                className="form-control border-0 ps-0"
                                value={filters.endDate}
                                onChange={(e) => setFilters({...filters, endDate: e.target.value, page: 1})}
                            />
                        </div>
                    </div>

                    {/* Payment Status */}
                    <div className="col-md-2">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{fontSize: '10px'}}>Payment Status</label>
                        <div className="input-group input-group-sm shadow-sm rounded-3 overflow-hidden border">
                            <span className="input-group-text bg-white border-0"><Filter size={14} className="text-muted" /></span>
                            <select 
                                className="form-select border-0 ps-0"
                                value={filters.paymentStatus}
                                onChange={(e) => setFilters({...filters, paymentStatus: e.target.value, page: 1})}
                            >
                                <option value="">All Statuses</option>
                                <option value="Paid">Paid</option>
                                <option value="Unpaid">Unpaid</option>
                                <option value="Partially_Paid">Partially Paid</option>
                            </select>
                        </div>
                    </div>

                    {/* Product Type Filter */}
                    <div className="col-md-2">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{fontSize: '10px'}}>Product Type</label>
                        <div className="input-group input-group-sm shadow-sm rounded-3 overflow-hidden border">
                            <span className="input-group-text bg-white border-0"><Package size={14} className="text-muted" /></span>
                            <select 
                                className="form-select border-0 ps-0"
                                value={filters.productType}
                                onChange={(e) => setFilters({...filters, productType: e.target.value, page: 1})}
                            >
                                <option value="">All Types</option>
                                <option value="Company">Company Items</option>
                                <option value="Other">Other Items</option>
                            </select>
                        </div>
                    </div>

                    {/* Reset Button */}
                    <div className="col-md-2 text-end">
                        <button 
                            className="btn btn-sm btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 border shadow-sm fw-bold rounded-3"
                            onClick={handleReset}
                            style={{height: '31px'}}
                        >
                            <XCircle size={14} /> Reset Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Table */}
            <RecentSalesTable 
                externalData={sales} 
                externalLoading={loading} 
                title={`${pagination.total} Transactions Found`}
                pagination={pagination}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default SalesHistory;
