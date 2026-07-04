import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import ProductHeader from '../../component/Inventory/Product/ProductHeader';
import ProductTable from '../../component/Inventory/Product/ProductTable';
import ProductModal from '../../component/Inventory/Product/ProductModal';
import ProductViewModal from '../../component/Inventory/Product/ProductViewModal';
import Pagination from '../../component/common/Pagination';
import { X, Search } from 'react-feather';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/apiEndpoints';
import { useTranslation } from 'react-i18next';

// Utility function for stock status
const getStockStatus = (stockCount, minStock) => {
    const stock = parseFloat(stockCount) || 0;
    const min = parseFloat(minStock) || 0;
    if (stock <= 0) return 'Out of Stock';
    if (stock < min) return 'Low Stock';
    return 'In Stock';
};

const ProductPage = ({ typeFilter, pageTitle }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    //Filtering status
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [companySourceFilter, setCompanySourceFilter] = useState('all');

    // Reset search whenever the user navigates to a different product page
    useEffect(() => {
        setSearchTerm('');
        setCompanySourceFilter('all');
        setCurrentPage(1);
    }, [typeFilter]);

    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [viewingProduct, setViewingProduct] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);

    const [editingProduct, setEditingProduct] = useState(null);

    const [activeOnly, setActiveOnly] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [showQuickStockModal, setShowQuickStockModal] = useState(false);
    const [stockForm, setStockForm] = useState({ productId: '', qty: '' });
    const [stockProductSearch, setStockProductSearch] = useState('');
    const [showStockProductDropdown, setShowStockProductDropdown] = useState(false);
    const [stockDropdownBrowse, setStockDropdownBrowse] = useState(true);
    const [stockError, setStockError] = useState('');
    const [isSavingStock, setIsSavingStock] = useState(false);
    const [productionPromptProduct, setProductionPromptProduct] = useState(null);

    const isIsharaProduct = (product) => (
        product.isIsharaProduct === true ||
        product.isIsharaProduct === 1 ||
        product.isIsharaProduct === '1' ||
        product.isIsharaProduct === 'true'
    );

    const handleEdit = (product) => {
        setEditingProduct(product); // Set the selected product data
        setShowModal(true); // Open the modal
    };

    const handleView = (product) => {
        setViewingProduct(product);
        setShowViewModal(true);
    };

    const handleCloseViewModal = () => {
        setViewingProduct(null);
        setShowViewModal(false);
    };

    const handleCloseModal = () => {
        setEditingProduct(null); // Clear editing state on close
        setShowModal(false);
    };

    const goToProductionStock = () => {
        navigate('/inventory/production-stock');
    };

    const handleProductAdded = (product) => {
        if (product.type === 'Company' && !product.isIsharaProduct) {
            setProductionPromptProduct(product);
        } else {
            alert("Product added successfully!");
        }
    };
    
    const fetchProducts = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(API_ENDPOINTS.inventory.products);
                setProducts(response.data);
                setError(null);
            } catch (error) {
                console.error("Error fetching products:", error);
                setError("Failed to load products. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        }

    //Database fetching 
    useEffect(() => { fetchProducts(); }, [ typeFilter ]); //Refetch when typeFilter changes (if needed for future type-based filtering)

    
    //Filtering Logic
    // useMemo - optimize performance so filtering only happens when inputs change
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            //filter by page type(Company, other, Raw)
            const matchesType = product.type === typeFilter;

            const matchesCompanySource = typeFilter !== 'Company' ||
                companySourceFilter === 'all' ||
                (companySourceFilter === 'shanel' && !isIsharaProduct(product)) ||
                (companySourceFilter === 'ishara' && isIsharaProduct(product));

            //filter by active status(If toggle is ON ) - calculate status dynamically
            const calculatedStatus = getStockStatus(product.stockCount, product.minStock);
            const matchesStatus = activeOnly ? calculatedStatus === 'In Stock' : true;

            //Search logic
            const name = product.name?.toLowerCase() || '';
            const id = product.id?.toString().toLowerCase() || '';
            const barcode = product.barcode?.toLowerCase() || '';
            const term = searchTerm.toLowerCase();

            const matchesSearch = name.startsWith(term) || 
                                 id.includes(term) ||
                                 barcode.includes(term);
                                 
            
            return matchesSearch && matchesType && matchesStatus && matchesCompanySource;
        });
    }, [searchTerm, selectedType, products, typeFilter, activeOnly, companySourceFilter]); // Re-run filtering when any of these change

    // Reset to page 1 when search/filter changes
    useEffect(() => { setCurrentPage(1); }, [searchTerm, activeOnly, companySourceFilter]);

    // Paginated slice
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredProducts.slice(start, start + pageSize);
    }, [filteredProducts, currentPage, pageSize]);

    const companySourceCounts = useMemo(() => {        const companyProducts = products.filter(product => product.type === 'Company');

        return {
            all: companyProducts.length,
            shanel: companyProducts.filter(product => !isIsharaProduct(product)).length,
            ishara: companyProducts.filter(product => isIsharaProduct(product)).length
        };
    }, [products]);

    const quickStockProducts = useMemo(() => {
        return products.filter(product => {
            if (product.type !== typeFilter) return false;
            if (typeFilter === 'Company') return isIsharaProduct(product);
            return typeFilter === 'Other';
        });
    }, [products, typeFilter]);

    const selectedStockProduct = useMemo(() => {
        return quickStockProducts.find(product => product.id?.toString() === stockForm.productId);
    }, [quickStockProducts, stockForm.productId]);

    const filteredQuickStockProducts = useMemo(() => {
        if (stockDropdownBrowse) return quickStockProducts;

        const term = stockProductSearch.trim().toLowerCase();
        if (!term) return quickStockProducts;

        return quickStockProducts.filter((product) =>
            (product.name?.toLowerCase() || '').includes(term) ||
            (product.id?.toString().toLowerCase() || '').includes(term)
        );
    }, [quickStockProducts, stockProductSearch, stockDropdownBrowse]);

    const getStockLocation = () => {
        return 'Shop';
    };

    const openQuickStockModal = () => {
        setStockForm({ productId: '', qty: '' });
        setStockProductSearch('');
        setShowStockProductDropdown(false);
        setStockDropdownBrowse(true);
        setStockError('');
        setShowQuickStockModal(true);
    };

    const handleSelectStockProduct = (product) => {
        setStockForm((prev) => ({ ...prev, productId: product.id?.toString() || '' }));
        setStockProductSearch(`${product.id} - ${product.name}`);
        setShowStockProductDropdown(false);
        setStockDropdownBrowse(true);
    };

    const handleStockProductSearchChange = (value) => {
        setStockDropdownBrowse(false);
        setStockProductSearch(value);
        setShowStockProductDropdown(true);
        setStockForm((prev) => ({ ...prev, productId: '' }));
    };

    const handleClearStockProduct = () => {
        setStockForm((prev) => ({ ...prev, productId: '' }));
        setStockProductSearch('');
        setStockDropdownBrowse(true);
        setShowStockProductDropdown(true);
    };

    const handleStockProductFocus = () => {
        if (stockForm.productId) return;
        setShowStockProductDropdown(true);
        setStockDropdownBrowse(true);
    };

    const handleQuickStockSubmit = async (e) => {
        e.preventDefault();
        setStockError('');

        const qty = parseFloat(stockForm.qty);
        if (!stockForm.productId) {
            setStockError('Please select a product.');
            return;
        }
        if (!qty || qty <= 0) {
            setStockError('Please enter a quantity greater than 0.');
            return;
        }

        try {
            setIsSavingStock(true);
            await axios.post(API_ENDPOINTS.inventory.adjustments.adjust, {
                P_ID: stockForm.productId,
                Location: getStockLocation(),
                Adjustment_Qty: qty,
                Adjustment_Type: 'Stock_Take',
                Adjustment_Date: new Date().toISOString().slice(0, 10),
                Reason: 'Quick stock update'
            });

            setShowQuickStockModal(false);
            setStockForm({ productId: '', qty: '' });
            setStockProductSearch('');
            setShowStockProductDropdown(false);
            setStockDropdownBrowse(true);
            await fetchProducts();
        } catch (error) {
            setStockError(error.response?.data?.message || 'Failed to update stock.');
        } finally {
            setIsSavingStock(false);
        }
    };

    //Handlers for filter inputs
    const handleAddProduct = () => {
        setEditingProduct(null); // Clear editing state when adding a new product
        setShowModal(true);
    }

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await axios.delete(API_ENDPOINTS.inventory.productById(id));
                fetchProducts(); 
            } catch (error) {
                const msg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to delete product.';
                alert(msg);
            }
        }
    };

    // ---------- Barcode Print ----------
    const [printTarget, setPrintTarget]   = useState(null);  // product to print
    const [printQty, setPrintQty]         = useState(1);     // requested copies
    const [showPrintDialog, setShowPrintDialog] = useState(false);

    const handlePrintSingle = (product) => {
        if (!product.barcode) { alert('This product has no barcode assigned.'); return; }
        setPrintTarget(product);
        setPrintQty(1);
        setShowPrintDialog(true);
    };

    const executePrint = () => {
        const qty = parseInt(printQty, 10);
        if (!qty || qty < 1 || qty > 10000) { alert('Please enter a valid quantity (1 – 10,000).'); return; }
        setShowPrintDialog(false);

        // Build qty copies of the barcode in one print page
        const copies = Array.from({ length: qty }, (_, i) => `
            <div class="bc-item">
                <svg class="bc"
                    jsbarcode-value="${printTarget.barcode}"
                    jsbarcode-width="1.8"
                    jsbarcode-height="50"
                    jsbarcode-fontsize="11"
                    jsbarcode-margin="3">
                </svg>
                <p class="nm">${printTarget.name}</p>
                <p class="copy-num">${i + 1} / ${qty}</p>
            </div>`).join('');

        const win = window.open('', '_blank');
        win.document.write(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Print Barcodes – ${printTarget.name}</title>
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,sans-serif;background:#f0f0f0}

  /* ── Screen preview banner ── */
  .info{
    background:#1e293b;color:#f1f5f9;
    padding:10px 18px;font-size:12px;
    display:flex;align-items:center;gap:12px;
  }
  .info strong{color:#fff}
  .print-btn{
    margin-left:auto;
    background:#3b82f6;color:#fff;border:none;
    padding:5px 14px;border-radius:4px;cursor:pointer;font-size:12px;
  }

  /* ── Label grid ── */
  .grid{
    display:grid;
    grid-template-columns: repeat(4, 1fr);
    gap:0;
    padding:10mm;
    background:#f0f0f0;
  }

  /* ── Single label ── */
  .bc-item{
    background:#fff;
    border:1px dashed #bbb;      /* dashed = easy cut guide */
    padding:8px 6px 6px;
    text-align:center;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    min-height:28mm;
    page-break-inside:avoid;
  }
  .bc-item svg{ max-width:100%; height:auto; }
  .nm{
    font-size:9px;
    margin-top:4px;
    color:#111;
    font-weight:700;
    letter-spacing:0.03em;
    max-width:100%;
    word-break:break-word;
    line-height:1.3;
  }
  .copy-num{
    font-size:8px;
    color:#999;
    margin-top:2px;
  }

  /* ── Print overrides ── */
  @media print{
    body{background:#fff}
    .info{display:none}
    .grid{
      padding:5mm;
      background:#fff;
      gap:0;
    }
    .bc-item{
      border:1px dashed #aaa;
    }
  }
</style></head><body>
<div class="info">
  Printing <strong>${qty}&nbsp;cop${qty === 1 ? 'y' : 'ies'}</strong> of
  &nbsp;<strong>${printTarget.name}</strong>
  &nbsp;·&nbsp; Barcode:&nbsp;${printTarget.barcode}
  <button class="print-btn" onclick="window.print()">🖨 Print</button>
</div>
<div class="grid">${copies}</div>
<script>window.onload=function(){JsBarcode('.bc').init();};<\/script>
</body></html>`);
        win.document.close();
    };

  return (
    <div className='p-4 bg-light min-vh-100' style={{ fontSize: '13px' }}>
        <div className='container-fluid px-0'>

            <ProductHeader
                title={pageTitle}
                onAddClick={handleAddProduct}
                onUpdateQtyClick={openQuickStockModal}
                showUpdateQty={typeFilter === 'Company' || typeFilter === 'Other'}
                onProductionStockClick={goToProductionStock}
                showProductionStock={typeFilter === 'Company'}
                products={filteredProducts}
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                onSearchReset={() => setSearchTerm('')}
                activeOnly={activeOnly}
                onActiveToggle={setActiveOnly}
            />
            <ProductModal
                show={showModal}
                onHide={handleCloseModal}
                typeFilter={typeFilter}
                refreshData={fetchProducts}
                editData={editingProduct}
                onProductAdded={handleProductAdded}
            />
            <ProductViewModal show={showViewModal} onHide={handleCloseViewModal} product={viewingProduct} />


            {typeFilter === 'Company' && (
                <div className='  rounded-3 p-2 mb-3 d-flex flex-wrap gap-2'>
                    {[
                        { key: 'all', label: t('inventory.filters.all', 'All'), count: companySourceCounts.all },
                        { key: 'shanel', label: t('inventory.filters.shanel', 'Shanel Products'), count: companySourceCounts.shanel },
                        { key: 'ishara', label: t('inventory.filters.ishara', 'Ishara Products'), count: companySourceCounts.ishara }
                    ].map(filter => (
                        <button
                            key={filter.key}
                            type='button'
                            className={`btn btn-sm fw-semibold px-3 ${companySourceFilter === filter.key ? 'btn-dark' : 'btn-light border'}`}
                            onClick={() => setCompanySourceFilter(filter.key)}
                        >
                            {filter.label}
                            <span className={`ms-2 badge ${companySourceFilter === filter.key ? 'bg-white text-dark' : 'bg-secondary-subtle text-secondary'}`}>
                                {filter.count}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-3" role="alert">
                    <div className="flex-grow-1">{error}</div>
                    <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                </div>
            )}

            {/* 
            <div className='d-flex align-items-center justify-content-between mb-3 px-1'>
                <div className='d-flex gap-2'>
                    <span className='badge bg-white text-dark border shadow-sm py-2 px-3 fw-normal'>
                        <span className='text-muted fw-normal'>Total Results:</span> {products.length}                            
                    </span>
                    // {selectedType && (
                        // <span className='badge bg-info-subtle text-info border border-info-subtle py-2 px-3 fw-normal'>
                            // Found: {filteredProducts.length}
                        // </span>
                    // )} 
                </div>
            </div> 
            */}

            <ProductTable products={paginatedProducts} isLoading={isLoading} onDelete={handleDelete} onEdit={handleEdit} onView={handleView} onPrint={handlePrintSingle} error={error} />

            <Pagination
                currentPage={currentPage}
                totalItems={filteredProducts.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
            />

            {/* Barcode Qty Print Dialog */}
            {showPrintDialog && printTarget && (
                <div className='modal d-block' style={{ backgroundColor: 'rgba(15,23,42,0.6)', zIndex: 1055 }}
                     onClick={(e) => { if (e.target === e.currentTarget) setShowPrintDialog(false); }}>
                    <div className='modal-dialog modal-dialog-centered' style={{ maxWidth: '360px' }}>
                        <div className='modal-content border-0 shadow-lg rounded-4 overflow-hidden'>
                            <div className='modal-header border-0 px-4 pt-4 pb-2'>
                                <div>
                                    <h6 className='fw-bold mb-0'>Print Barcode</h6>
                                    <p className='text-muted small mb-0 mt-1' style={{ fontSize: '12px' }}>
                                        {printTarget.name} &nbsp;·&nbsp; <span className='text-secondary'>{printTarget.barcode}</span>
                                    </p>
                                </div>
                                <button className='btn-close shadow-none ms-auto' onClick={() => setShowPrintDialog(false)} />
                            </div>
                            <div className='modal-body px-4 py-3'>
                                <label className='form-label small fw-semibold text-muted mb-1'>How many copies do you want to print?</label>
                                <input
                                    type='number'
                                    className='form-control form-control-sm bg-light border-0 py-2 shadow-none'
                                    min='1' max='10000'
                                    value={printQty}
                                    autoFocus
                                    onChange={(e) => setPrintQty(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && executePrint()}
                                />
                                <p className='text-muted mt-2 mb-0' style={{ fontSize: '11px' }}>All copies will be formatted in a single printable sheet.</p>
                            </div>
                            <div className='modal-footer border-0 px-4 pb-4 pt-1 gap-2'>
                                <button className='btn btn-outline-secondary btn-sm px-4 rounded-3' onClick={() => setShowPrintDialog(false)}>Cancel</button>
                                <button className='btn btn-dark btn-sm px-4 rounded-3 shadow-sm' onClick={executePrint}>Print</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showQuickStockModal && (
                <div className='modal d-block' style={{ backgroundColor: 'rgba(15,23,42,0.6)', zIndex: 1055 }}
                     onClick={(e) => { if (e.target === e.currentTarget) setShowQuickStockModal(false); }}>
                    <div className='modal-dialog modal-dialog-centered' style={{ maxWidth: '460px' }}>
                        <form className='modal-content border-0 shadow-lg rounded-4' onSubmit={handleQuickStockSubmit}>
                            <div className='modal-header border-0 px-4 pt-4 pb-2'>
                                <div>
                                    <h6 className='fw-bold mb-0'>Update Quantity</h6>
                                    <p className='text-muted small mb-0 mt-1' style={{ fontSize: '12px' }}>
                                        {typeFilter === 'Company'
                                            ? 'Only Ishara products can be updated here.'
                                            : `Stock will be added to ${getStockLocation()} inventory.`}
                                    </p>
                                </div>
                                <button
                                    type='button'
                                    className='btn btn-sm btn-light border-0 rounded-circle ms-auto'
                                    onClick={() => setShowQuickStockModal(false)}
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className='modal-body px-4 py-3' style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                {stockError && <div className='alert alert-danger py-2 small mb-3'>{stockError}</div>}

                                <label className='form-label small fw-semibold text-muted mb-1'>Product</label>
                                <div className='mb-3'>
                                    <div className={`input-group input-group-sm rounded border ${stockForm.productId ? 'bg-white' : 'bg-light'}`}>
                                        <span className='input-group-text bg-transparent border-0 py-1'>
                                            <Search size={14} className='text-muted' />
                                        </span>
                                        <input
                                            type='text'
                                            className='form-control border-0 bg-transparent shadow-none py-2'
                                            placeholder='Search or select product...'
                                            value={stockProductSearch}
                                            readOnly={Boolean(stockForm.productId)}
                                            onChange={(e) => handleStockProductSearchChange(e.target.value)}
                                            onFocus={handleStockProductFocus}
                                            onClick={handleStockProductFocus}
                                            onBlur={() => setTimeout(() => setShowStockProductDropdown(false), 150)}
                                            disabled={quickStockProducts.length === 0}
                                        />
                                        {stockForm.productId && (
                                            <button
                                                type='button'
                                                className='btn btn-link text-muted border-0 px-2 py-0'
                                                onClick={handleClearStockProduct}
                                                title='Change product'
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>

                                    {showStockProductDropdown && !stockForm.productId && filteredQuickStockProducts.length > 0 && (
                                        <ul
                                            className='list-group border rounded shadow-sm mt-2 mb-0'
                                            style={{ maxHeight: '180px', overflowY: 'auto' }}
                                        >
                                            {filteredQuickStockProducts.map((product) => (
                                                <li
                                                    key={product.id}
                                                    className='list-group-item list-group-item-action py-2 small'
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => handleSelectStockProduct(product)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <div className='fw-semibold'>{product.id} - {product.name}</div>
                                                    {product.code && (
                                                        <div className='text-muted' style={{ fontSize: '11px' }}>
                                                            Code: {product.code}
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {showStockProductDropdown && !stockForm.productId && stockProductSearch.trim() && !stockDropdownBrowse && filteredQuickStockProducts.length === 0 && (
                                        <div className='border rounded shadow-sm mt-2 px-3 py-2 small text-muted bg-white'>
                                            No matching products found.
                                        </div>
                                    )}
                                </div>

                                {quickStockProducts.length === 0 && (
                                    <p className='text-muted small mb-3'>
                                        No products are available for quick quantity update on this page.
                                    </p>
                                )}

                                {!showStockProductDropdown && selectedStockProduct && (
                                    <div className='bg-light rounded-3 p-3 mb-3 d-flex justify-content-between'>
                                        <span className='text-muted small'>Current Stock</span>
                                        <strong>{selectedStockProduct.stockCount || 0} {selectedStockProduct.baseUnit || ''}</strong>
                                    </div>
                                )}

                                {!showStockProductDropdown && (
                                    <>
                                        <label className='form-label small fw-semibold text-muted mb-1'>Quantity to Add</label>
                                        <input
                                            type='number'
                                            min='0.01'
                                            step='0.01'
                                            className='form-control form-control-sm bg-light border-0 py-2 shadow-none'
                                            placeholder='Enter supplied quantity'
                                            value={stockForm.qty}
                                            onChange={(e) => setStockForm({ ...stockForm, qty: e.target.value })}
                                        />
                                    </>
                                )}
                            </div>

                            <div className='modal-footer border-0 px-4 pb-4 pt-1 gap-2'>
                                <button
                                    type='button'
                                    className='btn btn-outline-secondary btn-sm px-4 rounded-3'
                                    onClick={() => setShowQuickStockModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    className='btn btn-dark btn-sm px-4 rounded-3 shadow-sm'
                                    disabled={isSavingStock || quickStockProducts.length === 0}
                                >
                                    {isSavingStock ? 'Updating...' : 'Add to Stock'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {productionPromptProduct && (
                <div className='modal d-block' style={{ backgroundColor: 'rgba(15,23,42,0.55)', zIndex: 1060 }}
                     onClick={(e) => { if (e.target === e.currentTarget) setProductionPromptProduct(null); }}>
                    <div className='modal-dialog modal-dialog-centered' style={{ maxWidth: '420px' }}>
                        <div className='modal-content border-0 shadow-lg rounded-4 overflow-hidden'>
                            <div className='modal-header border-0 px-4 pt-4 pb-2'>
                                <div>
                                    <h6 className='fw-bold mb-0'>Product Added</h6>
                                    <p className='text-muted small mb-0 mt-1' style={{ fontSize: '12px' }}>
                                        {productionPromptProduct.name} was added successfully.
                                    </p>
                                </div>
                                <button
                                    type='button'
                                    className='btn btn-sm btn-light border-0 rounded-circle ms-auto'
                                    onClick={() => setProductionPromptProduct(null)}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className='modal-body px-4 py-3'>
                                <p className='mb-0 text-dark'>
                                    Do you want to add stock for this product from Production Stock now?
                                </p>
                            </div>
                            <div className='modal-footer border-0 px-4 pb-4 pt-1 gap-2'>
                                <button
                                    type='button'
                                    className='btn btn-outline-secondary btn-sm px-4 rounded-3'
                                    onClick={() => setProductionPromptProduct(null)}
                                >
                                    Later
                                </button>
                                <button
                                    type='button'
                                    className='btn btn-dark btn-sm px-4 rounded-3 shadow-sm'
                                    onClick={goToProductionStock}
                                >
                                    Go to Production Stock
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {filteredProducts.length === 0 && !isLoading && (
                <div className='text-center py-5 bg-white rounded-3 shadow-sm mt-3'>
                    <h5 className='text-muted'>No products found matching your criteria.</h5>
                </div>
            )}
        </div>
    </div>
  )
}

export default ProductPage
