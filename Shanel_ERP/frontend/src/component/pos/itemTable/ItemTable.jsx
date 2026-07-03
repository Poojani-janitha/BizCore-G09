import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Plus, Trash2, Package } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import './itemTable.css';
import Portal from './Portal';

const EMPTY_ITEM = {
    p_id: '',
    p_code: '',
    p_name: '',
    p_unit: '',
    base_unit_price: 0,
    unit_price: 0,
    discount: 0,
    tax: 0,
    quntity: 1,
    free: 0,
};

const toNumber = (value) => parseFloat(value) || 0;

const ItemTable = ({ cartItems, setCartItems, priceLevel, setPriceLevel, location, selectedProduct, setSelectedProduct, error, setError,  setInformation }) => {
    const { t } = useTranslation();
    const inputRowBg = '#f8faf9';
    const [query, setQuery] = useState('');
    const [allUnits, setAllUnits] = useState([]);// All available units for the selected product
    const [searchResults, setSearchResults] = useState([]);// For product search results dropdown
    const [tempItem, setTempItem] = useState(EMPTY_ITEM);// Temporary state for the item being added to the cart
    const [availableQuantity, setAvailableQuantity] = useState(null); // Available quantity for the selected product
    const searchInputRef = useRef(null);

    const getCartBaseQtyForProduct = (productId, excludeItemId = null) => {
        return cartItems
            .filter(item => item.p_id === productId && item.id !== excludeItemId)
            .reduce((sum, item) => sum + (toNumber(item.quntity) * (item.conversionFactor || 1)), 0);
    };

    // Fetch all units for the selected product
    useEffect(() => {
        const handleAllUnits = async () => {
            if (!tempItem.p_id) {
                setAllUnits([]);
                return;
            }

            try {
                const res = await axios.get(`http://localhost:5000/api/sales/units?productId=${tempItem.p_id}`);
                console.log('Units API Response:', res.data);
                if (res.data.success) {
                    const units = res.data.units || [];
                    setAllUnits(units);

                    // If no unit is selected yet, find and set the base unit (Priority: Is_Base_Unit flag, then Conversion factor 1)
                    if (!tempItem.p_unit && units.length > 0) {
                        const baseUnit = units.find(u => (typeof u === 'object' && (u.Is_Base_Unit || u.Unit_Conversion == 1))) || units[0];
                        const unitName = typeof baseUnit === 'string' ? baseUnit : baseUnit.Unit_Name;
                        setTempItem(prev => ({ ...prev, base_unit_name: unitName }));
                        handleUnitChange(unitName);
                    }
                }
            } catch (error) {
                console.error('Units fetch error', error);
            }
        };

        handleAllUnits();
    }, [tempItem.p_id]);


    // Function to  calculate line subtotal, tax amount, and total based on the current tempItem values. This ensures that as the user inputs or changes values for quantity, price, discount, or tax, the calculations are updated in real-time and accurately reflect the current state of the item being added to the cart.
    const calculateLineSubtotal = (item) => {
        const q = toNumber(item.quntity);
        const f = toNumber(item.free);
        const p = toNumber(item.unit_price);
        const d = toNumber(item.discount);
        const chargedQty = Math.max(0, q - f);
        return (chargedQty * p) * (1 - d / 100);
    };


    // Function to calculate the tax amount for a line item based on the calculated subtotal and the tax rate. This allows the system to determine how much tax should be applied to the item, which is essential for accurate invoicing and compliance with tax regulations.
    const calculateLineTaxAmount = (item) => {
        const lineSubtotal = calculateLineSubtotal(item);
        const taxRate = toNumber(item.tax);
        return lineSubtotal * (taxRate / 100);
    };

    // Function to calculate the total amount for a line item by summing the calculated subtotal and tax amount. This provides the final amount that will be added to the cart for that item, ensuring that all relevant factors (quantity, price, discount, and tax) are considered in the final total.
    const calculateLineTotal = (item) => calculateLineSubtotal(item) + calculateLineTaxAmount(item);



    //run calculation when tempItem changes to update the computed fields (subtotal, tax amount, total) in real-time as the user inputs data for the item being added to the cart. This ensures that the user sees accurate calculations based on their current inputs before they add the item to the cart.
    const currentEntryTaxAmount = useMemo(() => calculateLineTaxAmount(tempItem), [tempItem]);
    const currentEntryTotal = useMemo(() => calculateLineTotal(tempItem), [tempItem]);


    //search products based on the user input in the item description field. As the user types, this function sends a request to the backend to retrieve matching products, which are then displayed in a dropdown for selection. This enhances the user experience by allowing quick and efficient product selection without needing to navigate away from the current screen.
    const handleSearch = async (value) => {
        setQuery(value);
        if (!value.trim()) {
            setSearchResults([]);
            // Reset inputs when search is cleared
           // setTempItem((prev) => ({ ...prev, discount: 0, quntity: 1, tax: 0, free: 0 }));
           setTempItem(EMPTY_ITEM);
            return;
        }

        try {
            const res = await axios.get(`http://localhost:5000/api/sales/search?q=${value}`);
            if (res.data.success) {

                setSearchResults(res.data.products || []);
            }
        } catch (err) {
            console.error('Search error', err);
        }
    };

    // const res = await axios.get('http://localhost:5000/api/inventory/sales/search', {
    //     params: { q: term }
    // });

    // Function to handle changes in the unit selection for the item being added. When the user selects a different unit, this function retrieves the conversion factor for that unit relative to the base unit and updates the unit price accordingly. This ensures that the pricing remains accurate regardless of the unit selected by the user.
    const handleUnitChange = async (newUnit) => {
        if (!tempItem.p_id) {
            setTempItem((prev) => ({ ...prev, p_unit: newUnit }));
            return;
        }

        // Find the selected unit object from allUnits array
        const selectedUnitObj = allUnits.find((u) => {
            const unitName = typeof u === 'string' ? u : u.Unit_Name;
            return unitName === newUnit;
        });

        setTempItem((prev) => {
            // Get conversion factor from the selected unit object
            const conversionFactor = selectedUnitObj?.Unit_Conversion || 1;
            const nextPrice = toNumber(prev.base_unit_price) * toNumber(conversionFactor);

            return {
                ...prev,
                conversionFactor: conversionFactor,
                p_unit: newUnit,
                unit_price: nextPrice,
            };
        });
    };

    // Function to handle the selection of a product from the search results. When a product is selected, this function updates the temporary item state with the details of the selected product, including its code, name, base unit price, default unit, and tax rate. This allows the user to quickly populate the item details for adding to the cart without manually entering all the information.
    const selectProduct = (product) => {
        setTempItem((prev) => ({
            ...prev,
            discount_allowed: product.p_type === 'Company' && priceLevel === 'Wholesale' ? true : false,
            p_id: product.p_id,
            p_code: product.p_code,
            p_name: product.p_name,
            base_unit_price: priceLevel === "Retail" ? toNumber(product.retail_price) : toNumber(product.wholesale_price),
            unit_price: priceLevel === "Retail" ? toNumber(product.retail_price) : toNumber(product.wholesale_price),
            p_unit: '',
            tax: toNumber(product.tax_rate),
            conversionFactor: 1, // Base unit has conversion factor of 1
        }));
        setQuery(product.p_name);
        setSearchResults([]);
        setSelectedProduct(product); // Set the selected product for InformationBox
        setError(null); // Clear any previous errors
    };


    // Function to add the currently entered item (tempItem) to the cart. This function first checks if the item has a valid product code, then calculates the subtotal, tax amount, and total for the item before adding it to the cart. After adding the item, it resets the temporary item state and clears the search query, allowing the user to easily add another item.
    const hydrateComputedFields = (item) => {
        const subTotal = calculateLineSubtotal(item);
        const taxAmount = calculateLineTaxAmount(item);
        const total = subTotal + taxAmount;
        return { ...item, subTotal, taxAmount, total };
    };

    // Function to add the currently entered item (tempItem) to the cart. This function first checks if the item has a valid product code, then calculates the subtotal, tax amount, and total for the item before adding it to the cart. After adding the item, it resets the temporary item state and clears the search query, allowing the user to easily add another item.
    const addItem = () => {
        if (!tempItem.p_code) {
            console.warn('Cannot add item: no product code');
            return;
        }

        // Check if there is any error related to quantity
        if (error?.field === 'quantity' || (error?.message && error.message.includes('available'))) {
            console.warn('Cannot add item: quantity error exists');
            return;
        }

        // Check for duplicates (same product ID AND same unit)
        const isDuplicate = cartItems.some(item =>
            item.p_id === tempItem.p_id && item.p_unit === tempItem.p_unit
        );

        if (isDuplicate) {
            setError({
                field: 'general',
                message: `Item "${tempItem.p_name}" (${tempItem.p_unit}) is already in the cart. Please update the existing quantity instead.`
            });
            return;
        }

        // NEW: Check total stock consumption across all units of this product in BASE UNIT
        const newItemQtyInBaseUnit = toNumber(tempItem.quntity) * (tempItem.conversionFactor || 1);
        
        // Calculate total quantity already in cart for this product (in base unit)
        const totalInCartBaseUnit = getCartBaseQtyForProduct(tempItem.p_id);

        // Total would be if we add this item
        const totalAfterAdd = totalInCartBaseUnit + newItemQtyInBaseUnit;

        // Check against available quantity
        if (availableQuantity !== null && totalAfterAdd > availableQuantity) {
            const remainingQty = Math.max(0, availableQuantity - totalInCartBaseUnit);
            const baseUnitName = tempItem.base_unit_name || 'base unit';
           
            setError({
                field: 'general',
                message: totalInCartBaseUnit > 0
                    ? `Your cart already has ${totalInCartBaseUnit} ${baseUnitName} of ${tempItem.p_name}. You entered ${tempItem.quntity} ${tempItem.p_unit} (${newItemQtyInBaseUnit} ${baseUnitName}), but only ${remainingQty} ${baseUnitName} is still available in ${location}.`
                    : `Only ${availableQuantity} ${baseUnitName} available in ${location}. You entered ${tempItem.quntity} ${tempItem.p_unit} (${newItemQtyInBaseUnit} ${baseUnitName}).`
            });
            return;
        }

        const newItem = {
            ...hydrateComputedFields(tempItem),
            id: Date.now(),
        };

        setCartItems([...cartItems, newItem]);
        setTempItem(EMPTY_ITEM);
        setQuery('');
        setAvailableQuantity(null);
        setError(null);
        setSelectedProduct(null); // Clear currently selected product so InformationBox resets
        setInformation({}); // Clear information state passed to InformationBox
    };

    // Function to update a specific field of an item in the cart based on user input. When the user changes a value (like quantity, price, discount, etc.) for an item in the cart, this function updates that field and recalculates the subtotal, tax amount, and total for that item to ensure that the cart reflects the most current and accurate information.
     const updateCartItem = (index, field, value) => {
        const updatedCart = [...cartItems];
        const item = updatedCart[index];

        if (field === 'quntity') {
            const numQty = toNumber(value);
            const conversionFactor = item.conversionFactor || 1;
            const convertedQty = numQty * conversionFactor;
            const otherCartBaseQty = getCartBaseQtyForProduct(item.p_id, item.id);
            const remainingQty = availableQuantity !== null ? Math.max(0, availableQuantity - otherCartBaseQty) : null;

            if (remainingQty !== null && item.p_id === (tempItem.p_id || selectedProduct?.p_id) && convertedQty > remainingQty) {
                const baseUnitName = item.base_unit_name || tempItem.base_unit_name || 'base unit';
                setError({
                    field: 'general',
                    message: otherCartBaseQty > 0
                        ? `Your cart already has ${otherCartBaseQty} ${baseUnitName} of ${item.p_name}. You entered ${numQty} ${item.p_unit} (${convertedQty} ${baseUnitName}), but only ${remainingQty} ${baseUnitName} is still available in ${location}.`
                        : `Only ${availableQuantity} ${baseUnitName} available in ${location}. You entered ${numQty} ${item.p_unit} (${convertedQty} ${baseUnitName}).`
                });
                // Reset to 0 to prevent bypassing validation
                updatedCart[index][field] = 0;
            } else {
                if (error?.message?.includes('available in')) {
                    setError({ field: null, message: null });
                }
                updatedCart[index][field] = value;
            }
        } else {
            updatedCart[index][field] = value;
        }

        updatedCart[index] = hydrateComputedFields(updatedCart[index]);
        setCartItems(updatedCart);
    };


    //fuction to get availabale quntity of the product in inventory when user select the product from search result
    const fetchProductQuantity = async (productId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/sales/product-quantity/${productId}`);
            console.log('Product Quantity Response:', res.data);
            if (res.data.success) {
                const shopQty = toNumber(res.data.shopQty);
                const productionQty = toNumber(res.data.productionQty);
                const totalQty = toNumber(res.data.totalQty);

                let qtyToCheck = 0;
                if (location === 'Shop') {
                    qtyToCheck = shopQty;
                } else if (location === 'Production') {
                    qtyToCheck = productionQty;
                } else {
                    qtyToCheck = totalQty;
                }

                setAvailableQuantity(qtyToCheck);

                // Auto-check if out of stock
                if (qtyToCheck <= 0) {
                    setError({ field: 'general', message: `Product is out of stock in ${location}` });
                    setTempItem(prev => ({ ...prev, quntity: 0 }));
                }
            }
        }
        catch (error) {
            console.error("Error fetching product quantity:", error);
        }
    };


    //useEffect to call fetchProductQuantity when tempItem.p_id, selectedProduct, or location changes
    useEffect(() => {
        const productId = tempItem.p_id || selectedProduct?.p_id;
        if (productId) {
            fetchProductQuantity(productId);
        }
        else {
            setAvailableQuantity(null);
        }
    }, [tempItem.p_id, selectedProduct?.p_id, location]);



    // Monitor error state changes
    useEffect(() => {
        console.log('Error state changed:', error);
    }, [error]);

    // Monitor availableQuantity changes
    useEffect(() => {
        console.log('Available quantity updated:', availableQuantity);
    }, [availableQuantity]);

    // Update price when priceLevel changes if an item is selected
    useEffect(() => {
        if (tempItem.p_id && tempItem.base_unit_price) {
            // Fetch the full product details to get both retail and wholesale prices
            const fetchProductPrices = async () => {
                try {
                    const res = await axios.get(`http://localhost:5000/api/sales/search?q=${tempItem.p_code}`);
                    if (res.data.success && res.data.products.length > 0) {
                        const product = res.data.products[0];
                        const newPrice = priceLevel === "Retail" ? toNumber(product.retail_price) : toNumber(product.wholesale_price);
                        // Also update discount_allowed based on new price level
                        const newDiscountAllowed = product.p_type === 'Company' && priceLevel === 'Wholesale' ? true : false;
                        setTempItem((prev) => ({
                            ...prev,
                            base_unit_price: newPrice,
                            unit_price: newPrice * (prev.conversionFactor || 1),
                            discount_allowed: newDiscountAllowed,
                            discount: 0  // Reset discount to 0 when price level changes
                        }));
                    }
                } catch (err) {
                    console.error('Error fetching product prices:', err);
                }
            };
            
            fetchProductPrices();
        }
    }, [priceLevel]);


    //set error when user input quntity more than available quntity in stock and also when user change the product selection reset the error
    const handleQtyChange = (qty) => {
        const numQty = toNumber(qty);

        setTempItem((prev) => {
            const conversionFactor = prev.conversionFactor || 1;
            const convertedQty = numQty * conversionFactor; // Convert to base unit quantity for comparison
            const alreadyInCartBaseQty = getCartBaseQtyForProduct(prev.p_id || selectedProduct?.p_id);
            const remainingQty = availableQuantity !== null ? Math.max(0, availableQuantity - alreadyInCartBaseQty) : null;

            console.log('Qty Change Details:', {
                inputQty: qty,
                numQty,
                conversionFactor,
                convertedQty,
                availableQuantity,
                alreadyInCartBaseQty,
                hasError: availableQuantity !== null && convertedQty > availableQuantity
            });

            if (remainingQty !== null && convertedQty > remainingQty) {
                const baseUnitName = prev.base_unit_name || 'base unit';
                setError({
                    field: 'general',
                    message: alreadyInCartBaseQty > 0
                        ? `Your cart already has ${alreadyInCartBaseQty} ${baseUnitName} of ${prev.p_name || 'this item'}. You entered ${numQty} ${prev.p_unit || 'unit'} (${convertedQty} ${baseUnitName}), but only ${remainingQty} ${baseUnitName} is still available in ${location}.`
                        : `Only ${availableQuantity} ${baseUnitName} available in ${location}. You entered ${numQty} ${prev.p_unit || 'unit'} (${convertedQty} ${baseUnitName}).`
                });
                return { ...prev, quntity: 0 };
            } else {
                if (error?.message?.includes('available')) {
                    setError({ field: null, message: null });
                }
                return { ...prev, quntity: numQty };
            }
        });

    };



    //display error  when 
    const handleOnFocusDiscount = () => {
        if (!tempItem.discount_allowed) {
            setTempItem((prev) => ({ ...prev, discount: 0 }));
            setError({ field: 'general', message: 'Discount not allowed for this product, Discount only for Company and price level is Wholesale' });
        }
    };

    //display error when user tries to edit discount on cart item if discount is not allowed
    const handleOnFocusCartItemDiscount = (item) => {
        if (!item.discount_allowed) {
            setError({ field: 'general', message: 'Discount not allowed for this product, Discount only for Company and price level is Wholesale' });
        }
    };




    return (
        <div className='card border-0 shadow-sm'>
            {/* put toggle button here to  indicate this is a resale or wholesale */}

            <div className='card-header bg-white py-2' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h6 className='mb-0 fw-bold'><Package size={18} className='me-2 text-primary' /> {t('itemTable.title')}</h6>

                {/* Retail/Wholesale Toggle Button */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    padding: '6px 8px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '6px',
                    border: '1px solid #dee2e6'
                }}>
                    <button
                        onClick={() => setPriceLevel('Retail')}
                        style={{
                            padding: '6px 14px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '13px',
                            backgroundColor: priceLevel === 'Retail' ? '#007bff' : 'transparent',
                            color: priceLevel === 'Retail' ? 'white' : '#6c757d',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            if (priceLevel !== 'Retail') {
                                e.target.style.backgroundColor = '#e9ecef';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (priceLevel !== 'Retail') {
                                e.target.style.backgroundColor = 'transparent';
                            }
                        }}
                    >
                        🛍️ {t('itemTable.retail')}
                    </button>
                    <button
                        onClick={() => setPriceLevel('Wholesale')}
                        style={{
                            padding: '6px 14px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '13px',
                            backgroundColor: priceLevel === 'Wholesale' ? '#28a745' : 'transparent',
                            color: priceLevel === 'Wholesale' ? 'white' : '#6c757d',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            if (priceLevel !== 'Wholesale') {
                                e.target.style.backgroundColor = '#e9ecef';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (priceLevel !== 'Wholesale') {
                                e.target.style.backgroundColor = 'transparent';
                            }
                        }}
                    >
                        📦 {t('itemTable.wholesale')}
                    </button>
                </div>
            </div>

            {/* Local alert displays removed to use global alerts in POS.jsx */}


            <div className='table-responsive' style={{ minHeight: '300px', overflowX: 'auto' }}>
                <table className='table table-sm table-hover align-middle mb-0' style={{ width: '100%', minWidth: '1000px' }}>
                    <thead className='bg-light text-secondary small text-uppercase'>
                        <tr>
                            <th className='text-center' style={{ width: '40px' }}>#</th>
                            <th style={{ width: '110px' }}>{t('itemTable.itemCode')}</th>
                            <th style={{ width: 'auto' }}>{t('itemTable.description')}</th>
                            <th style={{ width: '100px' }}>{t('itemTable.unit')}</th>
                            <th className='text-end' style={{ width: '90px' }}>{t('itemTable.price')}</th>
                            <th className='text-end' style={{ width: '70px' }}>{t('itemTable.discount')}</th>
                            <th className='text-end' style={{ width: '70px' }}>{t('itemTable.tax')}</th>
                            <th className='text-center' style={{ width: '80px' }}>{t('itemTable.qty')}</th>
                            <th className='text-center' style={{ width: '70px' }}>{t('itemTable.free')}</th>
                            <th className='text-end' style={{ width: '100px' }}>{t('itemTable.total')}</th>
                            <th className='text-center' style={{ width: '50px' }}>{t('itemTable.action')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* INPUT ROW */}
                        <tr style={{ backgroundColor: inputRowBg, borderBottom: '2px solid #dee2e6' }}>
                            <td className='text-center text-success fw-bold'>+</td>
                            <td>
                                <input readOnly className='form-control form-control-sm bg-light' value={tempItem.p_code} placeholder='Code' />
                            </td>
                            <td className='position-relative' style={{ width: '300px' }}>
                                <input
                                    ref={searchInputRef}
                                    className='form-control form-control-sm'
                                    placeholder={t('itemTable.searchPlaceholder')}
                                    value={query}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    style={{ width: '100%' }}
                                />
                                {searchResults.length > 0 && (
                                    <Portal targetElement={searchInputRef}>
                                        <ul className='list-group shadow-lg' style={{ maxHeight: '300px', overflowY: 'auto', width: '400px' }}>
                                            {searchResults.map((product) => (
                                                <li
                                                    key={product.p_id}
                                                    onClick={() => selectProduct(product)}
                                                    className='list-group-item list-group-item-action small py-2 cursor-pointer search-result-item'
                                                >
                                                    <div className='fw-bold' style={{ color: product.p_type === 'Company' ? '#0d6efd' : '#198754' }}>{product.p_name}</div>
                                                    <div className='text-muted' style={{ fontSize: '12px' }}>
                                                        {product.image_path && <img src={`http://localhost:5000${product.image_path}`} style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px' }} />}
                                                        Code: {product.p_code} | Price: {priceLevel == "Retail" ? toNumber(product.retail_price).toFixed(2) : toNumber(product.wholesale_price).toFixed(2)} | Tax: {toNumber(product.tax_rate).toFixed(2)}% |<br /> Type : {product.p_type}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </Portal>
                                )}
                            </td>
                            <td>
                                <select
                                    className='form-select form-select-sm'
                                    value={tempItem.p_unit}
                                    onChange={(e) => handleUnitChange(e.target.value)}
                                >
                                    {/*default option if no  unit are loaded yet*/}
                                    {allUnits.length === 0 && <option value="Packet">Packet</option>}
                                    {allUnits.map((unit) => (
                                        <option key={unit.Unit_Name} value={unit.Unit_Name}>{unit.Unit_Name}</option>
                                    ))}
                                </select>
                            </td>
                            <td><input type='number' className='form-control form-control-sm text-end' value={tempItem.unit_price} onChange={(e) => setTempItem({ ...tempItem, unit_price: e.target.value })} readOnly /></td>

                            <td><input type='number' min='0' className='form-control form-control-sm text-end' value={tempItem.discount} onChange={(e) => setTempItem({ ...tempItem, discount: Math.max(0, parseFloat(e.target.value) || 0) })} onFocus={handleOnFocusDiscount} readOnly={!tempItem.discount_allowed} /></td>
                            <td><input type='number' className='form-control form-control-sm text-end' value={tempItem.tax} onChange={(e) => setTempItem({ ...tempItem, tax: e.target.value })} readOnly /></td>
                            <td>
                                <input
                                    type='number'
                                    min='0'
                                    className='form-control form-control-sm text-center fw-bold'
                                    value={tempItem.quntity}
                                    onChange={(e) => handleQtyChange(Math.max(0, parseFloat(e.target.value) || 0).toString())}
                                    style={error?.field === 'quantity' ? { borderColor: '#dc3545', borderWidth: '2px' } : {}}
                                />
                            </td>
                            <td><input type='number' min='0' className='form-control form-control-sm text-center' value={tempItem.free} onChange={(e) => setTempItem({ ...tempItem, free: Math.max(0, parseFloat(e.target.value) || 0) })} /></td>
                            <td className='text-end fw-bold text-primary'>{currentEntryTotal.toFixed(2)}</td>
                            <td className='text-center'>
                                <button
                                    onClick={addItem}
                                    className='btn btn-primary btn-sm'
                                    disabled={!tempItem.p_code || !tempItem.p_unit || (error?.field === 'general' && error?.message?.toLowerCase().includes('available'))}
                                    title={error?.message || "Add to cart"}
                                >
                                    <Plus size={16} />
                                </button>
                            </td>

                        </tr>

                        {/* CART ITEMS */}
                        {cartItems.map((item, index) => (
                            <tr key={item.id} className='border-bottom' onClick={() => setSelectedProduct({ p_id: item.p_id, p_name: item.p_name, p_code: item.p_code })} style={{ cursor: 'pointer' }}>
                                <td className='text-center text-muted small'>{index + 1}</td>
                                <td className='small'>{item.p_code}</td>
                                <td className='fw-medium small'>{item.p_name}</td>
                                <td className='small'>{item.p_unit}</td>
                                <td><input type='number' className='form-control form-control-sm border-0 text-end p-0' value={item.unit_price} onChange={(e) => updateCartItem(index, 'unit_price', e.target.value)} readOnly /></td>
                                <td><input type='number' min='0' className='form-control form-control-sm border-0 text-end p-0' value={item.discount} onChange={(e) => updateCartItem(index, 'discount', Math.max(0, parseFloat(e.target.value) || 0))} onFocus={() => handleOnFocusCartItemDiscount(item)} readOnly={!item.discount_allowed} /></td>
                                <td><input type='number' className='form-control form-control-sm border-0 text-end p-0' value={item.tax} onChange={(e) => updateCartItem(index, 'tax', e.target.value)} readOnly /></td>
                                <td><input type='number' min='0' className='form-control form-control-sm border-0 text-center fw-bold text-success p-0' value={item.quntity} onChange={(e) => updateCartItem(index, 'quntity', Math.max(0, parseFloat(e.target.value) || 0))} /></td>
                                <td><input type='number' min='0' className='form-control form-control-sm border-0 text-center p-0' value={item.free} onChange={(e) => updateCartItem(index, 'free', Math.max(0, parseFloat(e.target.value) || 0))} /></td>
                                <td className='text-end fw-bold small'>{toNumber(item.total).toFixed(2)}</td>
                                <td className='text-center'>
                                    <button onClick={() => setCartItems(cartItems.filter((i) => i.id !== item.id))} className='btn btn-link text-danger p-0 border-0'><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>


    );
};

export default ItemTable;


// {
//   // Product Identification
//   p_id: '12345',                    // Product ID from database
//   p_code: 'PROD-001',               // Product code
//   p_name: 'Milk (1L)',              // Product name
  
//   // Unit & Conversion
//   p_unit: 'Litre',                  // Selected unit (e.g., Litre, Packet)
//   conversionFactor: 1.5,            // Unit conversion ratio relative to base unit
  
//   // Pricing
//   base_unit_price: 200.00,          // Original price at base unit
//   unit_price: 300.00,               // Calculated price at selected unit
  
//   // Quantity & Discounts
//   quntity: 5,                       // Ordered quantity
//   free: 1,                          // Free items (promotional)
//   discount: 10,                     // Discount % (only for Wholesale Company)
//   discount_allowed: true,           // Permission flag (Company + Wholesale)
  
//   // Tax
//   tax: 15,                          // Tax % (read-only)
  
//   // Computed/Calculated Fields
//   subTotal: 1350.00,                // (Qty - Free) × Unit Price × (1 - Discount%)
//   taxAmount: 202.50,                // SubTotal × Tax%
//   total: 1552.50,                   // SubTotal + Tax Amount
  
//   // Line Item Identifier
//   id: 1715478523456                 // Timestamp-based unique ID for cart
// }