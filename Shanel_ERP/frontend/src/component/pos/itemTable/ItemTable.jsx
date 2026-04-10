import React from 'react'
import {Plus, X} from 'lucide-react'

const ItemTable = () => {
  return (
    <div className='bg-white rounded shadow-sm mb-3'>
        <div className='table-responsive'>
            <table className='table table-sm table-hover mb-0'>
                <thead className='table-light'>
                    <tr>
                        <th style={{width:'50px'}}>No</th>
                        <th style={{width:'50px'}}>Item Code</th>
                        <th style={{width:'50px'}}>Unit</th>
                        <th style={{width:'50px'}}>Unit price</th>
                        <th style={{width:'50px'}}>Dis %</th>
                        <th style={{width:'50px'}}>Tax %</th>
                        <th style={{width:'50px'}}>Tax Amt</th>
                        <th style={{width:'50px'}}>Qty</th>
                        <th style={{width:'50px'}}>Unit Total</th>
                        <th style={{width:'50px'}}>Action</th>

                    </tr>
                </thead>
                <tbody>
                    <tr className='table-active'>
                        <td className='text-center'>+</td>
                        <td><input type="text" className='form-control form-control-sm ' placeholder='Item Code'/></td>
                        <td><input type="text" className='form-control form-control-sm ' placeholder='Description'/></td>
                        <td>
                            <select className= 'form-select form-select-sm' name="" id="">
                                <option value="">Packet</option>
                                
                            </select>
                        </td>
                        <td><input type="number" className='form-control form-control-sm text-end' defaultValue={0}/></td>
                        <td><input type="number" className='form-control form-control-sm text-end' defaultValue={0}/></td>
                        <td><input type="number" className='form-control form-control-sm text-end' defaultValue={0.0}/></td>
                        <td><input type="number" className='form-control form-control-sm text-end' defaultValue={0}/></td>
                        <td><input type="number" className='form-control form-control-sm text-end' defaultValue={0.0}/></td>
                        <td className='text-center'>
                            <button className='btn btn-sm btn-primary'>
                                <Plus size={14}></Plus>
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
