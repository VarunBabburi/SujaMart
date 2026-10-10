import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import Navbar from "../components/Navbar";

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
  back: "M15 19l-7-7 7-7",
  check: "M5 13l4 4L19 7",
  x: "M6 18L18 6M6 6l12 12",
  pin: "M17.66 16.66L13.41 20.9a2 2 0 01-2.82 0l-4.25-4.24a8 8 0 1111.32 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
  card: "M3 10h18M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z",
  bag: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
  receipt: "M9 14l6-6M9.5 8.5h.01M14.5 13.5h.01M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16l-3-2-2 2-2-2-2 2-2-2-3 2z",
  copy: "M8 7h8a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V9a2 2 0 012-2zM16 7V5a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2h2",
  phone: "M3 5a2 2 0 012-2h2.3a1 1 0 01.95.68L9.7 7.1a1 1 0 01-.5 1.2l-1.6.8a11 11 0 005.3 5.3l.8-1.6a1 1 0 011.2-.5l3.4 1.45a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.7 21 3 14.3 3 6V5z",
};

const TONES = {
  amber: { card: "bg-amber-50 border-amber-100", icon: "bg-white text-amber-600" },
  sky: { card: "bg-sky-50 border-sky-100", icon: "bg-white text-sky-600" },
  orange: { card: "bg-orange-50 border-orange-100", icon: "bg-white text-orange-600" },
  teal: { card: "bg-teal-50 border-teal-100", icon: "bg-white text-teal-600" },
};

const SectionCard = ({ title, icon, right, tone = "sky", children }) => (
  <section className={`border rounded-2xl p-4 sm:p-5 ${TONES[tone].card}`}>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <span className={`h-8 w-8 rounded-full flex items-center justify-center shadow-sm ${TONES[tone].icon}`}>
          <Icon d={icon} className="h-4 w-4" />
        </span>
        <h2 className="text-[15px] font-extrabold tracking-tight">{title}</h2>
      </div>
      {right}
    </div>
    {children}
  </section>
);

const paymentLabel = (method) => {
  switch (method?.toLowerCase()) {
    case "cash":
      return "Cash on Delivery";
    case "udhaar":
      return "Credit (Udhaar)";
    case "online":
      return "Online Payment";
    default:
      return method || "-";
  }
};

const statusPill = (status) => {
  switch (status?.toLowerCase()) {
    case "delivered":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-400/30";
    case "cancelled":
      return "bg-rose-500/15 text-rose-300 border-rose-400/30";
    case "pending":
      return "bg-amber-400/15 text-amber-300 border-amber-300/30";
    default:
      return "bg-sky-400/15 text-sky-300 border-sky-300/30";
  }
};

