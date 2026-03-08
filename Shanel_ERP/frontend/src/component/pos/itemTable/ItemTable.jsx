import React from 'react'
import { Plus, Trash2 } from 'lucide-react'

const ItemTable = () => {
    // These colors match the professional mint-green entry style
    const inputRowBg = '#f1f5f2'; 
    const inputBorder = '#d1d9d4';

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
                                <input type="text" className='form-control form-control-sm border-1' style={{ borderColor: inputBorder }} placeholder='Item Code'/>
                            </td>
                            <td style={{ backgroundColor: inputRowBg }}>
                                <input type="text" className='form-control form-control-sm border-1' style={{ borderColor: inputBorder }} placeholder='Item name...'/>
                            </td>
                            <td style={{ backgroundColor: inputRowBg }}>
                                <select className='form-select form-select-sm border-1' style={{ borderColor: inputBorder }}>
                                    <option value="">Packet</option>
                                    <option value="">Pieces</option>
                                    <option value="">kg</option>
                                </select>
                            </td>
                            <td style={{ backgroundColor: inputRowBg }}>
                                <input type="number" className='form-control form-control-sm border-1 text-end' style={{ borderColor: inputBorder }} placeholder='0.00'/>
                            </td>
                            <td style={{ backgroundColor: inputRowBg }}>
                                <input type="number" className='form-control form-control-sm border-1 text-end' style={{ borderColor: inputBorder }} defaultValue={0}/>
                            </td>
                            <td style={{ backgroundColor: inputRowBg }}>
                                <input type="number" className='form-control form-control-sm border-1 text-end' style={{ borderColor: inputBorder }} defaultValue={0}/>
                            </td>
                            <td style={{ backgroundColor: inputRowBg }}>
                                <input type="number" className='form-control form-control-sm border-1 text-center fw-bold' style={{ borderColor: inputBorder }} defaultValue={1}/>
                            </td>
                            <td style={{ backgroundColor: inputRowBg }}>
                                <input type="number" className='form-control form-control-sm border-1 text-end fw-bold bg-white' style={{ borderColor: inputBorder }} value="0.00" readOnly/>
                            </td>
                            <td style={{ backgroundColor: inputRowBg }}>
                                <input type="number" className='form-control form-control-sm border-1 text-end' style={{ borderColor: inputBorder }} defaultValue={0}/>
                            </td>
                            <td style={{ backgroundColor: inputRowBg }} className='text-center'>
                                <button className='btn btn-success btn-sm shadow-sm px-2 py-1'>
                                    <Plus size={18} strokeWidth={3} />
                                </button>
                            </td>
                        </tr>

                        {/* --- SAVED DATA ROWS --- */}
                        <tr>
                            <td className='text-center text-muted ps-3'>1</td>
                            <td className='fw-bold text-dark'>ITEM001</td>
                            <td className='text-muted'>Item Description</td>
                            <td className='text-muted'>Packet</td>
                            <td className='text-end fw-semibold'>100.00</td>
                            <td className='text-end'>0.00</td>
                            <td className='text-end'>0.00</td>
                            <td className='text-center fw-bold text-dark'>2</td>
                            <td className='text-end fw-bold text-dark'>200.00</td>
                            <td className='text-end'>0</td>
                            <td className='text-center'>
                                <button className='btn btn-danger btn-sm shadow-sm px-2 py-1'>
                                    <Trash2 size={18} strokeWidth={3} />
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