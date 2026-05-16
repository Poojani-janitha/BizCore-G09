import React from 'react';
import { Edit2, Trash2, Printer, Eye, AlertCircle } from 'react-feather';
import { useTranslation } from 'react-i18next';

// Utility functions for stock status
const getStockStatus = (stockCount, minStock) => {
    const stock = parseFloat(stockCount) || 0;
    const min = parseFloat(minStock) || 0;
    if (stock <= 0) return 'Out of Stock';
    if (stock < min) return 'Low Stock';
    return 'In Stock';
};

const getStatusBadgeClass = (status) => {
    switch (status) {
        case 'In Stock':
            return 'bg-success-subtle text-success border border-success-subtle';
        case 'Low Stock':
            return 'bg-warning text-dark border border-warning shadow-lg';
        case 'Out of Stock':
            return 'bg-danger text-white border border-danger shadow-sm';
        default:
            return 'bg-secondary-subtle text-secondary';
    }
};

const getStatusLabel = (status, t) => {
    switch (status) {
        case 'In Stock':
            return t('inventory.status.in_stock');
        case 'Low Stock':
            return t('inventory.status.low_stock');
        case 'Out of Stock':
            return t('inventory.status.out_of_stock');
        default:
            return status;
    }
};

const formatStock = (value) => {
    const num = parseFloat(value) || 0;
    return Number.isInteger(num) ? num : num.toFixed(2);
};

const thStyle = {
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    borderBottom: '2px solid rgba(255,255,255,0.15)',
    background: 'transparent',
    '--bs-table-bg': 'transparent',
};

const ProductTable = ({ products, isLoading, onDelete, onEdit, onPrint, onView, error = null }) => {
    const { t, i18n } = useTranslation();
    const isSinhala = i18n.language?.startsWith('si');

    if(isLoading){
        return(
            <div className='text-center py-5 bg-white rounded-3 shadow-sm'>
                <div className='spinner-border text-primary' role='status'>
                    <span className='visually-hidden'>Loading...</span>
                </div>
                <p className='text-muted mt-2'>{t('inventory.table.loading')}</p>
            </div>
        )
    }
    
    if(error){
        return(
            <div className='alert alert-danger rounded-3 py-4 text-center' role='alert'>
                <p className='mb-0'><strong>{t('inventory.table.error')}:</strong> {error}</p>
            </div>
        )
    }
  return (
    <div className='card border-0 shadow-sm rounded-3 overflow-hidden'>
        <div className='table-responsive'>
            <table className='table table-hover align-middle mb-0'>
                <thead className='text-center'>
                    <tr style={{ background: 'linear-gradient(135deg, #004445 0%, #2c7873 100%)', textDecoration: 'center' }}>
                        <th className='ps-4 text-uppercase py-3' style={thStyle}>{t('inventory.table.col_id')}</th>
                        <th className='text-uppercase py-3' style={thStyle}>{t('inventory.table.col_name')}</th>
                        <th className='text-uppercase py-3' style={thStyle}>{t('inventory.table.col_type')}</th>
                        <th className='text-uppercase py-3' style={thStyle}>{t('inventory.table.col_barcode')}</th>
                        <th className='text-uppercase py-3 text-center' style={thStyle}>{t('inventory.table.col_cost')}</th>
                        <th className='text-uppercase py-3 text-center' style={thStyle}>{t('inventory.table.col_retail')}</th>
                        <th className='text-uppercase py-3 text-center' style={thStyle}>{t('inventory.table.col_wholesale')}</th>
                        <th className='text-uppercase py-3 text-center' style={thStyle}>{t('inventory.table.col_tax')}</th>
                        <th className='text-uppercase py-3 text-center' style={thStyle}>{t('inventory.table.col_stock')}</th>
                        <th className='text-uppercase py-3 ' style={thStyle}>{t('inventory.table.col_status')}</th>
                        <th className='text-end pe-4 py-3' style={{ ...thStyle, color: 'rgba(255,255,255,0.85)' }}>{t('inventory.table.col_actions')}</th>
                    </tr>
                </thead>
                <tbody className='text-center'>
                    {products.length > 0 ? (
                        products.map((p) => (
                            <tr key={p.id}>
                                <td className='ps-4 fw-medium text-primary small'>{p.id}</td>
                                <td className='fw-bold text-dark'>{(isSinhala && p.nameSinhala) ? p.nameSinhala : p.name}</td>
                                <td>
                                    <span className={`badge ${p.type === 'Company' ? 'bg-info-subtle text-info' : 'bg-warning-subtle text-warning'} border px-2 py-1`}>
                                        {p.type}
                                    </span>
                                </td>
                                <td className='text-muted small'>{p.barcode || 'N/A'}</td>
                                <td className='fw-medium'>{(p.costPrice || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</td>
                                <td className='fw-bold text-success'>{(p.retailPrice || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</td>
                                <td className='fw-medium text-primary'>{(p.wholesalePrice || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</td>
                                <td className='fw-medium text-primary'>{Math.round(p.taxRate || 0)}%</td>
                                <td>
                                    <span className={p.minStock && parseFloat(p.stockCount) < parseFloat(p.minStock) ? 'text-danger fw-bold' : ''}>
                                        {formatStock(p.stockCount)} {p.baseUnit || ''} 
                                    </span>
                                    <div className='text-muted' style={{fontSize: '10px'}}>{t('inventory.table.min_stock')}: {formatStock(p.minStock)}</div>
                                </td>
                                <td>
                                    <span className={`badge rounded-pill fw-semibold ${
                                        getStatusBadgeClass(getStockStatus(p.stockCount, p.minStock))
                                    }`} style={{
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        letterSpacing: '0.5px',
                                        textTransform: 'uppercase',
                                        padding: '6px 12px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        {getStockStatus(p.stockCount, p.minStock) === 'Low Stock' && <AlertCircle size={13} />}
                                        {getStockStatus(p.stockCount, p.minStock) === 'Out of Stock' && '⚠️ '}
                                        {getStatusLabel(getStockStatus(p.stockCount, p.minStock), t)}
                                    </span>
                                </td>
                                <td className='text-end pe-4'>
                                    <div className='btn-group shadow-sm'>
                                        <button className='btn btn-sm btn-light border p-1' title={t('inventory.actions.view')} onClick={() => onView && onView(p)}><Eye size={15} className='text-info'/></button>
                                        <button className='btn btn-sm btn-light border p-1' title={t('inventory.actions.edit')} onClick={() => onEdit(p)}><Edit2 size={15} className='text-muted'/></button>
                                        <button className='btn btn-sm btn-light border p-1' title={t('inventory.actions.delete')} onClick={() => onDelete(p.id)}><Trash2 size={15} className='text-danger'/></button>
                                        <button className='btn btn-sm btn-light border p-1' title={t('inventory.actions.print')} onClick={() => onPrint(p)}><Printer size={15} className='text-primary'/></button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="12" className="text-center py-4 text-muted">{t('inventory.table.no_products')}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  )
}

export default ProductTable