function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get(`/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("ORDER DETAILS:", res.data);

      setItems(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(String(text));
      toast.success("Copied");
    } catch (e) {
      toast.error("Could not copy");
    }
  };

  /* ---------- Loading skeleton ---------- */
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F4F4F5] font-sans">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 pt-6 space-y-3 animate-pulse">
          <div className="h-36 rounded-2xl bg-slate-300" />
          <div className="h-28 rounded-2xl bg-white border border-slate-200" />
          <div className="h-48 rounded-2xl bg-white border border-slate-200" />
          <div className="h-40 rounded-2xl bg-white border border-slate-200" />
        </div>
      </div>
    );
  }

  const order = items[0];

  const statuses = ["Pending", "Accepted", "Packed", "Out for Delivery", "Delivered"];

  const currentStep = statuses.findIndex(
    (s) => s.toLowerCase() === order.order_status?.toLowerCase()
  );
  const cancelled = order.order_status?.toLowerCase() === "cancelled";

  const itemTotal = items.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.price_at_purchase),
    0
  );
  const totalQty = items.reduce((sum, item) => sum + Number(item.quantity), 0);

  return (
    <div className="min-h-screen bg-[#F4F4F5] pb-32 font-sans text-slate-900 antialiased">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 pt-4 sm:pt-6 space-y-3">
        {/* Back + title */}
        <button
          onClick={() => navigate("/orders")}
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-slate-600 hover:text-slate-900 transition"
        >
          <span className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center">
            <Icon d={ICONS.back} className="h-4 w-4" sw={2.6} />
          </span>
          All orders
        </button>

        {/* ---------- Hero ---------- */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-5 shadow-lg shadow-slate-900/10">
          <div className="absolute -top-12 -right-10 h-40 w-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 left-20 h-36 w-36 rounded-full bg-white/5" />

          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Order
              </p>
              <h1 className="text-2xl font-extrabold tracking-tight mt-0.5">
                #{order.order_id}
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-1.5">
                {new Date(order.created_at).toLocaleString([], {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-[11px] font-extrabold border capitalize ${statusPill(
                order.order_status
              )}`}
            >
              {order.order_status}
            </span>
          </div>

          <div className="relative mt-5 pt-4 border-t border-white/10 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Order total
              </p>
              <p className="text-3xl font-extrabold tracking-tight">₹{order.total_amount}</p>
            </div>
            <p className="text-xs font-semibold text-slate-400">
              {totalQty} {totalQty === 1 ? "item" : "items"} · {paymentLabel(order.payment_method)}
            </p>
          </div>
        </div>

        {/* ---------- Tracking ---------- */}
        <section className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 sm:p-5">
          <h2 className="text-[15px] font-extrabold tracking-tight mb-5">Order tracking</h2>

          {cancelled ? (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl px-3.5 py-3 text-sm font-bold">
              <Icon d={ICONS.x} className="h-4 w-4" sw={2.6} />
              This order was cancelled
            </div>
          ) : (
            <div className="flex w-full">
              {statuses.map((status, index) => (
                <div
                  key={status}
                  className="flex-1 flex flex-col items-center relative"
                >
                  {/* Line */}
                  {index !== statuses.length - 1 && (
                    <div
                      className={`absolute top-[11px] left-1/2 w-full h-0.5 ${
                        index < currentStep ? "bg-emerald-500" : "bg-slate-200"
                      }`}
                    />
                  )}

                  {/* Circle */}
                  <div
                    className={`relative z-10 h-6 w-6 rounded-full flex items-center justify-center border-2 ${
                      index <= currentStep
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "bg-white border-slate-300 text-transparent"
                    }`}
                  >
                    <Icon d={ICONS.check} className="h-3.5 w-3.5" sw={3.5} />
                  </div>

                  <p
                    className={`text-[10px] sm:text-xs mt-2 text-center leading-tight px-0.5 ${
                      index <= currentStep ? "font-bold text-slate-800" : "font-medium text-slate-400"
                    }`}
                  >
                    {status}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ---------- Items ---------- */}
        <SectionCard
          title="Items ordered"
          tone="amber"
          icon={ICONS.bag}
          right={
            <span className="text-[11px] font-bold text-amber-700 bg-white px-2.5 py-1 rounded-full">
              {totalQty} {totalQty === 1 ? "item" : "items"}
            </span>
          }
        >
          <ul className="divide-y divide-slate-100 -my-1">
            {items.map((item, index) => (
              <li key={`${item.name}-${index}`} className="flex items-center gap-3 py-3">
                <div className="h-14 w-14 rounded-xl bg-white border border-amber-100 flex items-center justify-center shrink-0 overflow-hidden p-1">
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
                    <span className="text-2xl">🛍️</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold leading-snug line-clamp-2">{item.name}</p>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    {item.quantity} × ₹{item.price_at_purchase}
                  </p>
                </div>

                <p className="text-[15px] font-extrabold shrink-0">
                  ₹{item.quantity * item.price_at_purchase}
                </p>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* ---------- Bill ---------- */}
        <SectionCard title="Bill details" tone="sky" icon={ICONS.receipt}>
          <div className="space-y-2.5 text-[13px] font-medium text-slate-600">
            <div className="flex justify-between">
              <span>Item total</span>
              <span className="font-bold text-slate-800">₹{itemTotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery fee</span>
              <span className="font-extrabold text-emerald-600">FREE</span>
            </div>
            <div className="flex justify-between">
              <span>Platform fee</span>
              <span className="font-extrabold text-emerald-600">FREE</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-dashed border-slate-200 flex justify-between items-center">
            <span className="text-[14px] font-extrabold">Grand total</span>
            <span className="text-xl font-extrabold tracking-tight">₹{order.total_amount}</span>
          </div>
        </SectionCard>

        {/* ---------- Delivery address ---------- */}
        <SectionCard
          title="Delivery address"
          tone="orange"
          icon={ICONS.pin}
          right={
            order.address_type && (
              <span className="text-[11px] font-extrabold uppercase tracking-wide text-orange-700 bg-white px-2.5 py-1 rounded-full">
                {order.address_type}
              </span>
            )
          }
        >
          <p className="text-[15px] font-extrabold">{order.delivery_name}</p>
          <p className="text-[13px] text-slate-500 font-medium leading-relaxed mt-1">
            {order.address_line}, {order.city}
            {order.pincode ? ` – ${order.pincode}` : ""}
          </p>

          {order.landmark && (
            <p className="text-[13px] text-slate-500 font-medium mt-1">
              <span className="font-bold text-slate-700">Landmark:</span> {order.landmark}
            </p>
          )}

          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
            {order.delivery_phone && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-full">
                <Icon d={ICONS.phone} className="h-3.5 w-3.5" />
                {order.delivery_phone}
              </span>
            )}
            {order.alternate_phone && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-full">
                <Icon d={ICONS.phone} className="h-3.5 w-3.5" />
                {order.alternate_phone} (alt)
              </span>
            )}
          </div>
        </SectionCard>

        {/* ---------- Payment ---------- */}
        <SectionCard
          title="Payment"
          tone="teal"
          icon={ICONS.card}
          right={
            order.payment_method === "online" && order.payment_status && (
              <span className="text-[11px] font-extrabold uppercase tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                {order.payment_status}
              </span>
            )
          }
        >
          <div className="flex justify-between items-center text-[13px]">
            <span className="font-medium text-slate-500">Method</span>
            <span className="font-extrabold">{paymentLabel(order.payment_method)}</span>
          </div>

          {order.payment_method === "online" && (
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
              {[
                { label: "Transaction ID", value: order.razorpay_payment_id },
                { label: "Razorpay order ID", value: order.razorpay_order_id },
              ].map(
                (row) =>
                  row.value && (
                    <div key={row.label}>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {row.label}
                      </p>
                      <div className="mt-1 flex items-center justify-between gap-2 bg-white border border-teal-100 rounded-xl px-3 py-2">
                        <span className="text-xs font-mono font-semibold text-slate-700 truncate">
                          {row.value}
                        </span>
                        <button
                          onClick={() => copyText(row.value)}
                          aria-label={`Copy ${row.label}`}
                          className="shrink-0 h-7 w-7 rounded-lg hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
                        >
                          <Icon d={ICONS.copy} className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )
              )}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

export default OrderDetails;