import React from 'react';
import { assets } from '../assets/assets.js';

const NavBar = ({ setToken }) => {
  return (
    <div className="flex items-center py-4 px-[4%] justify-between bg-[#f8f1e4] border-b-2 border-[#d4a373] shadow-md">
      {/* Logo */}
      

      {/* Logout Button */}
      <button
        onClick={() => setToken('')}
        className="ml-auto bg-[#5a4235] text-white px-5 py-2 sm:px-7 sm:py-3 rounded-full text-xs sm:text-sm shadow-md hover:bg-[#d4a373] transition-all"
      >
        Logout
      </button>
    </div>
  );
};

export default NavBar;
