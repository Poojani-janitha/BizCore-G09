import React, { useEffect, useCallback } from 'react'
import CustomerInfo from '../../component/pos/customerInfo/CustomerInfo'
import ItemTable from '../../component/pos/itemTable/ItemTable'
import InvoiceTotal from '../../component/pos/invoiceTotal/InvoiceTotal'
import PaymentMethod from '../../component/pos/paymentMethod/PaymentMethod'
import ActionButtons from '../../component/pos/actionButtons/ActionButtons'
import Test from './Test'
import { useState } from 'react'
import axios from 'axios'

const POS = () => {
  const [cartItems, setCartItems] = useState([]);
  const [invoiceData, setInvoiceData] = useState({});
  const [customerData, setCustomerData] = useState({});
  const [paymentData, setPaymentData] = useState({});
  const [action, setAction] = useState({});
  const[invoiceNo,setInvoiceNo] = useState('');



  const handleInvoiceDataChange = (data) => {
 
    setInvoiceData(data);
    console.log("Updated Invoice Data:", data);
  }

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

  return (

    <div className='pos-wrapper w-100' style={{ overflowX: 'hidden' }}>
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
