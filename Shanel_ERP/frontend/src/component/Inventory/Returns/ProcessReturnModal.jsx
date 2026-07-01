import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Table, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { ArrowRight, CheckCircle, AlertCircle } from 'react-feather';

const ProcessReturnModal = ({ show, onHide, refresh }) => {
    const [invoiceNo, setInvoiceNo] = useState('');
    const [invoiceData, setInvoiceData] = useState(null);
    const [invoiceItems, setInvoiceItems] = useState([]);
    const [searchStatus, setSearchStatus] = useState('idle'); // idle, loading, found, notfound
    const [loadingItems, setLoadingItems] = useState(false);
    
    const [formData, setFormData] = useState({
        Return_Type: 'Customer',
        Ref_ID: '',
        Sale_ID: '',
        returnItems: [] // Array of items with good/bad quantities
    });
    
    const [errors, setErrors] = useState({});

    // Search invoice when user leaves invoice field
    const handleSearchInvoice = async () => {
        if (!invoiceNo.trim()) {
            setSearchStatus('idle');
            return;
        }

        setSearchStatus('loading');
        try {
            const res = await axios.get(`http://localhost:5000/api/inventory/invoice/${invoiceNo}`);
            if (res.data.success) {
                setInvoiceData(res.data.invoice);
                setFormData(prev => ({
                    ...prev,
                    Ref_ID: res.data.invoice.Sale_ID,
                    Sale_ID: res.data.invoice.Sale_ID
                }));
                setSearchStatus('found');
                setErrors({});
                
                // Load invoice items
                await loadInvoiceItems(res.data.invoice.Sale_ID);
            }
        } catch (err) {
            setSearchStatus('notfound');
            setInvoiceData(null);
            setInvoiceItems([]);
            setErrors({ invoice: err.response?.data?.message || 'Invoice not found' });
        }
    };

    // Load items for the invoice
    const loadInvoiceItems = async (saleId) => {
        setLoadingItems(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/inventory/invoice-details/${saleId}`);
            if (res.data.success) {
                setInvoiceItems(res.data.items);
                // Initialize return items array
                const initialReturnItems = res.data.items.map(item => ({
                    Sale_Item_Id: item.Sale_Item_Id,
                    P_ID: item.P_ID,
                    P_Name: item.P_Name,
                    Base_Unit: item.Base_Unit,
                    Base_Unit_Qty_Sold: item.Base_Unit_Qty_Sold,
                    Unit_Price: item.Unit_Price,
                    Sale_Date: item.Sale_Date,
                    Good_Qty: '',
                    Bad_Qty: '',
                    Total_Return_Qty: 0,
                    Reason: 'Damaged',
                    Reason_Details: '',
                    Refund_Amount: ''
                }));
                setFormData(prev => ({
                    ...prev,
                    returnItems: initialReturnItems
                }));
            }
        } catch (err) {
            console.error('Error loading items:', err);
            setInvoiceItems([]);
        } finally {
            setLoadingItems(false);
        }
    };

    // Update return item data
    const updateReturnItem = (index, field, value) => {
        const updatedItems = [...formData.returnItems];
        updatedItems[index][field] = value;

        // Auto-calculate refund if qty changed
        if (field === 'Good_Qty' || field === 'Bad_Qty') {
            const total = parseFloat(updatedItems[index].Good_Qty || 0) + parseFloat(updatedItems[index].Bad_Qty || 0);
            updatedItems[index].Total_Return_Qty = total;
            // Auto-calculate refund amount: quantity × unit price
            updatedItems[index].Refund_Amount = total > 0 ? (total * parseFloat(updatedItems[index].Unit_Price)).toFixed(2) : '';
        }

        setFormData(prev => ({
            ...prev,
            returnItems: updatedItems
        }));
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!invoiceNo.trim()) newErrors.invoice = 'Invoice number is required';
        if (!invoiceData) newErrors.invoice = 'Please select a valid invoice';
        
        const hasReturnItems = formData.returnItems.some(item => 
            parseFloat(item.Good_Qty) > 0 || parseFloat(item.Bad_Qty) > 0
        );

        if (!hasReturnItems) newErrors.items = 'Please enter return quantity for at least one item';

        formData.returnItems.forEach((item, idx) => {
            if (parseFloat(item.Good_Qty) + parseFloat(item.Bad_Qty) > parseFloat(item.Base_Unit_Qty_Sold)) {
                newErrors[`item_${idx}`] = `Return qty cannot exceed ${item.Base_Unit_Qty_Sold} (sold qty)`;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit return
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        try {
            // Process each return item separately
            const returnPromises = formData.returnItems
                .filter(item => parseFloat(item.Good_Qty) > 0 || parseFloat(item.Bad_Qty) > 0)
                .map(item => 
                    axios.post('http://localhost:5000/api/inventory/returns/process', {
                        P_ID: item.P_ID,
                        Return_Type: formData.Return_Type,
                        Ref_ID: formData.Ref_ID,
                        Total_Return_Qty: item.Total_Return_Qty,
                        Good_Qty: item.Good_Qty,
                        Bad_Qty: item.Bad_Qty,
                        Refund_Amount: item.Refund_Amount,
                        Reason: item.Reason,
                        Reason_Details: item.Reason_Details
                    })
                );

            await Promise.all(returnPromises);
            
            refresh();
            handleClose();
            alert('Return processed successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Error processing return');
        }
    };

    const handleClose = () => {
        setInvoiceNo('');
        setInvoiceData(null);
        setInvoiceItems([]);
        setFormData({
            Return_Type: 'Customer',
            Ref_ID: '',
            Sale_ID: '',
            returnItems: []
        });
        setSearchStatus('idle');
        setErrors({});
        onHide();
    };

    return (
        <>
        <Modal show={show} onHide={handleClose} size="xl" centered scrollable className="centered-modal">
            <Modal.Header closeButton className="border-0 pb-2" style={{ background: 'linear-gradient(135deg, #f7fbff 0%, #eef7f2 100%)' }}>
                <Modal.Title className="fw-bold">Process New Return</Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body className="py-3 px-3" style={{ maxHeight: '72vh', overflowY: 'auto', background: 'linear-gradient(180deg, #f9fcff 0%, #f5fbf7 100%)' }}>
                    
                    {/* Return Type Selection */}
                    <Row className="mb-3">
                        <Col md={12}>
                            <div className="p-3 rounded-4" style={{ background: '#fff', border: '1px solid #dbe4ef' }}>
                            <Form.Label className="small fw-bold text-secondary mb-2">RETURN TYPE</Form.Label>
                            <div className="d-flex gap-3 mt-2">
                                <Form.Check 
                                    type="radio" 
                                    label="Customer Return" 
                                    name="ReturnType"
                                    checked={formData.Return_Type === 'Customer'}
                                    onChange={() => setFormData({...formData, Return_Type: 'Customer'})}
                                />
                                <Form.Check 
                                    type="radio" 
                                    label="Supplier Return" 
                                    name="ReturnType"
                                    checked={formData.Return_Type === 'Supplier'}
                                    onChange={() => setFormData({...formData, Return_Type: 'Supplier'})}
                                />
                            </div>
                            </div>
                        </Col>
                    </Row>

                    {/* Invoice Search Section */}
                    <Row className="mb-3">
                        <Col lg={12} md={10}>
                            <div className="p-3 rounded-4" style={{ background: '#fff', border: '1px solid #dbe4ef' }}>
                                <Form.Label className="small fw-bold text-secondary mb-2">INVOICE NUMBER (e.g., 2026-001)</Form.Label>
                                <div className="d-flex gap-2 mb-2">
                                    <Form.Control 
                                        type="text"
                                        placeholder="Enter invoice number..."
                                        value={invoiceNo}
                                        onChange={(e) => setInvoiceNo(e.target.value)}
                                        className={errors.invoice ? 'is-invalid' : ''}
                                        style={{ borderRadius: '10px', border: '1px solid #cbd5e1', padding: '10px 12px' }}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSearchInvoice();
                                            }
                                        }}
                                    />
                                    <Button 
                                        variant="primary" 
                                        onClick={handleSearchInvoice}
                                        disabled={!invoiceNo.trim() || searchStatus === 'loading'}
                                        className="rounded-3 px-4 fw-bold"
                                        style={{ backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}
                                    >
                                        {searchStatus === 'loading' ? (
                                            <>
                                                <Spinner size="sm" className="me-1"/> Searching
                                            </>
                                        ) : (
                                            'Find'
                                        )}
                                    </Button>
                                </div>
                                {errors.invoice && <div className="text-danger small mt-2">{errors.invoice}</div>}
                                
                                {/* Status Indicators */}
                                {searchStatus === 'found' && invoiceData && (
                                    <div className="mt-2">
                                        <Badge bg="success" className="p-2">
                                            <CheckCircle size={14} className="me-1" /> Found
                                        </Badge>
                                    </div>
                                )}
                                {searchStatus === 'notfound' && (
                                    <div className="mt-2">
                                        <Badge bg="danger" className="p-2">
                                            <AlertCircle size={14} className="me-1" /> Not Found
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>

                    {/* Customer Info - Show when invoice found */}
                    {invoiceData && (
                        <Row className="mb-3 p-3 rounded-4" style={{ background: '#ecfeff', border: '1px solid #a5f3fc' }}>
                            <Col md={6}>
                                <small className="text-secondary fw-bold">CUSTOMER</small>
                                <p className="mb-0 fw-bold">{invoiceData.Customer_Name}</p>
                            </Col>
                            <Col md={3}>
                                <small className="text-secondary fw-bold">INVOICE DATE</small>
                                <p className="mb-0">{new Date(invoiceData.Sale_Date).toLocaleDateString()}</p>
                            </Col>
                            <Col md={3}>
                                <small className="text-secondary fw-bold">INVOICE TOTAL</small>
                                <p className="mb-0 text-success fw-bold">LKR {parseFloat(invoiceData.Total_Amount).toLocaleString('en-LK', {maximumFractionDigits: 2})}</p>
                            </Col>
                        </Row>
                    )}

                    {/* Return Items Table */}
                    {invoiceItems.length > 0 && (
                        <>
                            {errors.items && <Alert variant="warning" className="mb-3">{errors.items}</Alert>}
                            
                            <div className="p-2 rounded-4" style={{ background: '#fff', border: '1px solid #dbe4ef' }}>
                            <div className="table-responsive">
                                <Table hover size="sm" className="mb-0">
                                    <thead>
                                        <tr>
                                            <th className="fw-bold small" style={{ background: '#f8fafc' }}>PRODUCT</th>
                                            <th className="fw-bold small" style={{ background: '#f8fafc' }}>BASE UNIT</th>
                                            <th className="fw-bold small text-end" style={{ background: '#f8fafc' }}>PURCHASED</th>
                                            <th className="fw-bold small text-end" style={{ background: '#f8fafc' }}>GOOD QTY</th>
                                            <th className="fw-bold small text-end" style={{ background: '#f8fafc' }}>BAD QTY</th>
                                            <th className="fw-bold small text-end" style={{ background: '#f8fafc' }}>UNIT PRICE</th>
                                            <th className="fw-bold small text-end" style={{ background: '#f8fafc' }}>REFUND AMOUNT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.returnItems.map((item, idx) => (
                                            <tr key={idx} className="border-bottom">
                                                <td>
                                                    <small className="fw-bold">{item.P_Name}</small>
                                                </td>
                                                <td>
                                                    <Badge bg="secondary" className="small">{item.Base_Unit}</Badge>
                                                </td>
                                                <td className="text-end">
                                                    <small className="fw-bold">{parseFloat(item.Base_Unit_Qty_Sold)} {item.Base_Unit}</small>
                                                </td>
                                                <td>
                                                    <Form.Control 
                                                        type="number"
                                                        step="0.01"
                                                        size="sm"
                                                        value={item.Good_Qty}
                                                        onChange={(e) => updateReturnItem(idx, 'Good_Qty', e.target.value)}
                                                        className="text-end"
                                                        min="0"
                                                        max={item.Base_Unit_Qty_Sold}
                                                        style={{ borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                                    />
                                                </td>
                                                <td>
                                                    <Form.Control 
                                                        type="number"
                                                        step="0.01"
                                                        size="sm"
                                                        value={item.Bad_Qty}
                                                        onChange={(e) => updateReturnItem(idx, 'Bad_Qty', e.target.value)}
                                                        className="text-end"
                                                        min="0"
                                                        max={item.Base_Unit_Qty_Sold}
                                                        style={{ borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                                    />
                                                </td>
                                                <td className="text-end">
                                                    <small>LKR {parseFloat(item.Unit_Price).toFixed(2)}</small>
                                                </td>
                                                <td>
                                                    <Form.Control 
                                                        type="number"
                                                        step="0.01"
                                                        size="sm"
                                                        value={item.Refund_Amount}
                                                        onChange={(e) => updateReturnItem(idx, 'Refund_Amount', e.target.value)}
                                                        className="text-end"
                                                        min="0"
                                                        style={{ width: '120px', marginLeft: 'auto', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                            </div>

                            {/* Reason & Details for each item */}
                            <div className="mt-3 p-3 rounded-4" style={{ background: '#fff', border: '1px solid #dbe4ef' }}>
                                <Form.Label className="small fw-bold text-secondary">RETURN REASON & DETAILS</Form.Label>
                                {formData.returnItems.map((item, idx) => (
                                    (parseFloat(item.Good_Qty) > 0 || parseFloat(item.Bad_Qty) > 0) && (
                                        <div key={idx} className="mb-2 p-2 rounded border bg-light">
                                            <small className="fw-bold text-primary">{item.P_Name}</small>
                                            <Row className="mt-1">
                                                <Col md={6}>
                                                    <Form.Label className="small fw-bold">PRIMARY REASON</Form.Label>
                                                    <Form.Select 
                                                        size="sm"
                                                        value={item.Reason}
                                                        onChange={(e) => updateReturnItem(idx, 'Reason', e.target.value)}
                                                    >
                                                        <option value="Damaged">Damaged</option>
                                                        <option value="Expired">Expired</option>
                                                        <option value="Wrong_Product">Wrong Product</option>
                                                        <option value="Quality_Issue">Quality Issue</option>
                                                        <option value="Overstocked">Overstocked</option>
                                                        <option value="Other">Other</option>
                                                    </Form.Select>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Label className="small fw-bold">DETAILS</Form.Label>
                                                    <Form.Control 
                                                        as="textarea"
                                                        rows={2}
                                                        size="sm"
                                                        placeholder="Describe the issue..."
                                                        value={item.Reason_Details}
                                                        onChange={(e) => updateReturnItem(idx, 'Reason_Details', e.target.value)}
                                                    />
                                                </Col>
                                            </Row>
                                            {errors[`item_${idx}`] && (
                                                <div className="text-danger small mt-2">{errors[`item_${idx}`]}</div>
                                            )}
                                        </div>
                                    )
                                ))}
                            </div>
                        </>
                    )}

                </Modal.Body>

                <Modal.Footer className="border-0 p-2" style={{ background: 'linear-gradient(180deg, #f9fcff 0%, #f5fbf7 100%)' }}>
                    <Button variant="light" className="rounded-3 px-4" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        type="submit"
                        disabled={!invoiceData || loadingItems || formData.returnItems.length === 0}
                        className="rounded-3 px-4 shadow-sm" 
                        style={{ backgroundColor: '#f97316', borderColor: '#f97316' }}
                    >
                        Complete Return
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>

        <style>{`
            /* Scoped modal centering for returns processing modal */
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
            .modal.centered-modal .modal-dialog.modal-xl { max-width: 1140px; }
            .modal.centered-modal .modal-content { max-height: calc(100vh - 120px); overflow-y: auto; }
        `}</style>

        </>
    );
};

export default ProcessReturnModal;