import React from 'react';
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';

const Sidebar = () => {
  return (
    <div className="w-[18%] min-h-screen bg-[#f8f1e4] border-r-2 border-[#d4a373] shadow-md">
      {/* Logo Section */}
      <div className="flex justify-center items-center py-6">
        <img className="w-12 h-12 rounded-full shadow-lg border-2 border-[#b08968]" src={assets.logo} alt="Logo" />
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col gap-5 text-[16px] font-medium text-[#5a4235] px-4">
        {/* Add Items */}
        <NavLink
          className="flex items-center gap-3 px-4 py-2 rounded-lg transition-all hover:bg-[#d4a373] hover:text-white"
          to="/add"
        >
          <img className="w-6 h-6" src={assets.add_icon} alt="Add Icon" />
          <p className="hidden md:block">Add Items</p>
        </NavLink>
        <hr className="border-t border-[#d4a373]" />

        {/* List Items */}
        <NavLink
          className="flex items-center gap-3 px-4 py-2 rounded-lg transition-all hover:bg-[#d4a373] hover:text-white"
          to="/list"
        >
          <img className="w-6 h-6" src={assets.list_icon} alt="List Icon" />
          <p className="hidden md:block">List Items</p>
        </NavLink>
        <hr className="border-t border-[#d4a373]" />

        {/* Orders */}
        <NavLink
          className="flex items-center gap-3 px-4 py-2 rounded-lg transition-all hover:bg-[#d4a373] hover:text-white"
          to="/orders"
        >
          <img className="w-6 h-6" src={assets.order_icon} alt="Orders Icon" />
          <p className="hidden md:block">Orders</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
