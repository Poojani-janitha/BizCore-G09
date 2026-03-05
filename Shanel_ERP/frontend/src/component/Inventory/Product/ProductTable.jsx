import React from 'react'
import{ Edit2, MoreVertical, Eye, Trash2 } from 'react-feather';

const thStyle = {
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    borderBottom: '2px solid rgba(255,255,255,0.15)',
    background: 'transparent',
    '--bs-table-bg': 'transparent',
};

const ProductTable = ({ products, isLoading, onDelete, onEdit }) => {
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
                                <td className='text-end fw-medium text-primary'>{(p.wholesalePrice || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</td>
                                <td className='text-end fw-bold text-success'>{(p.retailPrice || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</td>
                                <td className='text-center'>
                                    <span className={p.minStock < 100 ? 'text-danger fw-bold' : ''}>
                                        {p.stockCount || 0} 
                                    </span>
                                    <div className='text-muted' style={{fontSize: '10px'}}>Min: {p.minStock}</div>
                                </td>
                                <td>
                                    <span className={`badge rounded-pill ${p.status === 'Active' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'} px-3`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td className='text-end pe-4'>
                                    <div className='btn-group shadow-sm'>
                                        {/* <button className='btn btn-sm btn-light border p-1'><Eye size={15} className='text-muted'/></button> */}
                                        <button className='btn btn-sm btn-light border p-1' onClick={() => onEdit(p)}><Edit2 size={15} className='text-muted'/></button>
                                        <button className='btn btn-sm btn-light border p-1' onClick={() => onDelete(p.id)}><Trash2 size={15} className='text-danger'/></button>
                                        {/* <button className='btn btn-sm btn-light border p-1'><MoreVertical size={15} className='text-muted'/></button> */}
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