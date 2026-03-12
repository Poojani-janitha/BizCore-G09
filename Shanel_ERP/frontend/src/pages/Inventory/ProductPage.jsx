import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import ProductHeader from '../../component/Inventory/Product/ProductHeader';
import ProductFilters from '../../component/Inventory/Product/ProductFilters';
import ProductTable from '../../component/Inventory/Product/ProductTable';
import ProductModal from '../../component/Inventory/Product/ProductModal';

const ProductPage = ({ typeFilter, pageTitle }) => {

    //Filtering status
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');

    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showModal, setShowModal] = useState(false);

    const [editingProduct, setEditingProduct] = useState(null);

    const [activeOnly, setActiveOnly] = useState(false);

    const handleEdit = (product) => {
        setEditingProduct(product); // Set the selected product data
        setShowModal(true); // Open the modal
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

            //filter by active status(If toggle is ON )
            const matchesStatus = activeOnly ? product.status === 'In Stock' : true;

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

    const printBarcodes = (items, showName) => {
        const withBarcode = (items || []).filter(p => p.barcode);
        if (withBarcode.length === 0) { alert('No barcodes available to print.'); return; }
        const rows = withBarcode.map(p => `
            <div class="bc-item">
                <svg class="bc" jsbarcode-value="${p.barcode}" jsbarcode-width="2" jsbarcode-height="60" jsbarcode-fontsize="13"></svg>
                ${showName ? `<p class="nm">${p.name}</p>` : ''}
            </div>`).join('');
        const win = window.open('', '_blank');
        win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Barcodes</title>
            <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
            <style>
                *{box-sizing:border-box;margin:0;padding:0}
                body{font-family:Arial,sans-serif;background:#fff}
                .grid{display:flex;flex-wrap:wrap;gap:12px;padding:20px}
                .bc-item{border:1px solid #ddd;padding:10px 14px;text-align:center;border-radius:4px}
                .nm{font-size:11px;margin-top:5px;color:#333;font-weight:600}
                @media print{.grid{padding:8px;gap:8px}}
            </style></head><body>
            <div class="grid">${rows}</div>
            <script>window.onload=function(){JsBarcode('.bc').init();window.print();};<\/script>
        </body></html>`);
        win.document.close();
    };

    const handlePrintSingle   = (product) => printBarcodes([product], true);
    const handlePrintWithName = () => printBarcodes(filteredProducts, true);
    const handlePrintBarcodesOnly = () => printBarcodes(filteredProducts, false);

  return (
    <div className='p-4 bg-light min-vh-100' style={{ fontSize: '13px' }}>
        <div className='container-fluid px-0'>

            <ProductHeader title={pageTitle} onAddClick={handleAddProduct} onPrintWithName={handlePrintWithName} onPrintBarcodesOnly={handlePrintBarcodesOnly} />
            <ProductModal show={showModal} onHide={handleCloseModal} typeFilter={typeFilter} refreshData={fetchProducts} editData={editingProduct} />
            <ProductFilters onSearchChange={setSearchTerm} onTypeChange={setSelectedType} onActiveToggle={setActiveOnly} />
            
            {error && (
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                        <div>{error}</div>
                    </div>
            )}

            <div className='d-flex align-items-center justify-content-between mb-3 px-1'>
                <div className='d-flex gap-2'>
                    <span className='badge bg-white text-dark border shadow-sm py-2 px-3 fw-normal'>
                        <span className='text-muted fw-normal'>Total Results:</span> {products.length}                            
                    </span>
                    {/* {selectedType && (
                        <span className='badge bg-info-subtle text-info border border-info-subtle py-2 px-3 fw-normal'>
                            Found: {filteredProducts.length}
                        </span>
                    )} */}
                </div>
            </div>

            <ProductTable products={filteredProducts} isLoading={isLoading} onDelete={handleDelete} onEdit={handleEdit} onPrint={handlePrintSingle} />

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