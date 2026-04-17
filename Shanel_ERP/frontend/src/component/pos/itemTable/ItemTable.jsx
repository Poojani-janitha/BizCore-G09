import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Plus, Trash2, Package } from 'lucide-react';
import axios, { all } from 'axios';
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

const ItemTable = ({ cartItems, setCartItems }) => {
    const inputRowBg = '#f8faf9';
    const [query, setQuery] = useState('');
    const [allUnits, setAllUnits] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [tempItem, setTempItem] = useState(EMPTY_ITEM);
    
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
                if (res.data.success) {
                    
                    setAllUnits(res.data.units || []);
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
                p_unit: newUnit,
                unit_price: nextPrice,
            };
        });
    };

    // Function to handle the selection of a product from the search results. When a product is selected, this function updates the temporary item state with the details of the selected product, including its code, name, base unit price, default unit, and tax rate. This allows the user to quickly populate the item details for adding to the cart without manually entering all the information.
    const selectProduct = (product) => {
        setTempItem((prev) => ({
            ...prev,
            p_id: product.p_id,
            p_code: product.p_code,
            p_name: product.p_name,
            base_unit_price: toNumber(product.retail_price),
            unit_price: toNumber(product.retail_price),
            p_unit: product.base_unit || allUnits[0] || 'Packet',
            tax: toNumber(product.tax_rate),
        }));
        setQuery(product.p_name);
        setSearchResults([]);
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
            return;
        }

        const newItem = {
            ...hydrateComputedFields(tempItem),
            id: Date.now(),
        };

        setCartItems([...cartItems, newItem]);
        setTempItem(EMPTY_ITEM);
        setQuery('');
    };

    // Function to update a specific field of an item in the cart based on user input. When the user changes a value (like quantity, price, discount, etc.) for an item in the cart, this function updates that field and recalculates the subtotal, tax amount, and total for that item to ensure that the cart reflects the most current and accurate information.
    const updateCartItem = (index, field, value) => {
        const updatedCart = [...cartItems];
        updatedCart[index][field] = value;
        updatedCart[index] = hydrateComputedFields(updatedCart[index]);
        setCartItems(updatedCart);
    };

    return (
        <div className='card border-0 shadow-sm'>
        <div className='card-header bg-white py-2'>
            <h6 className='mb-0 fw-bold'><Package size={18} className='me-2 text-primary' /> Sales Items</h6>
        </div>
   
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
                                                <div className='fw-bold'>{product.p_name}</div>
                                                <div className='text-muted' style={{fontSize: '12px'}}>
                                                    <img src={product.image_path } style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px' }} />
                                                    Code: {product.p_code} | Price: {toNumber(product.retail_price).toFixed(2)} | Tax: {toNumber(product.tax_rate).toFixed(2)}%
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
                        <td><input type='number' className='form-control form-control-sm text-end' value={tempItem.discount} onChange={(e) => setTempItem({ ...tempItem, discount: e.target.value })} /></td>
                        <td><input type='number' className='form-control form-control-sm text-end' value={tempItem.tax} onChange={(e) => setTempItem({ ...tempItem, tax: e.target.value })} readOnly /></td>
                        <td><input type='number' className='form-control form-control-sm text-center fw-bold' value={tempItem.quntity} onChange={(e) => setTempItem({ ...tempItem, quntity: e.target.value })} /></td>
                        <td><input type='number' className='form-control form-control-sm text-center' value={tempItem.free} onChange={(e) => setTempItem({ ...tempItem, free: e.target.value })} /></td>
                        <td className='text-end fw-bold text-primary'>{currentEntryTotal.toFixed(2)}</td>
                        <td className='text-center'>
                            <button onClick={addItem} className='btn btn-primary btn-sm'><Plus size={16} /></button>
                        </td>
                    </tr>

                    {/* CART ITEMS */}
                    {cartItems.map((item, index) => (
                        <tr key={item.id} className='border-bottom'>
                            <td className='text-center text-muted small'>{index + 1}</td>
                            <td className='small'>{item.p_code}</td>
                            <td className='fw-medium small'>{item.p_name}</td>
                            <td className='small'>{item.p_unit}</td>
                            <td><input type='number' className='form-control form-control-sm border-0 text-end p-0' value={item.unit_price} onChange={(e) => updateCartItem(index, 'unit_price', e.target.value)} /></td>
                            <td><input type='number' className='form-control form-control-sm border-0 text-end p-0' value={item.discount} onChange={(e) => updateCartItem(index, 'discount', e.target.value)} /></td>
                            <td><input type='number' className='form-control form-control-sm border-0 text-end p-0' value={item.tax} onChange={(e) => updateCartItem(index, 'tax', e.target.value)} readOnly/></td>
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