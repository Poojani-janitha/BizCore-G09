import React from 'react';
import { X } from 'react-feather';
import Barcode from 'react-barcode';

const ProductViewModal = ({ show, onHide, product }) => {
    if (!show || !product) return null;

    // Alternative units (non-base units)
    const alternativeUnits = (product.units || []).filter(u => !u.isBaseUnit);

    const SectionTitle = ({ children }) => (
        <div className="col-12 mt-2 mb-1">
            <div className="d-flex align-items-center gap-2">
                <span className="small fw-bold text-uppercase text-muted" style={{ letterSpacing: '0.07em', fontSize: '11px' }}>
                    {children}
                </span>
                <div className="flex-grow-1" style={{ height: '1px', background: '#e2e8f0' }} />
            </div>
        </div>
    );

    const Field = ({ label, children, col = 6 }) => (
        <div className={`col-${col}`}>
            <label className="form-label mb-1 small fw-semibold text-muted" style={{ fontSize: '11px' }}>{label}</label>
            <div className="p-2 bg-light rounded-2" style={{ fontSize: '13px' }}>
                {children}
            </div>
        </div>
    );

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 1050 }}>
            <div
                className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                style={{ maxWidth: '520px' }}
            >
                <div
                    className="modal-content border-0 shadow-lg rounded-4"
                    style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
                >
                    {/* Header */}
                    <div className="modal-header bg-white border-0 px-4 pt-4 pb-2" style={{ flexShrink: 0 }}>
                        <div>
                            <h6 className="modal-title fw-bold text-dark mb-0" style={{ fontSize: '14px' }}>
                                Product Details
                            </h6>
                            <p className="text-muted small mb-0 mt-1">{product.name}</p>
                        </div>
                        <button type="button" className="btn-close shadow-none" onClick={onHide} />
                    </div>

                    {/* Body */}
                    <div className="modal-body px-4 py-3" style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
                        <div className="row g-2">

                            {/* Product Image */}
                            {product.imagePath && (
                                <div className="col-12 mb-1">
                                    <div className="d-flex justify-content-center">
                                        {/* <img
                                            src={`http://localhost:5000${product.imagePath}`} */}
                                        <img 
                                            src={`${product.imagePath}`} 
                                            alt={product.name}
                                            style={{
                                                maxWidth: '100%', maxHeight: '200px',
                                                objectFit: 'cover', borderRadius: '12px',
                                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* ── Basic Info ── */}
                            <SectionTitle>Basic Info</SectionTitle>

                            <Field label="Product Code" col={6}>
                                <strong>{product.code || 'N/A'}</strong>
                            </Field>

                            <Field label="Product Type" col={6}>
                                <span className={`badge border px-2 py-1 ${product.type === 'Company' ? 'bg-info-subtle text-info' : 'bg-warning-subtle text-warning'}`}>
                                    {product.type}
                                </span>
                                {(product.isIsharaProduct === true || product.isIsharaProduct === 1 || product.isIsharaProduct === '1') && (
                                    <span className="badge ms-1 border px-2 py-1" style={{ background: '#fff3e0', color: '#e65100', borderColor: '#ffcc80' }}>
                                        Ishara
                                    </span>
                                )}
                            </Field>

                            <Field label="Product Name" col={12}>
                                <strong>{product.name}</strong>
                            </Field>

                            {product.nameSinhala && (
                                <Field label="Sinhala Name" col={12}>
                                    <strong>{product.nameSinhala}</strong>
                                </Field>
                            )}

                            {/* ── Unit Management ── */}
                            <SectionTitle>Unit Management</SectionTitle>

                            {/* Base unit highlighted card */}
                            <div className="col-12">
                                <div
                                    className="d-flex align-items-center justify-content-between px-3 py-2 rounded-3"
                                    style={{ background: 'linear-gradient(135deg, #004445 0%, #2c7873 100%)' }}
                                >
                                    <div>
                                        <div className="text-white fw-bold" style={{ fontSize: '14px' }}>
                                            {product.baseUnit || 'N/A'}
                                        </div>
                                        <div className="text-white opacity-75" style={{ fontSize: '11px' }}>
                                            Base Unit · All stock quantities stored in this unit
                                        </div>
                                    </div>
                                    <span className="badge bg-white text-dark px-2 py-1" style={{ fontSize: '11px' }}>
                                        1.0 (Base)
                                    </span>
                                </div>
                            </div>

                            {/* Alternative units table */}
                            {alternativeUnits.length > 0 ? (
                                <div className="col-12">
                                    <label className="form-label mb-1 small fw-semibold text-muted" style={{ fontSize: '11px' }}>
                                        Alternative Units
                                    </label>
                                    <div className="rounded-3 overflow-hidden border">
                                        <table className="table table-sm table-hover mb-0" style={{ fontSize: '13px' }}>
                                            <thead style={{ background: '#f1f5f9' }}>
                                                <tr>
                                                    <th className="py-2 px-3 fw-semibold text-muted border-0" style={{ fontSize: '11px' }}>
                                                        UNIT
                                                    </th>
                                                    <th className="py-2 px-3 fw-semibold text-muted border-0 text-center" style={{ fontSize: '11px' }}>
                                                        CONVERSION
                                                    </th>
                                                    <th className="py-2 px-3 fw-semibold text-muted border-0 text-end" style={{ fontSize: '11px' }}>
                                                        EQUIVALENT
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {alternativeUnits.map((unit, idx) => (
                                                    <tr key={unit.id || idx}>
                                                        <td className="py-2 px-3 fw-bold border-0">
                                                            {unit.unitName}
                                                        </td>
                                                        <td className="py-2 px-3 text-center border-0 text-muted">
                                                            1 {unit.unitName} = {unit.conversionRate} {product.baseUnit}
                                                        </td>
                                                        <td className="py-2 px-3 text-end border-0">
                                                            <span className="badge bg-primary-subtle text-primary border px-2">
                                                                × {unit.conversionRate}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <p className="text-muted mt-1 mb-0" style={{ fontSize: '11px' }}>
                                        Example: if base unit is <strong>Packet</strong> and 1 <strong>Box</strong> = 10 Packets, stock of 100 Packets = 10 Boxes
                                    </p>
                                </div>
                            ) : (
                                <div className="col-12">
                                    <div className="p-2 rounded-2 text-muted bg-light text-center" style={{ fontSize: '12px' }}>
                                        No alternative units defined
                                    </div>
                                </div>
                            )}

                            {/* Current stock in all units */}
                            {alternativeUnits.length > 0 && (
                                <div className="col-12">
                                    <label className="form-label mb-1 small fw-semibold text-muted" style={{ fontSize: '11px' }}>
                                        Current Stock in All Units
                                    </label>
                                    <div className="d-flex flex-wrap gap-2">
                                        <span className="badge bg-dark text-white px-3 py-2" style={{ fontSize: '12px' }}>
                                            {product.stockCount || 0} {product.baseUnit}
                                        </span>
                                        {alternativeUnits.map((unit, idx) => (
                                            <span key={idx} className="badge bg-secondary-subtle text-secondary border px-3 py-2" style={{ fontSize: '12px' }}>
                                                {unit.conversionRate > 0
                                                    ? (parseFloat(product.stockCount || 0) / unit.conversionRate).toFixed(2)
                                                    : '—'
                                                } {unit.unitName}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Pricing ── */}
                            <SectionTitle>Pricing</SectionTitle>

                            <Field label="Cost Price (LKR)" col={4}>
                                {(product.costPrice || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                            </Field>
                            <Field label="Retail Price (LKR)" col={4}>
                                <strong className="text-success">
                                    {(product.retailPrice || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                                </strong>
                            </Field>
                            <Field label="Wholesale Price (LKR)" col={4}>
                                <strong className="text-primary">
                                    {(product.wholesalePrice || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                                </strong>
                            </Field>

                            <Field label="Tax Rate" col={6}>
                                {Math.round(product.taxRate || 0)}%
                            </Field>

                            {/* ── Stock ── */}
                            <SectionTitle>Stock</SectionTitle>

                            <Field label="Current Stock" col={4}>
                                <strong>{product.stockCount || 0}</strong> {product.baseUnit}
                            </Field>
                            <Field label="Min Stock" col={4}>
                                {product.minStock || 0} {product.baseUnit}
                            </Field>
                            <Field label="Reorder Level" col={4}>
                                {product.reorderLevel || 'N/A'}
                            </Field>

                            <Field label="Status" col={12}>
                                <span className={`badge ${product.status === 'In Stock' ? 'bg-success' : 'bg-secondary'}`}>
                                    {product.status || 'N/A'}
                                </span>
                            </Field>

                            {/* ── Description ── */}
                            {product.description && (
                                <>
                                    <SectionTitle>Description</SectionTitle>
                                    <div className="col-12">
                                        <div className="p-2 bg-light rounded-2" style={{ fontSize: '13px', minHeight: '50px' }}>
                                            {product.description}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* ── Barcode ── */}
                            <SectionTitle>Barcode</SectionTitle>
                            <div className="col-12">
                                {product.barcode ? (
                                    <div className="d-flex flex-column align-items-center p-3 rounded-3"
                                        style={{ backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                                        <Barcode
                                            value={product.barcode}
                                            width={1.5} height={50}
                                            fontSize={13} margin={5}
                                            background="#f8fafc"
                                        />
                                        <small className="text-muted mt-1">{product.barcode}</small>
                                    </div>
                                ) : (
                                    <div className="p-3 rounded-3 text-center"
                                        style={{ backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                                        <span className="text-muted small">No barcode assigned</span>
                                    </div>
                                )}
                            </div>

                            {/* ── Dates ── */}
                            <SectionTitle>Record Info</SectionTitle>
                            <Field label="Created Date" col={6}>
                                <span style={{ fontSize: '12px' }}>
                                    {product.createdAt ? new Date(product.createdAt).toLocaleString('en-LK') : 'N/A'}
                                </span>
                            </Field>
                            <Field label="Last Updated" col={6}>
                                <span style={{ fontSize: '12px' }}>
                                    {product.updatedAt ? new Date(product.updatedAt).toLocaleString('en-LK') : 'N/A'}
                                </span>
                            </Field>

                        </div>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer border-top px-4 pb-4 pt-3 bg-white" style={{ flexShrink: 0 }}>
                        <button type="button" className="btn btn-dark px-4 py-2 rounded-3 shadow-sm fw-bold" onClick={onHide}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductViewModal;
