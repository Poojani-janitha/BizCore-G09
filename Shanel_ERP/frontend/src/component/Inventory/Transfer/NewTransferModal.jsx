import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { Search, X } from 'react-feather';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../config/apiEndpoints';

const LOCATION_OPTIONS = ['Production', 'Shop'];

const NewTransferModal = ({ show, onHide, refreshData, editTransfer }) => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [locationInventory, setLocationInventory] = useState({});
    const [formData, setFormData] = useState({
        P_ID: '', Qty: '', From_Location: '', To_Location: '', Transferred_By: ''
    });
    const [isEditing, setIsEditing] = useState(false);

    // Searchable dropdown state
    const [productSearch, setProductSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Unit selection state
    const [selectedUnitIndex, setSelectedUnitIndex] = useState(0); // 0 = base unit
    const [displayQty, setDisplayQty] = useState(''); // qty in selected unit

    // Close dropdown on outside click
    useEffect(() => {
        const handleOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, []);

    useEffect(() => {
        if (show) {
            axios.get(API_ENDPOINTS.inventory.products).then(res => setProducts(res.data));
            const userId = localStorage.getItem('userId');

            if (editTransfer) {
                setIsEditing(true);
                setFormData({
                    P_ID: editTransfer.P_ID || '',
                    Qty: editTransfer.Qty || '',
                    From_Location: editTransfer.From_Location || '',
                    To_Location: editTransfer.To_Location || '',
                    Transferred_By: editTransfer.Transferred_By || userId ? parseInt(userId) : null
                });
                setDisplayQty(editTransfer.Qty ? String(parseInt(editTransfer.Qty)) : '');
                setSelectedUnitIndex(0);

                if (editTransfer.P_ID) {
                    const product = products.find(p => p.id === editTransfer.P_ID);
                    if (product) {
                        setSelectedProduct(product);
                    }
                    
                    axios.get(API_ENDPOINTS.inventory.productLocations(editTransfer.P_ID))
                        .then(res => setLocationInventory(res.data || {}))
                        .catch(err => console.log('Failed to fetch location inventory'));
                }
            } else {
                setIsEditing(false);
                setFormData({ P_ID: '', Qty: '', From_Location: '', To_Location: '', Transferred_By: userId ? parseInt(userId) : null });
                setSelectedProduct(null);
                setLocationInventory({});
                setProductSearch('');
                setDisplayQty('');
                setSelectedUnitIndex(0);
            }
        } else {
            setIsEditing(false);
            setSelectedProduct(null);
            setLocationInventory({});
            setProductSearch('');
            setDisplayQty('');
            setSelectedUnitIndex(0);
            setFormData({ P_ID: '', Qty: '', From_Location: '', To_Location: '', Transferred_By: null });
        }
    }, [show, editTransfer]);

    // Build unit options: base unit first, then alternatives
    const unitOptions = useMemo(() => {
        if (!selectedProduct) return [];
        const base = { label: selectedProduct.baseUnit || 'Unit', conversionRate: 1, isBase: true };
        const alternatives = (selectedProduct.units || [])
            .filter(u => !u.isBaseUnit)
            .map(u => ({ label: u.unitName, conversionRate: parseFloat(u.conversionRate) || 1, isBase: false }));
        return [base, ...alternatives];
    }, [selectedProduct]);

    const selectedUnit = unitOptions[selectedUnitIndex] || { label: '', conversionRate: 1 };

    // Keep selected unit and entered qty when editing existing transfer records.
    useEffect(() => {
        if (!show || !isEditing || !editTransfer || !selectedProduct || unitOptions.length === 0) return;

        if (editTransfer.Display_Unit) {
            const idx = unitOptions.findIndex(u => u.label === editTransfer.Display_Unit);
            setSelectedUnitIndex(idx >= 0 ? idx : 0);
        }

        if (editTransfer.Display_Qty !== undefined && editTransfer.Display_Qty !== null && editTransfer.Display_Qty !== '') {
            setDisplayQty(String(parseInt(editTransfer.Display_Qty)));
        }
    }, [show, isEditing, editTransfer, selectedProduct, unitOptions]);

    // When unit changes, recalculate displayQty from base qty
    const handleUnitChange = (idx) => {
        setSelectedUnitIndex(idx);
        const newUnit = unitOptions[idx] || { conversionRate: 1 };
        if (formData.Qty) {
            const baseQty = parseFloat(formData.Qty);
            const inNewUnit = baseQty / newUnit.conversionRate;
            setDisplayQty(Number.isInteger(inNewUnit) ? String(inNewUnit) : inNewUnit.toFixed(4).replace(/\.?0+$/, ''));
        }
    };

    // When display qty changes, convert to base unit and store in formData.Qty
    const handleDisplayQtyChange = (val) => {
        // Only allow whole numbers
        const intVal = val.replace(/[^0-9]/g, '');
        setDisplayQty(intVal);
        const parsed = parseInt(intVal);
        if (!isNaN(parsed) && parsed >= 0) {
            const baseQty = parsed * selectedUnit.conversionRate;
            setFormData(prev => ({ ...prev, Qty: String(baseQty) }));
        } else {
            setFormData(prev => ({ ...prev, Qty: '' }));
        }
    };

    // Max qty allowed in currently selected unit (based on available stock in From_Location)
    const maxInSelectedUnit = () => {
        const base = getAvailableQuantity();
        if (!base) return 0;
        return Math.floor(base / selectedUnit.conversionRate);
    };

    // Exclude Raw + filter by starting letter
    const filteredProducts = products.filter(p => {
        if (p.type === 'Raw') return false;
        if (!productSearch.trim()) return true;
        return p.name?.toLowerCase().startsWith(productSearch.toLowerCase());
    });

    const handleSelectProduct = (product) => {
        setSelectedProduct(product);
        setProductSearch(product.name);
        setFormData(prev => ({ ...prev, P_ID: product.id, Qty: '' }));
        setDisplayQty('');
        setSelectedUnitIndex(0);
        setShowDropdown(false);
        axios.get(API_ENDPOINTS.inventory.productLocations(product.id))
            .then(res => setLocationInventory(res.data || {})).catch(() => {});
    };

    const handleClearProduct = () => {
        setSelectedProduct(null);
        setProductSearch('');
        setFormData(prev => ({ ...prev, P_ID: '', Qty: '' }));
        setLocationInventory({});
        setDisplayQty('');
        setSelectedUnitIndex(0);
        setShowDropdown(false);
    };

    const getAvailableQuantity = () => {
        if (!formData.From_Location || !locationInventory[formData.From_Location]) return 0;
        return parseFloat(locationInventory[formData.From_Location]) || 0;
    };

    // Show available qty in selected unit
    const availableInSelectedUnit = () => {
        const base = getAvailableQuantity();
        if (!selectedUnit.conversionRate || selectedUnit.conversionRate === 1) return `${base} ${selectedProduct?.baseUnit || ''}`;
        const converted = base / selectedUnit.conversionRate;
        const display = Number.isInteger(converted) ? converted : converted.toFixed(2);
        return `${base} ${selectedProduct?.baseUnit} (${display} ${selectedUnit.label})`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate: must be whole number and within available stock
        const enteredQty = parseInt(displayQty);
        if (!enteredQty || enteredQty <= 0) {
            alert('Please enter a valid quantity greater than 0.');
            return;
        }
        if (formData.From_Location && enteredQty > maxInSelectedUnit()) {
            alert(`Cannot transfer ${enteredQty} ${selectedUnit.label}. Only ${maxInSelectedUnit()} ${selectedUnit.label} available in ${formData.From_Location}.`);
            return;
        }

        try {
            // Always submit in base units
            const baseQty = parseFloat(formData.Qty);
            const payload = {
                ...formData,
                Qty: Number.isFinite(baseQty) ? baseQty : 0,
                Display_Qty: enteredQty,
                Display_Unit: selectedUnit.label || selectedProduct?.baseUnit || 'Unit'
            };
            if (isEditing && editTransfer) {
                // Update existing transfer
                await axios.put(API_ENDPOINTS.inventory.transfers.byId(editTransfer.ST_ID), formData);
            } else {
                // Create new transfer
                await axios.post(API_ENDPOINTS.inventory.transfers.create, formData);
            }
            refreshData();
            onHide();
            setSelectedProduct(null);
            setIsEditing(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Transfer Failed');
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton className="border-0">
                <Modal.Title className="fw-bold" style={{ fontSize: '15px' }}>
                    {isEditing ? 'Edit Stock Transfer' : 'New Stock Transfer'}
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>

                    {/* ── Searchable Product Dropdown ── */}
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">SELECT ITEM</Form.Label>
                        <div ref={dropdownRef} style={{ position: 'relative' }}>
                            <div className="input-group bg-light rounded border align-items-center px-2">
                                <Search size={14} className="text-muted flex-shrink-0" />
                                <input
                                    type="text"
                                    className="form-control form-control-sm border-0 bg-transparent shadow-none py-2"
                                    placeholder="Type to search product..."
                                    value={productSearch}
                                    onChange={(e) => {
                                        setProductSearch(e.target.value);
                                        setSelectedProduct(null);
                                        setFormData(prev => ({ ...prev, P_ID: '', Qty: '' }));
                                        setDisplayQty('');
                                        setSelectedUnitIndex(0);
                                        setShowDropdown(true);
                                    }}
                                    onFocus={() => setShowDropdown(true)}
                                    autoComplete="off"
                                />
                                {productSearch && (
                                    <button type="button" className="btn btn-link text-muted border-0 p-0 d-flex align-items-center"
                                        onClick={handleClearProduct} style={{ lineHeight: 1 }}>
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            {showDropdown && (
                                <ul className="list-group shadow border rounded mt-1 mb-0"
                                    style={{ position: 'absolute', zIndex: 1060, width: '100%', maxHeight: '200px', overflowY: 'auto', top: '100%' }}>
                                    {filteredProducts.length > 0 ? filteredProducts.map(p => (
                                        <li key={p.id}
                                            className="list-group-item list-group-item-action py-2 px-3"
                                            style={{ cursor: 'pointer', fontSize: '13px' }}
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => handleSelectProduct(p)}>
                                            <span className="fw-semibold">{p.name}</span>
                                            <span className="text-muted ms-2" style={{ fontSize: '11px' }}>#{p.id} · {p.type}</span>
                                        </li>
                                    )) : (
                                        <li className="list-group-item text-muted py-2 px-3" style={{ fontSize: '13px' }}>No products found</li>
                                    )}
                                </ul>
                            )}
                        </div>

                        {selectedProduct && (
                            <div className="mt-2 p-2 bg-light rounded" style={{ fontSize: '13px' }}>
                                <span className="text-muted">Total Stock: </span>
                                <span className="fw-bold text-success">{selectedProduct.stockCount || 0} {selectedProduct.baseUnit}</span>
                            </div>
                        )}
                        <input type="hidden" required value={formData.P_ID} onChange={() => {}} />
                    </Form.Group>

                    {/* ── From / To ── */}
                    <Row className="mb-3">
                        <Col>
                            <Form.Label className="small fw-bold">FROM</Form.Label>
                            <div className="input-group">
                                <Form.Select required value={formData.From_Location}
                                    onChange={e => {
                                        const nextFrom = e.target.value;
                                        setFormData(prev => ({
                                            ...prev,
                                            From_Location: nextFrom,
                                            To_Location: prev.To_Location === nextFrom ? '' : prev.To_Location
                                        }));
                                    }}>
                                    <option value="">Source...</option>
                                    {LOCATION_OPTIONS.map(location => (
                                        <option
                                            key={location}
                                            value={location}
                                            disabled={location === formData.To_Location}
                                        >
                                            {location}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Button
                                    variant="light"
                                    type="button"
                                    className="border"
                                    onClick={() => setFormData(prev => ({ ...prev, From_Location: '' }))}
                                    disabled={!formData.From_Location}
                                    title="Clear source location"
                                >
                                    <X size={14} />
                                </Button>
                            </div>
                            {selectedProduct && formData.From_Location && (
                                <div className="mt-2 p-2 bg-warning-subtle rounded" style={{ fontSize: '12px' }}>
                                    <span className="text-muted">Available: </span>
                                    <span className="fw-bold text-danger">{availableInSelectedUnit()}</span>
                                </div>
                            )}
                        </Col>
                        <Col>
                            <Form.Label className="small fw-bold">TO</Form.Label>
                            <div className="input-group">
                                <Form.Select required value={formData.To_Location}
                                    onChange={e => {
                                        const nextTo = e.target.value;
                                        setFormData(prev => ({
                                            ...prev,
                                            To_Location: nextTo,
                                            From_Location: prev.From_Location === nextTo ? '' : prev.From_Location
                                        }));
                                    }}>
                                    <option value="">Destination...</option>
                                    {LOCATION_OPTIONS.map(location => (
                                        <option
                                            key={location}
                                            value={location}
                                            disabled={location === formData.From_Location}
                                        >
                                            {location}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Button
                                    variant="light"
                                    type="button"
                                    className="border"
                                    onClick={() => setFormData(prev => ({ ...prev, To_Location: '' }))}
                                    disabled={!formData.To_Location}
                                    title="Clear destination location"
                                >
                                    <X size={14} />
                                </Button>
                            </div>
                        </Col>
                    </Row>

                    {/* ── Quantity with unit selector ── */}
                    <Form.Group className="mb-2">
                        <Form.Label className="small fw-bold">QUANTITY</Form.Label>

                        {/* Unit toggle pills — only shown when alternatives exist */}
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

                        {/* Qty input */}
                        <div className="input-group">
                            <Form.Control
                                type="number"
                                step="1"
                                min="1"
                                max={formData.From_Location ? maxInSelectedUnit() : undefined}
                                required
                                placeholder={`Enter qty in ${selectedUnit.label}...`}
                                value={displayQty}
                                onChange={e => handleDisplayQtyChange(e.target.value)}
                                onKeyDown={e => {
                                    // Block decimal point and minus
                                    if (e.key === '.' || e.key === ',' || e.key === '-') e.preventDefault();
                                }}
                                isInvalid={
                                    formData.From_Location &&
                                    displayQty !== '' &&
                                    parseInt(displayQty) > maxInSelectedUnit()
                                }
                            />
                            <span className="input-group-text fw-semibold bg-light" style={{ fontSize: '13px' }}>
                                {selectedUnit.label}
                            </span>
                            <Form.Control.Feedback type="invalid">
                                Max available: {maxInSelectedUnit()} {selectedUnit.label}
                            </Form.Control.Feedback>
                        </div>

                        {/* Single unified hint — shows max + conversion info */}
                        {displayQty && parseInt(displayQty) > 0 && (() => {
                            const entered = parseInt(displayQty);
                            const max = formData.From_Location ? maxInSelectedUnit() : Infinity;
                            const baseQty = entered * selectedUnit.conversionRate;
                            const isOver = formData.From_Location && entered > max;

                            return isOver ? (
                                <div className="mt-2 px-3 py-2 rounded-3 d-flex align-items-center gap-2"
                                    style={{ background: '#fef2f2', border: '1px solid #fecaca', fontSize: '12px' }}>
                                    <span className="text-danger fw-semibold">✕</span>
                                    <span className="text-danger">
                                        Only <strong>{max} {selectedUnit.label}</strong> available in {formData.From_Location}.
                                        {!selectedUnit.isBase && <> That equals <strong>{max * selectedUnit.conversionRate} {selectedProduct?.baseUnit}</strong>.</>}
                                    </span>
                                </div>
                            ) : (
                                <div className="mt-2 px-3 py-2 rounded-3 d-flex align-items-center gap-2"
                                    style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: '12px' }}>
                                    <span className="text-success fw-semibold">✓</span>
                                    <span className="text-muted">
                                        <strong className="text-dark">{entered} {selectedUnit.label}</strong>
                                        {!selectedUnit.isBase && <> = <strong className="text-dark">{baseQty} {selectedProduct?.baseUnit}</strong></>}
                                        &nbsp;will be transferred
                                        {formData.From_Location && max !== Infinity && (
                                            <> &nbsp;·&nbsp; Max: <strong className="text-dark">{max} {selectedUnit.label}</strong></>
                                        )}
                                    </span>
                                </div>
                            );
                        })()}
                    </Form.Group>

                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="light" onClick={onHide}>Cancel</Button>
                    <Button variant="primary" type="submit" disabled={!formData.P_ID}>
                        {isEditing ? 'Update Transfer' : 'Execute Transfer'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default NewTransferModal;
