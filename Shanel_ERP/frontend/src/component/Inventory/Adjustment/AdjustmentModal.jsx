import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { Search, X, ChevronDown } from 'react-feather';

const AdjustmentModal = ({ show, onHide, refresh }) => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [locationInventory, setLocationInventory] = useState({});
    const [productSearch, setProductSearch] = useState('');
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const productDropdownRef = useRef(null);
    const [selectedUnitIndex, setSelectedUnitIndex] = useState(0);
    const [displayQty, setDisplayQty] = useState('');
    const [formData, setFormData] = useState({
        P_ID: '',
        Location: 'Shop',
        Adjustment_Qty: '',
        Adjustment_Type: 'Stock_Take',
        Adjustment_Date: new Date().toISOString().split('T')[0],
        Reason: ''
    });

    const isReductionType = (type) => {
        return type === 'Damage' || type === 'Expired' || type === 'Theft' || type === 'Other';
    };

    useEffect(() => {
        const handleOutside = (e) => {
            if (productDropdownRef.current && !productDropdownRef.current.contains(e.target)) {
                setShowProductDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, []);

    // Fetch products when modal opens
    useEffect(() => {
        if (show) {
            axios.get('http://localhost:5000/api/inventory/products')
                .then(res => setProducts(res.data))
                .catch(err => console.error("Error loading products:", err));

            setSelectedProduct(null);
            setLocationInventory({});
            setProductSearch('');
            setSelectedUnitIndex(0);
            setDisplayQty('');
        }
    }, [show]);

    // Get current stock per location when product is selected
    const handleProductChange = async (productId) => {
        setFormData(prev => ({ ...prev, P_ID: productId, Adjustment_Qty: '' }));
        const selectedProduct = products.find(p => p.id === parseInt(productId));
        setSelectedProduct(selectedProduct || null);
        setProductSearch(selectedProduct ? selectedProduct.name : '');
        setSelectedUnitIndex(0);
        setDisplayQty('');
        setShowProductDropdown(false);

        if (!productId) {
            setLocationInventory({});
            return;
        }

        try {
            const res = await axios.get(`http://localhost:5000/api/inventory/product/${productId}/locations`);
            setLocationInventory(res.data || {});
        } catch {
            setLocationInventory({});
        }
    };

    const filteredProducts = useMemo(() => {
        const query = productSearch.trim().toLowerCase();
        if (!query) return products;
        return products.filter((p) => String(p.name || '').toLowerCase().startsWith(query));
    }, [products, productSearch]);

    const handleClearProduct = () => {
        setProductSearch('');
        setSelectedProduct(null);
        setLocationInventory({});
        setSelectedUnitIndex(0);
        setDisplayQty('');
        setFormData(prev => ({ ...prev, P_ID: '', Adjustment_Qty: '' }));
        setShowProductDropdown(false);
    };

    const unitOptions = useMemo(() => {
        if (!selectedProduct) return [];
        const base = { label: selectedProduct.baseUnit || 'Unit', conversionRate: 1, isBase: true };
        const alternatives = (selectedProduct.units || [])
            .filter(u => !u.isBaseUnit)
            .map(u => ({ label: u.unitName, conversionRate: parseFloat(u.conversionRate) || 1, isBase: false }));
        return [base, ...alternatives];
    }, [selectedProduct]);

    const selectedUnit = unitOptions[selectedUnitIndex] || { label: selectedProduct?.baseUnit || 'Unit', conversionRate: 1, isBase: true };

    const getAvailableBaseQty = () => {
        if (!formData.Location) return 0;
        return parseFloat(locationInventory[formData.Location] || 0);
    };

    const formatQty = (value) => {
        return Number.isInteger(value) ? String(value) : value.toFixed(2);
    };

    const maxInSelectedUnit = () => {
        const availableBase = getAvailableBaseQty();
        const rate = selectedUnit?.conversionRate || 1;
        return availableBase / rate;
    };

    const handleUnitChange = (idx) => {
        setSelectedUnitIndex(idx);
        const newUnit = unitOptions[idx] || { conversionRate: 1 };
        if (formData.Adjustment_Qty) {
            const baseQty = parseFloat(formData.Adjustment_Qty);
            const inNewUnit = baseQty / newUnit.conversionRate;
            setDisplayQty(Number.isInteger(inNewUnit) ? String(inNewUnit) : inNewUnit.toFixed(2));
        }
    };

    const handleDisplayQtyChange = (value) => {
        const intValue = String(value).replace(/[^0-9]/g, '');
        setDisplayQty(intValue);
        const parsed = parseInt(intValue, 10);
        if (!isNaN(parsed) && parsed >= 0) {
            const baseQty = parsed * selectedUnit.conversionRate;
            setFormData(prev => ({ ...prev, Adjustment_Qty: String(baseQty) }));
        } else {
            setFormData(prev => ({ ...prev, Adjustment_Qty: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!formData.P_ID) {
            alert('Please select a product');
            return;
        }
        if (!formData.Adjustment_Qty || parseFloat(formData.Adjustment_Qty) <= 0) {
            alert('Adjustment quantity must be greater than 0');
            return;
        }

        const availableBaseQty = getAvailableBaseQty();
        if (isReductionType(formData.Adjustment_Type) && parseFloat(formData.Adjustment_Qty) > availableBaseQty) {
            alert(`Cannot reduce more than available stock in ${formData.Location}. Max: ${formatQty(maxInSelectedUnit())} ${selectedUnit.label}`);
            return;
        }
        
        try {
            const response = await axios.post('http://localhost:5000/api/inventory/adjustments/adjust', formData);
            if (response.data.success) {
                refresh(); // Refresh the log table on the main page
                onHide();   // Close modal
                alert('Stock adjustment created successfully!');
                setFormData({ 
                    P_ID: '', 
                    Location: 'Shop', 
                    Adjustment_Qty: '', 
                    Adjustment_Type: 'Stock_Take', 
                    Adjustment_Date: new Date().toISOString().split('T')[0],
                    Reason: '' 
                });
                setSelectedProduct(null);
                setLocationInventory({});
                setProductSearch('');
                setSelectedUnitIndex(0);
                setDisplayQty('');
            }
        } catch (error) {
            alert(error.response?.data?.message || "Adjustment Failed");
        }
    };

    return (
        <>
        <Modal show={show} onHide={onHide} size="xl" centered className="centered-modal">
            <Modal.Header
                closeButton
                className="border-0 pb-0"
                style={{
                    background: 'linear-gradient(135deg, #f7fbff 0%, #eef7f2 100%)',
                    borderTopLeftRadius: '20px',
                    borderTopRightRadius: '20px'
                }}
            >
                <Modal.Title className="fw-bold fs-5">Create Stock Adjustment</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body className="py-4" style={{ background: 'linear-gradient(180deg, #f9fcff 0%, #f5fbf7 100%)' }}>
                    <div className="p-3 rounded-4 mb-3" style={{ background: '#ffffff', border: '1px solid #dbe4ef', borderRadius: '18px' }}>
                        <div className="d-flex flex-wrap gap-2 mb-3">
                            <span className="badge rounded-pill text-dark" style={{ background: '#e0f2fe', border: '1px solid #bae6fd' }}>
                                Current Stock ({formData.Location}): {formatQty(getAvailableBaseQty())} {selectedProduct?.baseUnit || 'units'}
                            </span>
                            <span className="badge rounded-pill text-dark" style={{ background: '#fef3c7', border: '1px solid #fde68a' }}>
                                Mode: {isReductionType(formData.Adjustment_Type) ? 'Reduce Stock' : 'Add Stock'}
                            </span>
                        </div>

                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-secondary">Select Item</Form.Label>
                                    <div ref={productDropdownRef} style={{ position: 'relative' }}>
                                        <div className="input-group" style={{ borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff' }}>
                                            <span className="input-group-text border-0 bg-transparent"><Search size={14} /></span>
                                            <input
                                                type="text"
                                                className="form-control border-0"
                                                placeholder="Search product by name..."
                                                value={productSearch}
                                                onChange={(e) => {
                                                    setProductSearch(e.target.value);
                                                    setSelectedProduct(null);
                                                    setLocationInventory({});
                                                    setSelectedUnitIndex(0);
                                                    setDisplayQty('');
                                                    setFormData(prev => ({ ...prev, P_ID: '', Adjustment_Qty: '' }));
                                                    setShowProductDropdown(true);
                                                }}
                                                onFocus={() => setShowProductDropdown(true)}
                                                autoComplete="off"
                                                style={{ padding: '10px 12px' }}
                                            />
                                            {productSearch && (
                                                <button type="button" className="btn btn-link text-muted border-0" onClick={handleClearProduct} style={{ textDecoration: 'none' }}>
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>

                                        {showProductDropdown && (
                                            <ul
                                                className="list-group shadow-sm border rounded mt-1 mb-0"
                                                style={{ position: 'absolute', zIndex: 1060, width: '100%', maxHeight: '220px', overflowY: 'auto', top: '100%', background: '#fff' }}
                                            >
                                                {filteredProducts.length > 0 ? filteredProducts.map((p) => (
                                                    <li
                                                        key={p.id}
                                                        className="list-group-item list-group-item-action py-2 px-3"
                                                        style={{ cursor: 'pointer', fontSize: '13px' }}
                                                        onMouseDown={(e) => e.preventDefault()}
                                                        onClick={() => handleProductChange(String(p.id))}
                                                    >
                                                        <span className="fw-semibold">{p.name}</span>
                                                        <span className="text-muted ms-2" style={{ fontSize: '11px' }}>#{p.id} · {p.type}</span>
                                                    </li>
                                                )) : (
                                                    <li className="list-group-item text-muted py-2 px-3" style={{ fontSize: '13px' }}>No products found</li>
                                                )}
                                            </ul>
                                        )}
                                    </div>
                                    <input type="hidden" required value={formData.P_ID} onChange={() => {}} />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-secondary">Adjustment Type</Form.Label>
                                    <div style={{ position: 'relative' }}>
                                        <Form.Select
                                            value={formData.Adjustment_Type}
                                            onChange={(e) => setFormData({...formData, Adjustment_Type: e.target.value})}
                                            style={{ borderRadius: '12px', border: '1px solid #cbd5e1', padding: '10px 38px 10px 12px', background: '#fff' }}
                                        >
                                            <option value="Stock_Take">Stock Take (General Audit)</option>
                                            <option value="Damage">Damaged - Reduce Stock</option>
                                            <option value="Expired">Expired - Reduce Stock</option>
                                            <option value="Theft">Stolen/Theft</option>
                                            <option value="Other">Other Reason</option>
                                        </Form.Select>
                                        <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }} />
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    <div className="p-3 rounded-4 mb-3" style={{ background: '#ffffff', border: '1px solid #dbe4ef', borderRadius: '18px' }}>
                        <Row className="g-3">
                            <Col md={5}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-secondary">Location</Form.Label>
                                    <div style={{ position: 'relative' }}>
                                        <Form.Select
                                            value={formData.Location}
                                            onChange={(e) => setFormData({...formData, Location: e.target.value})}
                                            style={{ borderRadius: '12px', border: '1px solid #cbd5e1', padding: '10px 38px 10px 12px', background: '#fff' }}
                                        >
                                            <option value="Shop">Shop</option>
                                            <option value="Production">Production</option>
                                        </Form.Select>
                                        <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }} />
                                    </div>
                                </Form.Group>
                            </Col>

                            <Col md={5}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-secondary">Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={formData.Adjustment_Date}
                                        onChange={(e) => setFormData({...formData, Adjustment_Date: e.target.value})}
                                        required
                                        style={{ borderRadius: '12px', border: '1px solid #cbd5e1', padding: '10px 12px', background: '#fff' }}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={10}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-secondary">
                                        {formData.Adjustment_Type === 'Stock_Take' ? 'Add Quantity' : 'Reduce Quantity'}
                                    </Form.Label>

                                    {unitOptions.length > 1 && (
                                        <div className="d-flex flex-wrap gap-2 mb-2">
                                            {unitOptions.map((u, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    className={`btn btn-sm px-3 py-1 rounded-pill fw-semibold ${selectedUnitIndex === idx ? 'btn-dark' : 'btn-light border'}`}
                                                    style={{ fontSize: '12px' }}
                                                    onClick={() => handleUnitChange(idx)}
                                                >
                                                    {u.label}
                                                    {!u.isBase && (
                                                        <span className={`ms-1 badge rounded-pill ${selectedUnitIndex === idx ? 'bg-white text-dark' : 'bg-secondary-subtle text-secondary'}`}
                                                            style={{ fontSize: '10px' }}>
                                                            ×{u.conversionRate}
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <div className="input-group">
                                        <Form.Control
                                            type="number"
                                            step="1"
                                            min="1"
                                            max={isReductionType(formData.Adjustment_Type) ? maxInSelectedUnit() : undefined}
                                            placeholder={formData.Adjustment_Type === 'Stock_Take' ? 'Enter quantity to add' : 'Enter quantity to remove'}
                                            required
                                            disabled={!formData.P_ID}
                                            value={displayQty}
                                            onChange={(e) => handleDisplayQtyChange(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === '.' || e.key === ',' || e.key === '-' || e.key === 'e' || e.key === 'E') {
                                                    e.preventDefault();
                                                }
                                            }}
                                            isInvalid={
                                                isReductionType(formData.Adjustment_Type) &&
                                                displayQty !== '' &&
                                                parseFloat(displayQty || 0) > maxInSelectedUnit()
                                            }
                                            style={{ borderRadius: '12px 0 0 12px', border: '1px solid #cbd5e1', padding: '10px 12px', background: '#fff' }}
                                        />
                                        <span className="input-group-text" style={{ borderRadius: '0 12px 12px 0', border: '1px solid #cbd5e1', borderLeft: '0', background: '#f8fafc' }}>
                                            {selectedUnit.label || selectedProduct?.baseUnit || 'Unit'}
                                        </span>
                                    </div>

                                    {isReductionType(formData.Adjustment_Type) && selectedProduct && (
                                        <small className="text-danger d-block mt-1">
                                            Max available: {formatQty(maxInSelectedUnit())} {selectedUnit.label}
                                        </small>
                                    )}

                                    <small className="text-muted d-block mt-1">
                                        {!isReductionType(formData.Adjustment_Type)
                                            ? 'This value will be added to stock'
                                            : `This value will be removed (${formatQty(getAvailableBaseQty())} ${selectedProduct?.baseUnit || 'units'} available)`
                                        }
                                    </small>

                                    {selectedProduct && unitOptions.length > 0 && (
                                        <div className="mt-2 d-flex flex-wrap gap-2">
                                            {unitOptions.map((u, idx) => {
                                                const available = getAvailableBaseQty() / (u.conversionRate || 1);
                                                return (
                                                    <span
                                                        key={`avail-${idx}`}
                                                        className="badge rounded-pill"
                                                        style={{
                                                            background: '#eef2ff',
                                                            border: '1px solid #c7d2fe',
                                                            color: '#1e293b',
                                                            fontSize: '11px'
                                                        }}
                                                    >
                                                        Available: {formatQty(available)} {u.label}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}
                                </Form.Group>
                            </Col>

                            
                        </Row>
                    </div>

                    <div className="p-3 rounded-4" style={{ background: '#ffffff', border: '1px solid #dbe4ef', borderRadius: '18px' }}>
                        <Form.Group>
                            <Form.Label className="small fw-bold text-secondary">Notes / Details (Optional)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                placeholder="Add extra details (batch number, issue details, audit notes, etc.)"
                                value={formData.Reason}
                                onChange={(e) => setFormData({...formData, Reason: e.target.value})}
                                style={{ borderRadius: '12px', border: '1px solid #cbd5e1', padding: '12px', background: '#fff' }}
                            />
                        </Form.Group>
                    </div>
                </Modal.Body>
                <Modal.Footer
                    className="border-0 pt-0"
                    style={{
                        background: 'linear-gradient(180deg, #f9fcff 0%, #f5fbf7 100%)',
                        borderBottomLeftRadius: '20px',
                        borderBottomRightRadius: '20px'
                    }}
                >
                    <button
                        type="button"
                        className="btn btn-outline-secondary px-4 py-2 rounded-3 shadow-sm fw-bold me-auto"
                        onClick={onHide}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-dark px-3 py-2 rounded-3 shadow-sm fw-bold"
                    >
                        Submit Adjustment
                    </button>
                </Modal.Footer>
            </Form>
            </Modal>

            <style>{`
                /* Scoped modal centering for this component */
                .modal.centered-modal {
                    display: flex !important;
                    align-items: center;
                    justify-content: center;
                    padding: 1rem;
                    min-height: 100vh;
                }
                .modal.centered-modal .modal-dialog { margin: 0; }
                .modal.centered-modal .modal-dialog.modal-md { max-width: 720px; }
                .modal.centered-modal .modal-dialog.modal-lg { max-width: 980px; }
                .modal.centered-modal .modal-dialog.modal-xl { max-width: 1080px; }
                .modal.centered-modal .modal-content {
                    border-radius: 20px !important;
                    overflow: hidden;
                    max-height: calc(100vh - 120px);
                    overflow-y: auto;
                }
            `}</style>

            </>
    );
};

export default AdjustmentModal;