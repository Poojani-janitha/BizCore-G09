import React from 'react'
import { useState } from 'react'
import axios from 'axios';
import { Search } from 'lucide-react';

const CustomerInfo = () => {

  // const [customerID, setCustomerID] = useState('');
  // const [customerData, setCustomerData] = useState({});

  // const fetchCustomerData = async(id) => {

  //   if (id.trim() === '' || !id) {
  //     return
  //   }

  //   try {
  //     const res = await axios.get(`http://localhost:5000/api/customer/${id}`);
  //     if (res.data.success) {

  //       console.log(res.data);
  //       setCustomerData(res.data.data);

  //     }
  //   } catch (error) {
  //     console.error('Error fetching customer data: ', error);
  //   }
  // }

  // useEffect(() => {
  //   fetchCustomerData(customerID);
  // }, [customerID])


  const[result,setResult]= useState([]);
  const[query,setQuery]= useState('');
  const[,setSelected]= useState(null);
  const searchCustomers = async (value) =>{
    const term = value.trim();

    if (!term) {
      setResult([]);
      return;
    }

    try{
      const res = await axios.get('http://localhost:5000/api/customer/search', {
        params: { q: term }
      });
      if(res.data.success){
        setResult(res.data.customers);
      }
    }catch(err)
    {
        console.error(err)
    }

  }

  const handleSelect = async (customer) =>{
      setSelected(customer);
      setQuery(customer.c_name);
      setResult([]);//close the dropdown 
  }

  return (
    <div className="container-fluid p-0">
      <div className='row g-3 align-items-end'> {/* align-items-end keeps all inputs level */}

        {/* Customer Input Group */}
        <div className='col-12 col-md-auto'>
          <label className='form-label small text-muted mb-1'>Customer</label>
          <div className='input-group input-group-sm' style={{ maxWidth: '400px', position: 'relative' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={14} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none' }} />
              <input
                type="text"
                className='form-control'
                value={query}
                placeholder='Search customer...'
                style={{ paddingLeft: '28px' }}
                onChange={(e) => {
                  const value = e.target.value;
                  setQuery(value);
                  searchCustomers(value);
                }}
              />
            </div>
            {result.length > 0 && (
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
                {result.map((c) => (
                  <li
                    key={c.c_id}
                    onClick={() => handleSelect(c)}
                    style={{ cursor: 'pointer', padding: '7px 12px', fontSize: '0.85rem', borderBottom: '1px solid #f1f1f1' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f7ff'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
                  >
                    <span style={{ fontWeight: 500, color: '#1a1a2e' }}>{c.c_name}</span>
                    {c.phone1 && <span style={{ color: '#6c757d', marginLeft: '8px' }}>{c.phone1}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Invoice Details pushed to the right */}
        <div className='col-auto ms-auto'>
          <label className='form-label small text-muted mb-1'>Invoice Date</label>
          <input type="text" className='form-control form-control-sm bg-light' value="2024-05-20" readOnly style={{ width: '130px' }} />
        </div>

        <div className='col-auto'>
          <label className='form-label small text-muted mb-1'>Invoice No</label>
          <input type="text" className='form-control form-control-sm bg-light' value="INV-1001" readOnly style={{ width: '130px' }} />
        </div>

        <div className='col-auto'>
          <label className='form-label small text-muted mb-1'>Terminal</label>
          <input type="text" className='form-control form-control-sm text-center bg-light' value="T-01" readOnly style={{ width: '70px' }} />
        </div>

      </div>
    </div>
  )
}

export default CustomerInfo