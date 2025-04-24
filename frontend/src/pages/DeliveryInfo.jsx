import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  street: "",
  city: "",
  state: "",
  zipcode: "",
  country: "",
  phone: "",
};

const Spinner = ({ message = "Redirecting..." }) => (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center z-50">
    <svg className="animate-spin h-12 w-12 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
    </svg>
    <span className="text-blue-600 font-semibold text-lg">{message}</span>
  </div>
);

const DeliveryInfo = () => {
  const { backendUrl, token } = useContext(ShopContext);
  const [deliveryInfos, setDeliveryInfos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [isAdd, setIsAdd] = useState(false);
  const [confirmUseId, setConfirmUseId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      toast.error("Please login to view your delivery addresses.");
      navigate("/login");
      return;
    }
    fetchDeliveryInfos();
    // eslint-disable-next-line
  }, [token]);

  const fetchDeliveryInfos = async () => {
    try {
      const res = await axios.get(backendUrl + "/api/delivery", { headers: { token } });
      if (res.data.success) {
        setDeliveryInfos(res.data.deliveryInfos);
      } else if (res.data.message && res.data.message.toLowerCase().includes("not authorized")) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error("Failed to load delivery addresses");
      }
    } catch {
      toast.error("Failed to load delivery addresses");
      navigate("/login");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      const res = await axios.delete(backendUrl + `/api/delivery/${id}`, { headers: { token } });
      if (res.data.success) {
        toast.success("Deleted!");
        fetchDeliveryInfos();
      } else if (res.data.message && res.data.message.toLowerCase().includes("not authorized")) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error("Delete failed");
      }
    } catch {
      toast.error("Delete failed");
      navigate("/login");
    }
  };

  const handleEdit = (info) => {
    setForm(info);
    setErrors({});
    setEditId(info._id);
    setIsAdd(false);
    setShowModal(true);
  };
  const handleAdd = () => {
    setForm(emptyForm);
    setErrors({});
    setIsAdd(true);
    setShowModal(true);
  };

  // Restrict input and validate on change
  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    let error = "";

    // Letters only fields
    if (
      ["firstName", "lastName", "city", "state", "country"].includes(name)
    ) {
      newValue = newValue.replace(/[^a-zA-Z\s]/g, "");
      if (!/^[a-zA-Z\s]+$/.test(newValue) || !newValue.trim()) {
        error = "Only letters and spaces allowed";
      }
    }
    // Phone: numbers only, max 10
    else if (name === "phone") {
      newValue = newValue.replace(/[^0-9]/g, "").slice(0, 10);
      if (!/^\d{10}$/.test(newValue)) error = "Phone must be exactly 10 digits";
    }
    // Zipcode: numbers only, 5 or 6 digits
    else if (name === "zipcode") {
      newValue = newValue.replace(/[^0-9]/g, "").slice(0, 6);
      if (!/^\d{5,6}$/.test(newValue)) error = "Zip code must be 5 or 6 digits";
    }
    // Email
    else if (name === "email") {
      if (!newValue) error = "This field is required";
      else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(newValue))
        error = "Invalid email address";
    }
    // Street
    else if (name === "street") {
      if (!newValue.trim()) error = "This field is required";
    }

    setForm((prev) => ({ ...prev, [name]: newValue }));
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const isFormValid = () => {
    let valid = true;
    let newErrors = {};
    Object.entries(form).forEach(([field, value]) => {
      let error = "";
      if (
        ["firstName", "lastName", "city", "state", "country"].includes(field)
      ) {
        if (!/^[a-zA-Z\s]+$/.test(value) || !value.trim())
          error = "Only letters and spaces allowed";
      } else if (field === "phone") {
        if (!/^\d{10}$/.test(value)) error = "Phone must be exactly 10 digits";
      } else if (field === "zipcode") {
        if (!/^\d{5,6}$/.test(value)) error = "Zip code must be 5 or 6 digits";
      } else if (field === "email") {
        if (!value)
          error = "This field is required";
        else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value))
          error = "Invalid email address";
      } else if (field === "street") {
        if (!value.trim()) error = "This field is required";
      }
      if (error) valid = false;
      newErrors[field] = error;
    });
    setErrors(newErrors);
    return valid;
  };

  const handleSave = async () => {
    if (!isFormValid()) return;
    try {
      if (isAdd) {
        const res = await axios.post(
          backendUrl + "/api/delivery",
          { deliveryInfo: form },
          { headers: { token } }
        );
        if (res.data.success) {
          toast.success("Address added!");
        } else if (res.data.message && res.data.message.toLowerCase().includes("not authorized")) {
          toast.error("Session expired. Please login again.");
          navigate("/login");
          return;
        } else {
          toast.error("Add failed");
        }
      } else {
        const res = await axios.put(
          backendUrl + `/api/delivery/${editId}`,
          { deliveryInfo: form },
          { headers: { token } }
        );
        if (res.data.success) {
          toast.success("Updated!");
        } else if (res.data.message && res.data.message.toLowerCase().includes("not authorized")) {
          toast.error("Session expired. Please login again.");
          navigate("/login");
          return;
        } else {
          toast.error("Update failed");
        }
      }
      setShowModal(false);
      fetchDeliveryInfos();
    } catch {
      toast.error("Operation failed");
      navigate("/login");
    }
  };

  // --- Use this address logic ---
  const handleUseAddress = (info) => {
    setConfirmUseId(info._id);
  };

  const confirmUseAddress = () => {
    const info = deliveryInfos.find(addr => addr._id === confirmUseId);
    if (info) {
      setLoading(true);
      setTimeout(() => {
        localStorage.setItem("selectedDeliveryInfo", JSON.stringify(info));
        setLoading(false);
        navigate("/place-order");
      }, 2000);
    }
    setConfirmUseId(null);
  };

  const displayedAddresses = showAll ? deliveryInfos : deliveryInfos.slice(0, 5);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-8">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-8 overflow-x-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-black">My Delivery Addresses</h2>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2 font-bold shadow transition"
            onClick={handleAdd}
          >
            Add New
          </button>
        </div>
        <div className="space-y-6">
          {displayedAddresses.length === 0 && (
            <div className="text-center text-gray-500">No delivery addresses saved yet.</div>
          )}
          {displayedAddresses.map((info) => (
            <div
              key={info._id}
              className="bg-gradient-to-r from-indigo-50 to-white rounded-2xl shadow p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-lg text-indigo-800 truncate">
                  {info.firstName} {info.lastName}
                </div>
                <div className="text-gray-600 truncate">{info.street}, {info.city}, {info.state}, {info.zipcode}, {info.country}</div>
                <div className="text-gray-500 text-sm truncate">Email: {info.email} | Phone: {info.phone}</div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 sm:mt-0 justify-end">
                <button
                  className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-full px-5 py-2 font-semibold shadow transition"
                  onClick={() => handleEdit(info)}
                  aria-label="Edit address"
                  type="button"
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full px-5 py-2 font-semibold shadow transition"
                  onClick={() => handleDelete(info._id)}
                  aria-label="Delete address"
                  type="button"
                >
                  Delete
                </button>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white rounded-full px-5 py-2 font-semibold shadow transition"
                  onClick={() => handleUseAddress(info)}
                  aria-label="Use this address"
                  type="button"
                >
                  Use this address
                </button>
              </div>
            </div>
          ))}
          {deliveryInfos.length > 5 && (
            <button
              className="block mx-auto mt-4 bg-gray-100 hover:bg-gray-200 text-blue-700 font-semibold px-6 py-2 rounded-full shadow transition"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "See Less" : "See More"}
            </button>
          )}
        </div>
      </div>
      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4 text-indigo-700">
              {isAdd ? "Add New Address" : "Edit Address"}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input className="input" name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} />
                {errors.firstName && <div className="text-xs text-red-500">{errors.firstName}</div>}
              </div>
              <div>
                <input className="input" name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} />
                {errors.lastName && <div className="text-xs text-red-500">{errors.lastName}</div>}
              </div>
              <div>
                <input className="input" name="email" placeholder="Email" value={form.email} onChange={handleChange} />
                {errors.email && <div className="text-xs text-red-500">{errors.email}</div>}
              </div>
              <div>
                <input className="input" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} maxLength={10} />
                {errors.phone && <div className="text-xs text-red-500">{errors.phone}</div>}
              </div>
              <div className="col-span-2">
                <input className="input" name="street" placeholder="Street" value={form.street} onChange={handleChange} />
                {errors.street && <div className="text-xs text-red-500">{errors.street}</div>}
              </div>
              <div>
                <input className="input" name="city" placeholder="City" value={form.city} onChange={handleChange} />
                {errors.city && <div className="text-xs text-red-500">{errors.city}</div>}
              </div>
              <div>
                <input className="input" name="state" placeholder="State" value={form.state} onChange={handleChange} />
                {errors.state && <div className="text-xs text-red-500">{errors.state}</div>}
              </div>
              <div>
                <input className="input" name="zipcode" placeholder="Zip Code" value={form.zipcode} onChange={handleChange} maxLength={6} />
                {errors.zipcode && <div className="text-xs text-red-500">{errors.zipcode}</div>}
              </div>
              <div>
                <input className="input" name="country" placeholder="Country" value={form.country} onChange={handleChange} />
                {errors.country && <div className="text-xs text-red-500">{errors.country}</div>}
              </div>
            </div>
            <div className="flex gap-4 mt-6 justify-end">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2 font-bold shadow transition"
                onClick={handleSave}
                type="button"
              >
                Save
              </button>
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full px-6 py-2 font-bold shadow transition"
                onClick={() => setShowModal(false)}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal for confirm use */}
      {confirmUseId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            <div className="text-lg font-semibold mb-4">Add this address to your delivery address?</div>
            <div className="flex gap-4 justify-center">
              <button
                className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-2 font-bold shadow transition"
                onClick={confirmUseAddress}
                type="button"
              >
                Yes
              </button>
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full px-6 py-2 font-bold shadow transition"
                onClick={() => setConfirmUseId(null)}
                type="button"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
      {loading && <Spinner />}
      <style>{`
        .input {
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid #c7d2fe;
          background: #f8fafc;
          font-size: 1rem;
          outline: none;
          transition: border 0.2s;
        }
        .input:focus {
          border-color: #6366f1;
          background: #eef2ff;
        }
      `}</style>
    </div>
  );
};

export default DeliveryInfo;
