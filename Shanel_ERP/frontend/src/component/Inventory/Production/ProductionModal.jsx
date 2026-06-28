import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import { Package, Calendar, Layers, Hash } from 'react-feather';

const ProductionModal = ({ show, onHide, refreshData }) => {
    const getFallbackBatchNo = () => {
        const currentYear = String(new Date().getFullYear());
        return `BATCH-${currentYear}-001`;
    };

    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({ P_ID: '', Batch_No: '', Total_Qty_Produced: '', Production_Date: '', Exp_Date: '' });
    const [errors, setErrors] = useState({});
    const [existingBatches, setExistingBatches] = useState([]);

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
        }
    }, [show]);

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
                            <Form.Select required onChange={e => setFormData({...formData, P_ID: e.target.value})}
                                style={{ borderRadius: '8px', border: '1px solid #dee2e6', padding: '10px 12px' }}>
                                <option value="">Choose product...</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </Form.Select>
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
                            <Form.Control 
                                type="number" 
                                min="0"
                                required 
                                onChange={e => setFormData({...formData, Total_Qty_Produced: e.target.value})}
                                style={{ borderRadius: '8px', border: `1px solid ${errors.Total_Qty_Produced ? '#dc3545' : '#dee2e6'}`, padding: '10px 12px' }} 
                            />
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