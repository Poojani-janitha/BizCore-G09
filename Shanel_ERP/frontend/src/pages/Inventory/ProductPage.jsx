import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import ProductHeader from '../../component/Inventory/Product/ProductHeader';
import ProductFilters from '../../component/Inventory/Product/ProductFilters';
import ProductTable from '../../component/Inventory/Product/ProductTable';
import ProductModal from '../../component/Inventory/Product/ProductModal';
import ProductViewModal from '../../component/Inventory/Product/ProductViewModal';

// Utility function for stock status
const getStockStatus = (stockCount, minStock) => {
    const stock = parseFloat(stockCount) || 0;
    const min = parseFloat(minStock) || 0;
    if (stock <= 0) return 'Out of Stock';
    if (stock < min) return 'Low Stock';
    return 'In Stock';
};

const ProductPage = ({ typeFilter, pageTitle }) => {

    //Filtering status
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');

    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [viewingProduct, setViewingProduct] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);

    const [editingProduct, setEditingProduct] = useState(null);

    const [activeOnly, setActiveOnly] = useState(false);

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
    
    const fetchProducts = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get('http://localhost:5000/api/inventory/products');
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

            //filter by active status(If toggle is ON ) - calculate status dynamically
            const calculatedStatus = getStockStatus(product.stockCount, product.minStock);
            const matchesStatus = activeOnly ? calculatedStatus === 'In Stock' : true;

            //Search logic
            const name = product.name?.toLowerCase() || '';
            const id = product.id?.toString().toLowerCase() || '';
            const barcode = product.barcode?.toLowerCase() || '';
            
            const matchesSearch = name.includes(searchTerm.toLowerCase()) || 
                                 id.includes(searchTerm.toLowerCase()) ||
                                 barcode.includes(searchTerm.toLowerCase());
                                 
            
            return matchesSearch && matchesType && matchesStatus;
        });
    }, [searchTerm, selectedType, products, typeFilter, activeOnly]); // Re-run filtering when any of these change

    //Handlers for filter inputs
    const handleAddProduct = () => {
        setEditingProduct(null); // Clear editing state when adding a new product
        setShowModal(true);
    }

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await axios.delete(`http://localhost:5000/api/inventory/products/${id}`);
                fetchProducts(); 
            } catch (error) {
                console.error("Delete failed", error);
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

            <ProductHeader title={pageTitle} onAddClick={handleAddProduct} products={filteredProducts} />
            <ProductModal show={showModal} onHide={handleCloseModal} typeFilter={typeFilter} refreshData={fetchProducts} editData={editingProduct} />
            <ProductViewModal show={showViewModal} onHide={handleCloseViewModal} product={viewingProduct} />
            <ProductFilters onSearchChange={setSearchTerm} onTypeChange={setSelectedType} onActiveToggle={setActiveOnly} />
            
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

            <ProductTable products={filteredProducts} isLoading={isLoading} onDelete={handleDelete} onEdit={handleEdit} onView={handleView} onPrint={handlePrintSingle} error={error} />

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

            {/* Indicate emepty state */}
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