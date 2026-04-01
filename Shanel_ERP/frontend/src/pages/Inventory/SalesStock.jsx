import React, {useEffect,useState} from 'react';
import axios from 'axios';
import SalesMetricCard from '../../component/Inventory/Sales/SalesMetricCard';

const SalesStock = () => {
    const [data, setData] = useState({ tableData:[], metrics:{}});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('http://localhost:5000/api/sales/stock-overview')
        .then(res => {
            if(res.data.saccess) setData(res.data);
            setLoading(false);
        })
        .catch(err => console.error(err));
    }, []);

    // if(loading) return <div className='p-5 text-center'>Loading Sales Stock...</div>;
    return (
        <div className='p-4 bg-light min-vh-100'>
            <h4 className='fw-bold mb-1'>Sales Stock</h4>
            <p className='text-muted small mb-4'>Finished goods ready for sale</p>

            {/* top row */}
            <div>
                <SalesMetricCard />
            </div>
        </div>
    )
}

export default SalesStock