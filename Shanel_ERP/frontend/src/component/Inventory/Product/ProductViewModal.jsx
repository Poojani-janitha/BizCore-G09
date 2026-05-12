import React from 'react';
import { X } from 'react-feather';
import Barcode from 'react-barcode';

const ProductViewModal = ({ show, onHide, product }) => {
    if (!show || !product) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 1050 }}>
            <div className="modal-dialog modal-md modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div className="modal-header bg-white border-0 px-4 pt-4 pb-0">
                        <div>
                            <h6 className="modal-title fw-bold text-dark" style={{ fontSize: '14px' }}>Product Details</h6>
                            <p className="text-muted small">{product.name}</p>
                        </div>
                        <button type="button" className="btn-close shadow-none" onClick={onHide}></button>
                    </div>

                    <div className="modal-body px-4 py-3" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                        <div className="row g-3">
                            
                            {/* Product Image */}
                            {product.imagePath && (
                                <div className="col-12 mb-3">
                                    <div className="d-flex justify-content-center">
                                        <img 
                                            src={`http://localhost:5000${product.imagePath}`} 
                                            alt={product.name}
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '250px',
                                                objectFit: 'cover',
                                                borderRadius: '12px',
                                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                            
                            {/* Product Code */}
                            <div className="col-6">
                                <label className="form-label mb-1 small fw-semibold text-muted">Product Code</label>
                                <div className="p-2 bg-light rounded-2" style={{ fontSize: '13px' }}>
                                    <strong>{product.code || 'N/A'}</strong>
                                </div>
                            </div>

                            {/* Product Name */}
                            <div className="col-6">
                                <label className="form-label mb-1 small fw-semibold text-muted">Product Type</label>
                                <div className="p-2 bg-light rounded-2" style={{ fontSize: '13px' }}>
                                    <span className={`badge ${product.type === 'Company' ? 'bg-info-subtle text-info' : 'bg-warning-subtle text-warning'} border px-2 py-1`}>
                                        {product.type}
                                    </span>
                                </div>
                            </div>

                            {/* Product Name Full */}
                            <div className="col-12">
                                <label className="form-label mb-1 small fw-semibold text-muted">Product Name</label>
                                <div className="p-2 bg-light rounded-2" style={{ fontSize: '13px' }}>
                                    <strong>{product.name}</strong>
                                </div>
                            </div>

                            {/* Product Name Sinhala */}
                            {product.nameSinhala && (
                                <div className="col-12">
                                    <label className="form-label mb-1 small fw-semibold text-muted">Sinhala Product Name</label>
                                    <div className="p-2 bg-light rounded-2" style={{ fontSize: '13px' }}>
                                        <strong>{product.nameSinhala}</strong>
                                    </div>
                                </div>
                            )}

                            {/* Base Unit */}
                            <div className="col-6">
                                <label className="form-label mb-1 small fw-semibold text-muted">Base Unit</label>
                                <div className="p-2 bg-light rounded-2" style={{ fontSize: '13px' }}>
                                    {product.baseUnit || 'N/A'}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="col-6">
                                <label className="form-label mb-1 small fw-semibold text-muted">Status</label>
                                <div className="p-2 bg-light rounded-2" style={{ fontSize: '13px' }}>
                                    <span className={`badge ${product.status === 'In Stock' ? 'bg-success' : 'bg-secondary'}`}>
                                        {product.status || 'N/A'}
                                    </span>
                                </div>
                            </div>

                            {/* Pricing Section */}
                            <div className="col-4">
                                <label className="form-label mb-1 small fw-semibold text-muted">Cost Price (LKR)</label>
                                <div className="p-2 bg-light rounded-2" style={{ fontSize: '13px' }}>
                                    {(product.costPrice || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                                </div>
                            </div>

                            <div className="col-4">
                                <label className="form-label mb-1 small fw-semibold text-muted">Retail Price (LKR)</label>
                                <div className="p-2 bg-light rounded-2" style={{ fontSize: '13px' }}>
                                    <strong className="text-success">{(product.retailPrice || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</strong>
                                </div>
                            </div>

                            <div className="col-4">
                                <label className="form-label mb-1 small fw-semibold text-muted">Wholesale Price (LKR)</label>
                                <div className="p-2 bg-light rounded-2" style={{ fontSize: '13px' }}>
                                    <strong className="text-primary">{(product.wholesalePrice || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</strong>
                                </div>
                            </div>

                            {/* Tax & Min Stock */}
                            <div className="col-6">
                                <label className="form-label mb-1 small fw-semibold text-muted">Tax Rate (%)</label>
                                <div className="p-2 bg-light rounded-2" style={{ fontSize: '13px' }}>
                                    {Math.round(product.taxRate || 0)}%
                                </div>
                            </div>

                            <div className="col-6">
                                <label className="form-label mb-1 small fw-semibold text-muted">Minimum Stock</label>
                                <div className="p-2 bg-light rounded-2" style={{ fontSize: '13px' }}>
                                    {product.minStock || 0}
                                </div>
                            </div>

                            {/* Stock Count */}
                            <div className="col-6">
                                <label className="form-label mb-1 small fw-semibold text-muted">Current Stock</label>
                                <div className="p-2 bg-light rounded-2" style={{ fontSize: '13px' }}>
                                    <strong>{product.stockCount || 0}</strong>
                                </div>
                            </div>

                            {/* Reorder Level */}
                            <div className="col-6">
                                <label className="form-label mb-1 small fw-semibold text-muted">Reorder Level</label>
                                <div className="p-2 bg-light rounded-2" style={{ fontSize: '13px' }}>
                                    {product.reorderLevel || 'N/A'}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="col-12">
                                <label className="form-label mb-1 small fw-semibold text-muted">Description</label>
                                <div className="p-2 bg-light rounded-2" style={{ fontSize: '13px', minHeight: '60px' }}>
                                    {product.description || 'No description provided'}
                                </div>
                            </div>

                            {/* Barcode Section */}
                            <div className="col-12">
                                <label className="form-label mb-1 small fw-semibold text-muted">Barcode</label>
                                {product.barcode ? (
                                    <div className="d-flex flex-column align-items-center p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                                        <Barcode 
                                            value={product.barcode} 
                                            width={1.5} 
                                            height={50} 
                                            fontSize={13} 
                                            margin={5}
                                            background="#f8fafc"
                                        />
                                        <small className="text-muted mt-2">{product.barcode}</small>
                                    </div>
                                ) : (
                                    <div className="p-3 rounded-3 text-center" style={{ backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                                        <span className="text-muted small">No barcode assigned</span>
                                    </div>
                                )}
                            </div>

                            {/* Dates */}
                            <div className="col-6">
                                <label className="form-label mb-1 small fw-semibold text-muted">Created Date</label>
                                <div className="p-2 bg-light rounded-2" style={{ fontSize: '12px' }}>
                                    {product.createdAt ? new Date(product.createdAt).toLocaleString('en-LK') : 'N/A'}
                                </div>
                            </div>

                            <div className="col-6">
                                <label className="form-label mb-1 small fw-semibold text-muted">Last Updated</label>
                                <div className="p-2 bg-light rounded-2" style={{ fontSize: '12px' }}>
                                    {product.updatedAt ? new Date(product.updatedAt).toLocaleString('en-LK') : 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer border-0 p-4 pt-2">
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
