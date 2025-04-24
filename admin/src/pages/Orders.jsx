import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showCount, setShowCount] = useState(6);

  // Counts
  const [codCount, setCodCount] = useState(0);
  const [stripeCount, setStripeCount] = useState(0);
  const [bankSlipCount, setBankSlipCount] = useState(0);

  // For PNG report generation
  const reportCanvasRef = useRef();

  const fetchAllOrders = async () => {
    if (!token) {
      console.log('Token is missing.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        backendUrl + '/api/order/list',
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        const sorted = response.data.orders.sort((a, b) => b.date - a.date);
        setOrders(sorted);
        setCodCount(sorted.filter(o => o.paymentMethod === "cod").length);
        setStripeCount(sorted.filter(o => o.paymentMethod.toLowerCase() === "stripe").length);
        setBankSlipCount(sorted.filter(o => o.paymentMethod === "bankSlip").length);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching orders:', error.message);
    }
    setLoading(false);
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/order/status',
        { orderId, status: event.target.value },
        { headers: { token } }
      );
      if (response.data.success) {
        setOrders(prev =>
          prev.map(o => o._id === orderId ? { ...o, status: event.target.value } : o)
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const askDelete = (orderId) => setDeleteId(orderId);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const response = await axios.delete(
        `${backendUrl}/api/order/delete/${deleteId}`,
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Order deleted");
        setOrders(prev => prev.filter(o => o._id !== deleteId));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to delete order");
    }
    setDeleteId(null);
  };

  useEffect(() => {
    fetchAllOrders();
    // eslint-disable-next-line
  }, [token]);

  // Filtering logic (frontend only)
  const filteredOrders = orders.filter(order => {
    const searchLower = search.toLowerCase().trim();
    const matchesSearch =
      !searchLower ||
      [
        order.address.firstName,
        order.address.lastName,
        order.address.email,
        order.address.phone,
        order.address.city,
        order.address.state,
        order.address.country,
        order.address.zipcode,
      ]
        .filter(Boolean)
        .some(field => field.toLowerCase().includes(searchLower));
    const orderDate = new Date(order.date);
    const afterStart =
      !startDate || orderDate >= new Date(startDate + "T00:00:00");
    const beforeEnd =
      !endDate || orderDate <= new Date(endDate + "T23:59:59");
    return matchesSearch && afterStart && beforeEnd;
  });

  // Recalculate counts for filtered orders
  const filteredCodCount = filteredOrders.filter(o => o.paymentMethod === "cod").length;
  const filteredStripeCount = filteredOrders.filter(o => o.paymentMethod.toLowerCase() === "stripe").length;
  const filteredBankSlipCount = filteredOrders.filter(o => o.paymentMethod === "bankSlip").length;
  const filteredTotal = filteredOrders.length;

  // Pagination: show first 6, then more on "See More"
  const paginatedOrders = filteredOrders.slice(0, showCount);

  // Download beautiful PNG report for an order
  const downloadReport = async (order) => {
    // Dynamically import html2canvas only when needed
    const html2canvas = (await import('html2canvas')).default;
    // Create a hidden div to render the report
    const reportDiv = document.createElement('div');
    reportDiv.style.position = 'fixed';
    reportDiv.style.left = '-99999px';
    reportDiv.style.top = '0';
    reportDiv.style.width = '600px';
    reportDiv.style.background = 'white';
    reportDiv.style.fontFamily = 'sans-serif';
    reportDiv.innerHTML = `
      <div style="padding:32px 40px 24px 40px; border-radius:24px; box-shadow:0 3px 20px #0001; border:2px solid #b08968; width:520px; margin:auto; background:white;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
          <img src="${assets.flogo}" alt="Logo" style="height:48px;width:48px;border-radius:12px;border:2px solid #d4a373;" />
          <div>
            <div style="font-size:1.7rem;font-weight:bold;color:#5a4235;">Order Report</div>
            <div style="font-size:1.1rem;color:#b08968;">Order ID: ${order._id}</div>
          </div>
        </div>
        <hr style="border-top: 1px solid #e5e7eb; margin: 16px 0;" />
        <div style="margin-bottom:12px;">
          <b>Date:</b> ${new Date(order.date).toLocaleString()}
        </div>
        <div style="margin-bottom:12px;">
          <b>Customer:</b> ${order.address.firstName} ${order.address.lastName}<br/>
          <b>Email:</b> ${order.address.email}<br/>
          <b>Phone:</b> ${order.address.phone}<br/>
          <b>Address:</b> ${order.address.street}, ${order.address.city}, ${order.address.state}, ${order.address.country}, ${order.address.zipcode}
        </div>
        <div style="margin-bottom:12px;">
          <b>Payment Method:</b> ${order.paymentMethod} <br/>
          <b>Payment Status:</b> <span style="color:${order.payment ? '#059669' : '#dc2626'};font-weight:bold">${order.payment ? 'Done' : 'Pending'}</span><br/>
          <b>Order Status:</b> ${order.status}<br/>
          <b>Amount:</b> ${currency}${order.amount.toFixed(2)}
        </div>
        <div style="margin-bottom:12px;">
          <b>Items:</b>
          <ul style="margin:6px 0 0 18px;padding:0;">
            ${order.items.map(item => `<li>${item.name} (${item.size}) x ${item.quantity}</li>`).join('')}
          </ul>
        </div>
        ${order.paymentMethod === "bankSlip" && order.bankSlipUrl ? `
          <div style="margin-bottom:12px;">
            <b>Bank Slip:</b><br/>
            <img src="${order.bankSlipUrl}" alt="Bank Slip" style="margin-top:6px;max-height:90px;max-width:280px;border-radius:8px;border:1.5px solid #b08968;" />
          </div>
        ` : ''}
        <hr style="border-top: 1px solid #e5e7eb; margin: 18px 0 8px 0;" />
        <div style="display:flex;align-items:center;justify-content:space-between;">
         
          <span style="color:#b08968;font-size:1rem;">${new Date().getFullYear()} &copy; craftopia.com</span>
        </div>
      </div>
    `;
    document.body.appendChild(reportDiv);

    // Use html2canvas to render the div as PNG
    html2canvas(reportDiv, { backgroundColor: null, scale: 2 }).then(canvas => {
      const link = document.createElement('a');
      link.download = `order-report-${order._id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      document.body.removeChild(reportDiv);
    });
  };

  const onSearch = (e) => {
    e.preventDefault();
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <h3 className="text-3xl font-bold text-[#5a4235] mb-6 text-center">ALL Orders</h3>

      {/* Filters and counts */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <form onSubmit={onSearch} className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Search by name, email, phone, city..."
            className="border border-[#b08968] rounded-lg px-3 py-2 text-[#5a4235] bg-white shadow"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <input
            type="date"
            className="border border-[#b08968] rounded-lg px-3 py-2 text-[#5a4235] bg-white shadow"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
          <span className="mx-2 text-[#5a4235] font-semibold">to</span>
          <input
            type="date"
            className="border border-[#b08968] rounded-lg px-3 py-2 text-[#5a4235] bg-white shadow"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
          <button
            type="submit"
            className="bg-[#b08968] hover:bg-[#a98467] text-white px-4 py-2 rounded-lg font-semibold shadow transition"
          >
            Filter
          </button>
          <button
            type="button"
            className="ml-2 bg-gray-200 hover:bg-gray-300 text-[#5a4235] px-4 py-2 rounded-lg font-semibold shadow transition"
            onClick={() => { setSearch(''); setStartDate(''); setEndDate(''); }}
          >
            Clear
          </button>
        </form>
        <div className="flex flex-wrap gap-3 mt-2 md:mt-0">
          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-semibold shadow text-sm">
            Total: {filteredTotal}
          </span>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold shadow text-sm">
            Stripe: {filteredStripeCount}
          </span>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold shadow text-sm">
            COD: {filteredCodCount}
          </span>
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-semibold shadow text-sm">
            Bank Slip: {filteredBankSlipCount}
          </span>
        </div>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="text-center text-lg text-[#5a4235] py-12">Loading...</div>
        ) : paginatedOrders.length === 0 ? (
          <p className="text-center text-gray-500">No orders found.</p>
        ) : (
          paginatedOrders.map((order, index) => (
            <div
              key={order._id}
              className="relative grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-4 items-start border-2 border-[#d4a373] rounded-lg bg-[#fff7e1] shadow-md p-5 hover:shadow-lg transition-shadow"
            >
              {/* Delete icon */}
              <button
                className="absolute top-2 right-2 text-red-600 hover:text-red-800 p-1 rounded-full bg-white shadow hover:bg-red-100 transition"
                title="Delete order"
                onClick={() => askDelete(order._id)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <img
                className="w-16 h-16 object-cover mx-auto sm:mx-0 border-2 border-[#b08968] p-2 rounded-lg shadow"
                src={assets.parcel_icon}
                alt="Parcel Icon"
              />

              <div>
                <div>
                  {order.items.map((item, idx) => (
                    <p key={idx} className="text-[#5a4235]">
                      {item.name} x {item.quantity} <span>({item.size})</span>
                      {idx !== order.items.length - 1 && <span>,</span>}
                    </p>
                  ))}
                </div>
                <p className="mt-4 font-semibold text-[#5a4235]">{`${order.address.firstName} ${order.address.lastName}`}</p>
                <p>{`${order.address.street}, ${order.address.city}`}</p>
                <p>{`${order.address.state}, ${order.address.country}, ${order.address.zipcode}`}</p>
                <p className="font-medium">Phone: {order.address.phone}</p>
              </div>

              <div className="flex flex-col text-[#5a4235]">
                <p className="font-semibold">Items: {order.items.length}</p>
                <p>Method: {order.paymentMethod}</p>
                <p>
                  Payment:{" "}
                  <span className={order.payment ? "text-green-600" : "text-red-600"}>
                    {order.payment ? "Done" : "Pending"}
                  </span>
                </p>
                <p>Date: {new Date(order.date).toLocaleDateString()}</p>
                {order.paymentMethod === "bankSlip" && order.bankSlipUrl && (
                  <div className="mt-2">
                    <p className="font-semibold text-purple-700">Bank Slip:</p>
                    <img
                      src={order.bankSlipUrl}
                      alt="Bank Slip"
                      className="mt-1 rounded shadow border border-purple-200 max-h-32 max-w-xs"
                    />
                  </div>
                )}
              </div>

              <p className="font-bold text-xl text-[#5a4235] text-center lg:text-right">
                {currency}
                {order.amount.toFixed(2)}
              </p>

              <select
                onChange={(event) => statusHandler(event, order._id)}
                value={order.status}
                className="p-2 rounded-md border border-[#b08968] font-semibold text-[#5a4235] bg-[#fff7e1] shadow-md hover:bg-[#d4a373] transition-all"
              >
                <option value="Not Paid">Not Paid</option>
                <option value="Paid">Paid</option>
              </select>

              {/* Download report button */}
              <button
                className="absolute bottom-2 right-2 bg-[#b08968] hover:bg-[#a98467] text-white px-4 py-1 rounded shadow text-xs font-semibold transition"
                title="Download order report"
                onClick={() => downloadReport(order)}
              >
                Download Report
              </button>
            </div>
          ))
        )}
      </div>

      {/* See More / See Less */}
      {filteredOrders.length > 6 && (
        <div className="flex justify-center mt-8">
          {showCount < filteredOrders.length ? (
            <button
              className="bg-[#b08968] hover:bg-[#a98467] text-white px-6 py-2 rounded-lg font-semibold shadow transition"
              onClick={() => setShowCount(count => Math.min(count + 6, filteredOrders.length))}
            >
              See More
            </button>
          ) : (
            <button
              className="bg-gray-200 hover:bg-gray-300 text-[#5a4235] px-6 py-2 rounded-lg font-semibold shadow transition"
              onClick={() => setShowCount(6)}
            >
              See Less
            </button>
          )}
        </div>
      )}

      {/* Delete warning modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center">
            <svg className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m0-4h.01M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z" />
            </svg>
            <h2 className="text-xl font-bold text-red-600 mb-2">Delete Order?</h2>
            <p className="text-gray-700 text-center mb-6">Are you sure you want to delete this order? This action cannot be undone.</p>
            <div className="flex gap-6">
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold shadow transition"
                onClick={confirmDelete}
              >
                Yes, Delete
              </button>
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-semibold shadow transition"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
