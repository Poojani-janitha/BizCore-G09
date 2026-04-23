import React, {useEffect,useState} from 'react';
import axios from 'axios';
import { Package, CheckCircle, DollarSign, Clock, TrendingUp, TrendingDown } from 'react-feather';
import SalesMetricCard from '../../component/Inventory/Sales/SalesMetricCard';

const SalesStock = () => {
    const [data, setData] = useState({ tableData:[], metrics:{}});
    const [stockInData, setStockInData] = useState([]);
    const [stockOutData, setStockOutData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            axios.get('http://localhost:5000/api/inventory/sales/stock-overview'),
            axios.get('http://localhost:5000/api/inventory/sales/recent-stock-in'),
            axios.get('http://localhost:5000/api/inventory/sales/recent-stock-out')
        ])
        .then(([res1, res2, res3]) => {
            if(res1.data.success) setData(res1.data);
            if(res2.data.success) setStockInData(res2.data.data || []);
            if(res3.data.success) setStockOutData(res3.data.data || []);
            setLoading(false);
        })
        .catch(err => console.error(err));
    }, []);

    return (
        <div className='p-4 bg-light min-vh-100' style={{ fontSize: '13px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className='fw-bold text-dark mb-0'>Sales Stock</h6>
            </div>

            {/* top row */}
            <div className='row g-3 mb-4'>
                <SalesMetricCard title="Total Items" value={data.metrics.totalItems} icon={<Package size={20} className="text-warning"/>} borderColor="border-warning" label="Products in stock" />
                <SalesMetricCard title="Available" value={data.metrics.availableUnits} icon={<CheckCircle size={20} className="text-success"/>} borderColor="border-success" label="Units available" />
                <SalesMetricCard title="Stock Value" value={`LKR ${data.metrics.totalValue ? data.metrics.totalValue.toLocaleString() : '0'}`} icon={<DollarSign size={20} className="text-info"/>} borderColor="border-info" label="Total inventory value" />
                <SalesMetricCard title="Reserved" value={data.metrics.totalReserved} icon={<Clock size={20} className="text-danger"/>} borderColor="border-danger" label="Units reserved" />
            </div>

            {/* Inventory Table */}
            <h6 className='fw-bold text-dark mb-2'>Finished Good Inventory</h6>
            <div className='card border-0 shadow-sm rounded-3 overflow-hidden mb-4'>
                <div className='table-responsive'>
                    <table className='table align-middle mb-0'>
                        <thead>
                            <tr style={{ background: 'linear-gradient(135deg, #004445 0%, #2c7873 100%)' }}>
                                <th className='text-uppercase py-3 ps-4' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Item Details</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Type</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Total Quantity</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Reserved</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Available</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Stock Value</th>
                                <th className='text-uppercase py-3' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Expiry Date</th>
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: '13px'}}>
                            {data.tableData.map((item, index) => (
                                <tr key={index}>
                                    <td className='ps-4'>
                                        <div className='fw-bold text-dark'>{item.name}</div>
                                        <div className='text-muted' style={{fontSize:'11px'}}>{item.code}</div>
                                        <div className='text-muted' style={{fontSize:'10px'}}>Batch: {item.batchNo}</div>
                                    </td>
                                    <td>
                                        <span className={`badge ${item.type === 'Company' ? 'bg-warning-subtle text-warning' : 'bg-success-subtle text-success'} px-2`}>
                                            {item.type} Item
                                        </span>
                                    </td>
                                    <td className='fw-medium'>{item.totalqty} units</td>
                                    <td className='text-danger fw-bold'>{item.reserved} units</td>
                                    <td className='text-success fw-bold'>{item.available} units</td>
                                    <td className='fw-bold'>LKR {item.stockValue.toLocaleString()}</td>
                                    <td className='text-muted'>{item.expiry}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Stock In and Out Tables */}
            <div className='row g-4'>
                {/* Recent Stock In */}
                <div className='col-lg-6'>
                    <h6 className='fw-bold text-dark mb-2'>Recent Stock In</h6>
                    <div className='card border-0 shadow-sm rounded-3 overflow-hidden'>
                        <div className='table-responsive'>
                            <table className='table table-sm align-middle mb-0'>
                                <thead style={{ background: 'linear-gradient(135deg, #004445 0%, #2c7873 100%)' }}>
                                    <tr>
                                        <th className='text-uppercase py-2 ps-4 border-0' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Product</th>
                                        <th className='text-uppercase py-2 border-0' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Source</th>
                                        <th className='text-uppercase py-2 text-end border-0' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Qty</th>
                                        <th className='text-uppercase py-2 text-end pe-4 border-0' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Date</th>
                                    </tr>
                                </thead>
                                <tbody style={{ fontSize: '12px'}}>
                                    {stockInData.length > 0 ? (
                                        stockInData.map((item, idx) => (
                                            <tr key={idx} className='border-bottom'>
                                                <td className='ps-4'>
                                                    <div className='fw-medium text-dark'>{item.productName}</div>
                                                    <small className='text-muted'>{item.productType}</small>
                                                </td>
                                                <td>
                                                    <span className='badge bg-info-subtle text-info'>{item.source}</span>
                                                </td>
                                                <td className='text-end fw-bold text-success'>+{item.quantity}</td>
                                                <td className='text-end pe-4 text-muted'>{item.date}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className='text-center text-muted py-4'>
                                                No recent stock in
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Recent Stock Out */}
                <div className='col-lg-6'>
                    <h6 className='fw-bold text-dark mb-2'>Recent Stock Out</h6>
                    <div className='card border-0 shadow-sm rounded-3 overflow-hidden'>
                        <div className='table-responsive'>
                            <table className='table table-sm align-middle mb-0'>
                                <thead style={{ background: 'linear-gradient(135deg, #004445 0%, #2c7873 100%)' }}>
                                    <tr>
                                        <th className='text-uppercase py-2 ps-4 border-0' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Product</th>
                                        <th className='text-uppercase py-2 border-0' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>To</th>
                                        <th className='text-uppercase py-2 text-end border-0' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Qty</th>
                                        <th className='text-uppercase py-2 text-end pe-4 border-0' style={{ color:'#fff', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', background:'transparent', borderBottom:'2px solid rgba(255,255,255,0.15)' }}>Date</th>
                                    </tr>
                                </thead>
                                <tbody style={{ fontSize: '12px'}}>
                                    {stockOutData.length > 0 ? (
                                        stockOutData.map((item, idx) => (
                                            <tr key={idx} className='border-bottom'>
                                                <td className='ps-4'>
                                                    <div className='fw-medium text-dark'>{item.productName}</div>
                                                    <small className='text-muted'>{item.productType}</small>
                                                </td>
                                                <td>
                                                    <span className={`badge ${item.destination === 'Sales' ? 'bg-success-subtle text-success' : item.destination === 'Damage' ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning'}`}>
                                                        {item.destination}
                                                    </span>
                                                </td>
                                                <td className='text-end fw-bold text-danger'>-{item.quantity}</td>
                                                <td className='text-end pe-4 text-muted'>{item.date}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className='text-center text-muted py-4'>
                                                No recent stock out
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SalesStock