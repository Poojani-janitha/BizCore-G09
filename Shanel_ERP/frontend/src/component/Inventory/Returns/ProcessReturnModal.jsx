import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Table, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { CheckCircle, AlertCircle } from 'react-feather';

const ProcessReturnModal = ({ show, onHide, refresh }) => {
    const [invoiceNo, setInvoiceNo] = useState('');
    const [invoiceData, setInvoiceData] = useState(null);
    const [invoiceItems, setInvoiceItems] = useState([]);
    const [searchStatus, setSearchStatus] = useState('idle');
    const [loadingItems, setLoadingItems] = useState(false);

    const [formData, setFormData] = useState({
        Return_Type: 'Customer',
        Ref_ID: '',
        Sale_ID: '',
        returnItems: []
    });

    const [errors, setErrors] = useState({});

    const handleSearchInvoice = async () => {
        if (!invoiceNo.trim()) { setSearchStatus('idle'); return; }
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
                await loadInvoiceItems(res.data.invoice.Sale_ID);
            }
        } catch (err) {
            setSearchStatus('notfound');
            setInvoiceData(null);
            setInvoiceItems([]);
            setErrors({ invoice: err.response?.data?.message || 'Invoice not found' });
        }
    };

    const loadInvoiceItems = async (saleId) => {
        setLoadingItems(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/inventory/invoice-details/${saleId}`);
            if (res.data.success) {
                setInvoiceItems(res.data.items);
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
                setFormData(prev => ({ ...prev, returnItems: initialReturnItems }));
            }
        } catch (err) {
            console.error('Error loading items:', err);
            setInvoiceItems([]);
        } finally {
            setLoadingItems(false);
        }
    };

    const updateReturnItem = (index, field, value) => {
        const updatedItems = [...formData.returnItems];
        updatedItems[index][field] = value;
        if (field === 'Good_Qty' || field === 'Bad_Qty') {
            const total = parseFloat(updatedItems[index].Good_Qty || 0) + parseFloat(updatedItems[index].Bad_Qty || 0);
            updatedItems[index].Total_Return_Qty = total;
            updatedItems[index].Refund_Amount = total > 0
                ? (total * parseFloat(updatedItems[index].Unit_Price)).toFixed(2)
                : '';
        }
        setFormData(prev => ({ ...prev, returnItems: updatedItems }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!invoiceNo.trim()) newErrors.invoice = 'Invoice number is required';
        if (!invoiceData) newErrors.invoice = 'Please select a valid invoice';
        const hasReturnItems = formData.returnItems.some(
            item => parseFloat(item.Good_Qty) > 0 || parseFloat(item.Bad_Qty) > 0
        );
        if (!hasReturnItems) newErrors.items = 'Please enter return quantity for at least one item';
        formData.returnItems.forEach((item, idx) => {
            if (parseFloat(item.Good_Qty || 0) + parseFloat(item.Bad_Qty || 0) > parseFloat(item.Base_Unit_Qty_Sold)) {
                newErrors[`item_${idx}`] = `Return qty cannot exceed ${item.Base_Unit_Qty_Sold} (sold qty)`;
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        try {
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
        setFormData({ Return_Type: 'Customer', Ref_ID: '', Sale_ID: '', returnItems: [] });
        setSearchStatus('idle');
        setErrors({});
        onHide();
    };

    return (
        <>
            {/* Inject scoped styles into the page */}
            <style>{`
                .process-return-modal {
                    padding-left: 0 !important;
                }
                .process-return-modal .modal-dialog {
                    max-width: 500px !important;
                    width: calc(100vw - 40px) !important;
                    margin-left: auto !important;
                    margin-right: auto !important;
                }
                .process-return-modal .modal-content {
                    border-radius: 16px;
                    border: none;
                    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
                }
                .process-return-modal .modal-body {
                    max-height: 75vh;
                    overflow-y: auto;
                }
                .return-table th,
                .return-table td {
                    white-space: nowrap;
                }
                .return-table input[type="number"] {
                    min-width: 100px;
                }
            `}</style>

            <Modal
                show={show}
                onHide={handleClose}
                centered
                scrollable
                className="process-return-modal"
                container={document.body}
            >
                <Modal.Header
                    closeButton
                    className="border-0 px-4 pt-4 pb-3"
                    style={{ background: 'linear-gradient(135deg, #f7fbff 0%, #eef7f2 100%)' }}
                >
                    <Modal.Title className="fw-bold fs-4">Process New Return</Modal.Title>
                </Modal.Header>

                <Form onSubmit={handleSubmit}>
                    <Modal.Body
                        className="px-4 py-4"
                        style={{ background: 'linear-gradient(180deg, #f9fcff 0%, #f5fbf7 100%)' }}
                    >
                        {/* ── Return Type ── */}
                        <div className="mb-4 p-4 rounded-4" style={{ background: '#fff', border: '1px solid #dbe4ef' }}>
                            <p className="small fw-bold text-secondary mb-3 mb-0">RETURN TYPE</p>
                            <div className="d-flex gap-4 mt-2">
                                <Form.Check
                                    type="radio" label="Customer Return" name="ReturnType"
                                    id="rtCustomer"
                                    checked={formData.Return_Type === 'Customer'}
                                    onChange={() => setFormData({ ...formData, Return_Type: 'Customer' })}
                                />
                                <Form.Check
                                    type="radio" label="Supplier Return" name="ReturnType"
                                    id="rtSupplier"
                                    checked={formData.Return_Type === 'Supplier'}
                                    onChange={() => setFormData({ ...formData, Return_Type: 'Supplier' })}
                                />
                            </div>
                        </div>

                        {/* ── Invoice Search ── */}
                        <div className="mb-4 p-4 rounded-4" style={{ background: '#fff', border: '1px solid #dbe4ef' }}>
                            <Form.Label className="small fw-bold text-secondary mb-3">
                                INVOICE NUMBER&nbsp;
                                <span className="text-muted fw-normal">(e.g., 2026-001)</span>
                            </Form.Label>
                            <div className="d-flex gap-3">
                                <Form.Control
                                    type="text"
                                    placeholder="Enter invoice number..."
                                    value={invoiceNo}
                                    onChange={(e) => setInvoiceNo(e.target.value)}
                                    isInvalid={!!errors.invoice}
                                    onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearchInvoice(); } }}
                                    style={{ borderRadius: '10px', padding: '11px 16px', fontSize: '0.95rem' }}
                                />
                                <Button
                                    variant="primary"
                                    onClick={handleSearchInvoice}
                                    disabled={!invoiceNo.trim() || searchStatus === 'loading'}
                                    className="rounded-3 fw-bold px-4"
                                    style={{ backgroundColor: '#3b82f6', borderColor: '#3b82f6', minWidth: '110px' }}
                                >
                                    {searchStatus === 'loading'
                                        ? <><Spinner size="sm" className="me-2" />Searching</>
                                        : 'Find'}
                                </Button>
                            </div>
                            {errors.invoice && <div className="text-danger small mt-2">{errors.invoice}</div>}
                            {searchStatus === 'found' && invoiceData && (
                                <div className="mt-3">
                                    <Badge bg="success" className="py-2 px-3" style={{ fontSize: '0.8rem' }}>
                                        <CheckCircle size={13} className="me-1" /> Invoice Found
                                    </Badge>
                                </div>
                            )}
                            {searchStatus === 'notfound' && (
                                <div className="mt-3">
                                    <Badge bg="danger" className="py-2 px-3" style={{ fontSize: '0.8rem' }}>
                                        <AlertCircle size={13} className="me-1" /> Not Found
                                    </Badge>
                                </div>
                            )}
                        </div>

                        {/* ── Customer Info ── */}
                        {invoiceData && (
                            <div className="mb-4 p-4 rounded-4" style={{ background: '#ecfeff', border: '1px solid #a5f3fc' }}>
                                <Row>
                                    <Col md={5}>
                                        <small className="text-secondary fw-bold d-block mb-1">CUSTOMER</small>
                                        <p className="mb-0 fw-bold">{invoiceData.Customer_Name}</p>
                                    </Col>
                                    <Col md={3}>
                                        <small className="text-secondary fw-bold d-block mb-1">INVOICE DATE</small>
                                        <p className="mb-0">{new Date(invoiceData.Sale_Date).toLocaleDateString()}</p>
                                    </Col>
                                    <Col md={4}>
                                        <small className="text-secondary fw-bold d-block mb-1">INVOICE TOTAL</small>
                                        <p className="mb-0 text-success fw-bold">
                                            LKR {parseFloat(invoiceData.Total_Amount).toLocaleString('en-LK', { maximumFractionDigits: 2 })}
                                        </p>
                                    </Col>
                                </Row>
                            </div>
                        )}

                        {/* ── Return Items Table ── */}
                        {invoiceItems.length > 0 && (
                            <>
                                {errors.items && <Alert variant="warning" className="mb-4">{errors.items}</Alert>}

                                <div className="mb-4 rounded-4" style={{ border: '1px solid #dbe4ef', overflow: 'hidden' }}>
                                    <div className="px-4 py-3" style={{ background: '#f8fafc', borderBottom: '1px solid #dbe4ef' }}>
                                        <span className="small fw-bold text-secondary">RETURN ITEMS</span>
                                    </div>
                                    <div style={{ background: '#fff', overflowX: 'auto' }}>
                                        <Table hover className="mb-0 return-table" style={{ minWidth: '860px' }}>
                                            <thead>
                                                <tr>
                                                    <th className="fw-semibold small py-3 px-3" style={{ background: '#f8fafc', minWidth: '160px' }}>PRODUCT</th>
                                                    <th className="fw-semibold small py-3 px-3 text-center" style={{ background: '#f8fafc', width: '110px' }}>BASE UNIT</th>
                                                    <th className="fw-semibold small py-3 px-3 text-center" style={{ background: '#f8fafc', width: '120px' }}>PURCHASED</th>
                                                    <th className="fw-semibold small py-3 px-3 text-center" style={{ background: '#f8fafc', width: '130px' }}>GOOD QTY</th>
                                                    <th className="fw-semibold small py-3 px-3 text-center" style={{ background: '#f8fafc', width: '130px' }}>BAD QTY</th>
                                                    <th className="fw-semibold small py-3 px-3 text-end" style={{ background: '#f8fafc', width: '130px' }}>UNIT PRICE</th>
                                                    <th className="fw-semibold small py-3 px-3 text-end" style={{ background: '#f8fafc', width: '150px' }}>REFUND AMOUNT</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {formData.returnItems.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="py-3 px-3 align-middle fw-bold">{item.P_Name}</td>
                                                        <td className="py-3 px-3 align-middle text-center">
                                                            <Badge bg="secondary" className="px-2 py-1">{item.Base_Unit}</Badge>
                                                        </td>
                                                        <td className="py-3 px-3 align-middle text-center fw-bold">
                                                            {parseFloat(item.Base_Unit_Qty_Sold)}&nbsp;
                                                            <span className="text-muted small">{item.Base_Unit}</span>
                                                        </td>
                                                        <td className="py-3 px-3 align-middle">
                                                            <Form.Control
                                                                type="number" step="0.01" min="0"
                                                                max={item.Base_Unit_Qty_Sold}
                                                                value={item.Good_Qty}
                                                                onChange={(e) => updateReturnItem(idx, 'Good_Qty', e.target.value)}
                                                                className="text-center"
                                                                style={{ borderRadius: '8px', border: '1px solid #cbd5e1', padding: '8px' }}
                                                            />
                                                        </td>
                                                        <td className="py-3 px-3 align-middle">
                                                            <Form.Control
                                                                type="number" step="0.01" min="0"
                                                                max={item.Base_Unit_Qty_Sold}
                                                                value={item.Bad_Qty}
                                                                onChange={(e) => updateReturnItem(idx, 'Bad_Qty', e.target.value)}
                                                                className="text-center"
                                                                style={{ borderRadius: '8px', border: '1px solid #cbd5e1', padding: '8px' }}
                                                            />
                                                        </td>
                                                        <td className="py-3 px-3 align-middle text-end">
                                                            LKR {parseFloat(item.Unit_Price).toFixed(2)}
                                                        </td>
                                                        <td className="py-3 px-3 align-middle">
                                                            <Form.Control
                                                                type="number" step="0.01" min="0"
                                                                value={item.Refund_Amount}
                                                                onChange={(e) => updateReturnItem(idx, 'Refund_Amount', e.target.value)}
                                                                className="text-end"
                                                                style={{ borderRadius: '8px', border: '1px solid #cbd5e1', padding: '8px' }}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                </div>

                                {/* ── Reason & Details ── */}
                                <div className="mb-4 p-4 rounded-4" style={{ background: '#fff', border: '1px solid #dbe4ef' }}>
                                    <p className="small fw-bold text-secondary mb-3">RETURN REASON &amp; DETAILS</p>
                                    {formData.returnItems.map((item, idx) =>
                                        (parseFloat(item.Good_Qty) > 0 || parseFloat(item.Bad_Qty) > 0) && (
                                            <div key={idx} className="mb-3 p-3 rounded-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                                <p className="fw-bold text-primary mb-3 small">{item.P_Name}</p>
                                                <Row className="g-3">
                                                    <Col md={5}>
                                                        <Form.Label className="small fw-semibold">PRIMARY REASON</Form.Label>
                                                        <Form.Select
                                                            value={item.Reason}
                                                            onChange={(e) => updateReturnItem(idx, 'Reason', e.target.value)}
                                                            style={{ borderRadius: '8px', padding: '10px 12px' }}
                                                        >
                                                            <option value="Damaged">Damaged</option>
                                                            <option value="Expired">Expired</option>
                                                            <option value="Wrong_Product">Wrong Product</option>
                                                            <option value="Quality_Issue">Quality Issue</option>
                                                            <option value="Overstocked">Overstocked</option>
                                                            <option value="Other">Other</option>
                                                        </Form.Select>
                                                    </Col>
                                                    <Col md={7}>
                                                        <Form.Label className="small fw-semibold">DETAILS</Form.Label>
                                                        <Form.Control
                                                            as="textarea" rows={2}
                                                            placeholder="Describe the issue..."
                                                            value={item.Reason_Details}
                                                            onChange={(e) => updateReturnItem(idx, 'Reason_Details', e.target.value)}
                                                            style={{ borderRadius: '8px', resize: 'none' }}
                                                        />
                                                    </Col>
                                                </Row>
                                                {errors[`item_${idx}`] && (
                                                    <div className="text-danger small mt-2">{errors[`item_${idx}`]}</div>
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            </>
                        )}

                        {/* ── Action Buttons ── */}
                        <div className="d-flex justify-content-end gap-3 pt-3" style={{ borderTop: '1px solid #e2e8f0' }}>
                            <Button
                                variant="light"
                                className="rounded-3 px-5 py-2 fw-semibold"
                                style={{ border: '1px solid #cbd5e1', minWidth: '130px' }}
                                onClick={handleClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={!invoiceData || loadingItems || formData.returnItems.length === 0}
                                className="rounded-3 px-5 py-2 fw-bold shadow-sm"
                                style={{ backgroundColor: '#f97316', borderColor: '#f97316', minWidth: '180px' }}
                            >
                                Complete Return
                            </Button>
                        </div>
                    </Modal.Body>
                </Form>
            </Modal>
        </>
    );
};

export default ProcessReturnModal;
