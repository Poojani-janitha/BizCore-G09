// import React, { useState, useMemo } from 'react';
// import { Plus, Trash2, Package } from 'lucide-react';
// import axios from 'axios';

// const ItemTable = ({ cartItems, setCartItems }) => {
//     const inputRowBg = '#f8faf9';
//     const [query, setQuery] = useState('');
//     const [allUnits, setAllUnits] = useState([]); //to store units for the dropdown
//     const [searchResults, setSearchResults] = useState([]);
//     const [tempItem, setTempItem] = useState({
//         p_code: '', p_name: '', p_unit: 'Packet',
//         unit_price: 0, discount: 0, tax: 0, quntity: 1, free: 0
//     });

//     const calculateLineSubtotal = (item) => {
//         const q = parseFloat(item.quntity) || 0;
//         const f = parseFloat(item.free) || 0;
//         const p = parseFloat(item.unit_price) || 0;
//         const d = parseFloat(item.discount) || 0;
//         const chargedQty = Math.max(0, q - f);
//         return (chargedQty * p) * (1 - d / 100);
//     };

//     const calculateLineTaxAmount = (item) => {
//         const lineSubtotal = calculateLineSubtotal(item);
//         const taxRate = parseFloat(item.tax) || 0;
//         return lineSubtotal * (taxRate / 100);
//     };

//     const calculateLineTotal = (item) => calculateLineSubtotal(item) + calculateLineTaxAmount(item);

//     const currentEntryTotal = useMemo(() => calculateLineTotal(tempItem), [tempItem]);

//     const handleSearch = async (value) => {
//         setQuery(value);
//         if (!value.trim()) return setSearchResults([]);
//         try {
//             const res = await axios.get(`http://localhost:5000/api/sales/search?q=${value}`);
//             if (res.data.success) setSearchResults(res.data.products);
//         } catch (err) { console.error("Search error", err); }
//     };


    

//     //retrive all the unit names
//     const handleAllUnits = async () => {
//         try{
//             const res = await axios.get(`http://localhost:5000/api/sales/units`);
//             if(res.data.success) setAllUnits(res.data.units);

//         }catch (error) {
//             console.error("Units fetch error", error);
//         }
//     };

//     // call handleUnit conversion when unit changes to get the conversion factor for the selected unit and product related to the base unit, then use that factor to convert the quantity to the base unit for accurate calculations. This ensures that regardless of the unit selected by the user, the system can correctly calculate totals based on a consistent base unit.
//     const handleUnitConversion = async (productId, unitName) => {
//         try{
//             const res = await axios.get(`http://localhost:5000/api/sales/base-unit?productId=${productId}&unitName=${unitName}`);

//             if(res.data.success) return res.data.conversionQty;
//         } catch (error) {
//             console.error("Unit conversion error", error);
//         }
//     };

//     const selectProduct = (p) => {
//         setTempItem({
//             ...tempItem,
//             p_code: p.p_code,
//             p_name: p.p_name,
//             unit_price: p.retail_price || 0,
//             p_unit: p.p_unit || 'Packet',
//             tax: p.tax_rate || 0
//         });
//         setQuery(p.p_name);
//         setSearchResults([]);
//     };

//     const addItem = () => {
//         if (!tempItem.p_code) return;
//         const newItem = {
//             ...tempItem,
//             subTotal: calculateLineSubtotal(tempItem),
//             taxAmount: calculateLineTaxAmount(tempItem),
//             total: calculateLineTotal(tempItem),
//             id: Date.now()
//         };
//         setCartItems([...cartItems, newItem]);
//         setTempItem({ p_code: '', p_name: '', p_unit: 'Packet', unit_price: 0, discount: 0, tax: 0, quntity: 1, free: 0 });
//         setQuery('');
//     };

//     const updateCartItem = (index, field, value) => {
//         const updatedCart = [...cartItems];
//         updatedCart[index][field] = value;
//         updatedCart[index].subTotal = calculateLineSubtotal(updatedCart[index]);
//         updatedCart[index].taxAmount = calculateLineTaxAmount(updatedCart[index]);
//         updatedCart[index].total = calculateLineTotal(updatedCart[index]);
//         setCartItems(updatedCart);
//     };

