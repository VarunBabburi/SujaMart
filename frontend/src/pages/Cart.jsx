import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
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
    fetchCart();
    fetchAddresses();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/address", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses(res.data);
      if (res.data.length > 0) {
        setSelectedAddress(res.data[0].id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/cart/${itemId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCart();
    } catch (error) {
      console.log(error);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/cart/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
    } catch (error) {
      console.log(error);
    }
  };

  const handleOnlinePayment = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await api.post(
        "/payment/create-order",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "SujaMart",
        description: "Grocery Purchase",
        order_id: data.id,
        method: { upi: true, card: true, netbanking: true, wallet: true },
        handler: async function (response) {
          try {
            console.log("PAYMENT RESPONSE:", response);
            const verifyRes = await api.post(
              "/payment/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (verifyRes.data.success) {
              await placeOrder({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
              });
            }
          } catch (error) {
            console.log(error);
            toast.error("Payment Verification Failed");
          }
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment cancelled");
          },
        },
        prefill: {
          name: JSON.parse(localStorage.getItem("user"))?.name,
          contact: JSON.parse(localStorage.getItem("user"))?.phone,
        },
        theme: { color: "#16a34a" },
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.log(error);
      toast.error("Unable to start payment");
    }
  };

  const placeOrder = async (paymentData = {}) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.post(
        "/orders/place",
        { paymentMethod, address_id: selectedAddress, ...paymentData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await Swal.fire({
        icon: "success",
        title: "Order Placed!",
        html: `<b>Order ID:</b> ${res.data.orderId}<br>Thank you for shopping with SujaMart.`,
        confirmButtonColor: "#16a34a",
      });
      fetchCart();
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to place order");
    }
  };

  const totalAmount = cartItems.reduce(
    (total, item) => total + Number(item.subtotal),
    0
  );

  const addNewAddress = async () => {
    if (!newAddress.name.trim()) {
    toast.error("Name is required");
    return;
  }

  // Flexible phone regex: accepts optional '+' country code, 7-15 digits, spaces, and hyphens
 const cleanedPhone = newAddress.phone.replace(/[\s\-\+]/g, "").replace(/^0|^91/, "");

  // Strictly enforce 10 digits
  if (!/^\d{10}$/.test(cleanedPhone)) {
    toast.error("Phone number must be exactly 10 digits");
    return;
  }

  if (!newAddress.address_line.trim()) {
    toast.error("Address is required");
    return;
  }

  if (!newAddress.city.trim()) {
    toast.error("City is required");
    return;
  }
    try {
      const token = localStorage.getItem("token");
      const res = await api.post("/address", newAddress, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Address Added");
      await fetchAddresses();
      setSelectedAddress(res.data.addressId);
      setShowAddressForm(false);
      setNewAddress({
        name: "",
        phone: "",
        address_line: "",
        city: "",
        pincode: "",
        landmark: "",
        alternate_phone: "",
        address_type: "home",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add address");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Loading your cart...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#f3f3f3]">
        {cartItems.length === 0 ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
            <div className="text-8xl mb-6">🛒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-400 text-sm">
              Add items from the store to get started
            </p>
          </div>
        ) : (
          <div className="max-w-lg mx-auto pb-36">

            {/* ── Delivery ETA strip ── */}
            <div className="bg-white flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg">⚡</span>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                  Delivery in
                </p>
                <p className="text-[15px] font-extrabold text-gray-900 leading-tight">
                  5 – 9 minutes
                </p>
              </div>
            </div>

            {/* ── Cart items ── */}
            <div className="bg-white mt-2">
              <p className="px-4 pt-4 pb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
              </p>

              <ul className="divide-y divide-gray-50">
                {cartItems.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 px-4 py-4">
                    {/* Thumbnail */}
                    <div className="w-[68px] h-[68px] rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl">🛍️</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-gray-900 truncate leading-snug">
                        {item.name}
                      </p>
                      <p className="text-[13px] font-bold text-green-700 mt-0.5">
                        ₹{item.price}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Subtotal &nbsp;₹{item.subtotal}
                      </p>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center border-[2px] border-green-600 rounded-xl overflow-hidden flex-shrink-0">
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateQuantity(item.id, item.quantity - 1);
                          } else {
                            removeItem(item.id);
                          }
                        }}
                        className="w-9 h-9 bg-white text-green-700 flex items-center justify-center text-[18px] font-bold hover:bg-green-50 active:bg-green-100 transition-colors"
                      >
                        {item.quantity === 1 ? "-" : "−"}
                      </button>
                      <span className="w-9 h-9 bg-green-600 text-white flex items-center justify-center text-[13px] font-extrabold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-9 h-9 bg-white text-green-700 flex items-center justify-center text-[18px] font-bold hover:bg-green-50 active:bg-green-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Bill details ── */}
            <div className="bg-white mt-2 px-4 py-5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Bill Details
              </p>
              <div className="space-y-2.5">
                <div className="flex justify-between text-[13px] text-gray-600">
                  <span>Item total</span>
                  <span className="font-medium">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-[13px] text-gray-600">
                  <span>Delivery fee</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-[13px] text-gray-600">
                  <span>Platform fee</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-dashed border-gray-200 flex justify-between text-[14px] font-extrabold text-gray-900">
                <span>Grand Total</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>

            {/* ── Delivery address ── */}
            <div className="bg-white mt-2 px-4 py-5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
                🚚 &nbsp;Delivery Address
              </p>

              {addresses.length === 0 ? (
                <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-[13px] text-red-500 font-medium">
                  No saved address found. Please add one below.
                </div>
              ) : (
                <div className="space-y-2">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex items-start gap-3 rounded-2xl border-[2px] p-3 cursor-pointer transition-all duration-150 ${
                        Number(selectedAddress) === addr.id
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        value={addr.id}
                        checked={Number(selectedAddress) === addr.id}
                        onChange={(e) => setSelectedAddress(e.target.value)}
                        className="mt-1 accent-green-600 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wide text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                            {addr.address_type}
                          </span>
                          <span className="text-[13px] font-bold text-gray-800">
                            {addr.name}
                          </span>
                        </div>
                        <p className="text-[12px] text-gray-500 leading-relaxed">
                          {addr.address_line}, {addr.city} – {addr.pincode}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="mt-4 flex items-center gap-1.5 text-[13px] font-bold text-green-700 hover:text-green-800 transition-colors"
              >
                <span className="text-xl leading-none">+</span>
                Add New Address
              </button>

              {showAddressForm && (
                <div className="mt-4 border border-gray-200 rounded-2xl p-4 bg-gray-50 grid grid-cols-2 gap-3">
                  {[
                    { placeholder: "Full Name *", key: "name" },
                    { placeholder: "Phone *", key: "phone" },
                  ].map(({ placeholder, key }) => (
                    <input
                      key={key}
                      placeholder={placeholder}
                      value={newAddress[key]}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, [key]: e.target.value })
                      }
                      className="border border-gray-200 bg-white rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ))}
                  <input
                    placeholder="Address Line *"
                    value={newAddress.address_line}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, address_line: e.target.value })
                    }
                    className="col-span-2 border border-gray-200 bg-white rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {[
                    { placeholder: "City *", key: "city" },
                    { placeholder: "Pincode (optional)", key: "pincode" },
                    { placeholder: "Landmark (optional)", key: "landmark" },
                  ].map(({ placeholder, key }) => (
                    <input
                      key={key}
                      placeholder={placeholder}
                      value={newAddress[key]}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, [key]: e.target.value })
                      }
                      className="border border-gray-200 bg-white rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ))}
                  <select
                    value={newAddress.address_type}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, address_type: e.target.value })
                    }
                    className="border border-gray-200 bg-white rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                  <button
                    onClick={addNewAddress}
                    className="col-span-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl text-[13px] transition-colors"
                  >
                    Save Address
                  </button>
                </div>
              )}
            </div>

            {/* ── Payment method ── */}
            <div className="bg-white mt-2 px-4 py-5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
                💳 &nbsp;Payment Method
              </p>
              <div className="space-y-2">
                {[
                  { value: "cash", label: "Cash on Delivery", icon: "💵", badge: null },
                  { value: "udhaar", label: "Udhaar (Credit)", icon: "📋", badge: null },
                  { value: "online", label: "Online Payment", icon: "📱", badge: "UPI / Card / Net Banking" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 border-[2px] rounded-2xl px-4 py-3 cursor-pointer transition-all duration-150 ${
                      paymentMethod === opt.value
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      value={opt.value}
                      checked={paymentMethod === opt.value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="accent-green-600 flex-shrink-0"
                    />
                    <span className="text-xl">{opt.icon}</span>
                    <span className="text-[13px] font-semibold text-gray-800 flex-1">
                      {opt.label}
                    </span>
                    {opt.badge && (
                      <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {opt.badge}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ── Sticky checkout bar ── */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] text-gray-400 font-medium">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"} &nbsp;·&nbsp; Free delivery
              </p>
              <p className="text-[22px] font-extrabold text-gray-900 leading-tight">
                ₹{totalAmount}
              </p>
            </div>
            <button
              onClick={() => {
                if (paymentMethod === "online") {
                  handleOnlinePayment();
                } else {
                  placeOrder();
                }
              }}
              className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold px-7 py-3.5 rounded-2xl text-[14px] transition-colors flex items-center gap-2 flex-shrink-0"
            >
              {paymentMethod === "online" ? `Pay ₹${totalAmount}` : "Place Order"}
              <span className="text-base">→</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Cart;