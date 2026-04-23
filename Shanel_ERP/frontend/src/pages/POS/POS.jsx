import React, { useEffect, useCallback } from 'react'
import CustomerInfo from '../../component/pos/customerInfo/CustomerInfo'
import ItemTable from '../../component/pos/itemTable/ItemTable'
import InvoiceTotal from '../../component/pos/invoiceTotal/InvoiceTotal'
import PaymentMethod from '../../component/pos/paymentMethod/PaymentMethod'
import ActionButtons from '../../component/pos/actionButtons/ActionButtons'
import Test from './Test'
import { useState } from 'react'
import axios from 'axios'
import RecentSale from '../../component/pos/recentSale/RecentSale'

const POS = () => {
  const [cartItems, setCartItems] = useState([]);
  const [invoiceData, setInvoiceData] = useState({});
  const [customerData, setCustomerData] = useState({});
  const [paymentData, setPaymentData] = useState({});
  const [action, setAction] = useState({});
  const[invoiceNo,setInvoiceNo] = useState('');
  const[loading,setLoading] = useState(false);//for display resent sales component after payment, also can be used for loading state in future
  const[holdInvoice,setHoldInvoice] = useState(null);//for storing hold invoice data in local storage, this can be used in future to implement hold and resume invoice feature


  const handleInvoiceDataChange = (data) => {
 
    setInvoiceData(data);
    console.log("Updated Invoice Data:", data);
  }


  //send sales data to backend when action is triggered from ActionButtons component, also validate data before sending
  const sendData = useCallback(async () => {
    if (!action) {
      console.warn("No action selected. Data will not be sent.");
      return;
    } else if (action === 'proceedToPayment') {
      // Validate customer selection
      if (!customerData || !customerData.c_id) {
        alert("Please select a customer before proceeding to payment.");
        setAction({});
        return;
      }

      // Validate items exist
      if (!cartItems || cartItems.length === 0) {
        alert("Please add items to the cart before proceeding to payment.");
        setAction({});
        return;
      }

      try {
        const response = await axios.post(`http://localhost:5000/api/sales/`, {
          cutomer: customerData,
          items: cartItems,
          invoiceDetails: { ...invoiceData, invoiceNo: invoiceNo },
          paymentDetails: paymentData,
          action: action
        });
        console.log("Data sent successfully:", response.data);
        
        alert(`Sale saved successfully! Invoice No: ${response.data.invoiceNo}`);
        
        // Reset all form data for new transaction
        setInvoiceData({});
        setCartItems([]);
        setCustomerData({});
        setPaymentData({});
        setAction({});
        
        // Fetch new invoice number for next sale
        try {
          const newResponse = await axios.get('http://localhost:5000/api/sales/generate-invoice-no');
          if (newResponse.data.success) {
            setInvoiceNo(newResponse.data.invoiceNo);
          }else {
            console.error("Failed to fetch new invoice number:", newResponse.data.message);
          }
        } catch (error) {
          console.error("Error fetching new invoice number:", error);
        }
      } catch (error) {
        console.error("Error sending data:", error);
        const errorMessage = error.response?.data?.message || error.message || "Error saving sale. Please try again.";
        alert(errorMessage);
      }
    }
  }, [action]);

  // Trigger sendData when action changes to proceedToPayment
  useEffect(() => {
    if (action === 'proceedToPayment') {
      sendData();
      setAction({}); 
    }
  }, [action, sendData]);


  // Re-fetch invoice number when component mounts to ensure we have the latest one
  useEffect(() => {
    const fetchInvoiceNo = async () => {
      try {
        console.log("Fetching invoice number from API...");
        const response = await axios.get('http://localhost:5000/api/sales/generate-invoice-no');
        console.log("Full response:", response);
        console.log("Response data:", response.data);
        if (response.data.success) {
          console.log("Setting invoice number to:", response.data.invoiceNo);
          setInvoiceNo(response.data.invoiceNo);
        } else {
          console.error("Failed to fetch invoice number:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching invoice number:", error.message);
        console.error("Error details:", error);
      }
    };
    fetchInvoiceNo();
  }, []);

  //store hold invoice in local storage and retrieve when component mounts
  useEffect(() => {
    if (action === 'holdInvoice') {
      // Validate that required data exists
      if (!customerData || !invoiceData || cartItems.length === 0) {
        alert('Cannot hold invoice: Missing customer, items, or invoice data');
        setAction({});
        return;
      }

      // Create hold invoice object
      const holdData = {
        customerData,
        cartItems,
        invoiceData,
        paymentData,
        timestamp: new Date().toLocaleTimeString(),
        invoiceNo: invoiceNo
      };

      // Store in local storage
      localStorage.setItem('holdInvoice', JSON.stringify(holdData));
      setHoldInvoice(holdData);
      
      // Reset current invoice
      setInvoiceData({});
      setCartItems([]);
      setPaymentData({});
      setAction({});
      
      alert('Invoice has been held successfully!');
    }
  }, [action, customerData, cartItems, invoiceData, paymentData, invoiceNo]);

  // Load hold invoice from localStorage on component mount
  useEffect(() => {
    const storedHoldInvoice = localStorage.getItem('holdInvoice');
    if (storedHoldInvoice) {
      try {
        setHoldInvoice(JSON.parse(storedHoldInvoice));
      } catch (error) {
        console.error('Error loading held invoice from localStorage:', error);
      }
    }
  }, []);

  // Function to load held invoice back into the form
  const loadHeldInvoice = () => {
    if (holdInvoice) {
      setCustomerData(holdInvoice.customerData);
      setCartItems(holdInvoice.cartItems);
      setInvoiceData(holdInvoice.invoiceData);
      setPaymentData(holdInvoice.paymentData);
      setHoldInvoice(null);
      localStorage.removeItem('holdInvoice');
      alert('Held invoice has been loaded!');
    }
  };

  // Function to clear held invoice
  const clearHeldInvoice = () => {
    setHoldInvoice(null);
    localStorage.removeItem('holdInvoice');
  };


  return (

    <div className='pos-wrapper w-100' style={{ overflowX: 'hidden' }}>
      {/* Floating Recent Sales Button */}
      <RecentSale />

      {/* Hold Invoice Banner */}
      {holdInvoice && (
        <div style={{
          marginBottom: '16px',
          padding: '14px 16px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h6 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: '600', color: '#856404' }}>
              📋 Hold Invoice Pending
            </h6>
            <p style={{ margin: 0, fontSize: '13px', color: '#856404' }}>
              Customer: <strong>{holdInvoice.customerData?.c_name}</strong> | 
              Items: <strong>{holdInvoice.cartItems?.length || 0}</strong> | 
              Time: <strong>{holdInvoice.timestamp}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={loadHeldInvoice}
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'}
            >
              Load Invoice
            </button>
            <button
              onClick={clearHeldInvoice}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
            >
              Clear
            </button>
          </div>
        </div>
      )}
      
      {/* Section 1: Customer Info */}
      <div className='card border-0 shadow-sm p-4 mb-3'>
        <CustomerInfo setCustomerData={setCustomerData} invoiceNo={invoiceNo} />

      </div>

      {/* Section 2: Item Table */}
      <div className='card border-0 shadow-sm p-3 mb-3'>
        <ItemTable cartItems={cartItems} setCartItems={setCartItems} />
      </div>

      {/* Section 3: Bottom Grid */}
      <div className='row g-3'>
        <div className='col-xl-4 col-lg-6'>
          <div className='card border-0 shadow-sm p-3 h-100'>
            <InvoiceTotal cartItems={cartItems} onChangeInvoiceData={handleInvoiceDataChange} />
          </div>
        </div>

        <div className='col-xl-4 col-lg-6'>
          <div className='card border-0 shadow-sm p-3 h-100'>
            <PaymentMethod paymentData={paymentData} setPaymentData={setPaymentData} totalDue={invoiceData?.finalTotal || 0} />
          </div>
        </div>

        <div className='col-xl-4 col-lg-12'>
          <div className='card border-0 shadow-sm p-3 h-100'>
            <ActionButtons setAction={setAction} />
          </div>
        </div>

        {/* Test Component */}
        <div className='col-12'>
          <div className='card border-0 shadow-sm p-3 h-100'>
            <Test cartItems={cartItems} invoiceData={invoiceData} paymentData={paymentData} customerData={customerData} />
          </div>
        </div>
      </div>

    </div>
  )
}

export default POS
