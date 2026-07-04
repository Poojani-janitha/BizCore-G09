import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Search, Filter, Plus, Eye, Edit2, Phone, Mail,
    User, CreditCard, CheckCircle, XCircle, AlertCircle,
    ChevronLeft, ChevronRight, RefreshCw, UserX, UserCheck
} from 'react-feather';

// ─── Customer Form Modal ───────────────────────────────────────────────────────
const CustomerFormModal = ({ show, onClose, customer, onSaved }) => {
    const isEdit = !!customer;
    const [form, setForm] = useState({
        customer_name: '', contact_person: '', customer_email: '',
        customer_phone1: '', customer_phone2: '', customer_address: '',
        customer_city: '', customer_type: 'Retail', price_level: 'Retail',
        credit_allowed: false, credit_limit: 0, payment_terms: '', notes: '',
        status: 'Active'
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (customer) {
            setForm({
                customer_name: customer.C_Name || '',
                contact_person: customer.Contact_Person || '',
                customer_email: customer.Email || '',
                customer_phone1: customer.Phone1 || '',
                customer_phone2: customer.Phone2 || '',
                customer_address: customer.Address || '',
                customer_city: customer.City || '',
                customer_type: customer.Customer_Type || 'Retail',
                price_level: customer.Price_Level || 'Retail',
                credit_allowed: customer.Credit_Allowed || false,
                credit_limit: customer.Credit_Limit || 0,
                payment_terms: customer.Payment_Terms || '',
                notes: customer.Notes || '',
                status: customer.Status || 'Active'
            });
        } else {
            setForm({
                customer_name: '', contact_person: '', customer_email: '',
                customer_phone1: '', customer_phone2: '', customer_address: '',
                customer_city: '', customer_type: 'Retail', price_level: 'Retail',
                credit_allowed: false, credit_limit: 0, payment_terms: '', notes: '',
                status: 'Active'
            });
        }
        setError('');
    }, [customer, show]);

    const handleChange = (field, value) => {
        setForm(prev => {
            const updated = { ...prev, [field]: value };
            // Enforce: if credit not allowed, lock credit limit to 0
            if (field === 'credit_allowed' && !value) updated.credit_limit = 0;
            return updated;
        });
    };

    const handleSubmit = async () => {
        if (!form.customer_name.trim()) { setError('Customer name is required'); return; }
        if (!form.customer_phone1.trim()) { setError('Phone number is required'); return; }
        setSaving(true); setError('');
        try {
            if (isEdit) {
                await axios.put(`/api/customer/${customer.C_ID}`, form);
            } else {
                await axios.post('/api/customer', form);
            }
            onSaved(isEdit ? 'Customer updated successfully!' : 'Customer added successfully!');
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save customer');
        } finally {
            setSaving(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 1055, fontSize: '13px' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
                    <div className="modal-header bg-white border-0 px-4 pt-4 pb-0">
                        <div>
                            <h6 className="modal-title fw-bold text-dark" style={{ fontSize: '14px' }}>
                                {isEdit ? 'Edit Customer' : 'Add New Customer'}
                            </h6>
                            <p className="text-muted small">Enter customer details below</p>
                        </div>
                        <button type="button" className="btn-close shadow-none" onClick={onClose}></button>
                    </div>
                    <div className="modal-body px-4 py-2" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                        {error && (
                            <div className="alert alert-danger border-0 rounded-3 py-2 px-3 small mb-3">{error}</div>
                        )}
                        <div className="row g-2">
                            <div className="col-md-6 mb-2">
                                <label className="form-label mb-1 small fw-semibold text-muted">Customer Name *</label>
                                <input className="form-control form-control-sm bg-light border-0 py-2 shadow-none" value={form.customer_name} onChange={e => handleChange('customer_name', e.target.value)} placeholder="Full name" />
                            </div>
                            <div className="col-md-6 mb-2">
                                <label className="form-label mb-1 small fw-semibold text-muted">Contact Person</label>
                                <input className="form-control form-control-sm bg-light border-0 py-2 shadow-none" value={form.contact_person} onChange={e => handleChange('contact_person', e.target.value)} placeholder="Contact person" />
                            </div>
                            <div className="col-md-6 mb-2">
                                <label className="form-label mb-1 small fw-semibold text-muted">Phone 1 *</label>
                                <input className="form-control form-control-sm bg-light border-0 py-2 shadow-none" value={form.customer_phone1} onChange={e => handleChange('customer_phone1', e.target.value)} placeholder="+94 xx xxx xxxx" />
                            </div>
                            <div className="col-md-6 mb-2">
                                <label className="form-label mb-1 small fw-semibold text-muted">Phone 2</label>
                                <input className="form-control form-control-sm bg-light border-0 py-2 shadow-none" value={form.customer_phone2} onChange={e => handleChange('customer_phone2', e.target.value)} placeholder="Optional" />
                            </div>
                            <div className="col-md-6 mb-2">
                                <label className="form-label mb-1 small fw-semibold text-muted">Email</label>
                                <input type="email" className="form-control form-control-sm bg-light border-0 py-2 shadow-none" value={form.customer_email} onChange={e => handleChange('customer_email', e.target.value)} placeholder="email@example.com" />
                            </div>
                            <div className="col-md-6 mb-2">
                                <label className="form-label mb-1 small fw-semibold text-muted">City</label>
                                <input className="form-control form-control-sm bg-light border-0 py-2 shadow-none" value={form.customer_city} onChange={e => handleChange('customer_city', e.target.value)} placeholder="City" />
                            </div>
                            <div className="col-12 mb-2">
                                <label className="form-label mb-1 small fw-semibold text-muted">Address</label>
                                <textarea className="form-control form-control-sm bg-light border-0 py-2 shadow-none" rows={2} value={form.customer_address} onChange={e => handleChange('customer_address', e.target.value)} placeholder="Full address" />
                            </div>
                            <div className="col-md-4 mb-2">
                                <label className="form-label mb-1 small fw-semibold text-muted">Customer Type</label>
                                <select className="form-select form-select-sm bg-light border-0 py-2 shadow-none" value={form.customer_type} onChange={e => handleChange('customer_type', e.target.value)}>
                                    <option value="Retail">Retail</option>
                                    <option value="Wholesale">Wholesale</option>
                                </select>
                            </div>
                            <div className="col-md-4 mb-2">
                                <label className="form-label mb-1 small fw-semibold text-muted">Price Level</label>
                                <select className="form-select form-select-sm bg-light border-0 py-2 shadow-none" value={form.price_level} onChange={e => handleChange('price_level', e.target.value)}>
                                    <option value="Retail">Retail</option>
                                    <option value="Wholesale">Wholesale</option>
                                </select>
                            </div>
                            <div className="col-md-4 mb-2">
                                <label className="form-label mb-1 small fw-semibold text-muted">Status</label>
                                <select className="form-select form-select-sm bg-light border-0 py-2 shadow-none" value={form.status} onChange={e => handleChange('status', e.target.value)}>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Blocked">Blocked</option>
                                </select>
                            </div>
                            <div className="col-md-4 mb-2">
                                <label className="form-label mb-1 small fw-semibold text-muted">Payment Terms</label>
                                <input className="form-control form-control-sm bg-light border-0 py-2 shadow-none" value={form.payment_terms} onChange={e => handleChange('payment_terms', e.target.value)} placeholder="e.g. Net 30" />
                            </div>
                            <div className="col-md-4 mb-2">
                                <label className="form-label mb-1 small fw-semibold text-muted">Credit Allowed</label>
                                <div className="form-check form-switch mt-2">
                                    <input className="form-check-input" type="checkbox" checked={form.credit_allowed} onChange={e => handleChange('credit_allowed', e.target.checked)} id="creditAllowed" />
                                    <label className="form-check-label small text-muted" htmlFor="creditAllowed">{form.credit_allowed ? 'Yes' : 'No'}</label>
                                </div>
                            </div>
                            <div className="col-md-4 mb-2">
                                <label className="form-label mb-1 small fw-semibold text-muted">Credit Limit (Rs.)</label>
                                <input type="number" className="form-control form-control-sm bg-light border-0 py-2 shadow-none" value={form.credit_limit} disabled={!form.credit_allowed} onChange={e => handleChange('credit_limit', parseFloat(e.target.value) || 0)} min={0} />
                            </div>
                            <div className="col-12 mb-2">
                                <label className="form-label mb-1 small fw-semibold text-muted">Notes</label>
                                <textarea className="form-control form-control-sm bg-light border-0 py-2 shadow-none" rows={2} value={form.notes} onChange={e => handleChange('notes', e.target.value)} placeholder="Internal notes..." />
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer border-0 p-4 pt-2">
                        <button className="btn btn-outline-secondary px-4 py-2 rounded-3 shadow-sm fw-bold me-auto" onClick={onClose}>Cancel</button>
                        <button className="btn btn-dark px-3 py-2 rounded-3 shadow-sm fw-bold" onClick={handleSubmit} disabled={saving}>
                            {saving ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                            {isEdit ? 'Save Changes' : 'Add Customer'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Status Badge ────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const config = {
        Active: { cls: 'bg-success-subtle text-success border-success-subtle', icon: <CheckCircle size={10} /> },
        Inactive: { cls: 'bg-secondary-subtle text-secondary border-secondary-subtle', icon: <XCircle size={10} /> },
        Blocked: { cls: 'bg-danger-subtle text-danger border-danger-subtle', icon: <AlertCircle size={10} /> }
    };
    const c = config[status] || config.Active;
    return (
        <span className={`badge border rounded-pill px-2 py-1 d-inline-flex align-items-center gap-1 ${c.cls}`} style={{ fontSize: '10px' }}>
            {c.icon} {status}
        </span>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const CustomerListPage = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 0, limit: 20 });
    const [filters, setFilters] = useState({ q: '', type: '', status: '', hasBalance: '', page: 1 });
    const [showModal, setShowModal] = useState(false);
    const [editCustomer, setEditCustomer] = useState(null);
    const [notification, setNotification] = useState(null);

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', filters.page);
            params.append('limit', 20);
            if (filters.q) params.append('q', filters.q);
            if (filters.type) params.append('type', filters.type);
            if (filters.status) params.append('status', filters.status);
            if (filters.hasBalance) params.append('hasBalance', filters.hasBalance);

            const res = await axios.get(`/api/customer/paginated?${params}`);
            if (res.data.success) {
                setCustomers(res.data.data);
                setPagination(res.data.pagination);
            }
        } catch (err) {
            console.error('Error fetching customers:', err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        const timer = setTimeout(fetchCustomers, 300);
        return () => clearTimeout(timer);
    }, [fetchCustomers]);

    const handleSaved = (message) => {
        setNotification({ type: 'success', message });
        fetchCustomers();
        setTimeout(() => setNotification(null), 4000);
    };

    const handleToggleStatus = async (customerId, newStatus) => {
        try {
            const res = await axios.put(`/api/customer/${customerId}`, { status: newStatus });
            if (res.data.success) {
                setNotification({ 
                    type: 'success', 
                    message: `Customer status updated to ${newStatus} successfully!` 
                });
                fetchCustomers();
                setTimeout(() => setNotification(null), 4000);
            }
        } catch (err) {
            console.error('Error toggling customer status:', err);
            setNotification({ 
                type: 'danger', 
                message: err.response?.data?.message || 'Failed to update customer status' 
            });
            setTimeout(() => setNotification(null), 4000);
        }
    };

    const handleFilter = (field, value) => setFilters(prev => ({ ...prev, [field]: value, page: 1 }));
    const handleReset = () => setFilters({ q: '', type: '', status: '', hasBalance: '', page: 1 });

    const totalOutstanding = customers.reduce((s, c) => s + (parseFloat(c.Current_Balance) || 0), 0);

    return (
        <div className="container-fluid p-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Outfit', 'Inter', sans-serif" }}>
            
            {/* Success notification banner */}
            {notification && (
                <div className="alert alert-success alert-dismissible fade show d-flex align-items-center gap-2 mb-4 border-0 rounded-4 shadow-sm" role="alert" style={{ borderLeft: '4px solid #10b981' }}>
                    <CheckCircle size={18} className="text-success" />
                    <div className="flex-grow-1 fw-bold">{notification.message}</div>
                    <button type="button" className="btn-close shadow-none" onClick={() => setNotification(null)}></button>
                </div>
            )}

            {/* Header / Actions - Styled like product/company items buttons */}
            <div className="d-flex justify-content-end align-items-center mb-4">
                <button
                    className="btn btn-primary btn-sm d-flex align-items-center gap-2 px-3 shadow-sm"
                    onClick={() => { setEditCustomer(null); setShowModal(true); }}
                    id="add-customer-btn"
                >
                    <Plus size={14} /> Add Customer
                </button>
            </div>

            {/* Summary Tiles (Styled exactly like SalesMetricCard in SalesStock page) */}
            <div className="row g-3 mb-4">
                {[
                    { label: 'Total Customers', value: pagination.total, color: 'primary', icon: <User size={20} className="text-primary" />, description: 'Registered customer profiles' },
                    { label: 'Outstanding Balance', value: `Rs.${totalOutstanding.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: 'danger', icon: <AlertCircle size={20} className="text-danger" />, description: 'Consolidated unpaid credit' },
                    { label: 'Active Accounts', value: customers.filter(c => c.Status === 'Active').length, color: 'success', icon: <CheckCircle size={20} className="text-success" />, description: 'Currently active profiles' },
                    { label: 'Credit Enabled', value: customers.filter(c => c.Credit_Allowed).length, color: 'warning', icon: <CreditCard size={20} className="text-warning" />, description: 'Allowed credit sales' },
                ].map((tile, i) => (
                    <div key={i} className="col-md-3">
                        <div className={`card border-0 border-top border-4 border-${tile.color} shadow-sm p-3 h-100 bg-white`}>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '11px' }}>{tile.label}</small>
                                {tile.icon}
                            </div>
                            <h6 className="fw-bold mb-0 text-dark">{tile.value}</h6>
                            <small className="text-muted" style={{ fontSize: '11px' }}>{tile.description}</small>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
                <div className="row g-3 align-items-end">
                    <div className="col-md-4">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>Search</label>
                        <div className="input-group input-group-sm border rounded-3 overflow-hidden shadow-sm">
                            <span className="input-group-text bg-white border-0"><Search size={14} className="text-muted" /></span>
                            <input type="text" className="form-control border-0 ps-0" placeholder="Name, phone, or code..." value={filters.q} onChange={e => handleFilter('q', e.target.value)} />
                        </div>
                    </div>
                    <div className="col-md-2">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>Type</label>
                        <div className="input-group input-group-sm border rounded-3 overflow-hidden shadow-sm">
                            <span className="input-group-text bg-white border-0"><Filter size={14} className="text-muted" /></span>
                            <select className="form-select border-0" value={filters.type} onChange={e => handleFilter('type', e.target.value)}>
                                <option value="">All Types</option>
                                <option value="Retail">Retail</option>
                                <option value="Wholesale">Wholesale</option>
                            </select>
                        </div>
                    </div>
                    <div className="col-md-2">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>Status</label>
                        <select className="form-select form-select-sm border rounded-3 shadow-sm" value={filters.status} onChange={e => handleFilter('status', e.target.value)}>
                            <option value="">All Statuses</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="col-md-2">
                        <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>Balance</label>
                        <select className="form-select form-select-sm border rounded-3 shadow-sm" value={filters.hasBalance} onChange={e => handleFilter('hasBalance', e.target.value)}>
                            <option value="">All</option>
                            <option value="true">Has Outstanding</option>
                        </select>
                    </div>
                    <div className="col-md-2">
                        <button className="btn btn-sm btn-outline-secondary w-100 rounded-3" onClick={handleReset}>Reset</button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                    <h6 className="fw-bold text-dark mb-0">{pagination.total} Customers</h6>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                {['Code', 'Name', 'Type', 'Phone', 'Outstanding Balance', 'Total Purchases', 'Last Purchase', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="py-3 text-uppercase small fw-bold text-muted" style={{ fontSize: '10px' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={9} className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary" /></td></tr>
                            ) : customers.length === 0 ? (
                                <tr><td colSpan={9} className="text-center py-5 text-muted small">No customers found</td></tr>
                            ) : customers.map(c => (
                                <tr key={c.C_ID}>
                                    <td><span className="badge bg-secondary-subtle text-secondary rounded-pill px-2" style={{ fontSize: '10px' }}>{c.Customer_Code}</span></td>
                                    <td>
                                        <div className="fw-bold text-dark">{c.C_Name}</div>
                                        {c.Email && <small className="text-muted d-flex align-items-center gap-1"><Mail size={10} />{c.Email}</small>}
                                    </td>
                                    <td>
                                        <span className={`badge rounded-pill px-2 py-1 ${c.Customer_Type === 'Wholesale' ? 'bg-primary-subtle text-primary' : 'bg-info-subtle text-info'}`} style={{ fontSize: '10px' }}>
                                            {c.Customer_Type}
                                        </span>
                                    </td>
                                    <td className="text-muted small"><Phone size={12} className="me-1" />{c.Phone1}</td>
                                    <td>
                                        <span className={`fw-bold ${parseFloat(c.Current_Balance) > 0 ? 'text-danger' : 'text-success'}`}>
                                            Rs.{parseFloat(c.Current_Balance || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        </span>
                                    </td>
                                    <td className="text-dark fw-medium">Rs.{parseFloat(c.Total_Purchases || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                    <td className="text-muted small">{c.Last_Purchase_Date ? new Date(c.Last_Purchase_Date).toLocaleDateString() : '—'}</td>
                                    <td><StatusBadge status={c.Status} /></td>
                                    <td>
                                        <div className="btn-group shadow-sm border rounded-3 overflow-hidden">
                                            <button className="btn btn-sm btn-white px-2 border-end" title="View Detail" onClick={() => navigate(`/sales/customers/${c.C_ID}`)}>
                                                <Eye size={14} className="text-primary" />
                                            </button>
                                            <button className="btn btn-sm btn-white px-2" title="Edit" onClick={() => { setEditCustomer(c); setShowModal(true); }}>
                                                <Edit2 size={14} className="text-secondary" />
                                            </button>
                                            {c.Status === 'Active' ? (
                                                <button className="btn btn-sm btn-white px-2 border-start" title="Set Inactive" onClick={() => handleToggleStatus(c.C_ID, 'Inactive')}>
                                                    <UserX size={14} className="text-danger" />
                                                </button>
                                            ) : (
                                                <button className="btn btn-sm btn-white px-2 border-start" title="Set Active" onClick={() => handleToggleStatus(c.C_ID, 'Active')}>
                                                    <UserCheck size={14} className="text-success" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="card-footer bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center border-top">
                        <span className="text-muted small">
                            Showing <strong>{((pagination.page - 1) * pagination.limit) + 1}</strong> – <strong>{Math.min(pagination.page * pagination.limit, pagination.total)}</strong> of <strong>{pagination.total}</strong>
                        </span>
                        <nav>
                            <ul className="pagination pagination-sm mb-0 gap-1">
                                <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link border-0 rounded-3 shadow-sm px-3" onClick={() => handleFilter('page', pagination.page - 1)}><ChevronLeft size={14} /></button>
                                </li>
                                {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
                                    const p = i + 1;
                                    return (
                                        <li key={p} className={`page-item ${pagination.page === p ? 'active' : ''}`}>
                                            <button className={`page-link border-0 rounded-3 shadow-sm px-3 ${pagination.page === p ? 'bg-primary text-white' : 'bg-light text-dark'}`} onClick={() => handleFilter('page', p)}>{p}</button>
                                        </li>
                                    );
                                })}
                                <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                                    <button className="page-link border-0 rounded-3 shadow-sm px-3" onClick={() => handleFilter('page', pagination.page + 1)}><ChevronRight size={14} /></button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <CustomerFormModal
                show={showModal}
                onClose={() => { setShowModal(false); setEditCustomer(null); }}
                customer={editCustomer}
                onSaved={handleSaved}
            />
        </div>
    );
};

export default CustomerListPage;
