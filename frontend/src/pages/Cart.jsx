import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

/* ---------- inline icons ---------- */
const Icon = ({ d, className = "h-5 w-5", sw = 2 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const ICONS = {
  bolt: "M13 2L4 14h7l-1 8 9-12h-7l1-8z",
  trash: "M19 7l-.9 12.1A2 2 0 0116.1 21H7.9a2 2 0 01-2-1.9L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  pin: "M17.66 16.66L13.41 20.9a2 2 0 01-2.82 0l-4.25-4.24a8 8 0 1111.32 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
  check: "M5 13l4 4L19 7",
  arrow: "M9 5l7 7-7 7",
  receipt: "M9 14l6-6M9.5 8.5h.01M14.5 13.5h.01M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16l-3-2-2 2-2-2-2 2-2-2-3 2z",
};

const SectionCard = ({ title, icon, children }) => (
  <section className="bg-white rounded-3xl border border-purple-100/70 shadow-[0_2px_16px_rgba(76,29,149,0.05)] p-4 sm:p-5">
    <div className="flex items-center gap-2 mb-4">
      <span className="h-8 w-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
        <Icon d={icon} className="h-4 w-4" />
      </span>
      <h2 className="text-[15px] font-extrabold text-slate-900 tracking-tight">{title}</h2>
    </div>
    {children}
  </section>
);

const inputCls =
  "w-full border border-slate-200 bg-white rounded-xl px-3.5 py-3 text-[13px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition";

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
        theme: { color: "#7A22FD" },
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
        confirmButtonColor: "#7A22FD",
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

  /* ---------- Loading skeleton ---------- */
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#F5F3FF] font-sans">
          <div className="max-w-5xl mx-auto px-4 pt-5 space-y-4">
            <div className="h-20 rounded-3xl bg-gradient-to-r from-[#7A22FD]/30 to-[#FF4E6B]/30 animate-pulse" />
            <div className="bg-white rounded-3xl p-4 space-y-4 animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded-2xl bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-2/3 rounded bg-slate-100" />
                    <div className="h-3 w-1/3 rounded bg-slate-100" />
                  </div>
                  <div className="h-9 w-24 rounded-xl bg-slate-100" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  const paymentOptions = [
    { value: "cash", label: "Cash on Delivery", sub: "Pay when your order arrives", icon: "💵" },
    { value: "udhaar", label: "Credit (Udhaar)", sub: "Add to your ledger", icon: "📖" },
    { value: "online", label: "Online Payment", sub: "UPI / Card / Net Banking", icon: "📱" },
  ];

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#F5F3FF] font-sans text-slate-900 antialiased">
        {cartItems.length === 0 ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
            <div className="relative mb-6">
              <div className="h-32 w-32 rounded-full bg-gradient-to-br from-purple-100 to-fuchsia-100 flex items-center justify-center text-6xl shadow-inner">
                🛒
              </div>
              <span className="absolute -top-1 -right-1 h-9 w-9 rounded-full bg-[#FFD424] text-slate-900 flex items-center justify-center shadow-md">
                <Icon d={ICONS.bolt} className="h-4 w-4" />
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-1.5 tracking-tight">
              Your cart is empty
            </h2>
            <p className="text-slate-500 text-sm font-medium max-w-xs">
              Add fresh groceries and get them delivered in minutes.
            </p>
            <Link
              to="/products"
              className="mt-6 bg-gradient-to-r from-[#7A22FD] to-[#B318B0] text-white font-black text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-purple-500/30 active:scale-95 transition"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto px-4 pt-4 sm:pt-6 pb-56 md:pb-32">
            {/* ── Page title + ETA ── */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6D1BEA] via-[#B318B0] to-[#FF4E6B] text-white p-4 sm:p-5 shadow-xl shadow-purple-500/20 mb-4">
              <div className="absolute -top-10 -right-8 h-36 w-36 rounded-full bg-white/10" />
              <div className="relative flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/25 flex items-center justify-center shrink-0">
                  <Icon d={ICONS.bolt} className="h-6 w-6 text-[#FFD424]" />
                </div>
                <div className="leading-tight">
                  <p className="text-[10px] font-black text-white/80 uppercase tracking-widest">
                    Delivery in
                  </p>
                  <p className="text-xl sm:text-2xl font-black tracking-tight">5 – 9 minutes</p>
                </div>
                <span className="ml-auto text-[10px] sm:text-xs font-black bg-[#FFD424] text-slate-900 px-3 py-1.5 rounded-full uppercase tracking-wider">
                  Free delivery
                </span>
              </div>
            </div>

            <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-5 lg:items-start">
              {/* ───────── Left column ───────── */}
              <div className="space-y-4">
                {/* Cart items */}
                <section className="bg-white rounded-3xl border border-purple-100/70 shadow-[0_2px_16px_rgba(76,29,149,0.05)] overflow-hidden">
                  <div className="flex items-center justify-between px-4 sm:px-5 pt-4 pb-2">
                    <h2 className="text-[15px] font-extrabold tracking-tight">My cart</h2>
                    <span className="text-[11px] font-black text-purple-700 bg-purple-100 px-3 py-1 rounded-full uppercase tracking-wider">
                      {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
                    </span>
                  </div>

                  <ul className="divide-y divide-slate-100">
                    {cartItems.map((item) => (
                      <li key={item.id} className="flex items-center gap-3 px-4 sm:px-5 py-4">
                        {/* Thumbnail */}
                        <div className="w-[68px] h-[68px] rounded-2xl bg-gradient-to-b from-[#F8F7FF] to-[#F1EEFB] border border-purple-100/60 flex items-center justify-center shrink-0 overflow-hidden p-1.5">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                              className="max-h-full max-w-full object-contain mix-blend-multiply"
                            />
                          ) : (
                            <span className="text-3xl">🛍️</span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-bold text-slate-900 line-clamp-2 leading-snug">
                            {item.name}
                          </p>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-[15px] font-black text-slate-900">
                              ₹{item.subtotal}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-400">
                              ₹{item.price} each
                            </span>
                          </div>
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center bg-purple-600 text-white rounded-xl h-9 overflow-hidden shadow-md shadow-purple-600/25 shrink-0">
                          <button
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateQuantity(item.id, item.quantity - 1);
                              } else {
                                removeItem(item.id);
                              }
                            }}
                            aria-label={item.quantity === 1 ? "Remove item" : "Decrease quantity"}
                            className="w-9 h-full flex items-center justify-center hover:bg-purple-700 active:scale-90 transition"
                          >
                            <Icon
                              d={item.quantity === 1 ? ICONS.trash : ICONS.minus}
                              className="h-4 w-4"
                              sw={2.4}
                            />
                          </button>
                          <span className="w-6 text-center text-[13px] font-black">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                            className="w-9 h-full flex items-center justify-center hover:bg-purple-700 active:scale-90 transition"
                          >
                            <Icon d={ICONS.plus} className="h-4 w-4" sw={2.4} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* ───────── Right column: bill ───────── */}
              <div className="mt-4 lg:mt-0 lg:sticky lg:top-24">
                <SectionCard title="Bill details" icon={ICONS.receipt}>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[13px] text-slate-600 font-medium">
                      <span>Item total</span>
                      <span className="font-bold text-slate-800">₹{totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-[13px] text-slate-600 font-medium">
                      <span>Delivery fee</span>
                      <span className="font-black text-emerald-600">FREE</span>
                    </div>
                    <div className="flex justify-between text-[13px] text-slate-600 font-medium">
                      <span>Platform fee</span>
                      <span className="font-black text-emerald-600">FREE</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-dashed border-slate-200 flex justify-between items-center">
                    <span className="text-[14px] font-extrabold text-slate-900">Grand total</span>
                    <span className="text-xl font-black text-purple-700">₹{totalAmount}</span>
                  </div>
                </SectionCard>
              </div>

                {/* Delivery address */}
                <SectionCard title="Delivery address" icon={ICONS.pin}>
                  {addresses.length === 0 ? (
                    <div className="rounded-2xl bg-rose-50 border border-rose-100 px-4 py-3 text-[13px] text-rose-600 font-semibold">
                      No saved address found. Please add one below.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {addresses.map((addr) => {
                        const selected = Number(selectedAddress) === addr.id;
                        return (
                          <label
                            key={addr.id}
                            className={`flex items-start gap-3 rounded-2xl border-2 p-3.5 cursor-pointer transition-all duration-150 ${
                              selected
                                ? "border-purple-600 bg-purple-50/70 shadow-sm"
                                : "border-slate-200 bg-white hover:border-purple-300"
                            }`}
                          >
                            <input
                              type="radio"
                              value={addr.id}
                              checked={selected}
                              onChange={(e) => setSelectedAddress(e.target.value)}
                              className="sr-only"
                            />
                            <span
                              className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                                selected
                                  ? "border-purple-600 bg-purple-600 text-white"
                                  : "border-slate-300 bg-white"
                              }`}
                            >
                              {selected && <Icon d={ICONS.check} className="h-3 w-3" sw={3.5} />}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black uppercase tracking-wide text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                                  {addr.address_type}
                                </span>
                                <span className="text-[13px] font-extrabold text-slate-800">
                                  {addr.name}
                                </span>
                              </div>
                              <p className="text-[12px] text-slate-500 font-medium leading-relaxed">
                                {addr.address_line}, {addr.city} – {addr.pincode}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  <button
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-black text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-100 px-4 py-2.5 rounded-xl transition active:scale-95"
                  >
                    <Icon d={showAddressForm ? ICONS.minus : ICONS.plus} className="h-4 w-4" sw={2.6} />
                    {showAddressForm ? "Cancel" : "Add new address"}
                  </button>

                  {showAddressForm && (
                    <div className="mt-4 border border-purple-100 rounded-2xl p-4 bg-[#FAF8FF] grid grid-cols-2 gap-3">
                      {[
                        { placeholder: "Full name *", key: "name" },
                        { placeholder: "Phone *", key: "phone" },
                      ].map(({ placeholder, key }) => (
                        <input
                          key={key}
                          placeholder={placeholder}
                          value={newAddress[key]}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, [key]: e.target.value })
                          }
                          className={inputCls}
                        />
                      ))}
                      <input
                        placeholder="Address line *"
                        value={newAddress.address_line}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, address_line: e.target.value })
                        }
                        className={`col-span-2 ${inputCls}`}
                      />
                      {[
                        { placeholder: "City *", key: "city" },
                        { placeholder: "Pincode (optional)", key: "pincode" },
                      ].map(({ placeholder, key }) => (
                        <input
                          key={key}
                          placeholder={placeholder}
                          value={newAddress[key]}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, [key]: e.target.value })
                          }
                          className={inputCls}
                        />
                      ))}
                      <input
                        placeholder="Landmark (optional)"
                        value={newAddress.landmark}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, landmark: e.target.value })
                        }
                        className={`col-span-2 ${inputCls}`}
                      />

                      {/* Address type chips */}
                      <div className="col-span-2 flex gap-2">
                        {[
                          { value: "home", label: "Home" },
                          { value: "work", label: "Work" },
                          { value: "other", label: "Other" },
                        ].map((t) => (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => setNewAddress({ ...newAddress, address_type: t.value })}
                            className={`flex-1 py-2.5 rounded-xl text-[12px] font-black border-2 transition ${
                              newAddress.address_type === t.value
                                ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-600/25"
                                : "bg-white border-slate-200 text-slate-600 hover:border-purple-300"
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={addNewAddress}
                        className="col-span-2 bg-gradient-to-r from-[#7A22FD] to-[#B318B0] text-white font-black py-3 rounded-xl text-[13px] shadow-lg shadow-purple-500/25 active:scale-[0.98] transition"
                      >
                        Save address
                      </button>
                    </div>
                  )}
                </SectionCard>

                {/* Payment method */}
                <SectionCard title="Payment method" icon={ICONS.receipt}>
                  <div className="space-y-2.5">
                    {paymentOptions.map((opt) => {
                      const selected = paymentMethod === opt.value;
                      return (
                        <label
                          key={opt.value}
                          className={`flex items-center gap-3 border-2 rounded-2xl px-3.5 py-3 cursor-pointer transition-all duration-150 ${
                            selected
                              ? "border-purple-600 bg-purple-50/70 shadow-sm"
                              : "border-slate-200 bg-white hover:border-purple-300"
                          }`}
                        >
                          <input
                            type="radio"
                            value={opt.value}
                            checked={selected}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="sr-only"
                          />
                          <span className="h-11 w-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl shrink-0">
                            {opt.icon}
                          </span>
                          <div className="flex-1 min-w-0 leading-tight">
                            <p className="text-[13px] font-extrabold text-slate-800">{opt.label}</p>
                            <p className="text-[11px] font-medium text-slate-400 mt-0.5">{opt.sub}</p>
                          </div>
                          <span
                            className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                              selected
                                ? "border-purple-600 bg-purple-600 text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {selected && <Icon d={ICONS.check} className="h-3 w-3" sw={3.5} />}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </SectionCard>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Sticky checkout bar (sits above the mobile bottom nav) ── */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-[76px] md:bottom-0 left-0 right-0 z-40 px-3 md:px-0">
          <div className="max-w-5xl mx-auto bg-white/95 backdrop-blur-xl border border-purple-100 md:border-x-0 md:border-b-0 rounded-3xl md:rounded-none shadow-[0_8px_30px_rgba(109,27,234,0.18)] px-4 py-3 flex items-center justify-between gap-4">
            <div className="leading-tight">
              <p className="text-[11px] text-slate-400 font-bold">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"} · Free delivery
              </p>
              <p className="text-[22px] font-black text-slate-900 tracking-tight">₹{totalAmount}</p>
            </div>
            <button
              onClick={() => {
                if (paymentMethod === "online") {
                  handleOnlinePayment();
                } else {
                  placeOrder();
                }
              }}
              className="bg-gradient-to-r from-[#7A22FD] via-[#B318B0] to-[#FF4E6B] text-white font-black px-6 sm:px-8 py-3.5 rounded-2xl text-[14px] shadow-lg shadow-purple-500/30 active:scale-95 transition flex items-center gap-2 shrink-0"
            >
              {paymentMethod === "online" ? `Pay ₹${totalAmount}` : "Place order"}
              <Icon d={ICONS.arrow} className="h-4 w-4" sw={3} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Cart;