import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus } from 'react-feather';
import ProductionModal from '../../component/Inventory/Production/ProductionModal';
import StockTable from '../../component/Inventory/Production/StockTable';

const ProductionPage = () => {
    const [productionData, setProductionData] = useState([]);
    const [rawMaterialData, setRawMaterialData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const fetchProductionData = async () => {
        try {
            setIsLoading(true);
            const productionResponse = await axios.get('http://localhost:5000/api/production');
            const rawMaterialResponse = await axios.get('http://localhost:5000/api/inventory/products?type=Raw');
            
            setProductionData(productionResponse.data);
            setRawMaterialData(rawMaterialResponse.data);
        } catch (error) {
            console.error("Error fetching production data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProductionData();
    }, []);

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleAddProduction = () => {
        setShowModal(true);
    };

    return (
        <div className='p-4 bg-light min-vh-100'>
            <div className='container-fluid px-0'>
                
                {/* Header Section */}
                <div className='d-flex justify-content-between align-items-center mb-4'>
                    <div>
                        <h3 className='fw-bold text-dark'>Production Stock</h3>
                        <p className='text-muted small'>Manage production batches and monitor stock levels</p>
                    </div>
                    <button 
                        className='btn btn-primary d-flex align-items-center gap-2'
                        onClick={handleAddProduction}
                    >
                        <Plus size={18} /> Start New Batch
                    </button>
                </div>

                <ProductionModal show={showModal} onHide={handleCloseModal} refreshData={fetchProductionData} />

                {/* Production Batches Table */}
                {isLoading ? (
                    <div className='text-center py-5'>Loading...</div>
                ) : (
                    <>
                        <StockTable
                            title='Active Production Batches'
                            icon='⚙️'
                            columns={['Batch No', 'Product', 'Quantity', 'Progress', 'Status']}
                            data={productionData}
                            type='production'
                        />

                        <StockTable
                            title='Raw Materials'
                            icon='📦'
                            columns={['ID', 'Name', 'Quantity', 'Status']}
                            data={rawMaterialData}
                            type='raw'
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default ProductionPage;
