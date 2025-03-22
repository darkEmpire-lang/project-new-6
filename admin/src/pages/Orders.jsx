import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);

  const fetchAllOrders = async () => {
    if (!token) {
      console.log('Token is missing.');
      return;
    }

    try {
      const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } });
      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching orders:', error.message);
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/order/status',
        { orderId, status: event.target.value },
        { headers: { token } }
      );
      if (response.data.success) {
        await fetchAllOrders();
      }
    } catch (error) {
      console.log(error);
      toast.error(response.data.message);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  return (
    <div className="p-6 bg-[#f8f1e4] min-h-screen">
      <h3 className="text-3xl font-bold text-[#5a4235] mb-6 text-center">Orders</h3>

      <div className="grid gap-6">
        {orders.length === 0 ? (
          <p className="text-center text-gray-500">No orders found.</p>
        ) : (
          orders.map((order, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-4 items-start border-2 border-[#d4a373] rounded-lg bg-[#fff7e1] shadow-md p-5 hover:shadow-lg transition-shadow"
            >
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
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
