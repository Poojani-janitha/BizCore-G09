import React, { useState } from 'react';
import { Plus, Download, ChevronDown, PlusCircle, Truck } from 'react-feather';
import { generatePDF } from '../../../services/reportGenerator';
import { useTranslation } from 'react-i18next';

const ProductHeader = ({
    title,
    onAddClick,
    onUpdateQtyClick,
    showUpdateQty = false,
    onProductionStockClick,
    showProductionStock = false,
    products = []
}) => {
    const [showExportMenu, setShowExportMenu] = useState(false);
    const { t } = useTranslation();

    // Prepare data for export
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

    // Export as Excel (XLSX)
    const handleExportExcel = async () => {
        if (!products || products.length === 0) {
            alert('No products to export');
            return;
        }

        try {
            const XLSX = await import('xlsx');
            const data = getPreparedData();
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            
            // Set column widths
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

    // Export as PDF using the professional reportGenerator
    const handleExportPDF = () => {
        if (!products || products.length === 0) {
            alert('No products to export');
            return;
        }

        const getStatus = (stockCount, minStock) => {
            if (stockCount === 0) return 'Out of Stock';
            if (stockCount < minStock) return 'Low Stock';
            return 'In Stock';
        };

        const reportMeta = {
            'Company Items': { reportTitle: 'Company Item Price List', fileName: 'Company_Item_Price_List_Report' },
            'Other Items': { reportTitle: 'Other Item Price List', fileName: 'Other_Item_Price_List_Report' },
            'Raw Materials': { reportTitle: 'Raw Material Price List', fileName: 'Raw_Material_Price_List_Report' }
        };
        const { reportTitle, fileName } = reportMeta[title] || {
            reportTitle: `${title} Price List`,
            fileName: `${String(title).replace(/\s+/g, '_')}_Price_List_Report`
        };

        const columns = ['ID', 'Name', 'Type', 'Cost Price', 'Retail Price', 'Wholesale Price', 'Status'];
        const data = products.map(p => ({
            'ID': p.id,
            'Name': p.name,
            'Type': p.type,
            'Cost Price': p.costPrice || 0,
            'Retail Price': p.retailPrice || 0,
            'Wholesale Price': p.wholesalePrice || 0,
            'Status': getStatus(p.stockCount, p.minStock)
        }));

        generatePDF(reportTitle, columns, data, fileName);
        setShowExportMenu(false);
    };

    return (
        <div className='d-flex justify-content-between align-items-center mb-3'>
            <div className='d-flex gap-2 ms-auto' style={{ position: 'relative' }}>
                {/* Export Dropdown */}
                <div style={{ position: 'relative' }}>
                    <button 
                        className='btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 px-3' 
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        title='Export products data'
                    >
                        <Download size={14}/> {t('inventory.actions.export')}
                        <ChevronDown size={14} style={{ 
                            transform: showExportMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s'
                        }}/>
                    </button>

                    {showExportMenu && (
                        <div className='position-absolute bg-white border rounded-2 shadow-lg p-1' style={{
                            top: '100%',
                            right: 0,
                            zIndex: 1000,
                            minWidth: '150px',
                            marginTop: '4px'
                        }}>
                            <button 
                                className='btn btn-sm btn-light w-100 text-start px-3 py-2 mb-1'
                                onClick={handleExportExcel}
                                style={{ border: 'none', borderRadius: '6px', transition: 'all 0.2s' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                📊 Excel
                            </button>
                            <button 
                                className='btn btn-sm btn-light w-100 text-start px-3 py-2'
                                onClick={handleExportPDF}
                                style={{ border: 'none', borderRadius: '6px', transition: 'all 0.2s' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                📋 PDF
                            </button>
                        </div>
                    )}
                </div>

                <button
                    className='btn btn-primary btn-sm d-flex align-items-center gap-2 px-3 shadow-sm'
                    onClick={onAddClick}>
                    <Plus size={14}/> {t('inventory.actions.add_new')}
                </button>
                {showUpdateQty && (
                    <button
                        className='btn btn-success btn-sm d-flex align-items-center gap-2 px-3 shadow-sm'
                        onClick={onUpdateQtyClick}
                    >
                        <PlusCircle size={14}/> {t('inventory.actions.update_qty')}
                    </button>
                )}
                {showProductionStock && (
                    <button
                        className='btn btn-outline-dark btn-sm d-flex align-items-center gap-2 px-3 shadow-sm'
                        onClick={onProductionStockClick}
                    >
                        <Truck size={14}/> {t('inventory.actions.add_production_stock')}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProductHeader
