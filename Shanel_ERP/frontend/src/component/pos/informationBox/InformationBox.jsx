import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_ENDPOINTS } from '../../../config/apiEndpoints';

const InformationBox = ({ customerData, selectedProduct, location, setLocation, setError, cartItems }) => {

    const [availableStock, setAvailableStock] = useState(null);

    const toNumber = (value) => parseFloat(value) || 0;

    //fuction to get availabale quntity of the product in inventory when user select the product from search result
    const fetchProductQuantity = async (productId) => {
        try {
            const res = await axios.get(API_ENDPOINTS.sales.productQuantity(productId));
            console.log('Product Quantity Response:', res.data);
            if (res.data.success) {
                const shopQty = toNumber(res.data.shopQty);
                const productionQty = toNumber(res.data.productionQty);
                const totalQty = toNumber(res.data.totalQty);

                setAvailableStock({ shop: shopQty, production: productionQty, total: totalQty });
            }
        }
        catch (error) {
            console.error("Error fetching product quantity:", error);
        }
    };

    useEffect(() => {
        if (selectedProduct?.p_id) {
            fetchProductQuantity(selectedProduct.p_id);
        } else {
            setAvailableStock(null);
        }
    }, [selectedProduct]);

    const handleLocationChange = (newLoc) => {
        if (newLoc === location) return;
        if (cartItems && cartItems.length > 0) {
            setError({ field: 'general', message: "Cannot change location while there are items in the cart. Please clear the cart first." });
            return;
        }
        setLocation(newLoc);
    };



    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 0',
            flexWrap: 'wrap',
            borderTop: '1px solid #e0e0e0',
            paddingTop: '12px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                {/* Customer Phone */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>Customer Phone:</span>
                    <span style={{ fontSize: '12px', color: '#333', fontWeight: '600' }}>{customerData?.phone1 || customerData?.Phone || 'N/A'}</span>
                </div>

                {/* Outstanding Balance */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>Outstanding Balance:</span>
                    <span style={{ fontSize: '12px', color: '#d9534f', fontWeight: '600' }}>Rs. {toNumber(customerData?.current_balance ?? customerData?.Current_Balance).toFixed(2)}</span>
                </div>


                {/* Selected Product Name */}
                {selectedProduct?.p_name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>Product:</span>
                        <span style={{ fontSize: '12px', color: '#333', fontWeight: '600' }}>{selectedProduct.p_name}</span>
                    </div>
                )}

                {/* Shop Stock */}
                <div style={{ 
                     display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                    <span style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>Shop Qty:</span>
                    <span style={{ fontSize: '12px', color: '#1976d2', fontWeight: '700' }}>{availableStock?.shop || '0'}</span>
                </div>

                {/* Production Stock */}
                <div style={{ 
                    display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                    <span style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>Production Qty:</span>
                    <span style={{ fontSize: '12px', color: '#7b1fa2', fontWeight: '700' }}>{availableStock?.production || '0'}</span>
                </div>

                {/* Total Stock */}
                <div style={{ 
                     display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                    <span style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>Total Stock:</span>
                    <span style={{ fontSize: '12px', color: '#333', fontWeight: '700' }}>{availableStock?.total || '0'}</span>
                </div>
            </div>

            {/* Location Toggle - Right Side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
                {/* Shop Option */}
                <div 
                    onClick={() => handleLocationChange('Shop')}
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        opacity: cartItems?.length > 0 && location !== 'Shop' ? 0.6 : 1
                    }}
                >
                    <input
                        className="form-check-input mt-0 cursor-pointer"
                        type="radio"
                        name="locationToggle"
                        id="infoLocationShop"
                        checked={location === 'Shop'}
                        onChange={() => handleLocationChange('Shop')}
                        style={{ width: '13px', height: '13px', cursor: 'pointer' }}
                    />
                    <label 
                        htmlFor="infoLocationShop"
                        className="mb-0 fw-bold cursor-pointer shop-label" 
                        style={{ 
                            fontSize: '13px', 
                            color: '#000000',
                            userSelect: 'none'
                        }}
                    >
                        Shop
                    </label>
                </div>

                {/* Production Option */}
                <div 
                    onClick={() => handleLocationChange('Production')}
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        opacity: cartItems?.length > 0 && location !== 'Production' ? 0.6 : 1
                    }}
                >
                    <input
                        className="form-check-input mt-0 cursor-pointer"
                        type="radio"
                        name="locationToggle"
                        id="infoLocationProduction"
                        checked={location === 'Production'}
                        onChange={() => handleLocationChange('Production')}
                        style={{ width: '13px', height: '13px', cursor: 'pointer' }}
                    />

                    <label 
                        htmlFor="infoLocationProduction"
                        className="mb-0 fw-bold cursor-pointer production-label" 
                        style={{ 
                            fontSize: '13px', 
                            color: '#000000',
                            userSelect: 'none'
                        }}
                    >
                        Production
                    </label>
                </div>

                <style>{`
                    .shop-label:hover, .production-label:hover {
                        color: #000000 !important;
                    }
                    div:hover > .shop-label, div:hover > .production-label {
                        color: #000000 !important;
                    }
                `}</style>
            </div>
        </div>
    )
}

export default InformationBox
