import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Play, Trash2, Loader, Edit2, Search } from 'react-feather';
import ProductionModal from '../../component/Inventory/Production/ProductionModal';
import EditProductionModal from '../../component/Inventory/Production/EditProductionModal';
import { API_ENDPOINTS } from '../../config/apiEndpoints';
import { useTranslation } from 'react-i18next';
import Pagination from '../../component/common/Pagination';

const API_BASE = 'http://localhost:5000/api/production/stock-overview';

const formatStock = (value) => {
    const num = parseFloat(value) || 0;
    return Number.isInteger(num) ? num : num.toFixed(2);
};

const defaultPagination = {
    currentPage: 1,
    totalPages: 1,
    pageSize: 25,
    totalRecords: 0
};

const ProductionStock = () => {
    const [workingItems, setWorkingItems] = useState([]);
    const [approvedItems, setApprovedItems] = useState([]);
    const [wipPagination, setWipPagination] = useState(defaultPagination);
    const [approvedPagination, setApprovedPagination] = useState(defaultPagination);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);

    const [search, setSearch] = useState('');
    const [productFilter, setProductFilter] = useState('');
    const [expiryFilter, setExpiryFilter] = useState('all');
    const [wipPage, setWipPage] = useState(1);
    const [approvedPage, setApprovedPage] = useState(1);
    const [wipLimit, setWipLimit] = useState(25);
    const [approvedLimit, setApprovedLimit] = useState(25);

    const { t, i18n } = useTranslation();
    const isSinhala = i18n.language?.startsWith('si');

    const formatDaysToExpiry = (days) => {
        if (days === null) return 'N/A';
        if (days < 0) return 'EXPIRED';

        const years = Math.floor(days / 365);
        const remainingDaysAfterYears = days % 365;
        const months = Math.floor(remainingDaysAfterYears / 30);
        const remainingDays = remainingDaysAfterYears % 30;

        const result = [];
        if (years > 0) result.push(`${years} year${years > 1 ? 's' : ''}`);
        if (months > 0) result.push(`${months} month${months > 1 ? 's' : ''}`);
        if (remainingDays > 0) result.push(`${remainingDays} day${remainingDays > 1 ? 's' : ''}`);

        return result.length > 0 ? result.join(' ') : '0 days';
    };

    const fetchSection = useCallback(async (section, page, limit, filters, setItems, setPagination) => {
        const params = {
            section,
            page,
            limit,
            search: filters.search,
            productId: filters.productFilter || undefined,
            expiryFilter: section === 'approved' ? filters.expiryFilter : undefined
        };

        const res = await axios.get(API_BASE, { params });
        if (res.data.success) {
            setItems(res.data.data || []);
            setPagination(res.data.pagination || defaultPagination);
        }
    }, []);

    const fetchData = useCallback(async (isInitial = false) => {
        if (isInitial) setLoading(true);
        else setTableLoading(true);

        const filters = { search, productFilter, expiryFilter };

        try {
            await Promise.all([
                fetchSection('wip', wipPage, wipLimit, filters, setWorkingItems, setWipPagination),
                fetchSection('approved', approvedPage, approvedLimit, filters, setApprovedItems, setApprovedPagination)
            ]);

            const productRes = await axios.get(API_ENDPOINTS.inventory.products);
            if (Array.isArray(productRes.data)) {
                setProducts(productRes.data.filter((p) => p.type === 'Company').map((p) => ({ id: p.id, name: p.name })));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setTableLoading(false);
        }
    }, [search, productFilter, expiryFilter, wipPage, approvedPage, wipLimit, approvedLimit, fetchSection]);

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            fetchData(true);
            return;
        }
        fetchData(false);
    }, [search, productFilter, expiryFilter, wipPage, approvedPage, wipLimit, approvedLimit, fetchData]);

    const handleSearchChange = (value) => {
        setSearch(value);
        setWipPage(1);
        setApprovedPage(1);
    };

    const handleProductFilterChange = (value) => {
        setProductFilter(value);
        setWipPage(1);
        setApprovedPage(1);
    };

    const handleExpiryFilterChange = (value) => {
        setExpiryFilter(value);
        setApprovedPage(1);
    };

    const handleStatusUpdate = async (id, status) => {
        await axios.put(API_ENDPOINTS.production.update(id), { status });
        fetchData();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this batch?')) {
            await axios.delete(API_ENDPOINTS.production.byId(id));
            fetchData();
        }
    };

    const handleEdit = (batch) => {
        setSelectedBatch(batch);
        setShowEditModal(true);
    };

    if (loading) {
        return (
            <div className='vh-100 d-flex justify-content-center align-items-center'>
                <Loader className="spinner-border text-primary" />
            </div>
        );
    }

    return (
        <div className='p-4 bg-light min-vh-100' style={{ fontSize: '13px' }}>
            <ProductionModal show={showModal} onHide={() => setShowModal(false)} refreshData={() => fetchData(false)} />
            <EditProductionModal
                show={showEditModal}
                onHide={() => { setShowEditModal(false); setSelectedBatch(null); }}
                refreshData={() => fetchData(false)}
                batch={selectedBatch}
                products={products}
            />

            <div className='card border-0 shadow-sm mb-3'>
                <div className='card-body py-2 px-3'>
                    <div className='d-flex flex-wrap align-items-center gap-2'>
                        <span className='large fw-semibold text-primary text-nowrap pe-1'>
                            {t('inventory.pages.production_stock.filter_title')}
                        </span>
                        <div className='flex-grow-1' style={{ minWidth: '160px', maxWidth: '280px' }}>
                            <div className='input-group input-group-sm bg-light rounded border'>
                                <span className='input-group-text bg-transparent border-0 py-1'>
                                    <Search size={14} className="text-muted" />
                                </span>
                                <input
                                    type="text"
                                    className='form-control border-0 bg-transparent shadow-none py-1'
                                    placeholder={t('inventory.pages.production_stock.search_placeholder')}
                                    value={search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                />
                            </div>
                        </div>
                        <select
                            className='form-select form-select-sm'
                            style={{ width: 'auto', minWidth: '130px', maxWidth: '180px' }}
                            value={productFilter}
                            onChange={(e) => handleProductFilterChange(e.target.value)}
                        >
                            <option value="">{t('inventory.pages.production_stock.filter_product')}</option>
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <select
                            className='form-select form-select-sm'
                            style={{ width: 'auto', minWidth: '140px', maxWidth: '180px' }}
                            value={expiryFilter}
                            onChange={(e) => handleExpiryFilterChange(e.target.value)}
                            title={t('inventory.pages.production_stock.expiry_filter_hint')}
                        >
                            <option value="all">{t('inventory.pages.production_stock.filter_expiry')}</option>
                            <option value="expired">{t('inventory.pages.production_stock.expiry_expired')}</option>
                            <option value="within_7">{t('inventory.pages.production_stock.expiry_within_7')}</option>
                            <option value="within_30">{t('inventory.pages.production_stock.expiry_within_30')}</option>
                            <option value="within_60">{t('inventory.pages.production_stock.expiry_within_60')}</option>
                        </select>

                        <button
                            type="button"
                            className="btn btn-primary btn-sm d-flex align-items-center gap-2 px-3 shadow-sm ms-md-auto flex-shrink-0"
                            onClick={() => setShowModal(true)} >
                            
                             <Play size={14}/> {t('inventory.pages.production_stock.btn_new_batch')}

                        </button>
                    </div>
                </div>
            </div>

            <h6 className='fw-bold text-dark mb-2 mt-4'>{t('inventory.pages.production_stock.pending_batches')}</h6>

            <div className='card border-0 shadow-sm rounded-3 overflow-hidden position-relative'>
                {tableLoading && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75" style={{ zIndex: 2 }}>
                        <Loader className="spinner-border text-primary" />
                    </div>
                )}
                <div className='table-responsive'>
                    <table className='table align-middle mb-0'>
                        <thead>
                            <tr style={{ background: 'linear-gradient(135deg, #004445 0%, #2c7873 100%)', textAlign:"center" }}>
                                <th className='text-uppercase py-3 ps-4' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>{t('inventory.pages.production_stock.col_batch_id')}</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>{t('inventory.pages.production_stock.col_product')}</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>{t('inventory.pages.production_stock.col_qty')}</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>{t('inventory.pages.production_stock.col_production_date')}</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>{t('inventory.pages.production_stock.col_expiry_date')}</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>{t('inventory.pages.production_stock.col_completion')}</th>
                                <th className='text-uppercase py-3 text-end pe-4' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>{t('inventory.pages.production_stock.col_actions')}</th>
                            </tr>
                        </thead>
                        <tbody style={{textAlign:"center"}}>
                            {workingItems.map((item) => (
                                <tr key={item.PR_ID}>
                                    <td className='text-primary fw-medium ps-4'>{item.Batch_No}</td>
                                    <td className='fw-bold'>{(isSinhala && item.P_Name_Sinhala) ? item.P_Name_Sinhala : item.P_Name}</td>
                                    <td>{formatStock(item.Total_Qty_Produced)} {item.Base_Unit}</td>
                                    <td>{item.Production_Date ? new Date(item.Production_Date).toLocaleDateString() : 'N/A'}</td>
                                    <td>{item.Exp_Date ? new Date(item.Exp_Date).toLocaleDateString() : 'N/A'}</td>
                                    <td style={{ minWidth: '150px' }}>
                                        {(() => {
                                            const completion = Number(item.Completion || 0);
                                            return (
                                                <div className="d-flex align-items-center">
                                                    <div className="progress flex-grow-1 me-2" style={{ height: '8px', borderRadius: '10px' }}>
                                                        <div className={`progress-bar ${completion >= 90 ? 'bg-success' : 'bg-warning'}`}
                                                             style={{ width: `${completion}%` }}></div>
                                                    </div>
                                                    <span className="fw-bold">{completion}%</span>
                                                </div>
                                            );
                                        })()}
                                    </td>
                                    <td className="text-end pe-4">
                                        <button className="btn btn-success btn-sm me-2" title="Approve & Sync Stock" onClick={() => handleStatusUpdate(item.PR_ID, 'Approved')}>{t('inventory.pages.production_stock.btn_approve')}</button>
                                        <button className="btn btn-link text-primary p-0 me-3" title="Edit batch" onClick={() => handleEdit(item)}><Edit2 size={16}/></button>
                                        <button className="btn btn-link text-danger p-0" title="Delete" onClick={() => handleDelete(item.PR_ID)}><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                            {workingItems.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center text-muted py-4">{t('inventory.pages.production_stock.no_wip')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-3 py-2">
                    <Pagination
                        currentPage={wipPagination.currentPage}
                        totalItems={wipPagination.totalRecords}
                        pageSize={wipLimit}
                        onPageChange={setWipPage}
                        onPageSizeChange={(size) => { setWipLimit(size); setWipPage(1); }}
                    />
                </div>            </div>

            <h6 className='fw-bold text-dark mb-2 mt-4'>{t('inventory.pages.production_stock.approved_batches')}</h6>
            <div className='card border-0 shadow-sm rounded-3 overflow-hidden position-relative'>
                {tableLoading && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75" style={{ zIndex: 2 }}>
                        <Loader className="spinner-border text-primary" />
                    </div>
                )}
                <div className='table-responsive'>
                    <table className='table align-middle mb-0'>
                        <thead>
                            <tr style={{ background: 'linear-gradient(135deg, #004445 0%, #2c7873 100%)', textAlign:"center" }}>
                                <th className='text-uppercase py-3 ps-4' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>{t('inventory.pages.production_stock.col_batch_id')}</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>{t('inventory.pages.production_stock.col_product')}</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>{t('inventory.pages.production_stock.col_qty')}</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>{t('inventory.pages.production_stock.col_production_date')}</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>{t('inventory.pages.production_stock.col_expiry_date')}</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>{t('inventory.pages.production_stock.col_days_to_expire')}</th>
                            </tr>
                        </thead>
                        <tbody style={{textAlign:"center"}}>
                            {approvedItems.map((item) => {
                                const daysLeft = item.DaysToExpire;
                                let badgeClass = 'bg-success-subtle text-success';
                                if (daysLeft <= 0) badgeClass = 'bg-danger-subtle text-danger';
                                else if (daysLeft <= 7) badgeClass = 'bg-danger-subtle text-danger';
                                else if (daysLeft <= 30) badgeClass = 'bg-warning-subtle text-warning';

                                return (
                                    <tr key={item.PR_ID}>
                                        <td className='text-primary fw-medium ps-4'>{item.Batch_No}</td>
                                        <td className='fw-bold'>{(isSinhala && item.P_Name_Sinhala) ? item.P_Name_Sinhala : item.P_Name}</td>
                                        <td>{formatStock(item.Total_Qty_Produced)} {item.Base_Unit}</td>
                                        <td>{item.Production_Date ? new Date(item.Production_Date).toLocaleDateString() : 'N/A'}</td>
                                        <td>{item.Exp_Date ? new Date(item.Exp_Date).toLocaleDateString() : 'N/A'}</td>
                                        <td>
                                            <span className={`badge d-inline-block text-center ${badgeClass} px-3 py-2`} style={{ minWidth: '120px', fontWeight: '600' }}>
                                                {formatDaysToExpiry(daysLeft)}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {approvedItems.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center text-muted py-4">{t('inventory.pages.production_stock.no_approved')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-3 py-2">
                    <Pagination
                        currentPage={approvedPagination.currentPage}
                        totalItems={approvedPagination.totalRecords}
                        pageSize={approvedLimit}
                        onPageChange={setApprovedPage}
                        onPageSizeChange={(size) => { setApprovedLimit(size); setApprovedPage(1); }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProductionStock;
