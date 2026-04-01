import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

const ProductionModal = ({ show, onHide, refreshData }) => {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({ P_ID: '', Batch_No: '', Total_Qty_Produced: '', Exp_Date: '' });

    useEffect(() => {
        axios.get('http://localhost:5000/api/inventory/products').then(res => {
            setProducts(res.data.filter(p => p.type === 'Company'));
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/production/start', formData);
            refreshData();
            onHide();
            setFormData({ P_ID: '', Batch_No: '', Total_Qty_Produced: '', Exp_Date: '' });
        } catch (error) { alert("Error starting production"); }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton className="border-0">
                <Modal.Title className="fw-bold">Start New Production</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Select Product</Form.Label>
                        <Form.Select required onChange={e => setFormData({...formData, P_ID: e.target.value})}>
                            <option value="">Choose product...</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Batch Number</Form.Label>
                        <Form.Control type="text" placeholder="e.g. BATCH-001" required 
                            onChange={e => setFormData({...formData, Batch_No: e.target.value})} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Quantity to Produce</Form.Label>
                        <Form.Control type="number" required 
                            onChange={e => setFormData({...formData, Total_Qty_Produced: e.target.value})} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Expiry Date</Form.Label>
                        <Form.Control type="date" required 
                            onChange={e => setFormData({...formData, Exp_Date: e.target.value})} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="light" onClick={onHide}>Cancel</Button>
                    <Button variant="primary" type="submit">Start Batch</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ProductionModal;