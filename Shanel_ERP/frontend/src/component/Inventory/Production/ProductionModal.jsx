import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import { Package, Calendar, Layers, Hash, Search, X } from 'react-feather';

const ProductionModal = ({ show, onHide, refreshData }) => {
    const getFallbackBatchNo = () => {
        const currentYear = String(new Date().getFullYear());
        return `BATCH-${currentYear}-001`;
    };

    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productSearch, setProductSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Unit selection state
    const [selectedUnitIndex, setSelectedUnitIndex] = useState(0); // 0 = base unit
    const [displayQty, setDisplayQty] = useState(''); // qty in selected unit

    const [formData, setFormData] = useState({ P_ID: '', Batch_No: '', Total_Qty_Produced: '', Production_Date: '', Exp_Date: '' });
    const [errors, setErrors] = useState({});
    const [existingBatches, setExistingBatches] = useState([]);

    // Close product dropdown on outside click
    useEffect(() => {
        const handleOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, []);

    const fetchNextBatchNo = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/production/next-batch-number');
            const nextBatchNo = res?.data?.batchNo || getFallbackBatchNo();
            setFormData(prev => ({ ...prev, Batch_No: nextBatchNo }));
        } catch (error) {
            setFormData(prev => ({ ...prev, Batch_No: getFallbackBatchNo() }));
        }
    };

    const isIsharaProduct = (product) => {
        const flag = product.isIsharaProduct ?? product.Is_Ishara_Product;
        return flag === true || flag === 1 || flag === '1' || flag === 'true';
    };

    useEffect(() => {
        axios.get('http://localhost:5000/api/inventory/products').then(res => {
            setProducts(res.data.filter(p => p.type === 'Company' && !isIsharaProduct(p)));
        });
        // Fetch existing batches for duplicate check
        axios.get('http://localhost:5000/api/production/stock-overview').then(res => {
            if (res.data.success) {
                const allBatches = [
                    ...(res.data.wip || []),
                    ...(res.data.approved || [])
                ].map(item => item.Batch_No);
                setExistingBatches(allBatches);
            }
        });
    }, []);

    useEffect(() => {
        if (show) {
            fetchNextBatchNo();
            setProductSearch('');
            setSelectedProduct(null);
            setDisplayQty('');
            setSelectedUnitIndex(0);
        }
    }, [show]);

    // Build unit options: base unit first, then alternatives
    const unitOptions = useMemo(() => {
        if (!selectedProduct) return [];
        const base = { label: selectedProduct.baseUnit || 'Unit', conversionRate: 1, isBase: true };
        const alternatives = (selectedProduct.units || [])
            .filter(u => !u.isBaseUnit)
            .map(u => ({ label: u.unitName, conversionRate: parseFloat(u.conversionRate) || 1, isBase: false }));
        return [base, ...alternatives];
    }, [selectedProduct]);

    const selectedUnit = unitOptions[selectedUnitIndex] || { label: '', conversionRate: 1, isBase: true };

    const filteredProducts = useMemo(() => {
        const query = productSearch.trim().toLowerCase();
        if (!query) return products;
        return products.filter(p => String(p.name || '').toLowerCase().startsWith(query));
    }, [products, productSearch]);

    const handleSelectProduct = (product) => {
        setSelectedProduct(product);
        setProductSearch(product.name || '');
        setFormData(prev => ({ ...prev, P_ID: product.id, Total_Qty_Produced: '' }));
        setDisplayQty('');
        setSelectedUnitIndex(0);
        setShowDropdown(false);
    };

    const handleClearProduct = () => {
        setSelectedProduct(null);
        setProductSearch('');
        setFormData(prev => ({ ...prev, P_ID: '', Total_Qty_Produced: '' }));
        setDisplayQty('');
        setSelectedUnitIndex(0);
        setShowDropdown(false);
    };

    const handleUnitChange = (idx) => {
        setSelectedUnitIndex(idx);
        const newUnit = unitOptions[idx] || { conversionRate: 1 };
        if (formData.Total_Qty_Produced) {
            const baseQty = parseFloat(formData.Total_Qty_Produced);
            const inNewUnit = baseQty / newUnit.conversionRate;
            setDisplayQty(Number.isInteger(inNewUnit) ? String(inNewUnit) : inNewUnit.toFixed(4).replace(/\.?0+$/, ''));
        }
    };

    const handleDisplayQtyChange = (value) => {
        const intVal = value.replace(/[^0-9]/g, '');
        setDisplayQty(intVal);
        const parsed = parseInt(intVal);
        if (!isNaN(parsed) && parsed >= 0) {
            const baseQty = parsed * selectedUnit.conversionRate;
            setFormData(prev => ({ ...prev, Total_Qty_Produced: String(baseQty) }));
        } else {
            setFormData(prev => ({ ...prev, Total_Qty_Produced: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        // Validation 1: Check if quantity is valid (must be > 0)
        const qty = parseFloat(formData.Total_Qty_Produced);
        if (!qty || qty <= 0) {
            newErrors.Total_Qty_Produced = 'Quantity must be greater than 0';
        }

        // Validation 2: Check if expiry date is after production date
        if (formData.Production_Date && formData.Exp_Date) {
            const prodDate = new Date(formData.Production_Date);
            const expDate = new Date(formData.Exp_Date);
            if (expDate < prodDate) {
                newErrors.Exp_Date = 'Expiry date cannot be before production date';
            }
        }

        // Validation 3: Check for duplicate batch number
        const batchNo = formData.Batch_No;
        if (existingBatches.includes(batchNo)) {
            newErrors.Batch_No = 'This batch number already exists';
        }

        // If there are errors, display them
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setErrors({});
            await axios.post('http://localhost:5000/api/production/start', { ...formData, Batch_No: batchNo });
            setExistingBatches([...existingBatches, batchNo]);
            refreshData();
            onHide();
            setFormData({
                P_ID: '',
                Batch_No: '',
                Total_Qty_Produced: '',
                Production_Date: '',
                Exp_Date: ''
            });
        } catch (error) { 
            setErrors({ submit: error.response?.data?.message || 'Error starting production' });
        }
    };

    return (
        <Modal show={show} onHide={() => { setErrors({}); onHide(); }} centered size="md">
            <Modal.Header closeButton style={{ backgroundColor: '#f8fbff', border: 'none', paddingBottom: '8px' }}>
                <Modal.Title style={{ fontWeight: '700', color: '#1a3a52', fontSize: '18px' }}>
                     Start New Production Batch
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body style={{ backgroundColor: '#f8fbff', borderRadius: '0 0 0 0' }}>
                    <div style={{ padding: '20px' }}>
                        {/* Error Alert */}
                        {errors.submit && (
                            <div style={{ backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', color: '#721c24', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                                ⚠️ {errors.submit}
                            </div>
                        )}
                        {/* Product Selection */}
                        <Form.Group className="mb-4">
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                <Package size={18} style={{ color: '#0d6efd', marginRight: '8px' }} />
                                <Form.Label style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>Select Product</Form.Label>
                            </div>
                            <div ref={dropdownRef} style={{ position: 'relative' }}>
                                <div className="input-group" style={{ borderRadius: '8px', border: '1px solid #dee2e6', background: '#fff' }}>
                                    <span className="input-group-text border-0 bg-transparent"><Search size={14} /></span>
                                    <input
                                        type="text"
                                        className="form-control border-0"
                                        placeholder="Type first letter to search product..."
                                        value={productSearch}
                                        onChange={(e) => {
                                            setProductSearch(e.target.value);
                                            setSelectedProduct(null);
                                            setFormData(prev => ({ ...prev, P_ID: '', Total_Qty_Produced: '' }));
                                            setDisplayQty('');
                                            setSelectedUnitIndex(0);
                                            setShowDropdown(true);
                                        }}
                                        onFocus={() => setShowDropdown(true)}
                                        autoComplete="off"
                                        style={{ padding: '10px 12px' }}
                                    />
                                    {productSearch && (
                                        <button
                                            type="button"
                                            className="btn btn-link text-muted border-0"
                                            onClick={handleClearProduct}
                                            style={{ textDecoration: 'none' }}
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                {showDropdown && (
                                    <ul className="list-group shadow border rounded mt-1 mb-0"
                                        style={{ position: 'absolute', zIndex: 1060, width: '100%', maxHeight: '220px', overflowY: 'auto', top: '100%', background: '#fff' }}>
                                        {filteredProducts.length > 0 ? filteredProducts.map(p => (
                                            <li key={p.id}
                                                className="list-group-item list-group-item-action py-2 px-3"
                                                style={{ cursor: 'pointer', fontSize: '13px' }}
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={() => handleSelectProduct(p)}>
                                                <span className="fw-semibold">{p.name}</span>
                                                <span className="text-muted ms-2" style={{ fontSize: '11px' }}>#{p.id}</span>
                                            </li>
                                        )) : (
                                            <li className="list-group-item text-muted py-2 px-3" style={{ fontSize: '13px' }}>No products found</li>
                                        )}
                                    </ul>
                                )}
                            </div>
                            <input type="hidden" required value={formData.P_ID} onChange={() => {}} />

                            {selectedProduct && (
                                <div className="mt-2 p-2 bg-light rounded" style={{ fontSize: '13px' }}>
                                    <span className="text-muted">Base Unit: </span>
                                    <span className="fw-bold text-success">{selectedProduct.baseUnit || 'Unit'}</span>
                                </div>
                            )}
                        </Form.Group>

                        {/* Batch Number */}
                        <Form.Group className="mb-4">
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                <Hash size={18} style={{ color: '#0d6efd', marginRight: '8px' }} />
                                <Form.Label style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>Batch Number</Form.Label>
                            </div>
                            <InputGroup style={{ borderRadius: '8px', overflow: 'hidden' }}>
                                <Form.Control 
                                    type="text" 
                                    placeholder="BATCH-2026-001" 
                                    required 
                                    value={formData.Batch_No}
                                    readOnly
                                    onChange={e => setFormData({...formData, Batch_No: e.target.value})}
                                    style={{ borderRadius: '8px', border: `1px solid ${errors.Batch_No ? '#dc3545' : '#dee2e6'}`, padding: '10px 12px', backgroundColor: '#f8f9fa' }} 
                                />
                            </InputGroup>
                            {errors.Batch_No && <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px' }}>❌ {errors.Batch_No}</div>}
                        </Form.Group>

                        {/* Quantity to Produce */}
                        <Form.Group className="mb-4">
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                <Layers size={18} style={{ color: '#0d6efd', marginRight: '8px' }} />
                                <Form.Label style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>Quantity to Produce</Form.Label>
                            </div>

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

                            <InputGroup>
                                <Form.Control
                                    type="number"
                                    step="1"
                                    min="1"
                                    required
                                    disabled={!formData.P_ID}
                                    placeholder={selectedUnit.label ? `Enter qty in ${selectedUnit.label}...` : 'Select product first...'}
                                    value={displayQty}
                                    onChange={e => handleDisplayQtyChange(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === '.' || e.key === ',' || e.key === '-') e.preventDefault();
                                    }}
                                    isInvalid={!!errors.Total_Qty_Produced}
                                    style={{ borderRadius: '8px 0 0 8px', border: `1px solid ${errors.Total_Qty_Produced ? '#dc3545' : '#dee2e6'}`, padding: '10px 12px' }}
                                />
                                <InputGroup.Text style={{ borderRadius: '0 8px 8px 0' }}>
                                    {selectedUnit.label || 'Unit'}
                                </InputGroup.Text>
                            </InputGroup>

                            {displayQty && parseInt(displayQty) > 0 && !selectedUnit.isBase && (
                                <div className="mt-2 px-3 py-2 rounded-3" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: '12px' }}>
                                    <span className="text-muted">
                                        <strong className="text-dark">{parseInt(displayQty)} {selectedUnit.label}</strong>
                                        {' = '}
                                        <strong className="text-dark">{parseInt(displayQty) * selectedUnit.conversionRate} {selectedProduct?.baseUnit}</strong>
                                        {' '}will be produced.
                                    </span>
                                </div>
                            )}

                            {errors.Total_Qty_Produced && <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px' }}>❌ {errors.Total_Qty_Produced}</div>}
                        </Form.Group>

                        {/* Production Date and Expiry Date in Same Row */}
                        <Row className="g-3 mb-2">
                            <Col md={6}>
                                <Form.Group>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                        <Calendar size={18} style={{ color: '#28a745', marginRight: '8px' }} />
                                        <Form.Label style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>Production Date</Form.Label>
                                    </div>
                                    <Form.Control type="date" required 
                                        onChange={e => setFormData({...formData, Production_Date: e.target.value})}
                                        style={{ borderRadius: '8px', border: '1px solid #dee2e6', padding: '10px 12px' }} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                        <Calendar size={18} style={{ color: '#dc3545', marginRight: '8px' }} />
                                        <Form.Label style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>Expiry Date</Form.Label>
                                    </div>
                                    <Form.Control 
                                        type="date" 
                                        required 
                                        onChange={e => setFormData({...formData, Exp_Date: e.target.value})}
                                        style={{ borderRadius: '8px', border: `1px solid ${errors.Exp_Date ? '#dc3545' : '#dee2e6'}`, padding: '10px 12px' }} 
                                    />
                                    {errors.Exp_Date && <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px' }}>❌ {errors.Exp_Date}</div>}
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
                </Modal.Body>
                <Modal.Footer style={{ backgroundColor: '#f8fbff', border: 'none', paddingTop: '8px', gap: '8px' }}>
                    <Button variant="light" onClick={() => { setErrors({}); onHide(); }} style={{ borderRadius: '8px', border: '1px solid #dee2e6', fontWeight: '500' }}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" style={{ borderRadius: '8px', fontWeight: '500', backgroundColor: '#0d6efd', border: 'none' }}>
                        Start Batch
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ProductionModal;