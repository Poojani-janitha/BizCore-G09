import React, { useState, useEffect } from "react";
import axios from "axios";
import RecentSalesTable from "../../component/Sale/recentSalesTable/RecentSalesTable";
import { AlertCircle, DollarSign, Calendar } from "react-feather";

const DueSales = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        pages: 0,
        limit: 20
    });
    const [filters, setFilters] = useState({
        page: 1
    });

    const fetchDueSales = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/sales-management/due?page=${filters.page}&limit=20`);
            if (response.data.success) {
                setSales(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error("Error fetching due sales:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDueSales();
    }, [filters.page]);

    const handlePageChange = (newPage) => {
        setFilters({ page: newPage });
    };

    // Calculate total due amount for summary
    const totalDue = sales.reduce((sum, sale) => sum + parseFloat(sale.Balance_Due || 0), 0);

    return (
        <div className="container-fluid p-4 bg-light min-vh-100">
            {/* Page Header */}
            <div className="mb-4 d-flex justify-content-between align-items-center">
                <div>
                    <h4 className="fw-bold text-dark mb-1">Pending Payments</h4>
                    <p className="text-muted small">Manage and track all outstanding customer balances</p>
                </div>
                
                <div className="d-flex gap-3">
                    <div className="bg-white p-3 rounded-4 shadow-sm border-start border-4 border-danger d-flex align-items-center gap-3">
                        <div className="bg-danger-subtle p-2 rounded-3 text-danger">
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <small className="text-muted fw-bold text-uppercase d-block" style={{fontSize: '10px'}}>Total Pending</small>
                            <span className="fw-bold text-dark h6 mb-0">Rs.{totalDue.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alert for high priority */}
            <div className="alert alert-warning border-0 shadow-sm rounded-4 d-flex align-items-center gap-3 mb-4 p-3 bg-white">
                <div className="bg-warning p-2 rounded-circle text-white shadow-sm">
                    <AlertCircle size={18} />
                </div>
                <div>
                    <span className="fw-bold text-dark d-block">Collection Summary</span>
                    <span className="text-muted small">You have <span className="text-danger fw-bold">{pagination.total}</span> invoices with pending balances. Oldest dues are shown first.</span>
                </div>
            </div>

            {/* Results Table */}
            <RecentSalesTable 
                externalData={sales} 
                externalLoading={loading} 
                title="Outstanding Invoices"
                pagination={pagination}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default DueSales;
