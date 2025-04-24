import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import Title from '../components/Title';
import { ShopContext } from '../context/ShopContext';

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);

  const loadOrderData = async () => {
    try {
      if (!token) return;
      const response = await axios.post(`${backendUrl}/api/order/userorders`, {}, { headers: { token } });
      if (response.data.success) {
        let allOrderItems = [];
        response.data.orders.forEach(order => {
          order.items.forEach(item => {
            item['status'] = order.status;
            item['payment'] = order.payment;
            item['paymentMethod'] = order.paymentMethod;
            item['date'] = order.date;
            allOrderItems.push(item);
          });
        });
        setOrderData(allOrderItems.reverse());
      }
    } catch (error) {
      console.error('Error loading orders:', error.message);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="text-3xl text-[#5a4235] font-bold text-center mb-6">
        <Title text1="MY" text2=" ORDERS" />
      </div>

      <p className="text-lg font-semibold text-[#5a4235] mb-4">Total Orders: {orderData.length}</p>

      <div className="grid gap-6">
        {orderData.length === 0 ? (
          <p className="text-center text-gray-500">No orders found.</p>
        ) : (
          orderData.map((item, index) => (
            <div
              key={index}
              className="border-2 border-[#d4a373] bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <img
                  className="w-20 h-20 object-cover border-2 border-[#b08968] p-2 rounded-lg shadow"
                  src={item.image ? item.image[0] : ''}
                  alt={item.name}
                />
                <div className="text-[#5a4235]">
                  <p className="text-lg font-medium">{item.name}</p>
                  <p className="text-lg">{currency}{item.price}</p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Size: {item.size}</p>
                  <p className="mt-2">Date: <span className="text-gray-600">{new Date(item.date).toLocaleDateString()}</span></p>
                  <p>Payment: <span className="text-gray-600">{item.paymentMethod}</span></p>
                </div>
                <div className="flex flex-col items-center gap-2 md:ml-auto">
                  <p className={`min-w-4 h-4 rounded-full ${item.status === 'Shipped' ? 'bg-green-500' : 'bg-yellow-500'}`}></p>
                  <p className="text-base font-semibold">{item.status || 'Processing'}</p>
                  <button 
                    onClick={loadOrderData} 
                    className="border px-4 py-2 text-sm font-medium rounded-md bg-[#d4a373] text-white hover:bg-[#b08968] transition"
                  >
                    Payment Status
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
