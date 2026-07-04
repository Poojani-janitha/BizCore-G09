import React, { useState } from 'react';
import { Plus, Download, ChevronDown, PlusCircle, Truck, Search, X } from 'react-feather';
import { generatePDF } from '../../../services/reportGenerator';
import { useTranslation } from 'react-i18next';

const ProductHeader = ({
    title,
    onAddClick,
    onUpdateQtyClick,
    showUpdateQty = false,
    onProductionStockClick,
    showProductionStock = false,
    products = [],
    // search props
    searchValue,
    onSearchChange,
    onSearchReset,
    activeOnly,
    onActiveToggle,
}) => {
    const [showExportMenu, setShowExportMenu] = useState(false);
    const { t } = useTranslation();

    const getPreparedData = () => {
        return products.map(p => ({
            ID: p.id,
            Name: p.name,
            Type: p.type,
            'Base Unit': p.baseUnit || '',
            'Cost Price': p.costPrice || 0,
            'Retail Price': p.retailPrice || 0,
            'Wholesale Price': p.wholesalePrice || 0,
            'Min Stock': p.minStock || 0,
            'Tax Rate': p.taxRate || 0,
            'Barcode': p.barcode || '',
            'Status': p.status || ''
        }));
    };

    const handleExportExcel = async () => {
        if (!products || products.length === 0) { alert('No products to export'); return; }
        try {
            const XLSX = await import('xlsx');
            const data = getPreparedData();
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            const colWidths = [8, 20, 15, 12, 15, 15, 18, 12, 12, 15, 12];
            ws['!cols'] = colWidths.map(width => ({ wch: width }));
            XLSX.utils.book_append_sheet(wb, ws, 'Products');
            XLSX.writeFile(wb, `products-${new Date().toISOString().slice(0, 10)}.xlsx`);
            setShowExportMenu(false);
        } catch (error) {
            alert('Excel export requires xlsx library. Please use PDF instead.');
            console.error('Excel export error:', error);
        }
    };

    const handleExportPDF = () => {
        if (!products || products.length === 0) { alert('No products to export'); return; }
        const getStatus = (stockCount, minStock) => {
            if (stockCount === 0) return 'Out of Stock';
            if (stockCount < minStock) return 'Low Stock';
            return 'In Stock';
        };
        const reportMeta = {
            'Company Items': { reportTitle: 'Company Item Price List', fileName: 'Company_Item_Price_List_Report' },
            'Other Items':   { reportTitle: 'Other Item Price List',   fileName: 'Other_Item_Price_List_Report' },
            'Raw Materials': { reportTitle: 'Raw Material Price List', fileName: 'Raw_Material_Price_List_Report' }
        };
        const { reportTitle, fileName } = reportMeta[title] || {
            reportTitle: `${title} Price List`,
            fileName: `${String(title).replace(/\s+/g, '_')}_Price_List_Report`
        };
        const columns = ['ID', 'Name', 'Type', 'Cost Price', 'Retail Price', 'Wholesale Price', 'Status'];
        const data = products.map(p => ({
            'ID': p.id, 'Name': p.name, 'Type': p.type,
            'Cost Price': p.costPrice || 0,
            'Retail Price': p.retailPrice || 0,
            'Wholesale Price': p.wholesalePrice || 0,
            'Status': getStatus(p.stockCount, p.minStock)
        }));
        generatePDF(reportTitle, columns, data, fileName);
        setShowExportMenu(false);
    };

    return (
        <div className='card border-0 shadow-sm px-3 py-2 mb-3'>
            <div className='d-flex align-items-center gap-2 flex-wrap'>

                {/* Search bar */}
                <div
                    className='input-group bg-light rounded-2 border align-items-center px-2'
                    style={{ maxWidth: '260px', minWidth: '160px', flex: '1 1 160px' }}
                >
                    <Search size={15} className='text-muted flex-shrink-0' />
                    <input
                        type='text'
                        className='form-control form-control-sm border-0 bg-transparent shadow-none py-1'
                        placeholder={t('inventory.filters.search_placeholder', 'Search by name or barcode...')}
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                    {searchValue && (
                        <button
                            type='button'
                            className='btn btn-link text-muted border-0 p-0 d-flex align-items-center'
                            onClick={onSearchReset}
                            title='Clear search'
                            style={{ lineHeight: 1 }}
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* In Stock toggle */}
                <div className='form-check form-switch mb-0 ms-1 d-flex align-items-center gap-1'>
                    <input
                        className='form-check-input mt-0'
                        type='checkbox'
                        id='activeOnly'
                        checked={activeOnly}
                        onChange={(e) => onActiveToggle(e.target.checked)}
                        style={{ cursor: 'pointer' }}
                    />
                    <label className='form-check-label small fw-medium text-nowrap' htmlFor='activeOnly' style={{ cursor: 'pointer' }}>
                        {t('inventory.filters.active_only', 'In Stock Only')}
                    </label>
                </div>

                {/* Push actions to the right */}
                <div className='ms-auto d-flex align-items-center gap-2 flex-wrap'>

                    {/* Export dropdown */}
                    <div style={{ position: 'relative' }}>
                        <button
                            className='btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 px-3'
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            title='Export products data'
                        >
                            <Download size={13} />
                            {t('inventory.actions.export')}
                            <ChevronDown size={13} style={{
                                transform: showExportMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s'
                            }} />
                        </button>
                        {showExportMenu && (
                            <div
                                className='position-absolute bg-white border rounded-2 shadow-lg p-1'
                                style={{ top: '100%', right: 0, zIndex: 1000, minWidth: '140px', marginTop: '4px' }}
                            >
                                <button
                                    className='btn btn-sm btn-light w-100 text-start px-3 py-2 mb-1'
                                    onClick={handleExportExcel}
                                    style={{ border: 'none', borderRadius: '6px' }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                >📊 Excel</button>
                                <button
                                    className='btn btn-sm btn-light w-100 text-start px-3 py-2'
                                    onClick={handleExportPDF}
                                    style={{ border: 'none', borderRadius: '6px' }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                >📋 PDF</button>
                            </div>
                        )}
                    </div>

                    {/* Add New */}
                    <button
                        className='btn btn-primary btn-sm d-flex align-items-center gap-1 px-3 shadow-sm'
                        onClick={onAddClick}
                    >
                        <Plus size={13} /> {t('inventory.actions.add_new')}
                    </button>

                    {/* Update Qty */}
                    {showUpdateQty && (
                        <button
                            className='btn btn-success btn-sm d-flex align-items-center gap-1 px-3 shadow-sm'
                            onClick={onUpdateQtyClick}
                        >
                            <PlusCircle size={13} /> {t('inventory.actions.update_qty')}
                        </button>
                    )}

                    {/* Production Stock */}
                    {showProductionStock && (
                        <button
                            className='btn btn-outline-dark btn-sm d-flex align-items-center gap-1 px-3 shadow-sm'
                            onClick={onProductionStockClick}
                        >
                            <Truck size={13} /> {t('inventory.actions.add_production_stock')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductHeader;
