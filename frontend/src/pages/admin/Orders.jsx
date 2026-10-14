import { useEffect, useMemo, useRef, useState } from "react";
import api from "../../services/api";
import Navbar from "../../components/Navbar";
import socket from "../../socket";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

/* ---------- constants ---------- */
const STATUSES = [
  "Pending",
  "Accepted",
  "Packed",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

// The happy path shown in the progress tracker
const STEPS = ["Pending", "Accepted", "Packed", "Out for Delivery", "Delivered"];

const STATUS_STYLE = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  accepted: "bg-sky-50 text-sky-700 ring-sky-200",
  packed: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  "out for delivery": "bg-orange-50 text-orange-700 ring-orange-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
};

const DOT_STYLE = {
  pending: "bg-amber-500",
  accepted: "bg-sky-500",
  packed: "bg-indigo-500",
  "out for delivery": "bg-orange-500",
  delivered: "bg-emerald-500",
  cancelled: "bg-rose-500",
};

// Coloured edge and header tint per status so the list scans at a glance
const EDGE = {
  pending: "border-l-amber-400",
  accepted: "border-l-sky-500",
  packed: "border-l-indigo-500",
  "out for delivery": "border-l-orange-500",
  delivered: "border-l-emerald-500",
  cancelled: "border-l-rose-500",
};

const TINT = {
  pending: "from-amber-50",
  accepted: "from-sky-50",
  packed: "from-indigo-50",
  "out for delivery": "from-orange-50",
  delivered: "from-emerald-50",
  cancelled: "from-rose-50",
};

// Active tab colour per filter
const TAB_ACTIVE = {
  All: "bg-slate-900 text-white",
  Pending: "bg-amber-500 text-white",
  Accepted: "bg-sky-600 text-white",
  Packed: "bg-indigo-600 text-white",
  "Out for Delivery": "bg-orange-500 text-white",
  Delivered: "bg-emerald-600 text-white",
  Cancelled: "bg-rose-600 text-white",
};

const TAB_DOT = {
  All: "bg-slate-400",
  Pending: "bg-amber-500",
  Accepted: "bg-sky-500",
  Packed: "bg-indigo-500",
  "Out for Delivery": "bg-orange-500",
  Delivered: "bg-emerald-500",
  Cancelled: "bg-rose-500",
};

// One-click "move to next stage" button
const NEXT_ACTION = {
  pending: { to: "Accepted", label: "Accept order" },
  accepted: { to: "Packed", label: "Mark as packed" },
  "out for delivery": { to: "Delivered", label: "Mark as delivered" },
};

const inr = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const key = (s) => (s || "").toLowerCase();

/* ---------- small pieces ---------- */
const Icon = ({ d, className = "h-4 w-4" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);

const P = {
  search: "M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z",
  user: "M20 21v-1a5 5 0 00-5-5H9a5 5 0 00-5 5v1M12 11a4 4 0 100-8 4 4 0 000 8z",
  bike: "M5 18a3 3 0 100-6 3 3 0 000 6zM19 18a3 3 0 100-6 3 3 0 000 6zM12 18l-3-6 3-4h4M9 12h6l2 6",
  edit: "M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4",
  check: "M5 12l5 5L20 7",
  refresh: "M20 11a8 8 0 00-14.9-3M4 5v4h4M4 13a8 8 0 0014.9 3M20 19v-4h-4",
  arrow: "M9 6l6 6-6 6",
  inbox: "M4 13l2-8h12l2 8M4 13v6h16v-6M4 13h5l1 2h4l1-2h5",
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
      STATUS_STYLE[key(status)] || "bg-slate-100 text-slate-700 ring-slate-200"
    }`}
  >
    <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLE[key(status)] || "bg-slate-400"}`} />
    {status}
  </span>
);

