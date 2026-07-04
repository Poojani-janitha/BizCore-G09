import React, { useState, useEffect, useCallback } from 'react'
import CustomerInfo from '../../component/pos/customerInfo/CustomerInfo'
import ItemTable from '../../component/pos/itemTable/ItemTable'
import InvoiceTotal from '../../component/pos/invoiceTotal/InvoiceTotal'
import PaymentMethod from '../../component/pos/paymentMethod/PaymentMethod'
import ActionButtons from '../../component/pos/actionButtons/ActionButtons'
// import Test from './Test'
import axios from 'axios'
import RecentSale from '../../component/pos/recentSale/RecentSale'
import InformationBox from '../../component/pos/informationBox/InformationBox'
import BillTemplate from '../../component/pos/billTemplate/BillTemplate'
import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print';
import { Trash2, PauseCircle, Package } from 'lucide-react';


// Create a walk-in customer object
const WALKIN_CUSTOMER = {
  c_id: 20,
  customer_code: 'WALKIN',
  c_name: 'Walk-in Customer',
  phone1: 'N/A',
  customer_type: 'Retail',
  price_level: 'Retail',
  credit_allowed: false,
  credit_status: 'NOT_ALLOWED'
};

const toNumber = (value) => parseFloat(value) || 0;

const POS = () => {
  const [cartItems, setCartItems] = useState([]);
  const [invoiceData, setInvoiceData] = useState({});
  const [customerData, setCustomerData] = useState(WALKIN_CUSTOMER);

  const [paymentData, setPaymentData] = useState({});
  const [action, setAction] = useState({});// This state is used to trigger actions like proceeding to payment or holding invoice, it can be set from ActionButtons component and will be monitored in useEffect to perform corresponding actions
  const [invoiceNo, setInvoiceNo] = useState('');
  const [loading, setLoading] = useState(false);//for display resent sales component after payment, also can be used for loading state in future
  const [holdInvoices, setHoldInvoices] = useState([]);//for storing multiple hold invoice data in local storage
  const [isHoldOpen, setIsHoldOpen] = useState(false);
  const[information, setInformation] = useState({});//for storing product information to display in InformationBox component
  const [priceLevel, setPriceLevel] = useState('Retail'); // Toggle between Retail and Wholesale
  const [location, setLocation] = useState('Shop'); // toggle between  shop and production
  const [selectedProduct, setSelectedProduct] = useState(null); // Store the currently selected product for which we want to show information in InformationBox
  const [error, setError] = useState({ field: null, message: null }); // Error state for handling any issues during API calls
  const [successMessage, setSuccessMessage] = useState(null); // Success message state for displaying any success messages after actions


  // Auto-clear alerts after 5 seconds
  useEffect(() => {
    if (successMessage || error?.message) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        if (error?.field === 'general' || !error?.field) {
          setError({ field: null, message: null });
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error?.message]);





  // Initial setup
  useEffect(() => {
    setCustomerData(WALKIN_CUSTOMER);
  }, []);


  const handleInvoiceDataChange = (data) => {

    setInvoiceData(data);
    console.log("Updated Invoice Data:", data);
  }

  const billPrintRef = useRef();// Reference for the BillTemplate component to trigger print

  // Function to handle printing the bill using react-to-print
  const handlePrint = useReactToPrint({
    contentRef: billPrintRef,
    documentTitle: `Invoice_${invoiceNo}`,
    pageStyle: `@page { size: auto; margin: 0; }`,
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
    console.log("Resetting form after sale. Completed Invoice:", completedInvoiceNo);
    setLoading(true);
    try {
      // Reset all form data
      setInvoiceData({});
      setCartItems([]);
      setCustomerData(WALKIN_CUSTOMER);
      setPaymentData({});
      setError({ field: null, message: null });

      // Fetch new invoice number for next sale
      console.log("Fetching new invoice number...");
      const newResponse = await axios.get('http://localhost:5000/api/sales/generate-invoice-no');
      console.log("New Invoice Response:", newResponse.data);

      if (newResponse.data.success) {
        console.log("Updating invoiceNo state to:", newResponse.data.invoiceNo);
        setInvoiceNo(newResponse.data.invoiceNo);
      }
    } catch (error) {
      console.error("Error resetting form:", error);
      setError({ field: 'general', message: "Sale saved, but failed to fetch new invoice number. Please refresh." });
    } finally {
      setLoading(false);
    }
  };


  //send sales data to backend when action is triggered from ActionButtons component, also validate data before sending
  // Auto-dismiss alerts after 5 seconds
  useEffect(() => {
    if (successMessage || error?.message) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError({ field: null, message: null });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  const validateCartStockBeforeSave = useCallback(async () => {
    const groupedItems = cartItems.reduce((groups, item) => {
      if (!item?.p_id) {
        return groups;
      }

      if (!groups[item.p_id]) {
        groups[item.p_id] = {
          p_name: item.p_name,
          base_unit_name: item.base_unit_name || item.p_unit || 'base unit',
          totalBaseQty: 0,
        };
      }

      groups[item.p_id].totalBaseQty += toNumber(item.quntity) * (item.conversionFactor || 1);
      return groups;
    }, {});

    for (const [productId, productInfo] of Object.entries(groupedItems)) {
      const res = await axios.get(`http://localhost:5000/api/sales/product-quantity/${productId}`);

      if (!res.data?.success) {
        continue;
      }

      const shopQty = toNumber(res.data.shopQty);
      const productionQty = toNumber(res.data.productionQty);
      const totalQty = toNumber(res.data.totalQty);

      let availableQty = 0;
      if (location === 'Shop') {
        availableQty = shopQty;
      } else if (location === 'Production') {
        availableQty = productionQty;
      } else {
        availableQty = totalQty;
      }

      if (productInfo.totalBaseQty > availableQty) {
        setError({
          field: 'general',
          message: `All ${productInfo.p_name} you ordered is ${productInfo.totalBaseQty} in base unit but there is only ${availableQty} ${productInfo.base_unit_name} in the ${location} location.`
        });
        return false;
      }
    }

    return true;
  }, [cartItems, location, setError]);

  const sendData = useCallback(async () => {

    if (!action) {
      console.warn("No action selected. Data will not be sent.");
      return;
    } else if (action === 'printAndSave') {
      // Validate customer selection
      if (!customerData || !customerData.c_id) {
        setError({ field: 'general', message: 'Please select a customer before proceeding to payment.' });
        setAction({});
        return;
      }

      // Validate non-cash payments for Walk-in customer
      const hasNonCash = parseFloat(paymentData?.Cheque_Amount) > 0 ||
        parseFloat(paymentData?.Bank_Transfer_Amount) > 0 ||
        parseFloat(paymentData?.Credit_Amount) > 0;
      if (hasNonCash && customerData?.customer_code === 'WALKIN') {
        setError({ field: 'general', message: 'Please select a specific customer for Cheque, Bank Transfer, or Credit payments.' });
        setAction({});
        return;
      }

      // Validate Overpayment vs Outstanding Balance
      if (paymentData?.Keep_Balance) {
        const tb = parseFloat(invoiceData?.finalTotal) || 0;
        const paymentAmount = parseFloat(paymentData?.Payment_Amount) || 0;
        const overpayment = paymentAmount - tb;
        const outstandingBalance = parseFloat(customerData?.current_balance ?? customerData?.Current_Balance) || 0;

        if (overpayment > outstandingBalance) {
          setError({
            field: 'general',
            message: `Keep balance amount (Rs. ${overpayment.toFixed(2)}) is greater than the customer's outstanding balance (Rs. ${outstandingBalance.toFixed(2)}).`
          });
          setAction({});
          return;
        }
      }
      // Validate Cheque/Bank Reference Details
      if (parseFloat(paymentData?.Cheque_Amount) > 0 && !paymentData?.Cheque_No) {
        setError({ field: 'general', message: 'Please enter payment details (Cheque Number).' });
        setAction({});
        return;
      }
      if (parseFloat(paymentData?.Bank_Transfer_Amount) > 0 && !paymentData?.Bank_Ref) {
        setError({ field: 'general', message: 'Please enter payment details (Bank Reference).' });
        setAction({});
        return;
      }




      if (!cartItems || cartItems.length === 0) {
        setError({ field: 'general', message: 'Your cart is empty. Please add items before saving or printing.' });
        setAction({});
        return;
      }


      if (!invoiceNo) {
        setError({ field: 'general', message: 'Invoice number is missing. Please try again.' });
        setAction({});
        return;
      }

      const isStockValid = await validateCartStockBeforeSave();
      if (!isStockValid) {
        setAction({});
        return;
      }

      const accessToken = localStorage.getItem('token');
      if (!accessToken) {
        setError({ field: 'general', message: 'You are not logged in. Please sign in again before saving the sale.' });
        setAction({});
        return;
      }

      const refreshAccessToken = async () => {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          return null;
        }

        const refreshResponse = await axios.post('http://localhost:5000/api/users/refresh', {
          refresh_token: refreshToken
        });

        if (refreshResponse.data?.success && refreshResponse.data.access_token) {
          localStorage.setItem('token', refreshResponse.data.access_token);
          return refreshResponse.data.access_token;
        }

        return null;
      };

      const submitSale = async (token) => {
        return axios.post(`http://localhost:5000/api/sales/`, {
          customer: customerData,
          items: cartItems,
          invoiceDetails: { ...invoiceData, invoiceNo: invoiceNo },
          paymentDetails: paymentData,
          priceLevel: priceLevel,
          saleType: priceLevel === 'Retail' ? 'Retail' : 'Wholesale',
          location: location,
          action: action
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      };

    

      try {
        let response;
        try {
          response = await submitSale(accessToken);
        } catch (saleError) {
          const status = saleError?.response?.status;
          if (status === 401) {
            const freshToken = await refreshAccessToken();
            if (!freshToken) {
              throw saleError;
            }
            response = await submitSale(freshToken);
          } else {
            throw saleError;
          }
        }


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
    } else if (action === 'print') {
      // Handle print action - Only check for items in cart
      if (!cartItems || cartItems.length === 0) {
        setError({ field: 'general', message: 'Cannot print: Your cart is empty.' });
        setAction({});
        return;
      }
      if (!invoiceNo) {
        setError({ field: 'general', message: 'Cannot print: Invoice number is missing.' });
        setAction({});
        return;
      }

      handlePrint();
      setAction({});


    }
    else if (action === 'clear') {
      setInvoiceData({});
      setCartItems([]);
      setCustomerData(WALKIN_CUSTOMER);
      setPaymentData({});
      setError({ field: null, message: null });
      setSuccessMessage(null);
      setAction({});
      setInformation({}); // Clear information box data
    }
  }, [action, handlePrint, cartItems, invoiceNo, WALKIN_CUSTOMER, invoiceData, paymentData, priceLevel, location, resetFormAfterSale, validateCartStockBeforeSave]);


  // Trigger sendData when action changes
  useEffect(() => {
    if (['printAndSave', 'print', 'clear'].includes(action)) {
      sendData();
    }
  }, [action, sendData]);


  // // Trigger sendData when action changes to print
  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Handle F-Keys and ESC
      if (e.key === 'F12') {
        e.preventDefault();
        setAction('printAndSave');
      } else if (e.key === 'F10') {
        e.preventDefault();
        setAction('print');
      } else if (e.key === 'F9') {
        e.preventDefault();
        setAction('holdInvoice');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setAction('clear');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


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


  useEffect(() => {
    if (action === 'holdInvoice') {
      if (!customerData || !invoiceData || cartItems.length === 0) {
        setError({ field: 'holdInvoice', message: 'Cannot hold invoice: Missing customer, items, or invoice data' });
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
        date: new Date().toLocaleDateString(),
        invoiceNo: invoiceNo,
        location: location,
        id: Date.now()
      };

      // Get existing hold invoices and add the new one
      const currentHolds = JSON.parse(localStorage.getItem('holdInvoices') || '[]');
      const updatedHolds = [...currentHolds, holdData];

      // Store in local storage
      localStorage.setItem('holdInvoices', JSON.stringify(updatedHolds));
      setHoldInvoices(updatedHolds);

      // Reset current invoice
      setInvoiceData({});
      setCartItems([]);
      setPaymentData({});
      setAction({});
      setCustomerData(WALKIN_CUSTOMER);

      setSuccessMessage('Invoice has been held successfully!');
    }
  }, [action, customerData, cartItems, invoiceData, paymentData, invoiceNo]);


  // Load hold invoices from localStorage on component mount
  useEffect(() => {
    const storedHolds = localStorage.getItem('holdInvoices');
    if (storedHolds) {
      try {
        setHoldInvoices(JSON.parse(storedHolds));
      } catch (error) {
        console.error('Error loading held invoices from localStorage:', error);
      }
    }
  }, []);


  // Function to load held invoice back into the form
  // Function to load a specific held invoice
  const loadHeldInvoice = (index) => {
    const invoiceToLoad = holdInvoices[index];
    if (invoiceToLoad) {
      setCustomerData(invoiceToLoad.customerData);
      setCartItems(invoiceToLoad.cartItems);
      setInvoiceData(invoiceToLoad.invoiceData);
      setPaymentData(invoiceToLoad.paymentData);

      // Remove from list
      const updatedHolds = holdInvoices.filter((_, i) => i !== index);
      setHoldInvoices(updatedHolds);
      localStorage.setItem('holdInvoices', JSON.stringify(updatedHolds));

      setIsHoldOpen(false);
      setSuccessMessage('Held invoice has been loaded successfully!');
    }
  };

  // Function to clear a specific held invoice
  const clearHeldInvoice = (index) => {
    const updatedHolds = holdInvoices.filter((_, i) => i !== index);
    setHoldInvoices(updatedHolds);
    localStorage.setItem('holdInvoices', JSON.stringify(updatedHolds));
    if (updatedHolds.length === 0) {
      setIsHoldOpen(false);
    }
  };




  return (
    <div className='pos-wrapper w-100' style={{ overflowX: 'hidden' }}>
      {/* Global Floating Alerts */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        width: 'auto',
        minWidth: '300px',
        maxWidth: '90%'
      }}>
        {successMessage && (
          <div className="alert alert-success alert-dismissible fade show border-0 shadow-lg mb-3" role="alert" style={{ backgroundColor: '#2e7d32', color: '#fff', borderRadius: '8px', padding: '15px 45px 15px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="bi bi-check-circle-fill" style={{ fontSize: '20px' }}></i>
              <div>
                <strong style={{ fontSize: '15px' }}>Success!</strong>
                <div style={{ fontSize: '14px', marginTop: '2px' }}>{successMessage}</div>
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={() => setSuccessMessage(null)} style={{ fontSize: '12px' }}></button>
          </div>
        )}

        {error?.message && (error?.field === 'general' || !error?.field) && (
          <div className="alert alert-danger alert-dismissible fade show border-0 shadow-lg" role="alert" style={{ backgroundColor: '#c62828', color: '#fff', borderRadius: '8px', padding: '15px 45px 15px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '20px' }}></i>
              <div>
                <strong style={{ fontSize: '15px' }}>Attention</strong>
                <div style={{ fontSize: '14px', marginTop: '2px' }}>{error?.message}</div>
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={() => setError({ field: null, message: null })} style={{ fontSize: '12px' }}></button>
          </div>
        )}
      </div>


      {/* Floating Recent Sales Button */}
      <RecentSale />

      {/* Floating Hold Invoice Button */}
      {holdInvoices.length > 0 && (
        <>
          <button
            onClick={() => setIsHoldOpen(!isHoldOpen)}
            style={{
              position: 'fixed',
              bottom: '100px',
              right: '30px',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#ffc107',
              border: 'none',
              color: '#856404',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255, 193, 7, 0.4)',
              zIndex: 999,
              transition: 'all 0.3s ease'
            }}
            title={`${holdInvoices.length} Held Invoices`}
          >
            <div style={{ position: 'relative' }}>
              <PauseCircle size={24} />
              <span style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                backgroundColor: '#dc3545',
                color: 'white',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                border: '2px solid #fff'
              }}>{holdInvoices.length}</span>
            </div>

          </button>

          {isHoldOpen && (
            <div
              onClick={() => setIsHoldOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'flex-end'
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  backgroundColor: '#fff',
                  width: '380px',
                  marginRight: '30px',
                  marginBottom: '170px',
                  borderRadius: '16px',
                  padding: '0',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
                  zIndex: 1001,
                  animation: 'slideUp 0.3s ease-out',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, #ffc107 0%, #ffdb4d 100%)',
                  color: '#856404',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h6 style={{ margin: 0, fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Package size={18} /> Held Invoices ({holdInvoices.length})
                  </h6>
                  <button onClick={() => setIsHoldOpen(false)} className="btn-close" style={{ filter: 'brightness(0.5)' }}></button>
                </div>


                <div style={{
                  maxHeight: '400px',
                  overflowY: 'auto',
                  padding: '15px',
                  backgroundColor: '#f8f9fa'
                }}>
                  {holdInvoices.map((hold, index) => (
                    <div
                      key={hold.id || index}
                      style={{
                        padding: '15px',
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        marginBottom: '12px',
                        border: '1px solid #eee',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#333' }}>{hold.customerData?.c_name || 'Walk-in'}</span>
                        <span style={{ fontSize: '11px', color: '#999' }}>{hold.timestamp}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          <i className="bi bi-cart3 me-1"></i> {hold.cartItems?.length || 0} items
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#0d6efd' }}>
                          Rs. {parseFloat(hold.invoiceData?.finalTotal || 0).toFixed(2)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button
                          onClick={() => loadHeldInvoice(index)}
                          className="btn btn-primary btn-sm flex-grow-1 fw-bold"
                          style={{ fontSize: '13px', padding: '8px' }}
                        >
                          Resume
                        </button>
                        <button
                          onClick={() => clearHeldInvoice(index)}
                          className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center"
                          style={{ width: '38px', height: '38px', padding: '0' }}
                          title="Clear this hold"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}




      {/* Section 1: Customer Info */}
      <div className='card border-0 shadow-sm p-4 mb-3'>
        <CustomerInfo
          customerData={customerData}
          setCustomerData={setCustomerData}
          invoiceNo={invoiceNo}
          setLocation={setLocation}
          location={location}
          setError={setError}
          setSuccessMessage={setSuccessMessage}
          WALKIN_CUSTOMER={WALKIN_CUSTOMER}
        />

      </div>


      {/* Section 2: Item Table */}
      <div className='card border-0 shadow-sm p-3 mb-3'>
        <ItemTable
          cartItems={cartItems}
          setCartItems={setCartItems}
          priceLevel={priceLevel}
          setPriceLevel={setPriceLevel}
          location={location}
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          error={error}
          setError={setError}
          setInformation={setInformation}
        />

        {/* Information Box - Horizontal Line Below Cart */}

        <div className='row g-3'>
          <div className='col-12'>
            <InformationBox
              customerData={customerData}
              selectedProduct={selectedProduct}
              setError={setError}
              location={location}
              setLocation={setLocation}
              cartItems={cartItems}
              information={information}
              setInformation={setInformation}
            />
          </div>
        </div>
      </div>

      {/* Section 3: Payment Method (Full Width) */}
      <div className='card border-0 shadow-sm p-4 mb-3'>
        <PaymentMethod 
          paymentData={paymentData} 
          setPaymentData={setPaymentData} 
          totalDue={invoiceData?.finalTotal || 0} 
          setError={setError} 
          customerData={customerData} 
        />
      </div>

      {/* Section 4: Summary & Actions (Horizontal Row) */}
      <div className='card border-0 shadow-sm p-4 mb-4'>
        <div className='row g-4'>
          <div className='col-lg-6 border-end'>
            <InvoiceTotal 
              cartItems={cartItems} 
              onChangeInvoiceData={handleInvoiceDataChange} 
              setError={setError} 
            />
          </div>
          <div className='col-lg-6'>
            <ActionButtons 
              setAction={setAction} 
              setError={setError} 
            />
          </div>
        </div>
      </div>



      {/* Hidden components (Logic only) */}
      <div style={{ display: 'none' }}>
        <BillTemplate
          ref={billPrintRef}
          cartItems={cartItems}
          invoiceData={invoiceData}
          customerData={customerData}
          invoiceNo={invoiceNo}
          companyInfo={{
            name: 'Shanel ERP System',
            phone: '+1234567890'
          }}
        />
      </div>


    </div>
  )
}

export default POS