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
  const [invoiceNo, setInvoiceNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [holdInvoice, setHoldInvoice] = useState(null);

  // FIX 1: Declared missing priceLevel state
  const [priceLevel, setPriceLevel] = useState('Retail');


  const handleInvoiceDataChange = (data) => {
    setInvoiceData(data);
    console.log("Updated Invoice Data:", data);
  }


  // FIX 3: Added all used variables to the useCallback dependency array
  const sendData = useCallback(async () => {
    if (!action) {
      console.warn("No action selected. Data will not be sent.");
      return;
    } else if (action === 'proceedToPayment') {

      if (!customerData || !customerData.c_id) {
        alert("Please select a customer before proceeding to payment.");
        setAction({});
        return;
      }

      if (!cartItems || cartItems.length === 0) {
        alert("Please add items to the cart before proceeding to payment.");
        setAction({});
        return;
      }

      try {
        const response = await axios.post(`http://localhost:5000/api/sales/`, {
          customer: customerData,
          items: cartItems,
          invoiceDetails: { ...invoiceData, invoiceNo: invoiceNo },
          paymentDetails: paymentData,
          priceLevel: priceLevel,
          saleType: priceLevel === 'Retail' ? 'Retail' : 'Wholesale',
          action: action
        });
        console.log("Data sent successfully:", response.data);

        alert(`Sale saved successfully! Invoice No: ${response.data.invoiceNo}`);

        setInvoiceData({});
        setCartItems([]);
        setCustomerData({});
        setPaymentData({});
        setAction({});

        // FIX 2: Replaced broken `}, 500);` syntax with a proper inner try/catch
        try {
          const newResponse = await axios.get('http://localhost:5000/api/sales/generate-invoice-no');
          if (newResponse.data.success) {
            setInvoiceNo(newResponse.data.invoiceNo);
          } else {
            console.error("Failed to fetch new invoice number:", newResponse.data.message);
          }
        } catch (innerError) {
          console.error("Failed to fetch new invoice number:", innerError);
        }

      } catch (error) {
        console.error("Error sending data:", error);
        const errorMessage = error.response?.data?.message || error.message || "Error saving sale. Please try again.";
        alert(errorMessage);
      }
    }
  }, [action, customerData, cartItems, invoiceData, paymentData, priceLevel, invoiceNo]); // FIX 3


  useEffect(() => {
    if (action === 'proceedToPayment') {
      sendData();
      setAction({});
    }
  }, [action, sendData]);


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


  useEffect(() => {
    if (action === 'holdInvoice') {
      if (!customerData || !invoiceData || cartItems.length === 0) {
        alert('Cannot hold invoice: Missing customer, items, or invoice data');
        setAction({});
        return;
      }

      const holdData = {
        customerData,
        cartItems,
        invoiceData,
        paymentData,
        timestamp: new Date().toLocaleTimeString(),
        invoiceNo: invoiceNo,
      };

      localStorage.setItem('holdInvoice', JSON.stringify(holdData));
      setHoldInvoice(holdData);

      setInvoiceData({});
      setCartItems([]);
      setPaymentData({});
      setAction({});

      alert('Invoice has been held successfully!');
    }
  }, [action, customerData, cartItems, invoiceData, paymentData, invoiceNo]);


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

  const clearHeldInvoice = () => {
    setHoldInvoice(null);
    localStorage.removeItem('holdInvoice');
  };


  return (
    <div className='pos-wrapper w-100' style={{ overflowX: 'hidden' }}>

      <RecentSale />

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

      <div className='card border-0 shadow-sm p-4 mb-3'>
        <CustomerInfo setCustomerData={setCustomerData} invoiceNo={invoiceNo} />
      </div>

      <div className='card border-0 shadow-sm p-3 mb-3'>
        <ItemTable cartItems={cartItems} setCartItems={setCartItems} priceLevel={priceLevel} setPriceLevel={setPriceLevel} />
      </div>

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