function Tracker({ status }) {
  const cancelled = key(status) === "cancelled";
  const current = STEPS.findIndex((s) => key(s) === key(status));

  if (cancelled) {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-rose-600">
        <span className="h-2 w-2 rounded-full bg-rose-500" />
        This order was cancelled
      </div>
    );
  }

  return (
    <ol className="flex items-center w-full" aria-label="Order progress">
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={step} className={`flex items-center ${i < STEPS.length - 1 ? "flex-1" : ""}`}>
            <span
              title={step}
              className={`h-5 w-5 shrink-0 rounded-full grid place-items-center text-[10px] font-bold transition ${
                done
                  ? "bg-emerald-500 text-white"
                  : active
                  ? "bg-white text-indigo-700 ring-2 ring-indigo-500 shadow-[0_0_0_4px_rgba(99,102,241,0.15)]"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {done ? <Icon d={P.check} className="h-3 w-3" /> : i + 1}
            </span>
            {i < STEPS.length - 1 && (
              <span className={`mx-1.5 h-0.5 flex-1 rounded ${done ? "bg-emerald-500" : "bg-slate-200"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Thumb({ item }) {
  return item.image ? (
    <img
      src={item.image}
      alt={item.name}
      loading="lazy"
      className="h-11 w-11 rounded-lg object-cover bg-slate-100 ring-1 ring-slate-200"
    />
  ) : (
    <span className="h-11 w-11 rounded-lg bg-slate-100 ring-1 ring-slate-200 grid place-items-center text-sm font-semibold text-slate-500">
      {(item.name || "?").charAt(0).toUpperCase()}
    </span>
  );
}

/* ====================================================== */

function AdminOrders() {
  const navigate = useNavigate();
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deliveryData, setDeliveryData] = useState({});
  const [editingOrders, setEditingOrders] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [highlightId, setHighlightId] = useState(null);
  const scrolledFor = useRef(null);

  useEffect(() => {
    fetchOrders();

    // New orders appear on this page without a manual refresh
    const onNewOrder = () => fetchOrders(true);
    socket.on("new-order", onNewOrder);
    return () => socket.off("new-order", onNewOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Coming from the notification bell: scroll to and highlight that order
  useEffect(() => {
    const target = location.state?.orderId;
    if (!target || orders.length === 0 || scrolledFor.current === target) return;
    const el = document.getElementById(`order-${target}`);
    if (el) {
      scrolledFor.current = target;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightId(Number(target));
      setTimeout(() => setHighlightId(null), 3500);
    }
  }, [orders, location.state]);

  const fetchOrders = async (silent = false) => {
    if (silent) setRefreshing(true);
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/admin/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(res.data.sort((a, b) => b.id - a.id));
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      setBusyId(orderId);
      const token = localStorage.getItem("token");

      await api.put(
        `/admin/orders/${orderId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(`Order #${orderId} is now ${status}`);
      await fetchOrders(true);
    } catch (error) {
      console.log(error);
      toast.error("Could not update the status");
    } finally {
      setBusyId(null);
    }
  };

  const assignDelivery = async (orderId) => {
    try {
      setBusyId(orderId);
      const token = localStorage.getItem("token");

      await api.put(
        `/admin/orders/${orderId}/delivery`,
        {
          deliveryBoy: deliveryData[orderId]?.boy,
          deliveryTime: deliveryData[orderId]?.time,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Delivery assigned 🚚");

      setDeliveryData((prev) => {
        const updated = { ...prev };
        delete updated[orderId];
        return updated;
      });

      // Exit edit mode if actively editing
      setEditingOrders((prev) => {
        const updated = { ...prev };
        delete updated[orderId];
        return updated;
      });

      await fetchOrders(true);
    } catch (error) {
      console.log(error);
      toast.error("Could not assign delivery");
    } finally {
      setBusyId(null);
    }
  };

  // Toggle edit mode for an order and pre-fill input values
  const handleEditClick = (order) => {
    setDeliveryData((prev) => ({
      ...prev,
      [order.id]: {
        boy: order.delivery_boy || "",
        time: order.delivery_time || "",
      },
    }));

    setEditingOrders((prev) => ({
      ...prev,
      [order.id]: true,
    }));
  };

  // Cancel editing and revert to view mode
  const handleCancelEdit = (orderId) => {
    setEditingOrders((prev) => {
      const updated = { ...prev };
      delete updated[orderId];
      return updated;
    });
  };

  /* ---------- derived ---------- */
  const counts = useMemo(() => {
    const c = { All: orders.length };
    STATUSES.forEach((s) => (c[s] = 0));
    orders.forEach((o) => {
      const match = STATUSES.find((s) => key(s) === key(o.order_status));
      if (match) c[match] += 1;
    });
    return c;
  }, [orders]);

  const filteredOrders = orders.filter((order) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      String(order.id).includes(q) ||
      (order.customer_name || "").toLowerCase().includes(q) ||
      (order.phone || "").includes(q);

    const matchesStatus =
      statusFilter === "All" || key(order.order_status) === key(statusFilter);

    return matchesSearch && matchesStatus;
  });

  const tabs = ["All", ...STATUSES];

  /* ---------- loading ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F6F8]">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-4">
          <div className="h-8 w-40 rounded-lg bg-slate-200/70 animate-pulse" />
          <div className="h-11 rounded-xl bg-slate-200/70 animate-pulse" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-200/70 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-[#F5F6F8] to-[#F5F6F8] pb-28 md:pb-12">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* ---------- banner header ---------- */}
<div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-7 text-white shadow-lg mb-6">          <span className="pointer-events-none absolute -right-10 -top-14 h-48 w-48 rounded-full bg-white/10" />
          <span className="pointer-events-none absolute right-28 -bottom-16 h-40 w-40 rounded-full bg-white/10" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-wider uppercase text-white/75">
                SujaMart admin
              </p>
              <h1 className="text-2xl sm:text-[30px] font-bold tracking-tight mt-1">
                Orders
              </h1>
              <p className="text-sm text-white/80 mt-1">
                {orders.length} total · {counts.Pending} waiting for action
              </p>
            </div>

            <button
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white text-indigo-700 text-[13px] font-semibold hover:bg-indigo-50 disabled:opacity-60 transition"
            >
              <Icon d={P.refresh} className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          <div className="relative mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              ["Pending", counts.Pending, "bg-amber-400/90"],
              ["Packed", counts.Packed, "bg-indigo-300/90"],
              ["Out for Delivery", counts["Out for Delivery"], "bg-orange-400/90"],
              ["Delivered", counts.Delivered, "bg-emerald-400/90"],
            ].map(([label, n, dot]) => (
              <button
                key={label}
                onClick={() => setStatusFilter(label)}
                className="text-left rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur px-3.5 py-2.5 transition"
              >
                <span className="flex items-center gap-2 text-xs text-white/85">
                  <span className={`h-2 w-2 rounded-full ${dot}`} />
                  {label}
                </span>
                <span className="block text-xl font-bold tabular-nums mt-0.5">{n}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ---------- search ---------- */}
        <div className="relative mb-4">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon d={P.search} className="h-[18px] w-[18px]" />
          </span>
          <input
            type="text"
            placeholder="Search by order ID, customer name or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
          />
        </div>

        {/* ---------- status tabs ---------- */}
        <div className="-mx-4 sm:mx-0 px-4 sm:px-0 mb-6 overflow-x-auto">
          <div className="inline-flex gap-1.5 min-w-max">
            {tabs.map((t) => {
              const active = statusFilter === t;
              return (
                <button
                  key={t}
                  onClick={() => setStatusFilter(t)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-semibold transition ${
                    active
                      ? `${TAB_ACTIVE[t]} shadow-md`
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {!active && <span className={`h-2 w-2 rounded-full ${TAB_DOT[t]}`} />}
                  {t}
                  <span
                    className={`text-[11px] rounded-md px-1.5 py-0.5 tabular-nums ${
                      active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {counts[t] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ---------- list ---------- */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 py-16 text-center">
            <span className="mx-auto h-12 w-12 rounded-full bg-slate-100 text-slate-500 grid place-items-center">
              <Icon d={P.inbox} className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-base font-semibold text-slate-900">No orders found</h2>
            <p className="text-sm text-slate-500 mt-1">
              {orders.length === 0
                ? "New orders will appear here as soon as customers place them."
                : "Try a different search or status filter."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const items = order.items || [];
              const itemCount = items.reduce((n, it) => n + Number(it.quantity || 0), 0);
              const next = NEXT_ACTION[key(order.order_status)];
              const busy = busyId === order.id;
              const isHighlighted = highlightId === order.id;
              const isAssigned = order.delivery_boy && !editingOrders[order.id];
              const closed =
                key(order.order_status) === "delivered" ||
                key(order.order_status) === "cancelled";

              return (
                <article
                  key={order.id}
                  id={`order-${order.id}`}
                  className={`bg-white rounded-2xl border border-l-4 shadow-sm hover:shadow-md transition ${
                    EDGE[key(order.order_status)] || "border-l-slate-300"
                  } ${
                    isHighlighted
                      ? "border-indigo-400 ring-4 ring-indigo-100"
                      : "border-slate-200/80"
                  }`}
                >
                  {/* head */}
                  <div
                    className={`flex items-start justify-between gap-3 p-5 pb-4 rounded-t-2xl bg-gradient-to-r ${
                      TINT[key(order.order_status)] || "from-slate-50"
                    } to-white`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-base font-semibold text-slate-900">
                          Order #{order.id}
                        </h2>
                        <StatusBadge status={order.order_status} />
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-1.5">
                          <Icon d={P.user} className="h-3.5 w-3.5 text-slate-400" />
                          {order.customer_name || "Customer"}
                        </span>
                        {order.phone && (
                          <span className="inline-flex items-center gap-1.5 tabular-nums">
                            <Icon d={P.phone} className="h-3.5 w-3.5 text-slate-400" />
                            {order.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xl font-bold text-indigo-700 tabular-nums">
                        {inr(order.total_amount)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {itemCount} {itemCount === 1 ? "item" : "items"}
                      </p>
                    </div>
                  </div>

                  {/* items */}
                  {items.length > 0 && (
                    <div className="px-5 pb-4">
                      <div className="flex items-center gap-2">
                        {items.slice(0, 5).map((it, i) => (
                          <Thumb key={i} item={it} />
                        ))}
                        {items.length > 5 && (
                          <span className="h-11 w-11 rounded-lg bg-slate-100 grid place-items-center text-xs font-semibold text-slate-600">
                            +{items.length - 5}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-slate-500 line-clamp-2">
                        {items.map((it) => `${it.name} × ${it.quantity}`).join(" · ")}
                      </p>
                    </div>
                  )}

                  {/* progress */}
                  <div className="px-5 pb-5">
                    <Tracker status={order.order_status} />
                    {!closed && key(order.order_status) === "packed" && !order.delivery_boy && (
                      <p className="mt-2 text-xs text-amber-700">
                        Assign a rider below to send this order out for delivery.
                      </p>
                    )}
                  </div>

                  {/* actions */}
                  <div className="border-t border-slate-100 bg-slate-50/60 rounded-b-2xl p-5 space-y-4">
                    <div className="flex flex-wrap items-end gap-3">
                      <div>
                        <label
                          htmlFor={`status-${order.id}`}
                          className="block text-xs font-medium text-slate-500 mb-1.5"
                        >
                          Status
                        </label>
                        <select
                          id={`status-${order.id}`}
                          value={order.order_status}
                          disabled={busy}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:opacity-60"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      {next && (
                        <button
                          onClick={() => updateStatus(order.id, next.to)}
                          disabled={busy}
                          className="h-10 inline-flex items-center gap-2 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/25 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60 transition"
                        >
                          {next.label}
                          <Icon d={P.arrow} className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                        className="h-10 px-4 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition sm:ml-auto"
                      >
                        View details
                      </button>
                    </div>

                    {/* delivery */}
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1.5">
                        Delivery
                      </p>

                      {isAssigned ? (
                        <div className="inline-flex flex-wrap items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5">
                          <span className="h-8 w-8 rounded-lg bg-emerald-600 text-white grid place-items-center">
                            <Icon d={P.bike} className="h-4 w-4" />
                          </span>
                          <span className="text-sm text-emerald-900">
                            <span className="font-semibold">
                              {order.delivery_boy || order.deliveryBoy}
                            </span>{" "}
                            <span className="text-emerald-700">
                              · ETA {order.delivery_time || order.deliveryTime} min
                            </span>
                          </span>
                          <button
                            onClick={() => handleEditClick(order)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-white/70 hover:bg-white border border-emerald-200 px-2.5 py-1.5 rounded-lg transition"
                          >
                            <Icon d={P.edit} className="h-3.5 w-3.5" />
                            Edit
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="text"
                            placeholder="Rider name"
                            aria-label={`Rider name for order ${order.id}`}
                            className="h-10 w-44 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                            value={deliveryData[order.id]?.boy || ""}
                            onChange={(e) =>
                              setDeliveryData({
                                ...deliveryData,
                                [order.id]: {
                                  ...deliveryData[order.id],
                                  boy: e.target.value,
                                },
                              })
                            }
                          />

                          <input
                            type="number"
                            min="1"
                            placeholder="Minutes"
                            aria-label={`Delivery minutes for order ${order.id}`}
                            className="h-10 w-28 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                            value={deliveryData[order.id]?.time || ""}
                            onChange={(e) =>
                              setDeliveryData({
                                ...deliveryData,
                                [order.id]: {
                                  ...deliveryData[order.id],
                                  time: e.target.value,
                                },
                              })
                            }
                          />

                          <button
                            onClick={() => assignDelivery(order.id)}
                            disabled={
                              busy ||
                              !deliveryData[order.id]?.boy ||
                              !deliveryData[order.id]?.time
                            }
                            className={`h-10 px-4 rounded-lg text-sm font-medium transition ${
                              deliveryData[order.id]?.boy && deliveryData[order.id]?.time
                                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 hover:from-indigo-700 hover:to-violet-700"
                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            {editingOrders[order.id] ? "Save changes" : "Assign rider"}
                          </button>

                          {/* Cancel Button (visible during edit mode) */}
                          {editingOrders[order.id] && (
                            <button
                              onClick={() => handleCancelEdit(order.id)}
                              className="h-10 px-4 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrders;