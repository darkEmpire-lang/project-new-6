import React, { useContext, useState, useEffect, useRef } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/assets';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  street: '',
  city: '',
  state: '',
  zipcode: '',
  country: '',
  phone: ''
};

const PlaceOrder = () => {
  const [method, setMethod] = useState('');
  const { navigate, backendUrl, token, cartItems, setcartItems, delivery_fee, products, getCartAmount } = useContext(ShopContext);

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);
  const [bankSlip, setBankSlip] = useState(null);
  const [bankSlipPreview, setBankSlipPreview] = useState(null);
  const [orderForReport, setOrderForReport] = useState(null);
  const [showReportPrompt, setShowReportPrompt] = useState(false);
  const fileInputRef = useRef();
  const reportDivRef = useRef();

  useEffect(() => {
    const selected = localStorage.getItem("selectedDeliveryInfo");
    if (selected) {
      try {
        const parsed = JSON.parse(selected);
        setFormData({
          firstName: parsed.firstName || "",
          lastName: parsed.lastName || "",
          email: parsed.email || "",
          street: parsed.street || "",
          city: parsed.city || "",
          state: parsed.state || "",
          zipcode: parsed.zipcode || "",
          country: parsed.country || "",
          phone: parsed.phone || ""
        });
      } catch {}
      localStorage.removeItem("selectedDeliveryInfo");
    }
  }, []);

  // --- VALIDATION ---
  function validateField(name, value) {
    if (["firstName", "lastName", "city", "state", "country"].includes(name)) {
      if (!/^[a-zA-Z\s]+$/.test(value)) return "Only letters allowed";
      if (!value.trim()) return "Required";
    }
    if (name === "zipcode") {
      if (!/^\d{0,5}$/.test(value)) return "Only numbers allowed";
      if (value.length !== 5) return "Zip code must be 5 digits";
    }
    if (name === "phone") {
      if (!/^\d{0,10}$/.test(value)) return "Only numbers allowed";
      if (value.length !== 10) return "Phone must be 10 digits";
    }
    if (name === "email") {
      if (!value.endsWith("@gmail.com")) return "Email must end with @gmail.com";
    }
    if (name === "street") {
      if (!value.trim()) return "Required";
    }
    return "";
  }

  function isFormValid(form) {
    let valid = true;
    let newErrors = {};
    Object.entries(form).forEach(([k, v]) => {
      const err = validateField(k, v);
      newErrors[k] = err;
      if (err) valid = false;
    });
    setErrors(newErrors);
    return valid;
  }

  // Watch for all fields filled and valid
  useEffect(() => {
    const allFilled = Object.values(formData).every(v => v && String(v).trim() !== '');
    const allValid = isFormValid(formData);
    if (allFilled && allValid && !hasPrompted) {
      setShowSavePrompt(true);
      setHasPrompted(true);
    }
    if (!allFilled && hasPrompted) setHasPrompted(false);
    // eslint-disable-next-line
  }, [formData]);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    let v = value;
    // Restrict input
    if (["firstName", "lastName", "city", "state", "country"].includes(name)) {
      v = v.replace(/[^a-zA-Z\s]/g, "");
    }
    if (name === "zipcode") {
      v = v.replace(/[^0-9]/g, "").slice(0, 5);
    }
    if (name === "phone") {
      v = v.replace(/[^0-9]/g, "").slice(0, 10);
    }
    setFormData((data) => ({ ...data, [name]: v }));
    setErrors((errs) => ({ ...errs, [name]: validateField(name, v) }));
    if (hasPrompted && (!v || String(v).trim() === '')) setHasPrompted(false);
  };

  const onBankSlipChange = (e) => {
    const file = e.target.files[0];
    setBankSlip(file);
    if (file) {
      setBankSlipPreview(URL.createObjectURL(file));
    } else {
      setBankSlipPreview(null);
    }
  };

  const removeBankSlip = () => {
    setBankSlip(null);
    setBankSlipPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (!method) {
      toast.error("Please select a payment method.");
      return;
    }
    if (!isFormValid(formData)) {
      toast.error("Please correct the errors in the form.");
      return;
    }
    try {
      let orderItems = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const itemInfo = structuredClone(products.find(product => product._id === items));
            if (itemInfo) {
              itemInfo.size = item;
              itemInfo.quantity = cartItems[items][item];
              orderItems.push(itemInfo);
            }
          }
        }
      }
      let orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee
      };

      if (method === 'cod') {
        const response = await axios.post(backendUrl + '/api/order/place', orderData, { headers: { token } });
        if (response.data.success) {
          setcartItems({});
          setOrderForReport({
            ...orderData,
            paymentMethod: 'cod',
            payment: false,
            status: 'Not Paid',
            date: Date.now(),
            _id: response.data.orderId || Math.random().toString(36).slice(2), // fallback
          });
          setShowReportPrompt(true);
        } else {
          toast.error(response.data.message);
        }
      } else if (method === 'stripe') {
        const responseStripe = await axios.post(backendUrl + '/api/order/stripe', orderData, { headers: { token } });
        if (responseStripe.data.success) {
          window.location.replace(responseStripe.data.session_url);
        } else {
          toast.error(responseStripe.data.message);
        }
      } else if (method === 'bankSlip') {
        if (!bankSlip) {
          toast.error("Please upload your bank slip image.");
          return;
        }
        const formDataObj = new FormData();
        formDataObj.append('userId', token && JSON.parse(atob(token.split('.')[1])).id);
        formDataObj.append('items', JSON.stringify(orderItems));
        formDataObj.append('amount', getCartAmount() + delivery_fee);
        formDataObj.append('address', JSON.stringify(formData));
        formDataObj.append('bankSlip', bankSlip);

        const response = await axios.post(
          backendUrl + '/api/order/bankslip',
          formDataObj,
          {
            headers: {
              token,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        if (response.data.success) {
          setcartItems({});
          setOrderForReport({
            ...orderData,
            paymentMethod: 'bankSlip',
            payment: false,
            status: 'Not Paid',
            date: Date.now(),
            bankSlipUrl: response.data.order?.bankSlipUrl || bankSlipPreview,
            _id: response.data.order?._id || Math.random().toString(36).slice(2),
          });
          setShowReportPrompt(true);
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      toast.error("Order failed");
    }
  };

  // Download beautiful PNG report using html2canvas
  const downloadReport = async () => {
    if (!orderForReport) return;
    const html2canvas = (await import('html2canvas')).default;
    setShowReportPrompt(false);
    setTimeout(async () => {
      if (!reportDivRef.current) return;
      const canvas = await html2canvas(reportDivRef.current, { backgroundColor: null, scale: 2 });
      const link = document.createElement('a');
      link.download = `order-report-${orderForReport._id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setTimeout(() => {
        navigate('/orders');
      }, 300);
    }, 100);
  };

  const handleReportPrompt = (download) => {
    setShowReportPrompt(false);
    setTimeout(() => {
      if (download) downloadReport();
      else navigate('/orders');
    }, 100);
  };

  const handlePaymentMethodClick = (paymentMethod) => setMethod(paymentMethod);

  const handleSaveDeliveryInfo = async (save) => {
    setShowSavePrompt(false);
    if (save) {
      try {
        const res = await axios.post(
          backendUrl + "/api/delivery",
          { deliveryInfo: formData },
          { headers: { token } }
        );
        if (res.data.success) {
          toast.success("Delivery info saved!");
        } else {
          toast.error("Failed to save delivery info");
        }
      } catch {
        toast.error("Failed to save delivery info");
      }
    }
  };

  
  const renderReportDiv = () => {
    if (!orderForReport) return null;
    const order = orderForReport;
    return (
      <div ref={reportDivRef} style={{
        padding: 32, borderRadius: 24, boxShadow: '0 3px 20px #0001', border: '2px solid #b08968',
        width: 520, margin: 'auto', background: 'white', fontFamily: 'sans-serif', color: '#222', position: 'fixed', left: '-99999px', top: 0, zIndex: -9999
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <img src={assets.flogo} alt="Logo" style={{ height: 48, width: 48, borderRadius: 12, border: '2px solid #d4a373' }} />
          <div>
            <div style={{ fontSize: '1.7rem', fontWeight: 'bold', color: '#5a4235' }}>Order Report</div>
            <div style={{ fontSize: '1.1rem', color: '#b08968' }}>Order ID: {order._id}</div>
          </div>
        </div>
        <hr style={{ borderTop: '1px solid #e5e7eb', margin: '16px 0' }} />
        <div style={{ marginBottom: 12 }}>
          <b>Date:</b> {new Date(order.date).toLocaleString()}
        </div>
        <div style={{ marginBottom: 12 }}>
          <b>Customer:</b> {order.address.firstName} {order.address.lastName}<br />
          <b>Email:</b> {order.address.email}<br />
          <b>Phone:</b> {order.address.phone}<br />
          <b>Address:</b> {order.address.street}, {order.address.city}, {order.address.state}, {order.address.country}, {order.address.zipcode}
        </div>
        <div style={{ marginBottom: 12 }}>
          <b>Payment Method:</b> {order.paymentMethod} <br />
          <b>Amount:</b> ₹{order.amount.toFixed(2)}
        </div>
        <div style={{ marginBottom: 12 }}>
          <b>Items:</b>
          <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
            {order.items.map(item => <li key={item.name + item.size}>{item.name} ({item.size}) x {item.quantity}</li>)}
          </ul>
        </div>
        {order.paymentMethod === "bankSlip" && order.bankSlipUrl && (
          <div style={{ marginBottom: 12 }}>
            <b>Bank Slip:</b><br />
            <img src={order.bankSlipUrl} alt="Bank Slip" style={{ marginTop: 6, maxHeight: 90, maxWidth: 280, borderRadius: 8, border: '1.5px solid #b08968' }} />
          </div>
        )}
        <hr style={{ borderTop: '1px solid #e5e7eb', margin: '18px 0 8px 0' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#b08968', fontSize: '1.1rem', fontWeight: 'bold' }}>Thank you for your order!</span>
          <span style={{ color: '#b08968', fontSize: '1rem' }}>{new Date().getFullYear()} &copy; Crafttopia.com</span>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderReportDiv()}
      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col sm:flex-row justify-between gap-8 pt-5 sm:pt-14 min-h-[80vh] border-t px-4 sm:px-8 relative"
        encType={method === 'bankSlip' ? "multipart/form-data" : undefined}
      >
        <div className="flex flex-col gap-6 w-full sm:max-w-[480px]">
          <div className="text-xl sm:text-2xl my-3 text-gray-800">
            <Title text1=" DELIVERY " text2=" INFORMATION " />
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex gap-4">
              <div className="w-full">
                <input onChange={onChangeHandler} name="firstName" value={formData.firstName} className="border border-gray-300 py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all" type="text" placeholder="First Name" required />
            
              </div>
              <div className="w-full">
                <input onChange={onChangeHandler} name="lastName" value={formData.lastName} className="border border-gray-300 py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all" type="text" placeholder="Last Name" required />
            
              </div>
            </div>
            <div>
              <input onChange={onChangeHandler} name="email" value={formData.email} className="border border-gray-300 py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all" type="email" placeholder="Email Address" required />
    
            </div>
            <div>
              <input onChange={onChangeHandler} name="street" value={formData.street} className="border border-gray-300 py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all" type="text" placeholder="Street Address" required />
        
            </div>
            <div className="flex gap-4">
              <div className="w-full">
                <input onChange={onChangeHandler} name="city" value={formData.city} className="border border-gray-300 py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all" type="text" placeholder="City" required />
  
              </div>
              <div className="w-full">
                <input onChange={onChangeHandler} name="state" value={formData.state} className="border border-gray-300 py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all" type="text" placeholder="State" required />
      
              </div>
              <div className="w-full">
                <input onChange={onChangeHandler} name="zipcode" value={formData.zipcode} className="border border-gray-300 py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all" type="text" placeholder="Zip Code" required />
              
              </div>
            </div>
            <div>
              <input onChange={onChangeHandler} name="country" value={formData.country} className="border border-gray-300 py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all" type="text" placeholder="Country" required />
            
            </div>
            <div>
              <input onChange={onChangeHandler} name="phone" value={formData.phone} className="border border-gray-300 py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all" type="tel" placeholder="Phone Number" required />
    
            </div>
          </div>
        </div>
        <div className="flex flex-col w-full sm:max-w-[400px]">
          <CartTotal />
          <div className="mt-8">
            <Title text1=" PAYMENT " text2=" METHOD " />
            <div className="flex flex-col sm:flex-row justify-between mt-4 gap-4 items-center">
              <div
                onClick={() => handlePaymentMethodClick('stripe')}
                className={`flex items-center gap-2 cursor-pointer p-3 border border-gray-300 rounded-lg w-full sm:w-auto ${method === 'stripe' ? 'border-blue-500' : 'hover:bg-gray-100'}`}
              >
                <input type="radio" name="payment" id="stripe" checked={method === 'stripe'} className="cursor-pointer w-24" readOnly />
                <img className="h-5 w-28 mr-4" src={assets.stripe_logo} alt="Stripe" />
              </div>
              <div
                onClick={() => handlePaymentMethodClick('cod')}
                className={`flex items-center gap-2 cursor-pointer p-3 border border-gray-300 rounded-lg w-full sm:w-auto ${method === 'cod' ? 'border-blue-500' : 'hover:bg-gray-100'}`}
              >
                <input type="radio" name="payment" id="cash" checked={method === 'cod'} className="cursor-pointer" readOnly />
                <span className="text-gray-700 text-sm whitespace-nowrap">Cash on Delivery</span>
              </div>
              <div
                onClick={() => handlePaymentMethodClick('bankSlip')}
                className={`flex items-center gap-2 cursor-pointer p-3 border border-gray-300 rounded-lg w-full sm:w-auto ${method === 'bankSlip' ? 'border-purple-500 bg-purple-50' : 'hover:bg-gray-100'}`}
              >
                <input type="radio" name="payment" id="bankSlip" checked={method === 'bankSlip'} className="cursor-pointer" readOnly />
                <span className="text-purple-700 text-sm whitespace-nowrap">Upload Bank Slip</span>
              </div>
            </div>
            {method === 'bankSlip' && (
              <div className="mt-6">
                <div className="mb-2 font-semibold text-purple-800">Bank Slip Payment Instructions</div>
                <ul className="list-disc pl-5 text-sm text-purple-700 mb-3">
                  <li>Transfer the total order amount to our bank account: <span className="font-semibold">1234567890</span> (ABC Bank, IFSC: ABCD0123456)</li>
                  <li>Upload a clear image or screenshot of your bank transfer slip below.</li>
                  <li>Your order will be processed after verification of your payment slip.</li>
                  <li>For any issues, contact support at <span className="underline">support@example.com</span>.</li>
                </ul>
                {/* Beautiful upload area */}
                <div
                  className="flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-2xl bg-white py-10 px-4 transition hover:border-blue-600 cursor-pointer"
                  style={{ minHeight: 180 }}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current && fileInputRef.current.click(); }}
                  role="button"
                  aria-label="Browse files to upload"
                >
                  <svg className="h-12 w-12 text-blue-500 mb-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 48 48">
                    <path d="M24 6v24m0 0l-8-8m8 8l8-8" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="8" y="32" width="32" height="10" rx="5" fill="#e3f0ff" stroke="none"/>
                  </svg>
                  <span className="text-lg font-medium text-gray-800 mb-2">Browse Files to upload</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={onBankSlipChange}
                    className="hidden"
                  />
                </div>
                {/* File info bar */}
                <div className="flex items-center gap-2 mt-4 px-3 py-2 bg-gray-50 rounded-lg border border-blue-100">
                  <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 8.293a1 1 0 011.414 1.414l-8 8a1 1 0 01-1.414 0l-8-8A1 1 0 012.707 8.293L10 15.586l7.293-7.293z"/>
                  </svg>
                  <span className="flex-1 text-sm text-gray-700 truncate">
                    {bankSlip ? bankSlip.name : "No selected File -"}
                  </span>
                  {bankSlip && (
                    <button
                      type="button"
                      className="ml-2 text-red-500 hover:text-red-700"
                      onClick={e => { e.stopPropagation(); removeBankSlip(); }}
                      aria-label="Remove file"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  )}
                </div>
                {bankSlipPreview && (
                  <img src={bankSlipPreview} alt="Bank Slip Preview" className="mt-3 rounded shadow max-h-32 border border-purple-200" />
                )}
              </div>
            )}
          </div>
          <div className="w-full text-end mt-8">
            <button
              type="submit"
              className="bg-black text-white px-16 py-3 text-sm rounded-lg hover:bg-gray-800"
              disabled={!method || Object.values(errors).some(e => e)}
            >
              PLACE ORDER
            </button>
          </div>
        </div>
      </form>
      {showSavePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col items-center">
            <div className="text-xl font-semibold mb-2 text-gray-800">Save this delivery address for next time?</div>
            <div className="flex gap-6 mt-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-medium transition" onClick={() => handleSaveDeliveryInfo(true)}>
                Yes, Save
              </button>
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-2 rounded-lg font-medium transition" onClick={() => handleSaveDeliveryInfo(false)}>
                No, Thanks
              </button>
            </div>
          </div>
        </div>
      )}
      {showReportPrompt && orderForReport && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col items-center">
            <div className="text-xl font-semibold mb-2 text-gray-800">Download Order Report?</div>
          
            <div className="flex gap-6 mt-2">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-medium transition" onClick={() => handleReportPrompt(true)}>
                Yes, Download
              </button>
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-2 rounded-lg font-medium transition" onClick={() => handleReportPrompt(false)}>
                No, Go to Orders
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PlaceOrder;
