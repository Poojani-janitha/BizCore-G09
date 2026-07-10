import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../config/apiEndpoints';

const EditProductionModal = ({ show, onHide, refreshData, batch, products }) => {
    const [formData, setFormData] = useState({
        P_ID: '',
        Total_Qty_Produced: '',
        Production_Date: '',
        Exp_Date: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (show && batch) {
            setFormData({
                P_ID: batch.P_ID || '',
                Total_Qty_Produced: batch.Total_Qty_Produced || '',
                Production_Date: batch.Production_Date || '',
                Exp_Date: batch.Exp_Date || ''
            });
            setErrors({});
        }
    }, [show, batch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        const qty = parseFloat(formData.Total_Qty_Produced);
        if (!qty || qty <= 0) {
            newErrors.Total_Qty_Produced = 'Quantity must be greater than 0';
        }

        if (formData.Production_Date && formData.Exp_Date) {
            const prodDate = new Date(formData.Production_Date);
            const expDate = new Date(formData.Exp_Date);
            if (expDate < prodDate) {
                newErrors.Exp_Date = 'Expiry date cannot be before production date';
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setErrors({});
            await axios.put(API_ENDPOINTS.production.byId(batch.PR_ID), formData);
            refreshData();
            onHide();
        } catch (error) {
            setErrors({ submit: error.response?.data?.message || 'Error updating production batch' });
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered size="md">
            <Modal.Header closeButton>
                <Modal.Title className="fw-bold">Edit Production Batch</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {errors.submit && (
                        <div className="alert alert-danger py-2" role="alert">
                            {errors.submit}
                        </div>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Batch Number</Form.Label>
                        <Form.Control value={batch?.Batch_No || ''} readOnly />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Product</Form.Label>
                        <Form.Select
                            value={formData.P_ID}
                            onChange={(e) => setFormData({ ...formData, P_ID: e.target.value })}
                            required
                        >
                            <option value="">Choose product...</option>
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Quantity to Produce</Form.Label>
                        <Form.Control
                            type="number"
                            min="0"
                            value={formData.Total_Qty_Produced}
                            onChange={(e) => setFormData({ ...formData, Total_Qty_Produced: e.target.value })}
                            isInvalid={!!errors.Total_Qty_Produced}
                            required
                        />
                        <Form.Control.Feedback type="invalid">{errors.Total_Qty_Produced}</Form.Control.Feedback>
                    </Form.Group>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">Production Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={formData.Production_Date}
                                    onChange={(e) => setFormData({ ...formData, Production_Date: e.target.value })}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">Expiry Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={formData.Exp_Date}
                                    onChange={(e) => setFormData({ ...formData, Exp_Date: e.target.value })}
                                    isInvalid={!!errors.Exp_Date}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">{errors.Exp_Date}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>Cancel</Button>
                    <Button variant="primary" type="submit">Save Changes</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default EditProductionModal;
