import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const NewTransferModal = ({ show, onHide, refreshData, editTransfer }) => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [locationInventory, setLocationInventory] = useState({});
    const [formData, setFormData] = useState({
        P_ID: '', Qty: '', From_Location: '', To_Location: '', Transferred_By: ''
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (show) {
            axios.get('/api/inventory/products').then(res => setProducts(res.data));
            const userId = localStorage.getItem('userId');
            
            if (editTransfer) {
                // Load existing transfer data for editing
                setIsEditing(true);
                setFormData({
                    P_ID: editTransfer.P_ID || '',
                    Qty: editTransfer.Qty || '',
                    From_Location: editTransfer.From_Location || '',
                    To_Location: editTransfer.To_Location || '',
                    Transferred_By: editTransfer.Transferred_By || userId ? parseInt(userId) : null
                });
                
                // Fetch the product and location inventory
                if (editTransfer.P_ID) {
                    const product = products.find(p => p.id === editTransfer.P_ID);
                    if (product) {
                        setSelectedProduct(product);
                    }
                    
                    axios.get(`/api/inventory/product/${editTransfer.P_ID}/locations`)
                        .then(res => setLocationInventory(res.data || {}))
                        .catch(err => console.log('Failed to fetch location inventory'));
                }
            } else {
                // New transfer mode
                setIsEditing(false);
                setFormData({
                    P_ID: '', Qty: '', From_Location: '', To_Location: '', Transferred_By: userId ? parseInt(userId) : null
                });
                setSelectedProduct(null);
                setLocationInventory({});
            }
        } else {
            // Reset state when modal closes
            setIsEditing(false);
            setSelectedProduct(null);
            setLocationInventory({});
            setFormData({
                P_ID: '', Qty: '', From_Location: '', To_Location: '', Transferred_By: null
            });
        }
    }, [show, editTransfer]);

    const handleProductChange = (e) => {
        const productId = e.target.value;
        const product = products.find(p => p.id == productId);
        setSelectedProduct(product);
        setFormData({...formData, P_ID: productId});
        
        // Fetch inventory details for this product by location
        axios.get(`/api/inventory/product/${productId}/locations`)
            .then(res => {
                setLocationInventory(res.data || {});
            })
            .catch(err => console.log('Failed to fetch location inventory'));
    };

    const handleLocationChange = (e) => {
        setFormData({...formData, From_Location: e.target.value});
    };

    const getAvailableQuantity = () => {
        if (!formData.From_Location || !locationInventory[formData.From_Location]) {
            return 0;
        }
        return locationInventory[formData.From_Location];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing && editTransfer) {
                // Update existing transfer
                await axios.put(`/api/inventory/transfers/${editTransfer.ST_ID}`, formData);
            } else {
                // Create new transfer
                await axios.post('/api/inventory/transfers/create', formData);
            }
            refreshData();
            onHide();
            setSelectedProduct(null);
            setIsEditing(false);
        } catch (err) {
            alert(err.response?.data?.message || "Transfer Failed");
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton className="border-0">
                <Modal.Title className="fw-bold">
                    {isEditing ? 'Edit Stock Transfer' : 'New Stock Transfer'}
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">SELECT ITEM</Form.Label>
                        <Form.Select required value={formData.P_ID} onChange={handleProductChange}>
                            <option value="">Choose Product...</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </Form.Select>
                        {selectedProduct && (
                            <div className="mt-2 p-2 bg-light rounded" style={{ fontSize: '13px' }}>
                                <span className="text-muted">Total Available: </span>
                                <span className="fw-bold text-success">{selectedProduct.stockCount || 0} {selectedProduct.baseUnit || 'units'}</span>
                            </div>
                        )}
                    </Form.Group>
                    <Row className="mb-3">
                        <Col>
                            <Form.Label className="small fw-bold">FROM</Form.Label>
                            <Form.Select required value={formData.From_Location} onChange={handleLocationChange}>
                                <option value="">Source...</option>
                                <option value="Production">Production</option>
                                <option value="Shop">Shop</option>
                            </Form.Select>
                            {selectedProduct && formData.From_Location && (
                                <div className="mt-2 p-2 bg-warning-subtle rounded" style={{ fontSize: '13px' }}>
                                    <span className="text-muted">Available in {formData.From_Location}: </span>
                                    <span className="fw-bold text-danger">{getAvailableQuantity()} {selectedProduct.baseUnit || 'units'}</span>
                                </div>
                            )}
                        </Col>
                        <Col>
                            <Form.Label className="small fw-bold">TO</Form.Label>
                            <Form.Select required value={formData.To_Location} onChange={e => setFormData({...formData, To_Location: e.target.value})}>
                                <option value="">Destination...</option>
                                <option value="Production">Production</option>
                                <option value="Shop">Shop</option>
                            </Form.Select>
                        </Col>
                    </Row>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">QUANTITY ({selectedProduct?.baseUnit || 'Units'})</Form.Label>
                        <Form.Control type="number" step="1" min="0" required value={formData.Qty ? parseInt(formData.Qty) : ''} onChange={e => setFormData({...formData, Qty: e.target.value})} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="light" onClick={onHide}>Cancel</Button>
                    <Button variant="primary" type="submit">
                        {isEditing ? 'Update Transfer' : 'Execute Transfer'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default NewTransferModal;