//     return (
//         <div className='card border-0 shadow-sm'>
//             <div className='card-header bg-white py-3'>
//                 <h5 className='mb-0'><Package size={20} className="me-2 text-primary"/> Sales Items</h5>
//             </div>
            
         
//             <div className='table-responsive' style={{ minHeight: '300px', overflow: 'visible' }}>
//                 <table className='table table-hover align-middle mb-0' style={{ minWidth: '1100px' }}>
//                     <thead className='bg-light text-secondary small text-uppercase'>
//                         <tr>
//                             <th className="text-center" style={{ width: '50px' }}>#</th>
//                             <th style={{ width: '140px' }}>Item Code</th>
//                             <th>Description</th>
//                             <th style={{ width: '110px' }}>Unit</th>
//                             <th className="text-end" style={{ width: '100px' }}>Price</th>
//                             <th className="text-end" style={{ width: '80px' }}>Dis%</th>
//                             <th className="text-center" style={{ width: '90px' }}>Qty</th>
//                             <th className="text-center" style={{ width: '80px' }}>Free</th>
//                             <th className="text-end" style={{ width: '120px' }}>Total</th>
//                             <th className="text-center" style={{ width: '60px' }}>Action</th>
//                         </tr>
//                     </thead>
//                     <tbody style={{ position: 'relative' }}>
//                         {/* INPUT ROW */}
//                         <tr style={{ backgroundColor: inputRowBg, borderBottom: '2px solid #dee2e6' }}>
//                             <td className='text-center text-success fw-bold'>+</td>
//                             <td><input readOnly className='form-control form-control-sm bg-white' value={tempItem.p_code} placeholder="Code" /></td>
//                             <td className="position-relative">
//                                 <input 
//                                     className='form-control form-control-sm' 
//                                     placeholder='Type to search item...' 
//                                     value={query} 
//                                     onChange={(e) => handleSearch(e.target.value)} 
//                                 />
//                                 {searchResults.length > 0 && (
//                                     <ul className="position-absolute list-group shadow-lg w-100" style={{ zIndex: 9999, top: '100%' }}>
//                                         {searchResults.map(p => (
//                                             <li key={p.p_id} onClick={() => selectProduct(p)} className="list-group-item list-group-item-action small py-2 cursor-pointer">
//                                                 <div className="fw-bold">{p.p_name}</div>
//                                                 <div className="text-muted small">Code: {p.p_code} | Price: {p.retail_price}</div>
//                                             </li>
//                                         ))}
//                                     </ul>
//                                 )}
//                             </td>
//                             <td>
//                                 <select className='form-select form-select-sm' value={tempItem.p_unit} onChange={e => setTempItem({...tempItem, p_unit: e.target.value})}>
//                                     <option value="Packet">Packet</option>
//                                     <option value="Pieces">Pieces</option>
//                                     <option value="Bottle">Bottle</option>
//                                     <option value="kg">kg</option>
//                                 </select>
//                             </td>
//                             <td><input type="number" className='form-control form-control-sm text-end' value={tempItem.unit_price} onChange={e => setTempItem({...tempItem, unit_price: e.target.value})} /></td>
//                             <td><input type="number" className='form-control form-control-sm text-end' value={tempItem.discount} onChange={e => setTempItem({...tempItem, discount: e.target.value})} /></td>
//                             <td><input type="number" className='form-control form-control-sm text-center' value={tempItem.quntity} onChange={e => setTempItem({...tempItem, quntity: e.target.value})} /></td>
//                             <td><input type="number" className='form-control form-control-sm text-center' value={tempItem.free} onChange={e => setTempItem({...tempItem, free: e.target.value})} /></td>
//                             <td className="text-end fw-bold text-primary">{currentEntryTotal.toFixed(2)}</td>
//                             <td className="text-center">
//                                 <button onClick={addItem} className='btn btn-success btn-sm shadow-sm'><Plus size={18} strokeWidth={3}/></button>
//                             </td>
//                         </tr>

