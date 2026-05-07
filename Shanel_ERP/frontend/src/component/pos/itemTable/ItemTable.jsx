import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Plus, Trash2, Package } from 'lucide-react';
import axios from 'axios';
import './itemTable.css';
import Portal from './Portal';

const EMPTY_ITEM = {
    p_id: '',
    p_code: '',
    p_name: '',
    p_unit: 'Packet',
    base_unit_price: 0,
    unit_price: 0,
    discount: 0,
    tax: 0,
    quntity: 1,
    free: 0,
};

const toNumber = (value) => parseFloat(value) || 0;

const ItemTable = ({ cartItems, setCartItems, priceLevel, setPriceLevel, setSelectedProduct, error, setError }) => {
    const inputRowBg = '#f8faf9';
    const [query, setQuery] = useState('');
    const [allUnits, setAllUnits] = useState([]);// All available units for the selected product
    const [searchResults, setSearchResults] = useState([]);// For product search results dropdown
    const [tempItem, setTempItem] = useState(EMPTY_ITEM);// Temporary state for the item being added to the cart
    const [availableQuantity, setAvailableQuantity] = useState(null); // Available quantity for the selected product
    const searchInputRef = useRef(null);

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
                    setAllUnits(res.data.units || []);
                    console.log('Units set to:', res.data.units);
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


    const currentEntryTaxAmount = useMemo(() => calculateLineTaxAmount(tempItem), [tempItem]);
    const currentEntryTotal = useMemo(() => calculateLineTotal(tempItem), [tempItem]);


    //search products based on the user input in the item description field. As the user types, this function sends a request to the backend to retrieve matching products, which are then displayed in a dropdown for selection. This enhances the user experience by allowing quick and efficient product selection without needing to navigate away from the current screen.
    const handleSearch = async (value) => {
        setQuery(value);
        if (!value.trim()) {
            setSearchResults([]);
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
            discount_allowed: product.p_type === 'Company' ? true : false,
            p_id: product.p_id,
            p_code: product.p_code,
            p_name: product.p_name,
            base_unit_price: priceLevel === "Retail" ? toNumber(product.retail_price) : toNumber(product.wholesale_price),
            unit_price: priceLevel === "Retail" ? toNumber(product.retail_price) : toNumber(product.wholesale_price),
            p_unit: product.base_unit || allUnits[0]?.Unit_Name || 'Packet',
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


        //check if there is any error related to quantity before adding the item to the cart. If there is an error (like quantity exceeding available stock), it prevents the item from being added and logs a warning. This ensures that only valid items with correct quantities are added to the cart, maintaining data integrity and preventing issues during checkout.
        if (error?.field === 'quantity') {
            console.warn('Cannot add item: quantity error exists');
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
    };

    // Function to update a specific field of an item in the cart based on user input. When the user changes a value (like quantity, price, discount, etc.) for an item in the cart, this function updates that field and recalculates the subtotal, tax amount, and total for that item to ensure that the cart reflects the most current and accurate information.
    const updateCartItem = (index, field, value) => {
        const updatedCart = [...cartItems];
        updatedCart[index][field] = value;
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

                if (location === 'Shop') {
                    setAvailableQuantity(shopQty);
                    console.log('Available quantity set to:', shopQty);
                }
                else if (location === 'Production') {
                    setAvailableQuantity(productionQty);
                    console.log('Available quantity set to:', productionQty);
                } else {
                    setAvailableQuantity(totalQty);
                    console.log('Available quantity set to:', totalQty);
                }
            }
        }
        catch (error) {
            console.error("Error fetching product quantity:", error);
        }
    };

    //useEffect to call fetchProductQuantity when tempItem.p_id changes
    useEffect(() => {
        if (tempItem.p_id) {
            console.log('Fetching quantity for product:', tempItem.p_id);
            fetchProductQuantity(tempItem.p_id);
        }
        else {
            setAvailableQuantity(null);
        }
    }, [tempItem.p_id]);

    // Monitor error state changes
    useEffect(() => {
        console.log('Error state changed:', error);
    }, [error]);

    // Monitor availableQuantity changes
    useEffect(() => {
        console.log('Available quantity updated:', availableQuantity);
    }, [availableQuantity]);


    //set error when user input quntity more than available quntity in stock and also when user change the product selection reset the error
    const handleQtyChange = (qty) => {
        const numQty = toNumber(qty);
        setTempItem((prev) => ({ ...prev, quntity: numQty }));

        const conversionFactor = tempItem.conversionFactor || 1;
        const convertedQty = numQty / conversionFactor; // Convert to base unit quantity for comparison

        console.log('Qty Change Details:', {
            inputQty: qty,
            numQty,
            conversionFactor,
            convertedQty,
            availableQuantity,
            hasError: availableQuantity !== null && convertedQty > availableQuantity
        });

        if (availableQuantity !== null && convertedQty > availableQuantity) {
            console.log('ERROR: Quantity exceeds available stock');
            setError({ field: 'quantity', message: `Only ${availableQuantity} units available in stock` });
        }
        else {
            console.log(' Quantity is valid');
            setError(null);
        }
    };

    //display error  when 
    const handleOnFocusDiscount = () => {
        if (!tempItem.discount_allowed) {
            setError({ field: 'discount', message: 'Discount not allowed for this product' });
        }
    };



    return (
        <div className='card border-0 shadow-sm'>
            {/* put toggle button here to  indicate this is a resale or wholesale */}

            <div className='card-header bg-white py-2' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h6 className='mb-0 fw-bold'><Package size={18} className='me-2 text-primary' /> Sales Items</h6>

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
                        🛍️ Retail
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
                        📦 Wholesale
                    </button>
                </div>
            </div>

            {/* Error message display */}
            {error?.field === 'quantity' && (
                <div className='alert alert-danger alert-dismissible fade show mx-3 mt-3' role='alert'>
                    <strong> Quantity Error:</strong> {error.message}
                </div>
            )}
            {error?.field === 'discount' && (
                <div className='alert alert-warning alert-dismissible fade show mx-3 mt-3' role='alert'>
                    <strong> Discount Not Allowed:</strong> {error.message}
                </div>
            )}

            <div className='table-responsive' style={{ minHeight: '300px', overflowX: 'auto' }}>
                <table className='table table-sm table-hover align-middle mb-0' style={{ width: '100%', minWidth: '1000px' }}>
                    <thead className='bg-light text-secondary small text-uppercase'>
                        <tr>
                            <th className='text-center' style={{ width: '40px' }}>#</th>
                            <th style={{ width: '110px' }}>Item Code</th>
                            <th style={{ width: 'auto' }}>Description</th>
                            <th style={{ width: '100px' }}>Unit</th>
                            <th className='text-end' style={{ width: '90px' }}>Price</th>
                            <th className='text-end' style={{ width: '70px' }}>Dis%</th>
                            <th className='text-end' style={{ width: '70px' }}>Tax%</th>
                            <th className='text-center' style={{ width: '80px' }}>Qty</th>
                            <th className='text-center' style={{ width: '70px' }}>Free</th>
                            <th className='text-end' style={{ width: '100px' }}>Total</th>
                            <th className='text-center' style={{ width: '50px' }}>Action</th>
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
                                    placeholder='Search item...'
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
                            <td><input type='number' className='form-control form-control-sm text-end' value={tempItem.unit_price} onChange={(e) => setTempItem({ ...tempItem, unit_price: e.target.value })} /></td>
                            <td><input type='number' className='form-control form-control-sm text-end' value={tempItem.discount} onChange={(e) => setTempItem({ ...tempItem, discount: e.target.value })} onFocus={handleOnFocusDiscount} /></td>
                            <td><input type='number' className='form-control form-control-sm text-end' value={tempItem.tax} onChange={(e) => setTempItem({ ...tempItem, tax: e.target.value })} readOnly /></td>
                            <td>
                                <input
                                    type='number'
                                    className='form-control form-control-sm text-center fw-bold'
                                    value={tempItem.quntity}
                                    onChange={(e) => handleQtyChange(e.target.value)}
                                    style={error?.field === 'quantity' ? { borderColor: '#dc3545', borderWidth: '2px' } : {}}
                                />
                            </td>
                            <td><input type='number' className='form-control form-control-sm text-center' value={tempItem.free} onChange={(e) => setTempItem({ ...tempItem, free: e.target.value })} /></td>
                            <td className='text-end fw-bold text-primary'>{currentEntryTotal.toFixed(2)}</td>
                            <td className='text-center'>
                                <button onClick={addItem} className='btn btn-primary btn-sm'><Plus size={16} /></button>
                            </td>
                        </tr>

                        {/* CART ITEMS */}
                        {cartItems.map((item, index) => (
                            <tr key={item.id} className='border-bottom' onClick={() => setSelectedProduct({ p_id: item.p_id, p_name: item.p_name, p_code: item.p_code })} style={{ cursor: 'pointer' }}>
                                <td className='text-center text-muted small'>{index + 1}</td>
                                <td className='small'>{item.p_code}</td>
                                <td className='fw-medium small'>{item.p_name}</td>
                                <td className='small'>{item.p_unit}</td>
                                <td><input type='number' className='form-control form-control-sm border-0 text-end p-0' value={item.unit_price} onChange={(e) => updateCartItem(index, 'unit_price', e.target.value)} /></td>
                                <td><input type='number' className='form-control form-control-sm border-0 text-end p-0' value={item.discount} onChange={(e) => updateCartItem(index, 'discount', e.target.value)} /></td>
                                <td><input type='number' className='form-control form-control-sm border-0 text-end p-0' value={item.tax} onChange={(e) => updateCartItem(index, 'tax', e.target.value)} readOnly /></td>
                                <td><input type='number' className='form-control form-control-sm border-0 text-center fw-bold text-success p-0' value={item.quntity} onChange={(e) => updateCartItem(index, 'quntity', e.target.value)} /></td>
                                <td><input type='number' className='form-control form-control-sm border-0 text-center p-0' value={item.free} onChange={(e) => updateCartItem(index, 'free', e.target.value)} /></td>
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