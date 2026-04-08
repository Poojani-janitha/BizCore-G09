import React from 'react'
import { Edit2, Trash2, Printer } from 'react-feather';

const thStyle = {
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    borderBottom: '2px solid rgba(255,255,255,0.15)',
    background: 'transparent',
    '--bs-table-bg': 'transparent',
};

const ProductTable = ({ products, isLoading, onDelete, onEdit, onPrint, error = null }) => {
    // Calculate correct status based on stock levels
    const getStatus = (stockCount, minStock) => {
        if (stockCount === 0) return 'Out of Stock';
        if (stockCount < minStock) return 'Low Stock';
        return 'In Stock';
    };

    if(isLoading){
        return(
            <div className='text-center py-5 bg-white rounded-3 shadow-sm'>
                <div className='spinner-border text-primary' role='status'>
                    <span className='visually-hidden'>Loading...</span>
                </div>
                <p className='text-muted mt-2'>Loading products from database...</p>
            </div>
        )
    }
    
    if(error){
        return(
            <div className='alert alert-danger rounded-3 py-4 text-center' role='alert'>
                <p className='mb-0'><strong>Error:</strong> {error}</p>
            </div>
        )
    }
  return (
    <div className='card border-0 shadow-sm rounded-3 overflow-hidden'>
        <div className='table-responsive'>
            <table className='table table-hover align-middle mb-0'>
                <thead>
                    <tr style={{ background: 'linear-gradient(135deg, #004445 0%, #2c7873 100%)' }}>
                        <th className='ps-4 text-uppercase py-3' style={thStyle}>ID</th>
                        <th className='text-uppercase py-3' style={thStyle}>Product Name</th>
                        <th className='text-uppercase py-3' style={thStyle}>Type</th>
                        <th className='text-uppercase py-3' style={thStyle}>Barcode</th>
                        <th className='text-uppercase py-3 text-end' style={thStyle}>Cost Price</th>
                        <th className='text-uppercase py-3 text-end' style={thStyle}>Retail Price</th>
                        <th className='text-uppercase py-3 text-end' style={thStyle}>Wholesale Price</th>
                        <th className='text-uppercase py-3 text-center' style={thStyle}>Stock</th>
                        <th className='text-uppercase py-3' style={thStyle}>Status</th>
                        <th className='text-end pe-4 py-3' style={{ ...thStyle, color: 'rgba(255,255,255,0.85)' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.length > 0 ? (
                        products.map((p) => (
                            <tr key={p.id}>
                                <td className='ps-4 fw-medium text-primary small'>{p.id}</td>
                                <td className='fw-bold text-dark'>{p.name}</td>
                                <td>
                                    <span className={`badge ${p.type === 'Finished' ? 'bg-info-subtle text-info' : 'bg-warning-subtle text-warning'} border px-2 py-1`}>
                                        {p.type}
                                    </span>
                                </td>
                                <td className='text-muted small'>{p.barcode || 'N/A'}</td>
                                <td className='text-end fw-medium'>{(p.costPrice || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</td>
                                <td className='text-end fw-bold text-success'>{(p.retailPrice || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</td>
                                <td className='text-end fw-medium text-primary'>{(p.wholesalePrice || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</td>
                                <td className='text-center'>
                                    <span className={p.minStock < 100 ? 'text-danger fw-bold' : ''}>
                                        {p.stockCount || 0} 
                                    </span>
                                    <div className='text-muted' style={{fontSize: '10px'}}>Min: {p.minStock}</div>
                                </td>
                                <td>
                                    <span className={`badge rounded-pill fw-semibold ${
                                        getStatus(p.stockCount, p.minStock) === 'In Stock' ? 'bg-success-subtle text-success border border-success-subtle' :
                                        getStatus(p.stockCount, p.minStock) === 'Low Stock' ? 'bg-warning-subtle text-warning border border-warning-subtle' :
                                        'bg-danger text-white border border-danger shadow-sm'
                                    } px-3 py-2`} style={{
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        letterSpacing: '0.5px',
                                        textTransform: 'uppercase'
                                    }}>
                                        {getStatus(p.stockCount, p.minStock) === 'Out of Stock' && '⚠️ '}
                                        {getStatus(p.stockCount, p.minStock)}
                                    </span>
                                </td>
                                <td className='text-end pe-4'>
                                    <div className='btn-group shadow-sm'>
                                        <button className='btn btn-sm btn-light border p-1' title='Edit' onClick={() => onEdit(p)}><Edit2 size={15} className='text-muted'/></button>
                                        <button className='btn btn-sm btn-light border p-1' title='Delete' onClick={() => onDelete(p.id)}><Trash2 size={15} className='text-danger'/></button>
                                        <button className='btn btn-sm btn-light border p-1' title='Print Barcode' onClick={() => onPrint(p)}><Printer size={15} className='text-primary'/></button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="10" className="text-center py-4 text-muted">No products found in the database.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  )
}

export default ProductTable