//                         {/* CART ITEMS */}
//                         {cartItems.map((item, index) => (
//                             <tr key={item.id} className="border-bottom">
//                                 <td className="text-center text-muted small">{index + 1}</td>
//                                 <td>{item.p_code}</td>
//                                 <td className="fw-medium">{item.p_name}</td>
//                                 <td>{item.p_unit}</td>
//                                 <td><input type="number" className="form-control form-control-sm border-0 text-end" value={item.unit_price} onChange={e => updateCartItem(index, 'unit_price', e.target.value)} /></td>
//                                 <td><input type="number" className="form-control form-control-sm border-0 text-end" value={item.discount} onChange={e => updateCartItem(index, 'discount', e.target.value)} /></td>
//                                 <td><input type="number" className="form-control form-control-sm border-0 text-center fw-bold text-success" value={item.quntity} onChange={e => updateCartItem(index, 'quntity', e.target.value)} /></td>
//                                 <td><input type="number" className="form-control form-control-sm border-0 text-center" value={item.free} onChange={e => updateCartItem(index, 'free', e.target.value)} /></td>
//                                 <td className="text-end fw-bold">{parseFloat(item.total).toFixed(2)}</td>
//                                 <td className="text-center">
//                                     <button onClick={() => setCartItems(cartItems.filter(i => i.id !== item.id))} className="btn btn-link text-danger p-0 border-0"><Trash2 size={16}/></button>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };


// export default ItemTable;

