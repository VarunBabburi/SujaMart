import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import socket from "../socket";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import riderImg from '../assets/delivery-rider.png';

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
  check: "M5 13l4 4L19 7",
  x: "M6 18L18 6M6 6l12 12",
  clock: "M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z",
  bike: "M5 18a3 3 0 100-6 3 3 0 000 6zm14 0a3 3 0 100-6 3 3 0 000 6zM5 15l3-6h5l3 6M10 9l-1-3H7m6 3l2 6",
  box: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  doc: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.6a1 1 0 01.7.3l5.4 5.4a1 1 0 01.3.7V19a2 2 0 01-2 2z",
  chevron: "M9 5l7 7-7 7",
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Ongoing" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const TRACK_STEPS = ["Placed", "Packed", "On the way", "Delivered"];

// Maps whatever status text the backend sends to a position on the tracker
const getStepIndex = (status) => {
  const s = status?.toLowerCase() || "";
  if (s === "delivered") return 3;
  if (s.includes("out for delivery") || s.includes("shipped")) return 2;
  if (s === "pending" || s === "placed") return 0;
  return 1;
};

// Icon + colors for the status shown on each card
const getStatusMeta = (status) => {
  switch (status?.toLowerCase()) {
    case "delivered":
      return { icon: ICONS.check, circle: "bg-emerald-500 text-white", text: "text-emerald-600" };
    case "cancelled":
      return { icon: ICONS.x, circle: "bg-rose-500 text-white", text: "text-rose-600" };
    case "pending":
      return { icon: ICONS.clock, circle: "bg-amber-400 text-white", text: "text-amber-600" };
    case "out for delivery":
      return { icon: ICONS.bike, circle: "bg-emerald-500 text-white", text: "text-emerald-600" };
    default:
      return { icon: ICONS.box, circle: "bg-sky-500 text-white", text: "text-sky-600" };
  }
};

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchOrders();

    socket.on("order-status-update", (data) => {
      toast.success(`📦 ${data.message}`, {
        autoClose: 5000,
      });
      fetchOrders();
    });

    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      socket.off("order-status-update");
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/orders/my-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(res.data);
      console.log("MY ORDERS:", res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/invoice/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.log(error);
      toast.error("Invoice download failed");
    }
  };

  const getRemainingTime = (order) => {
    if (!order.delivery_assigned_at || !order.delivery_time) {
      return "--:--";
    }

    // Parse MySQL datetime format string: "YYYY-MM-DD HH:MM:SS"
    const [datePart, timePart] = order.delivery_assigned_at.split(" ");
    if (!datePart || !timePart) return "--:--";

    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute, second] = timePart.split(":").map(Number);

    // Since Aiven is now set to +05:30, create the date object in LOCAL system time
    const assignedTime = new Date(
      year,
      month - 1,
      day,
      hour,
      minute,
      second
    ).getTime();

    if (isNaN(assignedTime)) {
      return "--:--";
    }

    const endTime = assignedTime + Number(order.delivery_time) * 60 * 1000;
    const diff = endTime - Date.now();

    if (diff <= 0) {
      return "Arriving soon";
    }

    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  /* ---------- Loading skeleton ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F4F5] font-sans">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 pt-6 space-y-3">
          <div className="h-7 w-36 rounded-lg bg-slate-200 animate-pulse" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-1/3 rounded bg-slate-200" />
                  <div className="h-3 w-1/2 rounded bg-slate-100" />
                </div>
                <div className="h-5 w-14 rounded bg-slate-200" />
              </div>
              <div className="flex gap-2">
                <div className="h-10 flex-1 rounded-xl bg-slate-100" />
                <div className="h-10 flex-1 rounded-xl bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter((order) => {
    const s = order.order_status?.toLowerCase();
    if (filter === "all") return true;
    if (filter === "delivered") return s === "delivered";
    if (filter === "cancelled") return s === "cancelled";
    return s !== "delivered" && s !== "cancelled"; // ongoing
  });

  return (
    <div className="min-h-screen bg-[#F4F4F5] pb-32 font-sans text-slate-900 antialiased">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 pt-5 sm:pt-8">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-extrabold tracking-tight">Your orders</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            {orders.length} {orders.length === 1 ? "order" : "orders"} placed so far
          </p>
        </div>

        {/* Filter chips */}
        {orders.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-none">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-bold border transition-all active:scale-95 ${
                  filter === f.key
                    ? "bg-slate-900 border-slate-900 text-white"
                    : "bg-white border-slate-300 text-slate-700 hover:border-slate-400"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {orders.length === 0 ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center text-center mt-16 px-6">
            <div className="h-28 w-28 rounded-full bg-white border border-slate-200 flex items-center justify-center text-5xl shadow-sm mb-5">
              📦
            </div>
            <h2 className="text-xl font-extrabold tracking-tight mb-1.5">No orders yet</h2>
            <p className="text-slate-500 text-sm font-medium max-w-xs">
              Looks like you haven't placed any orders yet. Start exploring your favorite items!
            </p>
            <button
              onClick={() => navigate("/products")}
              className="mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-8 py-3.5 rounded-xl active:scale-95 transition"
            >
              Start shopping
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl border border-slate-200 mt-3">
            <div className="text-4xl mb-2">🔍</div>
            <h2 className="text-sm font-bold text-slate-700">No orders in this list</h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">Try another filter.</p>
          </div>
        ) : (
          <div className="space-y-3 mt-1">
            {filteredOrders.map((order) => {
              const status = order.order_status?.toLowerCase();
              const cancelled = status === "cancelled";
              const stepIndex = getStepIndex(order.order_status);
              const meta = getStatusMeta(order.order_status);

              return (
                <div
                  key={order.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5"
                >
                  {/* Header row */}
                  <div className="flex items-start gap-3">
                    <span
                      className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${meta.circle}`}
                    >
                      <Icon d={meta.icon} className="h-5 w-5" sw={2.6} />
                    </span>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-extrabold tracking-tight">
                        Order #{order.id}
                      </h3>
                      <p className={`text-[13px] font-bold capitalize mt-0.5 ${meta.text}`}>
                        {order.order_status}
                      </p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {new Date(order.created_at).toLocaleString([], {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-[11px] font-semibold text-slate-400">Total</p>
                      <p className="text-lg font-extrabold tracking-tight">₹{order.total_amount}</p>
                    </div>
                  </div>

                  {/* Progress tracker */}
                  {!cancelled && status !== "delivered" && (
                    <div className="mt-5 px-1">
                      <div className="relative flex items-start justify-between">
                        <div className="absolute top-[9px] left-3 right-3 h-0.5 bg-slate-200" />
                        <div
                          className="absolute top-[9px] left-3 h-0.5 bg-emerald-500 transition-all duration-700"
                          style={{
                            width: `calc((100% - 1.5rem) * ${stepIndex / (TRACK_STEPS.length - 1)})`,
                          }}
                        />
                        {TRACK_STEPS.map((label, i) => {
                          const done = i <= stepIndex;
                          return (
                            <div key={label} className="relative z-10 flex flex-col items-center w-16">
                              <span
                                className={`h-5 w-5 rounded-full flex items-center justify-center border-2 ${
                                  done
                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                    : "bg-white border-slate-300 text-transparent"
                                }`}
                              >
                                <Icon d={ICONS.check} className="h-3 w-3" sw={3.5} />
                              </span>
                              <span
                                className={`mt-1.5 text-[10px] text-center leading-tight ${
                                  done ? "font-bold text-slate-800" : "font-medium text-slate-400"
                                }`}
                              >
                                {label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Live delivery widget */}
                  {status === "out for delivery" && (
                    <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* <div className="relative h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                          <Icon d={ICONS.bike} className="h-5 w-5" /> */}
                          {/* Image Container */}
    <div className="relative h-11 w-11 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-sm overflow-visible"> 
      
      {/* Delivery Rider Image */}
      <img 
        src={riderImg}
        alt="Delivery Rider" 
        className="h-12 w-12 scale-150 object-cover rounded-full"
      />
                          <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 ring-2 ring-white" />
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-emerald-900 text-sm leading-tight">
                            Order on the way
                          </h4>
                          <p className="text-xs text-emerald-700 font-medium mt-0.5 truncate">
                            Rider:{" "}
                            <span className="font-bold text-emerald-900">
                              {order.delivery_boy || "Assigned"}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 bg-white border border-emerald-200 px-3 py-1.5 rounded-lg text-center">
                        <span className="block text-[9px] font-bold tracking-wider uppercase text-emerald-600">
                          Arriving in
                        </span>
                        <span key={tick} className="text-base font-extrabold font-mono text-emerald-700">
                          {getRemainingTime(order)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2.5">
                    <button
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="flex-1 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-[13px] rounded-xl transition active:scale-[0.98] flex items-center justify-center gap-1"
                    >
                      View details
                      <Icon d={ICONS.chevron} className="h-3.5 w-3.5" sw={3} />
                    </button>

                    <button
                      onClick={() => downloadInvoice(order.id)}
                      className="flex-1 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[13px] rounded-xl transition active:scale-[0.98] flex items-center justify-center gap-1.5"
                    >
                      <Icon d={ICONS.doc} className="h-4 w-4" />
                      Invoice
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;