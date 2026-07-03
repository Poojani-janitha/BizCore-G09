import React, { useEffect } from 'react'
import { useState } from 'react'
import axios from 'axios';
import { Search, Plus, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CustomerForm from './CustomerForm';
import { API_ENDPOINTS } from '../../../config/apiEndpoints';

const CustomerInfo = ({ customerData, setCustomerData, invoiceNo, WALKIN_CUSTOMER, setError, setSuccessMessage }) => {
  const { t } = useTranslation();

  const date = new Date();
  const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
  const[displayForm,setDisplayForm] = useState(false);
  
  const toggleCustomerForm = () => {
    setDisplayForm(!displayForm);
  }


  // const [customerID, setCustomerID] = useState('');
  // const [customerData, setCustomerData] = useState({});

  // const fetchCustomerData = async(id) => {

  //   if (id.trim() === '' || !id) {
  //     return
  //   }

  //   try {
  //     const res = await axios.get(API_ENDPOINTS.customer.byId(id));
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




  const[result,setResult]= useState([]);//for search results dropdown
  const[query,setQuery]= useState('Walk-in Customer'); //default to walk-in customer, also used to control the input field
  const[selectedCustomer,setSelected]= useState(WALKIN_CUSTOMER);//selected customer object

  // Sync internal state with external customerData (for resets)
  useEffect(() => {
    if (customerData && customerData.customer_code === 'WALKIN') {
      setQuery('Walk-in Customer');
      setSelected(WALKIN_CUSTOMER);
    }
  }, [customerData, WALKIN_CUSTOMER, t]);


  // Set Walk-in Customer as default when component mounts
 useEffect(() => {
    setCustomerData(WALKIN_CUSTOMER);
  }, [setCustomerData]);


  // Handle input changes and search for customers
  const handleInputChange = (value) => {
    setQuery(value);
    if (value.trim() === '') {
      setResult([]);
    } else {
      searchCustomers(value);
    }
  };


  // Handle onBlur event to reset to walk-in customer if input is empty
  const handleOnBlur = () => {
    // If field is empty on blur, set to walk-in customer
    setTimeout(() => {
      if (query.trim() === '') {
        setSelected(WALKIN_CUSTOMER);
        setCustomerData(WALKIN_CUSTOMER);
        setQuery('Walk-in Customer');
      }
      setResult([]); // Close dropdown
    }, 200);
  };

    // Handle onFocus event to clear the input field for new search
    const handleOnFocus = () => {
        if (query === 'Walk-in Customer') {
            setQuery('');
        }
    };

  // Search customers from backend
  const searchCustomers = async (value) =>{
    const term = value.trim();

    if (!term) {
      setResult([]);
      return;
    }

    try{
      const res = await axios.get(API_ENDPOINTS.customer.search, {
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


  // Handle customer selection from dropdown
  const handleSelect = async (customer) =>{
      setSelected(customer);
      setQuery(customer.c_name);
      setCustomerData(customer);//pass selected customer data to parent component (POS.jsx)
      setResult([]);//close the dropdown 
  }


  
  return (
    <div className="container-fluid p-0">
      <div className='row g-3 align-items-end'> {/* align-items-end keeps all inputs level */}
         

        {/* Customer Input Group */}
        <div className='col-12 col-md-auto'>
          <label className='form-label small text-muted mb-1'>{t('customer.label')}</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <div className='input-group input-group-sm' style={{ maxWidth: '400px', position: 'relative' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={14} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none' }} />
                <input
                  type="text"
                  className='form-control'
                  value={query } 
                  placeholder={t('customer.search_placeholder')}
                  style={{ paddingLeft: '28px' }}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onBlur={handleOnBlur}
                  onFocus={handleOnFocus}
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
            {/* Add Customer Button */}
            <button
              onClick={toggleCustomerForm}
              title={t('customer.add_title')}
              style={{
                padding: '8px 12px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(40, 167, 69, 0.2)',
                fontSize: '14px',
                fontWeight: '500',
                height: '38px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#218838';
                e.target.style.boxShadow = '0 4px 8px rgba(40, 167, 69, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#28a745';
                e.target.style.boxShadow = '0 2px 4px rgba(40, 167, 69, 0.2)';
              }}
            >
              <Plus size={18} style={{ marginRight: '6px' }} />
              {t('customer.add_new')}
            </button>
          </div>
          {displayForm && <CustomerForm onClose={() => setDisplayForm(false)} setError={setError} setSuccessMessage={setSuccessMessage} />}
        </div>

        {/* Selected Customer Details */}
        {/* {selectedCustomer && (
          <div className='col-12 col-md-auto'>
            <div style={{ 
              padding: '8px 12px', 
              backgroundColor: '#e7f5ff', 
              borderRadius: '4px', 
              fontSize: '0.85rem',
              border: '1px solid #74c0fc'
            }}>
              <div style={{ fontWeight: 600, color: '#1a1a2e', marginBottom: '4px' }}>
                ✓ {selectedCustomer.c_name}
              </div>
              {selectedCustomer.phone1 && selectedCustomer.phone1 !== 'N/A' && (
                <div style={{ color: '#6c757d' }}>📞 {selectedCustomer.phone1}</div>
              )}
              {selectedCustomer.customer_type && (
                <div style={{ color: '#6c757d', fontSize: '0.8rem' }}>
                  {selectedCustomer.customer_type}
                </div>
              )}
            </div>
          </div>
        )} */}

        {/* Invoice Details pushed to the right */}
        <div className='col-auto ms-auto'>
          <label className='form-label small text-muted mb-1'>{t('customer.invoice_date')}</label>
          <input type="text" className='form-control form-control-sm bg-light' value={formattedDate} readOnly style={{ width: '130px' }} />
        </div>

        <div className='col-auto'>
          <label className='form-label small text-muted mb-1'>{t('customer.invoice_no')}</label>
          <input type="text" className='form-control form-control-sm bg-light' value={invoiceNo || 'INV-PENDING'} readOnly style={{ width: '130px' }} />
        </div>

        {/* <div className='col-auto'>
          <label className='form-label small text-muted mb-1'>Terminal</label>
          <input type="text" className='form-control form-control-sm text-center bg-light' value="T-01" readOnly style={{ width: '70px' }} />
        </div> */}

      </div>
    </div>
  );
}

export default CustomerInfo;