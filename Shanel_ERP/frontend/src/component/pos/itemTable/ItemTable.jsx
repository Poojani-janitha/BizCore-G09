import React from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react';
import axios from 'axios';


const ItemTable = () => {
    // These colors match the professional mint-green entry style
    const inputRowBg = '#f1f5f2';
    const inputBorder = '#d1d9d4';
    const [searchResults, setSearchResults] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [query, setQuery] = useState('');

    const handleUnitChange = (event) => {
        const unit = event.target.value;
        setSelectedProduct(prev => ({ ...(prev || {}), p_unit: unit }));
    };

    const handleSearch = async (value) => {

        const term = value.trim();
        if (!term) {
            setSearchResults([]);
            return;
        }

        try {

            const res = await axios.get('http://localhost:5000/api/sales/search', {
                params: { q: term }
            });


            if (res.data.success) {
                setSearchResults(res.data.products);
            }
        } catch (error) {
            console.error(error);
        }


    }
    return (
        <div className='bg-white rounded shadow-sm overflow-hidden border' style={{ minHeight: '300px' }}>
            <div className='table-responsive' >
                <table className='table table-hover align-middle mb-0' style={{ minWidth: '1100px', fontSize: '14px' }}>
                    <thead className='bg-light text-muted small uppercase'>
                        <tr>
                            <th className="py-3 ps-3 text-center" style={{ width: '60px' }}>#</th>
                            <th className="px-1" style={{ width: '160px' }}>Item Code</th>
                            <th className="px-1" style={{ minWidth: '250px' }}>Description</th>
                            <th className="px-1" style={{ width: '115px' }}>Unit</th>
                            <th className="px-1 text-end" style={{ width: '100px' }}>Unit Price</th>
                            <th className="px-1 text-end" style={{ width: '80px' }}>Dis %</th>
                            <th className="px-1 text-end" style={{ width: '80px' }}>Tax %</th>
                            <th className="px-1 text-center" style={{ width: '100px' }}>Qty</th>
                            <th className="px-1 text-end" style={{ width: '120px' }}>Unit Total</th>
                            <th className="px-1 text-end" style={{ width: '80px' }}>Free</th>
                            <th className="px-1 text-center" style={{ width: '60px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* --- INPUT ROW (Background applied to each cell for full coverage) --- */}
                        <tr >
                            <td style={{ backgroundColor: inputRowBg }} className='text-center text-success fw-bold'>+</td>
                            <td style={{ backgroundColor: inputRowBg }}>
                                <input type="text" className='form-control form-control-sm border-1' style={{ borderColor: inputBorder }} placeholder='Item Code' value={selectedProduct?.p_code || ''} readOnly />
                            </td>
                            <td style={{ backgroundColor: inputRowBg }}>
                                <div style={{ position: 'relative' }}>
                                    <input type="text" className='form-control form-control-sm border-1' style={{ borderColor: inputBorder }} placeholder='Item name...'
                                        value={query}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            handleSearch(value);
                                            setQuery(value);
                                        }}

                                    />

                                    {searchResults.length > 0 && (
                                        <ul style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            right: 0,
                                            zIndex: 1000,
                                            listStyle: 'none',
                                            margin: 0,
                                            padding: 0,
                                            backgroundColor: '#fff',
                                            border: '1px solid #dee2e6',
                                            borderRadius: '0 0 6px 6px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                            maxHeight: '220px',
                                            overflowY: 'auto',
                                        }}>
                                            {searchResults.map((p) => (
                                                <li
                                                    key={p.p_id}
                                                    onClick={() => {
                                                        setQuery(p.p_name);
                                                        setSelectedProduct(p);
                                                        setSearchResults([]);
                                                    }}
                                                    style={{
                                                        cursor: 'pointer',
                                                        padding: '7px 12px',
                                                        fontSize: '0.85rem',
                                                        borderBottom: '1px solid #f1f1f1'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f7ff'}
                                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
                                                >
                                                    <span style={{ fontWeight: 500, color: '#1a1a2e' }}>{p.p_name}</span>
                                                    {p.p_code && <span style={{ color: '#6c757d', marginLeft: '8px' }}>{p.p_code}</span>}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </td>
                            <td style={{ backgroundColor: inputRowBg }}>
                                <select className='form-select form-select-sm border-1' style={{ borderColor: inputBorder }} value={selectedProduct?.p_unit || ''} onChange={handleUnitChange}>
                                    <option value="">Packet</option>
                                    <option value="Pieces">Pieces</option>
                                    <option value="kg">kg</option>
                                </select>
                            </td>
                            <td style={{ backgroundColor: inputRowBg }}>
                                <input type="number" className='form-control form-control-sm border-1 text-end' style={{ borderColor: inputBorder }} placeholder='0.00' />
                            </td>
                            <td style={{ backgroundColor: inputRowBg }}>
                                <input type="number" className='form-control form-control-sm border-1 text-end' style={{ borderColor: inputBorder }} defaultValue={0} />
                            </td>
                            <td style={{ backgroundColor: inputRowBg }}>
                                <input type="number" className='form-control form-control-sm border-1 text-end' style={{ borderColor: inputBorder }} defaultValue={0} />
                            </td>
                            <td style={{ backgroundColor: inputRowBg }}>
                                <input type="number" className='form-control form-control-sm border-1 text-center fw-bold' style={{ borderColor: inputBorder }} defaultValue={1} />
                            </td>
                            <td style={{ backgroundColor: inputRowBg }}>
                                <input type="number" className='form-control form-control-sm border-1 text-end fw-bold bg-white' style={{ borderColor: inputBorder }} value="0.00" readOnly />
                            </td>
                            <td style={{ backgroundColor: inputRowBg }}>
                                <input type="number" className='form-control form-control-sm border-1 text-end' style={{ borderColor: inputBorder }} defaultValue={0} />
                            </td>
                            <td style={{ backgroundColor: inputRowBg }} className='text-center'>
                                <button className='btn btn-success btn-sm shadow-sm px-2 py-1'>
                                    <Plus size={18} strokeWidth={3} />
                                </button>
                            </td>
                        </tr>


            
                </tbody>
            </table>
        </div>
      
    </div>
  )
}

export default ItemTable
