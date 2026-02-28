import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import ProductHeader from '../../component/Inventory/Product/ProductHeader';
import ProductFilters from '../../component/Inventory/Product/ProductFilters';
import ProductTable from '../../component/Inventory/Product/ProductTable';

const ProductPage = ({ typeFilter, pageTitle }) => {

    //Filtering status
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');

    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);



    //Database fetching 
    useEffect(() => {
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
        fetchProducts();
    }, [ typeFilter ]); //Refetch when typeFilter changes (if needed for future type-based filtering)

    
    //Filtering Logic
    // useMemo - optimize performance so filtering only happens when inputs change
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesType = product.type === typeFilter;

            const name = product.name?.toLowerCase() || '';
            const id = product.id?.toString().toLowerCase() || '';
            const barcode = product.barcode?.toLowerCase() || '';
            
            const matchesSearch = name.includes(searchTerm.toLowerCase()) || 
                                 id.includes(searchTerm.toLowerCase()) ||
                                 barcode.includes(searchTerm.toLowerCase());
                                 
            
            return matchesSearch && matchesType;
        });
    }, [searchTerm, selectedType, products, typeFilter]); // Re-run filtering when any of these change

    //Handlers for filter inputs
    const handleAddProduct = () => {
        console.log(`Opening Add ${typeFilter} Product Modal...`);
        //Model logic
    }

  return (
    <div className='p-4 bg-light min-vh-100'>
        <div className='container-fluid px-0'>

            <ProductHeader 
                title={typeFilter === 'Other' ? 'Non-Company Items' : `${typeFilter} Items`} 
                onAddClick={handleAddProduct} 
            />
            <ProductFilters onSearchChange={setSearchTerm} onTypeChange={setSelectedType} />
            
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

            <ProductTable products={filteredProducts} isLoading={isLoading}/>

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