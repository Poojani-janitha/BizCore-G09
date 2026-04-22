import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';

const EditReturnModal = ({ show, onHide, returnItem, refresh }) => {
    const [formData, setFormData] = useState({
        Qty: '',
        Reason: 'Damaged',
        Reason_Details: '',
        Refund_Amount: '',
        Restock: 1
    });
    
    const [errors, setErrors] = useState({});

    // Load return data when modal opens
    useEffect(() => {
        if (show && returnItem) {
            setFormData({
                Qty: returnItem.Qty,
                Reason: returnItem.Reason,
                Reason_Details: returnItem.Reason_Details || '',
                Refund_Amount: returnItem.Refund_Amount,
                Restock: returnItem.Restock
            });
            setErrors({});
        }
    }, [show, returnItem]);

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.Qty || parseFloat(formData.Qty) <= 0) {
            newErrors.Qty = 'Quantity must be greater than 0';
        }

        if (!formData.Refund_Amount || parseFloat(formData.Refund_Amount) < 0) {
            newErrors.Refund_Amount = 'Refund amount cannot be negative';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const response = await axios.put(
                `http://localhost:5000/api/inventory/returns/${returnItem.RT_ID}`,
                {
                    Qty: parseFloat(formData.Qty),
                    Reason: formData.Reason,
                    Reason_Details: formData.Reason_Details,
                    Refund_Amount: parseFloat(formData.Refund_Amount),
                    Restock: parseInt(formData.Restock)
                }
            );

            if (response.data.success) {
                refresh();
                handleClose();
                alert('Return updated successfully');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating return');
        }
    };

    const handleClose = () => {
        setFormData({
            Qty: '',
            Reason: 'Damaged',
            Reason_Details: '',
            Refund_Amount: '',
            Restock: 1
        });
        setErrors({});
        onHide();
    };

    if (!returnItem) return null;

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton className="border-0 pb-2">
                <Modal.Title className="fw-bold">Edit Return (RT #{returnItem.RT_ID})</Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body className="py-4">
                    
                    {/* Return Info Display */}
                    <Row className="mb-4 p-3 rounded-3 bg-info bg-opacity-10 border border-info-subtle">
                        <Col md={6}>
                            <small className="text-secondary fw-bold">PRODUCT</small>
                            <p className="mb-0 fw-bold">{returnItem.P_Name}</p>
                        </Col>
                        <Col md={6}>
                            <small className="text-secondary fw-bold">INVOICE</small>
                            <p className="mb-0 fw-bold">{returnItem.Invoice_No}</p>
                        </Col>
                        <Col md={6} className="mt-2">
                            <small className="text-secondary fw-bold">CUSTOMER</small>
                            <p className="mb-0">{returnItem.C_Name || 'Unknown'}</p>
                        </Col>
                        <Col md={6} className="mt-2">
                            <small className="text-secondary fw-bold">RETURN DATE</small>
                            <p className="mb-0">{new Date(returnItem.Return_Date).toLocaleDateString('en-LK')}</p>
                        </Col>
                    </Row>

                    {/* Editable Fields */}
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-secondary">QUANTITY</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.01"
                                    value={formData.Qty}
                                    onChange={(e) => setFormData({...formData, Qty: e.target.value})}
                                    className={errors.Qty ? 'is-invalid' : ''}
                                />
                                {errors.Qty && <div className="text-danger small mt-1">{errors.Qty}</div>}
                                <small className="text-muted">Base Unit: {returnItem.Base_Unit}</small>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-secondary">RETURN TYPE</Form.Label>
                                <Form.Select
                                    value={formData.Restock}
                                    onChange={(e) => setFormData({...formData, Restock: parseInt(e.target.value)})}
                                >
                                    <option value={1}>Good ✓ (Add to Inventory)</option>
                                    <option value={0}>Bad ✗ (Waste/Throw)</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-secondary">RETURN REASON</Form.Label>
                                <Form.Select
                                    value={formData.Reason}
                                    onChange={(e) => setFormData({...formData, Reason: e.target.value})}
                                >
                                    <option value="Damaged">Damaged</option>
                                    <option value="Expired">Expired</option>
                                    <option value="Wrong_Product">Wrong Product</option>
                                    <option value="Quality_Issue">Quality Issue</option>
                                    <option value="Overstocked">Overstocked</option>
                                    <option value="Other">Other</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-secondary">REFUND AMOUNT (LKR)</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.01"
                                    value={formData.Refund_Amount}
                                    onChange={(e) => setFormData({...formData, Refund_Amount: e.target.value})}
                                    className={errors.Refund_Amount ? 'is-invalid' : ''}
                                />
                                {errors.Refund_Amount && <div className="text-danger small mt-1">{errors.Refund_Amount}</div>}
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-secondary">REASON DETAILS</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={formData.Reason_Details}
                            onChange={(e) => setFormData({...formData, Reason_Details: e.target.value})}
                            placeholder="Add any additional details about this return..."
                        />
                    </Form.Group>

                    <Alert variant="info" className="mb-0">
                        <small>
                            <strong>Note:</strong> If changing from Bad to Good or vice versa, inventory will be updated accordingly.
                        </small>
                    </Alert>

                </Modal.Body>

                <Modal.Footer className="border-0 pt-0">
                    <Button variant="light" className="rounded-3 px-4" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        className="rounded-3 px-4 shadow-sm"
                        style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                    >
                        Update Return
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default EditReturnModal;
