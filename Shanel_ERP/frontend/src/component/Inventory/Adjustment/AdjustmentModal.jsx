import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const AdjustmentModal = ({ show, onHide, refresh }) => {
    const [products, setProducts] = useState([]);
    const [currentStock, setCurrentStock] = useState(0);
    const [formData, setFormData] = useState({
        P_ID: '',
        Location: 'Shop',
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

    // Get current stock when product is selected
    const handleProductChange = (productId) => {
        setFormData({...formData, P_ID: productId});
        const selectedProduct = products.find(p => p.id === parseInt(productId));
        setCurrentStock(selectedProduct ? selectedProduct.stockCount : 0);
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
        if (!formData.Reason) {
            alert('Please provide a reason for this adjustment');
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
                setCurrentStock(0);
            }
        } catch (error) {
            alert(error.response?.data?.message || "Adjustment Failed");
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold fs-5">Create Stock Adjustment</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body className="py-4">
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted">SELECT ITEM</Form.Label>
                                <Form.Select 
                                    required 
                                    className="bg-light border-0 py-2 shadow-none"
                                    value={formData.P_ID}
                                    onChange={(e) => handleProductChange(e.target.value)}
                                >
                                    <option value="">Select an item...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                                    ))}
                                </Form.Select>
                                {formData.P_ID && (
                                    <small className="text-success fw-bold d-block mt-2">
                                        Current Stock: <span className="text-primary">{currentStock}</span> units
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
                                <Form.Select 
                                    className="bg-light border-0 py-2 shadow-none"
                                    value={formData.Location}
                                    onChange={(e) => setFormData({...formData, Location: e.target.value})}
                                >
                                    <option value="Shop">Shop</option>
                                    <option value="Production">Production</option>
                                    <option value="Main_Warehouse">Main Warehouse</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted">
                                    {formData.Adjustment_Type === 'Stock_Take' ? 'ADD QUANTITY' : 'REDUCE BY QUANTITY'}
                                </Form.Label>
                                <Form.Control 
                                    type="number" 
                                    step="0.01"
                                    placeholder={formData.Adjustment_Type === 'Stock_Take' ? "Enter quantity to add" : "Enter quantity to remove"} 
                                    required 
                                    className="bg-light border-0 py-2 shadow-none"
                                    value={formData.Adjustment_Qty}
                                    onChange={(e) => setFormData({...formData, Adjustment_Qty: e.target.value})}
                                />
                                <small className="text-muted d-block mt-1">
                                    {formData.Adjustment_Type === 'Stock_Take' 
                                        ? "Enter amount to ADD to stock"
                                        : `Enter amount to REMOVE from stock (${currentStock} available)`
                                    }
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
                            placeholder="Provide details about this adjustment (e.g. Batch number, specific damage info)..."
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
                        style={{ backgroundColor: '#24381f', borderColor: '#14290e' }} // Matched your Figma Orange
                    >
                        Submit Adjustment
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default AdjustmentModal;