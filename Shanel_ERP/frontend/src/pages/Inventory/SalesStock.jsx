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
            axios.get('http://localhost:5000/api/sales/stock-overview'),
            axios.get('http://localhost:5000/api/sales/recent-stock-in'),
            axios.get('http://localhost:5000/api/sales/recent-stock-out')
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
        <div className='p-4 bg-light min-vh-100'>
            <h4 className='fw-bold mb-1'>Sales Stock</h4>
            <p className='text-muted small mb-4'>Finished goods ready for sale</p>

            {/* top row */}
            <div className='row g-3 mb-4'>
                <SalesMetricCard title="Total Items" value={data.metrics.totalItems} icon={<Package size={20}/>} color="#f97316"/>
                <SalesMetricCard title="Available" value={data.metrics.availableUnits} icon={<CheckCircle size={20}/>} color="#22c55e"/>
                <SalesMetricCard title="Stock Value" value={`LKR ${data.metrics.totalValue ? data.metrics.totalValue.toLocaleString() : '0'}`} icon={<DollarSign size={20}/>} color="#a855f7"/>
                <SalesMetricCard title="Reserved" value={data.metrics.totalReserved} icon={<Clock size={20}/>} color="#f59e0b"/>
            </div>

            {/* Inventory Table */}
            <div className='card border-0 shadow-sm rounded-4 mb-4'>
                <div className='card-header bg-white border-0 pt-4 px-4'>
                    <h6 className='fw-bold mb-0'>Finished Good Inventory</h6>
                </div>
                <div className='table-responsive p-4'>
                    <table className='table align-middle'>
                        <thead className='text-muted small text-uppercase' style={{fontSize:'11px'}}>
                            <tr>
                                <th>Item Details</th>
                                <th>Type</th>
                                <th>Total Quantity</th>
                                <th>Reserved</th>
                                <th>Available</th>
                                <th>Stock Value</th>
                                <th>Expiry Date</th>
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: '13px'}}>
                            {data.tableData.map((item, index) => (
                                <tr key={index}>
                                    <td>
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
                    <div className='card border-0 shadow-sm rounded-4'>
                        <div className='card-header bg-white border-0 pt-4 px-4 d-flex align-items-center'>
                            <TrendingUp size={20} className='text-success me-2'/>
                            <h6 className='fw-bold mb-0'>Recent Stock In</h6>
                        </div>
                        <div className='table-responsive'>
                            <table className='table table-sm align-middle mb-0'>
                                <thead className='bg-light text-muted small text-uppercase' style={{fontSize:'11px'}}>
                                    <tr>
                                        <th className='border-0 ps-4'>Product</th>
                                        <th className='border-0'>Source</th>
                                        <th className='border-0 text-end'>Qty</th>
                                        <th className='border-0 text-end pe-4'>Date</th>
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
                    <div className='card border-0 shadow-sm rounded-4'>
                        <div className='card-header bg-white border-0 pt-4 px-4 d-flex align-items-center'>
                            <TrendingDown size={20} className='text-danger me-2'/>
                            <h6 className='fw-bold mb-0'>Recent Stock Out</h6>
                        </div>
                        <div className='table-responsive'>
                            <table className='table table-sm align-middle mb-0'>
                                <thead className='bg-light text-muted small text-uppercase' style={{fontSize:'11px'}}>
                                    <tr>
                                        <th className='border-0 ps-4'>Product</th>
                                        <th className='border-0'>To</th>
                                        <th className='border-0 text-end'>Qty</th>
                                        <th className='border-0 text-end pe-4'>Date</th>
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