import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw } from 'react-feather';
import axios from 'axios';
import Barcode from 'react-barcode';

const ProductModal = ({ show, onHide, typeFilter, refreshData, editData }) => {
    const initialState = {
        P_Name: '',
        P_Type: typeFilter, 
        Base_Unit: 'Packet',
        Cost_Price: 0,
        Retail_Price: 0,
        Wholesale_Price: 0,
        Min_Stock: 0,
        Tax_Rate: 0,
        Barcode: '',
        Status: 'Active'
    };

    const [formData, setFormData] = useState(initialState);

    // Sync typeFilter whenever the page changes or modal opens
    useEffect(() => {
        if (show) {
            if (editData) {
                setFormData({
                    id: editData.id,
                    P_Name: editData.name || '',
                    P_Type: editData.type || typeFilter,
                    Base_Unit: editData.baseUnit || 'Packet',
                    Cost_Price: editData.costPrice ?? 0,
                    Retail_Price: editData.retailPrice ?? 0,
                    Wholesale_Price: editData.wholesalePrice ?? 0,
                    Min_Stock: editData.minStock ?? 0,
                    Tax_Rate: editData.taxRate ?? 0,
                    Barcode: editData.barcode || '',
                    Status: editData.status || 'Active'
                });
            } else {
                setFormData({ ...initialState, P_Type: typeFilter });
            }
        }
    }, [show, typeFilter, editData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Professional Barcode Generator Logic
    const generateBarcode = () => {
        const prefix = formData.P_Type === 'Company' ? 'BC' : 'EXT';
        const random = Math.floor(100000000 + Math.random() * 900000000);
        setFormData({ ...formData, Barcode: `${prefix}${random}` });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editData) {
                await axios.put(`http://localhost:5000/api/inventory/products/${editData.id}`, formData);
                alert("Product updated successfully!");
            } else {
                await axios.post('http://localhost:5000/api/inventory/products', formData);
                alert("Product added successfully!");
            }
            refreshData(); 
            handleClose();
        } catch (error) {
            console.error("Error saving product:", error);
            alert("Failed to save product. Please try again.");
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
        onHide(); 
    };
    
    if (!show) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 1050 }}>
            <div className="modal-dialog modal-md modal-dialog-centered"> 
                <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <form onSubmit={handleSubmit}>
                        
                        <div className="modal-header bg-white border-0 px-4 pt-4 pb-0">
                            <div>
                                <h5 className="modal-title fw-bold text-dark">{editData ? 'Edit Product' : `Add New ${typeFilter} Item`}</h5>
                                <p className="text-muted small">Enter item details below</p>
                            </div>
                            <button type="button" className="btn-close shadow-none" onClick={handleClose}></button>
                        </div>

                        <div className="modal-body px-4 py-2">
                            <div className="row g-2">
                                
                                <div className="col-12 mb-2">
                                    <label className="form-label mb-1 small fw-semibold text-muted">Product Name *</label>
                                    <input type="text" name="P_Name" className="form-control form-control-sm bg-light border-0 py-2 shadow-none" 
                                           placeholder="e.g. Premium Soap Bar" required value={formData.P_Name} onChange={handleChange} />
                                </div>

                                <div className="col-6 mb-2">
                                    <label className="form-label mb-1 small fw-semibold text-muted">Product Type</label>
                                    <select name="P_Type" className="form-select form-select-sm bg-light border-0 py-2 shadow-none" 
                                            style={{ 
                                                backgroundColor: '#e2e8f0', // Slightly darker ash to show it is locked
                                                borderRadius: '8px',
                                                cursor: 'not-allowed' // Shows a 'blocked' cursor to the user
                                            }}
                                            value={formData.P_Type} onChange={handleChange} disabled>
                                        <option value="Company">Company Item</option>
                                        <option value="Other">Other Item</option>
                                        <option value="Raw">Raw Material</option>
                                    </select>
                                </div>

                                <div className="col-6 mb-2">
                                    <label className="form-label mb-1 small fw-semibold text-muted">Status</label>
                                    <select name="Status" className="form-select form-select-sm bg-light border-0 py-2 shadow-none" 
                                            value={formData.Status} onChange={handleChange}>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>

                                {/* Pricing Section (3-column layout) */}
                                <div className="col-4">
                                    <label className="form-label mb-1 small fw-semibold text-muted">Cost (LKR)</label>
                                    <input type="number" name="Cost_Price" className="form-control form-control-sm bg-light border-0 py-2" 
                                           value={formData.Cost_Price} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />
                                </div>
                                <div className="col-4">
                                    <label className="form-label mb-1 small fw-semibold text-muted">Retail (LKR)</label>
                                    <input type="number" name="Retail_Price" className="form-control form-control-sm bg-light border-0 py-2" 
                                           value={formData.Retail_Price} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />
                                </div>
                                <div className="col-4">
                                    <label className="form-label mb-1 small fw-semibold text-muted">Wholesale (LKR)</label>
                                    <input type="number" name="Wholesale_Price" className="form-control form-control-sm bg-light border-0 py-2" 
                                           value={formData.Wholesale_Price} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />
                                </div>

                                {/* Inventory Logic */}
                                <div className="col-6 mt-3">
                                    <label className="form-label mb-1 small fw-semibold text-muted">Min Stock Level</label>
                                    <input type="number" name="Min_Stock" className="form-control form-control-sm bg-light border-0 py-2" 
                                           value={formData.Min_Stock} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />
                                </div>
                                <div className="col-6 mt-3">
                                    <label className="form-label mb-1 small fw-semibold text-muted">Tax Rate (%)</label>
                                    <input type="number" name="Tax_Rate" className="form-control form-control-sm bg-light border-0 py-2" 
                                           value={formData.Tax_Rate} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />
                                </div>

                                {/* Barcode Management Section */}
                                <div className="col-12 mt-3 mb-3">
                                    <label className="form-label mb-1 small fw-semibold text-muted">Barcode Management</label>
                                    
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
                                            <div className="d-flex align-items-center" style={{ gap: '12px' }}>
                                                <input 
                                                    type="text" 
                                                    name="Barcode" 
                                                    className="form-control border-0 py-2 shadow-none flex-grow-1" 
                                                    style={{ 
                                                        backgroundColor: '#f1f5f9', 
                                                        borderRadius: '8px',
                                                        fontSize: '14px',
                                                        height: '42px'
                                                    }}
                                                    value={formData.Barcode} 
                                                    onChange={handleChange} 
                                                    placeholder="Scan or click generate"
                                                />

                                                <button 
                                                    className="btn d-flex align-items-center justify-content-center px-3 fw-bold" 
                                                    type="button" 
                                                    onClick={generateBarcode} 
                                                    style={{ 
                                                        backgroundColor: '#0f8d34', 
                                                        border: '1.5px solid #0f172a', 
                                                        borderRadius: '8px',
                                                        height: '42px',
                                                        color: '#ffffff',
                                                        fontSize: '13px',
                                                        transition: 'all 0.2s ease',
                                                        minWidth: '110px'
                                                    }}
                                                >
                                                    <RefreshCw size={14} className="me-2" />
                                                    Generate
                                                </button>
                                            </div>

                                            {formData.Barcode && (
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
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Professional Footer */}
                        <div className="modal-footer border-0 p-4 pt-2">
                            <button type="button" className="btn btn-outline-secondary px-4 py-2 rounded-3 shadow-sm fw-bold me-auto" onClick={handleClose}>Cancel</button>
                            <button type="submit" className="btn btn-dark px-4 py-2 rounded-3 shadow-sm fw-bold">
                                <Save size={16} className="me-2" /> {editData ? 'Update Product' : 'Add Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;