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
import InformationBox from '../../component/pos/informationBox/InformationBox'
import BillTemplate from '../../component/pos/billTemplate/BillTemplate'
import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print';

const POS = () => {
  const [cartItems, setCartItems] = useState([]);
  const [invoiceData, setInvoiceData] = useState({});
  const [customerData, setCustomerData] = useState({});
  const [paymentData, setPaymentData] = useState({});
  const [action, setAction] = useState({});// This state is used to trigger actions like proceeding to payment or holding invoice, it can be set from ActionButtons component and will be monitored in useEffect to perform corresponding actions
  const [invoiceNo, setInvoiceNo] = useState('');
  const [loading, setLoading] = useState(false);//for display resent sales component after payment, also can be used for loading state in future
  const [holdInvoice, setHoldInvoice] = useState(null);//for storing hold invoice data in local storage, this can be used in future to implement hold and resume invoice feature
  const [priceLevel, setPriceLevel] = useState('Retail'); // Toggle between Retail and Wholesale
  const [location, setLocation] = useState('Shop'); // toggle between  shop and production
  const [selectedProduct, setSelectedProduct] = useState(null); // Store the currently selected product for which we want to show information in InformationBox
  const [error, setError] = useState({ field: null, message: null }); // Error state for handling any issues during API calls
  const [successMessage, setSuccessMessage] = useState(null); // Success message state for displaying any success messages after actions

  const handleInvoiceDataChange = (data) => {

    setInvoiceData(data);
    console.log("Updated Invoice Data:", data);
  }

  const billPrintRef = useRef();// Reference for the BillTemplate component to trigger print

  // Function to handle printing the bill using react-to-print
  const handlePrint = useReactToPrint({
    contentRef: billPrintRef,
    documentTitle: `Invoice_${invoiceNo}`,
    onAfterPrint: async () => {
      // After printing, reset form data for new transaction
      await resetFormAfterSale(invoiceNo);
      
      // Update bill print status
      try {
        await updateBillPrintStatus();
      } catch (error) {
        console.error("Error updating print status:", error);
      }
    },
    onPrintError: (error) => {
      console.error("Print failed:", error);
      // Still reset form even if print fails
      resetFormAfterSale(invoiceNo);
    }
  });


  // Function to update the bill print status in the backend after printing the bill, this is optional and can be customized based on your backend API and requirements
  const updateBillPrintStatus = async () => {
    try {
      await axios.put(`http://localhost:5000/api/sales/update-print-status/${invoiceNo}`, {
        printed: true
      });
      console.log(`Bill print status updated for invoice ${invoiceNo}`);
    } catch (error) {
      console.error(`Error updating bill print status for invoice ${invoiceNo}:`, error);
    }
  };

  // Function to reset form and fetch new invoice number after sale
  const resetFormAfterSale = async (completedInvoiceNo) => {
    try {
      // Reset all form data
      setInvoiceData({});
      setCartItems([]);
      setCustomerData({});
      setPaymentData({});
      
      // Fetch new invoice number for next sale
      const newResponse = await axios.get('http://localhost:5000/api/sales/generate-invoice-no');
      if (newResponse.data.success) {
        setInvoiceNo(newResponse.data.invoiceNo);
      }
    } catch (error) {
      console.error("Error resetting form:", error);
    } finally {
      setLoading(false);
    }
  };

  // FIX 3: Added all used variables to the useCallback dependency array
  const sendData = useCallback(async () => {
    if (!action) {
      console.warn("No action selected. Data will not be sent.");
      return;
    } else if (action === 'proceedToPayment') {

      if (!customerData || !customerData.c_id) {
        setError({ field: 'customer', message: 'Please select a customer before proceeding to payment.' });
        setAction({});
        return;
      }

      if (!cartItems || cartItems.length === 0) {
        setError({ field: 'cart', message: 'Please add items to the cart before proceeding to payment.' });
        setAction({});
        return;
      }

      if (!invoiceNo) {
        setError({ field: 'invoiceNo', message: 'Invoice number is missing. Please try again.' });
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
          location: location,
          action: action
        });
        
        // Attempt print, but don't let it block the form reset
        try {
          if (billPrintRef.current) {
            handlePrint();
          } else {
            console.warn("Bill template ref not available for printing");
            // Still reset form even if print fails
            resetFormAfterSale(response.data.invoiceNo);
          }
        } catch (printError) {
          console.error("Print error:", printError);
          // Continue anyway - sale was saved successfully
          resetFormAfterSale(response.data.invoiceNo);
        }

        setAction({}); // Reset action after processing 
        console.log("Sale saved successfully:", response.data);
        console.log("Completed Invoice No:", response.data.invoiceNo);

        setSuccessMessage(`Sale saved successfully! Invoice No: ${response.data.invoiceNo}`);
      } catch (error) {
        console.error("Error sending data:", error);
        const errorMessage = error.response?.data?.message || error.message || "Error saving sale. Please try again.";
        setError({ field: 'general', message: errorMessage });
        setLoading(false);
      }
    } else if (action === 'printInvoice' || action === 'print') {
      // Handle print action
      if (!invoiceNo || !cartItems || cartItems.length === 0) {
        setError({ field: 'print', message: 'No sale data to print. Please complete a sale first.' });
        setAction({});
        return;
      }
      handlePrint();
      setAction({});
    }
  }, [action, handlePrint]);

  useEffect(() => {
    if (action === 'proceedToPayment') {
      sendData();
      setAction({});
    }
  }, [action, sendData]);

  // Trigger sendData when action changes to print
  useEffect(() => {
    if (action === 'printInvoice' || action === 'print') {
      sendData();
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
        setError({ field: 'holdInvoice', message: 'Cannot hold invoice: Missing customer, items, or invoice data' });
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
        location: location
      };

      localStorage.setItem('holdInvoice', JSON.stringify(holdData));
      setHoldInvoice(holdData);

      // Reset current invoice
      setInvoiceData({});
      setCartItems([]);
      setPaymentData({});
      setAction({});

      setError({ field: 'holdInvoice', message: 'Invoice has been held successfully!' });
      setSuccessMessage('Invoice has been held successfully!');
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

      {/* Section 1: Customer Info */}
      <div className='card border-0 shadow-sm p-4 mb-3'>
        <CustomerInfo setCustomerData={setCustomerData} invoiceNo={invoiceNo} setLocation={setLocation} location={location} setError={setError} />

      </div>

      <div className='card border-0 shadow-sm p-3 mb-3'>
        <ItemTable cartItems={cartItems} setCartItems={setCartItems} priceLevel={priceLevel} setPriceLevel={setPriceLevel} location={location} setSelectedProduct={setSelectedProduct} error={error} setError={setError} />
        
        {/* Information Box - Horizontal Line Below Cart */}
        <div className='row g-3'>
          <div className='col-12'>
            <InformationBox 
              customerData={customerData} 
              selectedProduct={selectedProduct} 
              setError={setError} 
              location={location} 
              setLocation={setLocation} 
            />
          </div>
        </div>
      </div>

      {/* Section 2.5: Payment Form - Under Item Table */}
      <div className='card border-0 shadow-sm p-3 mb-3'>
        <PaymentMethod paymentData={paymentData} setPaymentData={setPaymentData} totalDue={invoiceData?.finalTotal || 0} setError={setError} />
      </div>

      {/* Section 3: Bottom Grid - Invoice Total and Action Buttons */}
      <div className='card border-0 shadow-sm p-3 mb-3'>
        <div className='row g-3'>
          <div className='col-lg-6'>
            <InvoiceTotal cartItems={cartItems} onChangeInvoiceData={handleInvoiceDataChange} setError={setError} />
          </div>
          <div className='col-lg-6'>
            <ActionButtons setAction={setAction} setError={setError} />
          </div>
        </div>
      </div>

      <div className='row g-3'>
        {/* Test Component */}
        <div className='col-12'>
          <div className='card border-0 shadow-sm p-3 h-100'>
            <Test cartItems={cartItems} invoiceData={invoiceData} paymentData={paymentData} customerData={customerData} setError={setError} />
          </div>
        </div>


        {/* Hidden bill template for printing */}
        <div style={{ display: 'none' }}>
          <BillTemplate
            ref={billPrintRef}
            cartItems={cartItems}
            invoiceData={invoiceData}
            customerData={customerData}
            companyInfo={{
              name: 'Shanel ERP System',
              phone: '+1234567890'
            }}
          />
        </div>


      </div>

    </div>
  )
}

export default POS