import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Package } from 'lucide-react';
import axios from 'axios';
import './itemTable.css';

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

    // Fetch all units for the dropdown on component mount
    useEffect(() => {
        const handleAllUnits = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/sales/units');
                if (res.data.success) {
                    const normalized = (res.data.units || []).map((unit) =>
                        typeof unit === 'string' ? unit : (unit?.unit_name || unit?.Unit_Name || '')
                    ).filter(Boolean);
                    setAllUnits(normalized);
                }
            } catch (error) {
                console.error('Units fetch error', error);
            }
        };

        handleAllUnits();
    }, []);


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

        try {
            const res = await axios.get(`http://localhost:5000/api/sales/base-unit?productId=${tempItem.p_id}&unitName=${newUnit}`);
            const factor = toNumber(res?.data?.conversionQty);
            const nextPrice = factor > 0 ? toNumber(tempItem.base_unit_price) * factor : toNumber(tempItem.base_unit_price);
            setTempItem((prev) => ({
                ...prev,
                p_unit: newUnit,
                unit_price: nextPrice,
            }));
            return;
        } catch (error) {
            console.error('Unit conversion error', error);
        }

        setTempItem((prev) => ({ ...prev, p_unit: newUnit }));
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
            <div className='card-header bg-white py-3'>
                <h5 className='mb-0'><Package size={20} className='me-2 text-primary' /> Sales Items</h5>
            </div>
           
            <div className='table-responsive' style={{ minHeight: '300px', overflow: 'visible' }}>
                <table className='table table-hover align-middle mb-0' style={{ minWidth: '1320px' }}>
                     {/* header */}
                    <thead className='bg-light text-secondary small text-uppercase'>
                        <tr>
                            <th className='text-center' style={{ width: '50px' }}>#</th>
                            <th style={{ width: '140px' }}>Item Code</th>
                            <th>Description</th>
                            <th style={{ width: '110px' }}>Unit</th>
                            <th className='text-end' style={{ width: '100px' }}>Price</th>
                            <th className='text-end' style={{ width: '80px' }}>Dis%</th>
                            <th className='text-end' style={{ width: '80px' }}>Tax%</th>
                            <th className='text-center' style={{ width: '90px' }}>Qty</th>
                            <th className='text-center' style={{ width: '80px' }}>Free</th>
                            {/* <th className='text-end' style={{ width: '120px' }}>Tax Amt</th> */}
                            <th className='text-end' style={{ width: '120px' }}>Total</th>
                            <th className='text-center' style={{ width: '60px' }}>Action</th>
                        </tr>
                    </thead>
                    {/* body */}
                    <tbody>
                            {/* INPUT ROW */}
                        <tr style={{ backgroundColor: inputRowBg, borderBottom: '2px solid #dee2e6' }}>
                            <td className='text-center text-success fw-bold'>+</td>
                            <td>
                                <input readOnly className='form-control form-control-sm bg-white' value={tempItem.p_code} placeholder='Code' />
                            </td>
                            <td className='position-relative'>
                                <input
                                    className='form-control form-control-sm'
                                    placeholder='Type to search item...'
                                    value={query}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                                {searchResults.length > 0 && (
                                    <ul className='position-absolute list-group shadow-lg w-100 itemtable-dropdown' style={{ zIndex: 9999, top: '100%' }}>
                                        {searchResults.map((product) => (
                                            <li
                                                key={product.p_id}
                                                onClick={() => selectProduct(product)}
                                                className='list-group-item list-group-item-action small py-2 cursor-pointer'
                                            >
                                                <div className='fw-bold'>{product.p_name}</div>
                                                <div className='text-muted small'>
                                                    Code: {product.p_code} | Price: {toNumber(product.retail_price).toFixed(2)} | Tax: {toNumber(product.tax_rate).toFixed(2)}%
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </td>
                            <td>
                                <select
                                    className='form-select form-select-sm'
                                    value={tempItem.p_unit}
                                    onChange={(e) => handleUnitChange(e.target.value)}
                                >
                                    {(allUnits.length ? allUnits : ['Packet']).map((unit) => (
                                        <option key={unit} value={unit}>{unit}</option>
                                    ))}
                                </select>
                            </td>
                            <td>
                                <input type='number' className='form-control form-control-sm text-end' value={tempItem.unit_price} onChange={(e) => setTempItem({ ...tempItem, unit_price: e.target.value })} />
                            </td>
                            <td>
                                <input type='number' className='form-control form-control-sm text-end' value={tempItem.discount} onChange={(e) => setTempItem({ ...tempItem, discount: e.target.value })} />
                            </td>
                            <td>
                                <input type='number' className='form-control form-control-sm text-end' value={tempItem.tax} onChange={(e) => setTempItem({ ...tempItem, tax: e.target.value })} />
                            </td>
                            <td>
                                <input type='number' className='form-control form-control-sm text-center' value={tempItem.quntity} onChange={(e) => setTempItem({ ...tempItem, quntity: e.target.value })} />
                            </td>
                            <td>
                                <input type='number' className='form-control form-control-sm text-center' value={tempItem.free} onChange={(e) => setTempItem({ ...tempItem, free: e.target.value })} />
                            </td>
                            {/* <td className='text-end fw-bold text-secondary'>{currentEntryTaxAmount.toFixed(2)}</td> */}
                            <td className='text-end fw-bold text-primary'>{currentEntryTotal.toFixed(2)}</td>
                            <td className='text-center'>
                                <button onClick={addItem} className='btn btn-success btn-sm shadow-sm'><Plus size={18} strokeWidth={3} /></button>
                            </td>
                        </tr>
                            {/* CART ITEMS */}

                        {cartItems.map((item, index) => (
                            <tr key={item.id} className='border-bottom'>
                                <td className='text-center text-muted small'>{index + 1}</td>
                                <td>{item.p_code}</td>
                                <td className='fw-medium'>{item.p_name}</td>
                                <td>{item.p_unit}</td>
                                <td>
                                    <input type='number' className='form-control form-control-sm border-0 text-end' value={item.unit_price} onChange={(e) => updateCartItem(index, 'unit_price', e.target.value)} />
                                </td>
                                <td>
                                    <input type='number' className='form-control form-control-sm border-0 text-end' value={item.discount} onChange={(e) => updateCartItem(index, 'discount', e.target.value)} />
                                </td>
                                <td>
                                    <input type='number' className='form-control form-control-sm border-0 text-end' value={item.tax} onChange={(e) => updateCartItem(index, 'tax', e.target.value)} />
                                </td>
                                <td>
                                    <input type='number' className='form-control form-control-sm border-0 text-center fw-bold text-success' value={item.quntity} onChange={(e) => updateCartItem(index, 'quntity', e.target.value)} />
                                </td>
                                <td>
                                    <input type='number' className='form-control form-control-sm border-0 text-center' value={item.free} onChange={(e) => updateCartItem(index, 'free', e.target.value)} />
                                </td>
                                {/* <td className='text-end fw-semibold'>{toNumber(item.taxAmount).toFixed(2)}</td> */}
                                <td className='text-end fw-bold'>{toNumber(item.total).toFixed(2)}</td>
                                <td className='text-center'>
                                    <button onClick={() => setCartItems(cartItems.filter((cartItem) => cartItem.id !== item.id))} className='btn btn-link text-danger p-0 border-0'><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}

                        {cartItems.length === 0 && (
                            <tr>
                                <td colSpan={12} className='text-center text-muted py-4'>No items added yet</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ItemTable;