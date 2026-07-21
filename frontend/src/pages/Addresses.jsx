import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import { FaHome, FaBriefcase, FaMapMarkerAlt, FaPlus, FaTrashAlt, FaPhone, FaMapPin } from "react-icons/fa";

function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address_line: "",
    city: "",
    pincode: "",
    landmark: "",
    alternate_phone: "",
    address_type: "home",
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/address", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const addAddress = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await api.post("/address", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Address Added");
      setForm({
        name: "",
        phone: "",
        address_line: "",
        city: "",
        pincode: "",
        landmark: "",
        alternate_phone: "",
        address_type: "home",
      });
      setShowForm(false);
      fetchAddresses();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed");
    }
  };

  const removeAddress = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/address/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Address Removed");
      fetchAddresses();
    } catch (error) {
      toast.error("Failed to remove");
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "home":
        return <FaHome className="text-emerald-600" />;
      case "work":
        return <FaBriefcase className="text-emerald-600" />;
      default:
        return <FaMapMarkerAlt className="text-emerald-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <FaMapMarkerAlt className="text-emerald-500" /> My Saved Addresses
        </h1>

        {/* Toggle / Add New Address Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 text-white font-medium px-6 py-3 rounded-xl shadow-md hover:bg-emerald-700 transition duration-200"
          >
            <FaPlus />
            {showForm ? "Cancel" : "Add New Address"}
          </button>
        </div>

        {/* Collapsible Form */}
        {showForm && (
          <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 mb-8 animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Add New Delivery Address</h2>
            <form onSubmit={addAddress} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
              <input
                placeholder="Phone *"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
              <input
                placeholder="Address (House No., Street, Area) *"
                value={form.address_line}
                onChange={(e) => setForm({ ...form, address_line: e.target.value })}
                className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 md:col-span-2"
                required
              />
              <input
                placeholder="City *"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
              <input
                placeholder="Pincode *"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
              <input
                placeholder="Landmark (optional)"
                value={form.landmark}
                onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                placeholder="Alternate Phone (optional)"
                value={form.alternate_phone}
                onChange={(e) => setForm({ ...form, alternate_phone: e.target.value })}
                className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="md:col-span-2 grid grid-cols-3 gap-2 mt-2">
                {["home", "work", "other"].map((type) => (
                  <label
                    key={type}
                    className={`cursor-pointer border text-center py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                      form.address_type === type
                        ? "bg-emerald-50 border-emerald-500 text-emerald-600"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address_type"
                      value={type}
                      checked={form.address_type === type}
                      onChange={() => setForm({ ...form, address_type: type })}
                      className="hidden"
                    />
                    {type}
                  </label>
                ))}
              </div>
              <button className="md:col-span-2 bg-emerald-600 text-white font-medium rounded-xl p-3 mt-4 hover:bg-emerald-700 transition duration-200 shadow-sm">
                Save Address
              </button>
            </form>
          </div>
        )}

        {/* Addresses List */}
        <div className="grid gap-4">
          {addresses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
              <FaMapPin className="text-gray-300 text-5xl mx-auto mb-3" />
              <p className="text-gray-500">No addresses found. Add one to get started!</p>
            </div>
          ) : (
            addresses.map((addr) => (
              <div
                key={addr.id}
                className="bg-white shadow-sm border border-gray-100 rounded-2xl p-5 hover:border-emerald-500 hover:shadow-md transition duration-200 flex flex-col md:flex-row justify-between items-start md:items-center relative group gap-4"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-emerald-50 rounded-2xl text-xl mt-1">
                    {getTypeIcon(addr.address_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="font-semibold text-gray-800 text-lg">{addr.name}</h2>
                      <span className="bg-gray-100 px-2.5 py-0.5 rounded-md text-xs font-medium uppercase text-gray-600">
                        {addr.address_type}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm flex items-center gap-1.5 mb-1">
                      <FaPhone className="text-xs" /> {addr.phone}
                    </p>
                    <p className="text-gray-700 font-medium text-sm mt-2">
                      {addr.address_line}, {addr.city}
                    </p>
                    <p className="text-gray-500 text-sm">Pincode: {addr.pincode}</p>
                    {addr.landmark && (
                      <p className="text-gray-400 text-xs mt-1 bg-gray-50 inline-block px-2 py-1 rounded">
                        Landmark: {addr.landmark}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeAddress(addr.id)}
                  className="w-full md:w-auto flex items-center justify-center gap-2 text-red-500 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-xl text-sm font-medium transition duration-200 md:opacity-0 md:group-hover:opacity-100"
                >
                  <FaTrashAlt /> Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Addresses;
