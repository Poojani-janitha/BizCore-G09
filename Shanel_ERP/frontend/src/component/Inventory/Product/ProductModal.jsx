import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw, Upload } from 'react-feather';
import axios from 'axios';
import Barcode from 'react-barcode';
import UnitConversionManager from './UnitConversionManager';
import SupplierModal from './SupplierModal';

const ProductModal = ({ show, onHide, typeFilter, refreshData, editData, onProductAdded }) => {
    const initialState = {
        P_Code: '',
        P_Name: '',
        P_Name_Sinhala: '',
        P_Type: typeFilter, 
        Base_Unit: 'Packet',
        Cost_Price: 0,
        Retail_Price: 0,
        Wholesale_Price: 0,
        Min_Stock: 0,
        Reorder_Level: '',
        Tax_Rate: 0,
        Description: '',
        Image_Path: '',
        Barcode: '',
        Auto_Generate_Barcode: false,
        Status: 'In Stock',
        InitialQty: 0,  // For "Other" and "Raw" items only
        IsIsharaProduct: false,  // For Company items: true = Ishara (direct supply), false = regular production
        supplierId: ''
    };

    const [formData, setFormData] = useState(initialState);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [baseUnit, setBaseUnit] = useState('Packet');
    const [units, setUnits] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [showSupplierModal, setShowSupplierModal] = useState(false);

    const fetchSuppliers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/inventory/suppliers');
            if (res.data.success) {
                setSuppliers(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching suppliers:", error);
        }
    };

    // Generate next product code based on existing products
    const generateNextProductCode = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/inventory/products');
            const products = response.data || [];
            
            // Extract numeric parts from product codes (e.g., "PROD-1" -> 1)
            const codes = products
                .map(p => p.code || '')
                .filter(code => code.startsWith('PROD-'))
                .map(code => parseInt(code.replace('PROD-', '')) || 0);
            
            // Find the highest number
            const maxNumber = codes.length > 0 ? Math.max(...codes) : 0;
            const nextNumber = maxNumber + 1;
            const nextCode = `PROD-${nextNumber}`;
            
            return nextCode;
        } catch (error) {
            console.error("Error generating product code:", error);
            return 'PROD-1'; // Default fallback
        }
    };

    // Sync typeFilter whenever the page changes or modal opens
    useEffect(() => {
        if (show) {
            fetchSuppliers();
            if (editData) {
                // When editing, ALWAYS use the product's actual type, never typeFilter
                setFormData({
                    id: editData.id,
                    P_Code: editData.code || '',
                    P_Name: editData.name || '',
                    P_Name_Sinhala: editData.nameSinhala || '',
                    P_Type: editData.type, // CRITICAL FIX: Use editData.type only, never fallback to typeFilter
                    Base_Unit: editData.baseUnit || 'Packet',
                    Cost_Price: editData.costPrice ?? 0,
                    Retail_Price: editData.retailPrice ?? 0,
                    Wholesale_Price: editData.wholesalePrice ?? 0,
                    Min_Stock: editData.minStock ?? 0,
                    Reorder_Level: editData.reorderLevel ?? '',
                    Tax_Rate: editData.taxRate ?? 0,
                    Description: editData.description || '',
                    Image_Path: editData.imagePath || '',
                    Barcode: editData.barcode || '',
                    Auto_Generate_Barcode: editData.autoGenerateBarcode || false,
                    Status: editData.status || 'In Stock',
                    InitialQty: (editData.type === 'Other' || editData.type === 'Raw' || editData.isIsharaProduct) ? (editData.stockCount ?? 0) : 0,
                    IsIsharaProduct: editData.isIsharaProduct === true || editData.isIsharaProduct === 1, // CRITICAL FIX: Proper boolean conversion
                    supplierId: editData.supplierId || ''
                });
                // Set existing image preview
                if (editData.imagePath) {
                    setImagePreview(`http://localhost:5000${editData.imagePath}`);
                }
                // Load units for this product (filter out base unit, keep only alternatives)
                setBaseUnit(editData.baseUnit || 'Packet');
                const alternativeUnits = editData.units 
                    ? editData.units.filter(u => !u.isBaseUnit).map(u => ({
                        id: u.id,
                        unitName: u.unitName,
                        conversionRate: u.conversionRate
                      }))
                    : [];
                setUnits(alternativeUnits);
            } else {
                // Auto-generate product code for new products
                generateNextProductCode().then(nextCode => {
                    setFormData(prev => ({ ...prev, P_Type: typeFilter, P_Code: nextCode }));
                });
                setBaseUnit('Packet');
                setUnits([]);
                setImageFile(null);
                setImagePreview('');
            }
            setErrors({});
            setSubmitError('');
        }
    }, [show, editData]);

    // Sync baseUnit state with formData.Base_Unit
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            Base_Unit: baseUnit
        }));
    }, [baseUnit]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ 
            ...formData, 
            [name]: type === 'checkbox' ? checked : value 
        });
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    // Handle image file upload
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                alert('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
                return;
            }
            
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size exceeds 5MB limit.');
                return;
            }
            
            setImageFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Validation function
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.P_Name.trim()) newErrors.P_Name = 'Product name is required';
        if (!formData.Cost_Price || parseFloat(formData.Cost_Price) <= 0) newErrors.Cost_Price = 'Cost price must be greater than 0';
        if (!formData.Retail_Price || formData.Retail_Price <= 0) newErrors.Retail_Price = 'Retail price must be greater than 0';
        if (!formData.Wholesale_Price || formData.Wholesale_Price <= 0) newErrors.Wholesale_Price = 'Wholesale price must be greater than 0';
        
        // For new products, barcode is required. For editing, barcode should already exist
        if (!editData && (!formData.Barcode || !formData.Barcode.trim())) {
            newErrors.Barcode = 'Barcode is required. Please generate or enter a barcode';
        }
        
        // Only require InitialQty for items that show this field (Other, Raw, or Company + Ishara)
        const showsInitialQty = formData.P_Type === 'Other' || formData.P_Type === 'Raw' || (formData.P_Type === 'Company' && formData.IsIsharaProduct);
        if (showsInitialQty && (formData.InitialQty === '' || formData.InitialQty === null || formData.InitialQty < 0)) {
            newErrors.InitialQty = 'Initial quantity is required and must be >= 0';
        }
        
        // Min_Stock and Reorder_Level are optional - only validate if provided and non-zero
        if (formData.Min_Stock !== '' && formData.Min_Stock !== null && parseFloat(formData.Min_Stock) < 0) {
            newErrors.Min_Stock = 'Minimum stock cannot be negative';
        }
        if (formData.Reorder_Level !== '' && formData.Reorder_Level !== null && parseFloat(formData.Reorder_Level) < 0) {
            newErrors.Reorder_Level = 'Reorder level cannot be negative';
        }
        
        if (formData.Cost_Price && formData.Retail_Price && parseFloat(formData.Retail_Price) < parseFloat(formData.Cost_Price)) {
            newErrors.Retail_Price = 'Retail price must be greater than cost price';
        }
        if (formData.Tax_Rate && (parseFloat(formData.Tax_Rate) < 0 || parseFloat(formData.Tax_Rate) > 100)) {
            newErrors.Tax_Rate = 'Tax rate must be between 0 and 100';
        }
        
        return newErrors;
    };

    // Professional Barcode Generator Logic
    const generateBarcode = () => {
        const prefix = formData.P_Type === 'Company' ? 'CMP' : formData.P_Type === 'Other' ? 'OTH' : 'RAW';
        const random = Math.floor(100000000 + Math.random() * 900000000);
        setFormData({ ...formData, Barcode: `${prefix}${random}` });
        if (errors.Barcode) {
            setErrors({ ...errors, Barcode: '' });
        }
    };

    const handleSupplierCreated = (newSup) => {
        setSuppliers(prev => [...prev, newSup]);
        setFormData(prev => ({ ...prev, supplierId: newSup.S_ID }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');

        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            // Scroll to first error instead of alert
            return;
        }

        setIsSubmitting(true);
        try {
            const formDataToSend = new FormData();
            
            formDataToSend.append('code', formData.P_Code || '');
            formDataToSend.append('name', formData.P_Name);
            formDataToSend.append('nameSinhala', formData.P_Name_Sinhala || '');
            formDataToSend.append('type', formData.P_Type);
            formDataToSend.append('baseUnit', baseUnit);
            formDataToSend.append('costPrice', parseFloat(formData.Cost_Price) || 0);
            formDataToSend.append('retailPrice', parseFloat(formData.Retail_Price) || 0);
            formDataToSend.append('wholesalePrice', parseFloat(formData.Wholesale_Price) || 0);
            formDataToSend.append('minStock', parseFloat(formData.Min_Stock) || 0);
            formDataToSend.append('reorderLevel', formData.Reorder_Level ? parseFloat(formData.Reorder_Level) : '');
            formDataToSend.append('taxRate', parseFloat(formData.Tax_Rate) || 0);
            formDataToSend.append('description', formData.Description || '');
            formDataToSend.append('imagePath', formData.Image_Path || '');
            formDataToSend.append('barcode', formData.Barcode || '');
            formDataToSend.append('autoGenerateBarcode', formData.Auto_Generate_Barcode);
            formDataToSend.append('isIsharaProduct', formData.IsIsharaProduct);
            formDataToSend.append('supplierId', formData.supplierId || '');
            
            if (formData.P_Type === 'Other' || formData.P_Type === 'Raw' || (formData.P_Type === 'Company' && formData.IsIsharaProduct)) {
                formDataToSend.append('initialQty', parseFloat(formData.InitialQty) || 0);
            }
            
            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }
            
            formDataToSend.append('units', JSON.stringify(units));

            if (editData) {
                await axios.put(`http://localhost:5000/api/inventory/products/${editData.id}`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await axios.post('http://localhost:5000/api/inventory/products', formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            refreshData();
            handleClose();

            if (!editData && onProductAdded) {
                onProductAdded({
                    name: formData.P_Name,
                    type: formData.P_Type,
                    isIsharaProduct: formData.IsIsharaProduct
                });
            }
        } catch (error) {
            console.error("Error saving product:", error);
            const msg = error.response?.data?.message
                || error.response?.data?.error
                || error.message
                || 'An unexpected error occurred. Please try again.';
            setSubmitError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFocus = (e) => {
        if (e.target.value === '0') {
            setFormData({ ...formData, [e.target.name]: '' });
        }
    };

    const handleBlur = (e) => {
        if (e.target.value === '') {
            setFormData({ ...formData, [e.target.name]: 0 });
        }
    };

    const handleClose = () => {
        setFormData(initialState);
        setBaseUnit('Packet');
        setUnits([]);
        setImageFile(null);
        setImagePreview('');
        setSubmitError('');
        setIsSubmitting(false);
        onHide(); 
    };
    
    if (!show) return null;

    return (
        <>
            <div className="modal d-block" style={{ backgroundColor: 'rgba(42, 15, 24, 0.7)', zIndex: 1050 }}>
            <div className="modal-dialog modal-md modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content border-0 shadow-lg rounded-4" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column', minWidth:'90vh' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                        
                        <div className="modal-header bg-white border-0 px-4 pt-4 pb-0">
                            <div>
                                <h6 className="modal-title fw-bold text-dark" style={{ fontSize: '14px' }}>{editData ? 'Edit Product' : `Add New ${typeFilter} Item`}</h6>
                                <p className="text-muted small">Enter item details below</p>
                            </div>
                            <button type="button" className="btn-close shadow-none" onClick={handleClose}></button>
                        </div>

                        <div className="modal-body px-4 py-2" style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>

                            {/* ── Inline error banner ── */}
                            {submitError && (
                                <div className="d-flex align-items-start gap-2 px-3 py-2 rounded-3 mb-3"
                                    style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}>
                                    <span style={{ fontSize: '16px', lineHeight: 1.4, flexShrink: 0 }}>⚠️</span>
                                    <div>
                                        <p className="mb-0 small fw-semibold" style={{ color: '#b91c1c' }}>
                                            Unable to save product
                                        </p>
                                        <p className="mb-0 small" style={{ color: '#dc2626' }}>
                                            {submitError}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-close ms-auto"
                                        style={{ fontSize: '10px' }}
                                        onClick={() => setSubmitError('')}
                                    />
                                </div>
                            )}

                            <div className="row g-2">
                                
                                {/* Product Code */}
                                <div className="col-12 mb-2">
                                    <label className="form-label mb-1 small fw-semibold text-muted">
                                        Product Code
                                        {!editData && <span className="text-muted small ms-1">(Auto-generated)</span>}
                                    </label>
                                    <input 
                                        type="text" 
                                        name="P_Code" 
                                        className="form-control form-control-sm bg-light border-0 py-2 shadow-none" 
                                        value={formData.P_Code} 
                                        readOnly
                                        style={{ backgroundColor: '#e2e8f0', cursor: 'not-allowed', opacity: 0.8 }}
                                    />
                                </div>

                                {/* Product Name */}
                                <div className="col-12 mb-2">
                                    <label className="form-label mb-1 small fw-semibold text-muted">Product Name * <span className="text-danger">{errors.P_Name && errors.P_Name}</span></label>
                                    <input type="text" name="P_Name" className={`form-control form-control-sm bg-light border-0 py-2 shadow-none ${errors.P_Name ? 'border border-danger' : ''}`}
                                           placeholder="e.g. Premium Soap Bar" required value={formData.P_Name} onChange={handleChange} />
                                </div>

                                {/* Product Name Sinhala */}
                                <div className="col-12 mb-2">
                                    <label className="form-label mb-1 small fw-semibold text-muted">Product Name in Sinhala <span className="text-muted small">(Optional)</span></label>
                                    <input type="text" name="P_Name_Sinhala" className="form-control form-control-sm bg-light border-0 py-2 shadow-none"
                                           placeholder="උදා: රෙදි සෝදන සබන්" value={formData.P_Name_Sinhala} onChange={handleChange} />
                                </div>

                                {/* Product Type & Base Unit */}
                                <div className="col-6 mb-2">
                                    <label className="form-label mb-1 small fw-semibold text-muted">Product Type</label>
                                    <select name="P_Type" className="form-select form-select-sm bg-light border-0 py-2 shadow-none" 
                                            style={{ backgroundColor: '#e2e8f0', borderRadius: '8px', cursor: 'not-allowed' }}
                                            value={formData.P_Type} onChange={handleChange} disabled>
                                        <option value="Company">Company Item</option>
                                        <option value="Other">Other Item</option>
                                        <option value="Raw">Raw Material</option>
                                    </select>
                                </div>

                                {/* Product Source Selection - Only for Company Items */}
                                {formData.P_Type === 'Company' && (
                                    <div className="col-6 mb-2">
                                        <label className="form-label mb-1 small fw-semibold text-muted">Product Source</label>
                                        <div className="d-flex gap-3 mt-2">
                                            <div className="form-check">
                                                <input 
                                                    className="form-check-input" 
                                                    type="radio" 
                                                    name="IsIsharaProduct" 
                                                    id="companyRadio"
                                                    checked={!formData.IsIsharaProduct} 
                                                    onChange={() => setFormData({...formData, IsIsharaProduct: false})}
                                                />
                                                <label className="form-check-label small" htmlFor="companyRadio">
                                                    Company <small className="text-muted d-block" style={{ fontSize: '11px' }}>Production batch</small>
                                                </label>
                                            </div>
                                            <div className="form-check">
                                                <input 
                                                    className="form-check-input" 
                                                    type="radio" 
                                                    name="IsIsharaProduct" 
                                                    id="isharaRadio"
                                                    checked={formData.IsIsharaProduct} 
                                                    onChange={() => setFormData({...formData, IsIsharaProduct: true})}
                                                />
                                                <label className="form-check-label small" htmlFor="isharaRadio">
                                                    Ishara <small className="text-muted d-block" style={{ fontSize: '11px' }}>Direct supply</small>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                

                                {/* Unit Conversion Manager */}
                                <div className="col-12 mb-3">
                                    <UnitConversionManager 
                                        baseUnit={baseUnit} 
                                        setBaseUnit={setBaseUnit}
                                        units={units}
                                        setUnits={setUnits}
                                    />
                                </div>

                                {/* Pricing Section */}
                                <div className="col-4">
                                    <label className="form-label mb-1 small fw-semibold text-muted">Cost (LKR) * <span className="text-danger small">{errors.Cost_Price && errors.Cost_Price}</span></label>
                                    <input type="number" step="0.01" min="0" name="Cost_Price" className={`form-control form-control-sm bg-light border-0 py-2 ${errors.Cost_Price ? 'border border-danger' : ''}`}
                                           value={formData.Cost_Price} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} required />
                                </div>
                                <div className="col-4">
                                    <label className="form-label mb-1 small fw-semibold text-muted">Retail (LKR) * <span className="text-danger small">{errors.Retail_Price && errors.Retail_Price}</span></label>
                                    <input type="number" step="0.01" min="0" name="Retail_Price" className={`form-control form-control-sm bg-light border-0 py-2 ${errors.Retail_Price ? 'border border-danger' : ''}`}
                                           value={formData.Retail_Price} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} required />
                                </div>
                                <div className="col-4">
                                    <label className="form-label mb-1 small fw-semibold text-muted">Wholesale (LKR) * <span className="text-danger small">{errors.Wholesale_Price && errors.Wholesale_Price}</span></label>
                                    <input type="number" step="0.01" min="0" name="Wholesale_Price" className={`form-control form-control-sm bg-light border-0 py-2 ${errors.Wholesale_Price ? 'border border-danger' : ''}`}
                                           value={formData.Wholesale_Price} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} required />
                                </div>

                                {/* Tax & Stock Levels */}
                                <div className="col-6 mt-2">
                                    <label className="form-label mb-1 small fw-semibold text-muted">Tax Rate (%) <span className="text-danger small">{errors.Tax_Rate && errors.Tax_Rate}</span></label>
                                    <input type="number" step="0.01" min="0" name="Tax_Rate" className={`form-control form-control-sm bg-light border-0 py-2 ${errors.Tax_Rate ? 'border border-danger' : ''}`}
                                           value={formData.Tax_Rate} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />
                                </div>
                                <div className="col-6 mt-2">
                                    <label className="form-label mb-1 small fw-semibold text-muted">Min Stock * <span className="text-danger small">{errors.Min_Stock && errors.Min_Stock}</span></label>
                                    <input type="number" step="0.01" min="0" name="Min_Stock" className={`form-control form-control-sm bg-light border-0 py-2 ${errors.Min_Stock ? 'border border-danger' : ''}`}
                                           value={formData.Min_Stock} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />
                                </div>

                                {/* Supplier Section - For Supplier Items (Other/Raw) */}
                                {(formData.P_Type === 'Other' || formData.P_Type === 'Raw') && (
                                    <div className="col-12 mt-2 border-top pt-2">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <label className="form-label small fw-semibold text-muted mb-0">Supplier</label>
                                            <button 
                                                type="button" 
                                                className="btn btn-xs btn-outline-primary fw-bold" 
                                                style={{ fontSize: '10px', padding: '2px 8px' }}
                                                onClick={() => setShowSupplierModal(true)}
                                            >
                                                + Register New Supplier
                                            </button>
                                        </div>

                                        <select 
                                            name="supplierId" 
                                            className="form-select form-select-sm bg-light border-0 py-2 shadow-none"
                                            value={formData.supplierId}
                                            onChange={handleChange}
                                        >
                                            <option value="">-- Select Supplier (Optional) --</option>
                                            {suppliers.map(sup => (
                                                <option key={sup.S_ID} value={sup.S_ID}>
                                                    {sup.S_Name} {sup.Phone_No ? `(${sup.Phone_No})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Initial Quantity - For Supplier Items (Other/Raw) and Ishara Products */}
                                {(formData.P_Type === 'Other' || formData.P_Type === 'Raw' || (formData.P_Type === 'Company' && formData.IsIsharaProduct)) && (
                                    <div className="col-6 mt-2">
                                        <label className="form-label mb-1 small fw-semibold text-muted">
                                            {formData.P_Type === 'Company' ? 'Supplied Qty' : editData ? 'Current Stock' : 'Initial Qty'} {formData.P_Type === 'Other' ? '(Supplier)' : formData.P_Type === 'Company' ? '(Received)' : '(Received)'}
                                            * <span className="text-danger small">{errors.InitialQty && errors.InitialQty}</span>
                                        </label>
                                        <div className="d-flex align-items-center" style={{ gap: '8px' }}>
                                            <input 
                                                type="number" 
                                                step="0.01" 
                                                min="0"
                                                name="InitialQty" 
                                                className={`form-control form-control-sm bg-light border-0 py-2 flex-grow-1 ${errors.InitialQty ? 'border border-danger' : ''}`} 
                                                value={formData.InitialQty} 
                                                onChange={handleChange} 
                                                onFocus={handleFocus} 
                                                onBlur={handleBlur}
                                                placeholder="e.g., 500"
                                                title={editData ? "This shows current stock in inventory. Modify to update inventory." : "Enter the quantity supplied"}
                                            />
                                            <small className="text-muted" style={{ whiteSpace: 'nowrap', fontSize: '11px' }}>
                                                {formData.Base_Unit}
                                            </small>
                                        </div>

                                    </div>
                                )}

                                {/* Reorder Level */}
                                <div className="col-12 mt-2">
                                    <label className="form-label mb-1 small fw-semibold text-muted">Reorder Level * <span className="text-danger small">{errors.Reorder_Level && errors.Reorder_Level}</span></label>
                                    <input type="number" step="0.01" min="0" name="Reorder_Level" className={`form-control form-control-sm bg-light border-0 py-2 ${errors.Reorder_Level ? 'border border-danger' : ''}`} 
                                           value={formData.Reorder_Level} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />
                                </div>

                                {/* Description */}
                                <div className="col-12 mt-2">
                                    <label className="form-label mb-1 small fw-semibold text-muted">Description</label>
                                    <textarea name="Description" className="form-control form-control-sm bg-light border-0 py-2 shadow-none" 
                                              placeholder="Enter product description..." rows="2" value={formData.Description} onChange={handleChange}></textarea>
                                </div>

                                {/* Image Upload Section */}
                                <div className="col-12 mt-3 mb-3">
                                    <label className="form-label mb-1 small fw-semibold text-muted">Product Image</label>
                                    
                                    <div className="d-flex flex-column align-items-center p-4 rounded-3" 
                                         style={{ backgroundColor: '#f8fafc', border: '2px dashed #cbd5e1', cursor: 'pointer', transition: 'all 0.3s' }}
                                         onClick={() => document.getElementById('imageInput').click()}>
                                        
                                        {imagePreview ? (
                                            <>
                                                <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px', marginBottom: '10px', borderRadius: '8px' }} />
                                                <small className="text-muted">Click to change image</small>
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={32} className="text-muted mb-2" />
                                                <small className="text-muted">Click to upload or drag image here</small>
                                                <small className="text-muted" style={{ fontSize: '11px' }}>(JPEG, PNG, GIF, WebP - Max 5MB)</small>
                                            </>
                                        )}
                                    </div>
                                    
                                    <input 
                                        id="imageInput"
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleImageChange}
                                        style={{ display: 'none' }}
                                    />
                                </div>

                                {/* Barcode Management Section */}
                                <div className="col-12 mt-3 mb-3">
                                    <label className="form-label mb-1 small fw-semibold text-muted">
                                        Barcode Management <span className="text-danger small">{errors.Barcode && errors.Barcode}</span>
                                    </label>
                                    
                                    {editData ? (
                                        /* Edit Mode: show barcode visual, locked and not editable */
                                        <div className="d-flex flex-column align-items-center p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                                            {formData.Barcode ? (
                                                <Barcode 
                                                    value={formData.Barcode} 
                                                    width={1.5} 
                                                    height={50} 
                                                    fontSize={13} 
                                                    margin={5}
                                                    background="#f8fafc"
                                                />
                                            ) : (
                                                <span className="text-muted small">No barcode assigned</span>
                                            )}
                                        </div>
                                    ) : (
                                        /* Add Mode: input + generate + barcode visual */
                                        <>
                                            <div className="d-flex align-items-center" style={{ gap: '12px', marginBottom: '10px' }}>
                                                <input 
                                                    type="text" 
                                                    name="Barcode" 
                                                    className={`form-control py-2 shadow-none flex-grow-1 ${errors.Barcode ? 'border border-danger' : 'border-0'}`}
                                                    style={{ backgroundColor: '#f1f5f9', borderRadius: '8px', fontSize: '14px', height: '42px' }}
                                                    value={formData.Barcode} 
                                                    onChange={handleChange} 
                                                    placeholder="Scan or click generate"
                                                />
                                                <button 
                                                    className="btn d-flex align-items-center justify-content-center px-3 fw-bold" 
                                                    type="button" 
                                                    onClick={generateBarcode} 
                                                    style={{ backgroundColor: '#0f8d34', border: '1.5px solid #0f172a', borderRadius: '8px', height: '42px', color: '#ffffff', fontSize: '13px', minWidth: '110px' }}
                                                >
                                                    <RefreshCw size={14} className="me-2" />
                                                    Generate
                                                </button>
                                            </div>

                                            {formData.Barcode && (
                                                <div className="col-12">
                                                    <div className="d-flex flex-column align-items-center p-3 mt-2 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                                                        <Barcode 
                                                            value={formData.Barcode} 
                                                            width={1.5} 
                                                            height={50} 
                                                            fontSize={13} 
                                                            margin={5}
                                                            background="#f8fafc"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Professional Footer */}
                        <div className="modal-footer border-top px-4 pb-4 pt-3 bg-white" style={{ flexShrink: 0 }}>
                            <button type="button" className="btn btn-outline-secondary px-4 py-2 rounded-3 shadow-sm fw-bold me-auto" onClick={handleClose} disabled={isSubmitting}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-dark px-3 py-2 rounded-3 shadow-sm fw-bold" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        {editData ? 'Updating…' : 'Saving…'}
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} className="me-2" />
                                        {editData ? 'Update Product' : 'Add Product'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            </div>

            {/* High Detailed Supplier Modal Popup */}
            <SupplierModal 
                show={showSupplierModal}
                onHide={() => setShowSupplierModal(false)}
                onSupplierAdded={handleSupplierCreated}
            />
        </>
    );
};

export default ProductModal;
