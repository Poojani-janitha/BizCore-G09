import React, { use, useEffect, useState } from 'react'
import axios from 'axios'
import StockTabel from '../../component/Inventory/Production/StockTabel'
import { Package, Activity, Loader } from 'react-feather';

const ProductionStock = () => {

    const [data, setData] = useState({ materials: [], wip: [] });  //wip: work in progress
    const [loading, setLoading] = useState(true);

    useEffect (() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/production/stock-overview');
                if (res.data.success) {
                    setData ({ materials: res.data.materials, wip: res.data.wip})
                }
            } catch (error) {
                console.error('Error fetching production stock data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) return (
        <div className='d-flex justify-content-center align-items-center vh-100'>
            <Loader className="spinner-border text-primary" />
        </div>
    );
  return (
    <div className='p-4 bg-light min-vh-100'>
        <h4 className='fw-bold mb-1'>Production Stock</h4>
        <p className='text-muted small mb-4'>Raw materials are work in progress inventory</p>

        {/* Table for row matrial */}
        <StockTabel
            title="Raw Materials Inventory"
            icon={<Package size={18} className="me-2 text-primary"/>}
            columns={['ID', 'Material Name', 'Quantity', 'Status']}
            data={data.materials}
            type="raw"   
        />
        {/* Table for wip */}
        <StockTabel
            title="Work in Progress"
            icon={<Activity size={18} className="me-2 text-warning"/>}
            columns={['Batch ID', 'Product', 'Qty', 'Stage']}
            data={data.wip}
            type="wip"
        />
    </div>
  )
}

export default ProductionStock