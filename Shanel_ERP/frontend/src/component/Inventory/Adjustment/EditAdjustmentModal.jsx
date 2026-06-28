import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const EditAdjustmentModal = ({ show, onHide, adjustment, refresh }) => {
    const [products, setProducts] = useState([]);
    const [currentStock, setCurrentStock] = useState(0);
    const [formData, setFormData] = useState({
        Adjustment_Qty: '',
        Adjustment_Type: 'Stock_Take',
        Adjustment_Date: new Date().toISOString().split('T')[0],
        Reason: ''
    });

    // Fetch products when modal opens
    useEffect(() => {
        if (show) {
            axios.get('http://localhost:5000/api/inventory/products')
                .then(res => setProducts(res.data))
                .catch(err => console.error("Error loading products:", err));
        }
    }, [show]);

    // Load adjustment data when adjustment changes
    useEffect(() => {
        if (adjustment && show) {
            setFormData({
                Adjustment_Qty: Math.abs(adjustment.Difference),
                Adjustment_Type: adjustment.Adjustment_Type,
                Adjustment_Date: adjustment.Adjustment_Date,
                Reason: adjustment.Reason || ''
            });
            setCurrentStock(adjustment.System_Qty);
        }
    }, [adjustment, show]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!formData.Adjustment_Qty || parseFloat(formData.Adjustment_Qty) <= 0) {
            alert('Adjustment quantity must be greater than 0');
            return;
        }
        if (!formData.Reason) {
            alert('Please provide a reason for this adjustment');
            return;
        }
        
        try {
            const response = await axios.put(
                `http://localhost:5000/api/inventory/adjustments/${adjustment.Adjustment_ID}`,
                formData
            );
            if (response.data.success) {
                refresh();
                onHide();
                alert('Adjustment updated successfully');
            }
        } catch (error) {
            alert(error.response?.data?.message || "Update Failed");
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold fs-5">Edit Stock Adjustment</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body className="py-4">
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted">ITEM</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    disabled 
                                    className="bg-light border-0 py-2"
                                    value={adjustment?.Product?.P_Name || ''}
                                />
                                {adjustment && (
                                    <small className="text-success fw-bold d-block mt-2">
                                        Previous Stock: <span className="text-primary">{adjustment.System_Qty}</span> units
                                    </small>
                                )}
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted">ADJUSTMENT REASON (TYPE)</Form.Label>
                                <Form.Select 
                                    className="bg-light border-0 py-2 shadow-none"
                                    value={formData.Adjustment_Type}
                                    onChange={(e) => setFormData({...formData, Adjustment_Type: e.target.value})}
                                >
                                    <option value="Stock_Take">Stock Take (General Audit)</option>
                                    <option value="Damage">Damaged - Reduce Stock</option>
                                    <option value="Expired">Expired - Reduce Stock</option>
                                    <option value="Theft">Stolen/Theft</option>
                                    <option value="Other">Other Reason</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted">LOCATION</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    disabled 
                                    className="bg-light border-0 py-2"
                                    value={adjustment?.Location || ''}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted">
                                    {formData.Adjustment_Type === 'Stock_Take' ? 'NEW QUANTITY' : 'QUANTITY TO REMOVE'}
                                </Form.Label>
                                <Form.Control 
                                    type="number" 
                                    step="0.01"
                                    min="0"
                                    placeholder="Enter new quantity" 
                                    required 
                                    className="bg-light border-0 py-2 shadow-none"
                                    value={formData.Adjustment_Qty}
                                    onChange={(e) => setFormData({...formData, Adjustment_Qty: e.target.value})}
                                />
                                <small className="text-muted d-block mt-1">
                                    Stock will be adjusted by reversing previous change first
                                </small>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted">DATE</Form.Label>
                                <Form.Control 
                                    type="date" 
                                    className="bg-light border-0 py-2 shadow-none"
                                    value={formData.Adjustment_Date}
                                    onChange={(e) => setFormData({...formData, Adjustment_Date: e.target.value})}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group>
                        <Form.Label className="small fw-bold text-muted">NOTES / DETAILS</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={3} 
                            placeholder="Provide details about this adjustment..."
                            className="bg-light border-0 shadow-none"
                            required
                            value={formData.Reason}
                            onChange={(e) => setFormData({...formData, Reason: e.target.value})}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button variant="link" className="text-decoration-none text-muted" onClick={onHide}>
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        type="submit" 
                        className="px-4 py-2 rounded-3 shadow-sm"
                        style={{ backgroundColor: '#24381f', borderColor: '#14290e' }}
                    >
                        Update Adjustment
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default EditAdjustmentModal;
