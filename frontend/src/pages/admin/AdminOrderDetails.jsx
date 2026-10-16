import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import Navbar from "../../components/Navbar";

/* ---------- constants ---------- */
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

const key = (s) => (s || "").toLowerCase();

const inr = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

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
  back: "M15 6l-6 6 6 6",
  pin: "M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11zM12 12a2 2 0 100-4 2 2 0 000 4z",
  card: "M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM3 10h18",
  copy: "M9 9h10v10H9zM5 15V5h10",
  check: "M5 12l5 5L20 7",
  download: "M12 4v11m0 0l-4-4m4 4l4-4M5 20h14",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z",
  user: "M20 21v-1a5 5 0 00-5-5H9a5 5 0 00-5 5v1M12 11a4 4 0 100-8 4 4 0 000 8z",
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${
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
      <div className="flex items-center gap-2 text-sm font-bold text-rose-600">
        <span className="h-2 w-2 rounded-full bg-rose-500" />
        This order was cancelled
      </div>
    );
  }

  return (
    <ol className="flex items-start w-full" aria-label="Order progress">
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={step} className={`flex flex-col ${i < STEPS.length - 1 ? "flex-1" : ""}`}>
            <div className="flex items-center">
              <span
                className={`h-6 w-6 shrink-0 rounded-full grid place-items-center text-[11px] font-bold ${
                  done
                    ? "bg-emerald-500 text-white"
                    : active
                    ? "bg-white text-indigo-700 ring-2 ring-indigo-500"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {done ? <Icon d={P.check} className="h-3.5 w-3.5" /> : i + 1}
              </span>
              {i < STEPS.length - 1 && (
                <span className={`mx-1.5 sm:mx-2 h-0.5 flex-1 rounded ${done ? "bg-emerald-500" : "bg-slate-200"}`} />
              )}
            </div>
            <span
              className={`mt-1.5 text-[10px] sm:text-[11px] leading-tight ${
                active ? "font-semibold text-slate-900" : "text-slate-500"
              }`}
            >
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

const Card = ({ title, icon, children, className = "" }) => (
  <section
    className={`bg-white rounded-3xl border border-slate-100 shadow-[0_2px_14px_rgba(76,29,149,0.05)] ${className}`}
  >
    {title && (
      <header className="flex items-center gap-2.5 px-5 pt-5">
        {icon && (
          <span className="h-9 w-9 rounded-xl bg-purple-100 text-purple-700 grid place-items-center">
            <Icon d={icon} className="h-4 w-4" />
          </span>
        )}
        <h2 className="text-base font-extrabold tracking-tight text-slate-900">{title}</h2>
      </header>
    )}
    <div className="p-5">{children}</div>
  </section>
);

const Row = ({ label, children }) => (
  <div className="flex items-start justify-between gap-4 py-2 text-sm">
    <dt className="text-slate-400 font-semibold shrink-0">{label}</dt>
    <dd className="text-slate-900 font-bold text-right min-w-0 break-words">{children}</dd>
  </div>
);

function CopyValue({ value }) {
  const [done, setDone] = useState(false);
  if (!value) return <span className="text-slate-400">Not available</span>;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(String(value));
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch (e) {
      toast.info("Select the text and copy it manually");
    }
  };

  return (
    <span className="inline-flex items-center gap-2 max-w-full">
      <code className="font-mono text-xs bg-purple-50 text-purple-900 rounded-md px-1.5 py-0.5 break-all">{value}</code>
      <button
        onClick={copy}
        className="shrink-0 text-slate-400 hover:text-purple-700 active:scale-90 transition"
        aria-label="Copy"
        title="Copy"
      >
        <Icon d={done ? P.check : P.copy} className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}

/* ====================================================== */

function AdminOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get(`/admin/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setItems(res.data);
      setFailed(res.data.length === 0);
    } catch (error) {
      console.log(error);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async () => {
    try {
      setDownloading(true);
      const token = localStorage.getItem("token");
      const response = await api.get(`/invoice/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
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
    } finally {
      setDownloading(false);
    }
  };

  /* ---------- loading / not found ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F3FF]">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          <div className="h-36 sm:h-40 rounded-3xl bg-gradient-to-r from-[#7A22FD]/30 to-[#FF4E6B]/30 animate-pulse" />
          <div className="h-24 rounded-3xl bg-white animate-pulse" />
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 h-80 rounded-3xl bg-white animate-pulse" />
            <div className="h-80 rounded-3xl bg-white animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="min-h-screen bg-[#F5F3FF]">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF4C2] text-3xl">
            🛒
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">Order not found</h2>
          <p className="text-sm text-slate-500 mt-1">
            We could not load order #{orderId}. It may have been removed.
          </p>
          <button
            onClick={() => navigate("/admin/orders")}
            className="mt-5 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-black uppercase tracking-wider shadow-md shadow-purple-600/30 hover:bg-purple-700 active:scale-95 transition"
          >
            Back to orders
          </button>
        </div>
      </div>
    );
  }

  const order = items[0];
  const itemCount = items.reduce((n, it) => n + Number(it.quantity || 0), 0);
  const linesTotal = items.reduce(
    (sum, it) => sum + Number(it.quantity) * Number(it.price_at_purchase),
    0
  );
  const placedAt = new Date(order.created_at);
  const placedText = isNaN(placedAt)
    ? order.created_at
    : placedAt.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

  return (
    <div className="min-h-screen bg-[#F5F3FF] pb-28 md:pb-12 text-slate-900 antialiased font-sans selection:bg-purple-600 selection:text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* ---------- banner ---------- */}
 <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-7 text-white shadow-lg mb-6">
          <span className="pointer-events-none absolute -right-10 -top-14 h-48 w-48 rounded-full bg-indigo-400/10" />
          <span className="pointer-events-none absolute right-28 -bottom-16 h-40 w-40 rounded-full bg-white/5" />

          <div className="relative flex items-center justify-between gap-3 mb-4">
            <button
              onClick={() => navigate("/admin/orders")}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/20 backdrop-blur-sm px-3 py-1.5 text-xs font-bold text-white hover:bg-white/25 transition"
            >
              <Icon d={P.back} className="h-3.5 w-3.5" />
              All orders
            </button>
            <span className="inline-flex items-center gap-1.5 bg-[#FFD424] text-slate-900 text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
              ⚡ Sujamart
            </span>
          </div>

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-4xl font-black leading-tight tracking-tight">
                  Order #{order.order_id}
                </h1>
                <StatusBadge status={order.order_status} />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-white/85 mt-1.5">
                Placed {placedText}
              </p>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4">
              <div className="sm:text-right">
                <p className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                  Order total
                </p>
                <p className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight">
                  {inr(order.total_amount)}
                </p>
              </div>
              <button
                onClick={downloadInvoice}
                disabled={downloading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFD424] text-slate-900 text-xs font-black uppercase tracking-wider shadow-md hover:bg-[#FFDD4D] active:scale-95 disabled:opacity-60 disabled:pointer-events-none transition"
              >
                <Icon d={P.download} className="h-4 w-4" />
                {downloading ? "Preparing" : "Invoice"}
              </button>
            </div>
          </div>
        </div>

        {/* ---------- progress ---------- */}
        <Card className="mb-4">
          <Tracker status={order.order_status} />
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          {/* ---------- products ---------- */}
          <Card
            title={`Items (${itemCount})`}
            icon={P.check}
            className="lg:col-span-2"
          >
            <ul className="divide-y divide-slate-100 -my-2">
              {items.map((item, index) => {
                const line = Number(item.quantity) * Number(item.price_at_purchase);
                return (
                  <li key={`${item.name}-${index}`} className="py-3.5 flex items-center gap-3 sm:gap-4">
                    {item.image_url ? (
                      <span className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-2xl bg-gradient-to-b from-[#F8F7FF] to-[#F1EEFB] flex items-center justify-center p-2 overflow-hidden">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          loading="lazy"
                          className="max-h-full max-w-full object-contain mix-blend-multiply"
                        />
                      </span>
                    ) : (
                      <span className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-purple-100 grid place-items-center text-xl font-black text-purple-600 shrink-0">
                        {(item.name || "?").charAt(0).toUpperCase()}
                      </span>
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-2">
                        {item.name}
                      </h3>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 tabular-nums">
                          Qty {item.quantity}
                        </span>
                        <span className="text-xs font-bold text-slate-400 tabular-nums">
                          {inr(item.price_at_purchase)} each
                        </span>
                      </div>
                    </div>

                    <p className="text-base sm:text-lg font-black text-slate-900 tabular-nums shrink-0">
                      {inr(line)}
                    </p>
                  </li>
                );
              })}
            </ul>

            <dl className="mt-5 pt-4 border-t border-slate-100">
              <Row label="Items subtotal">
                <span className="tabular-nums">{inr(linesTotal)}</span>
              </Row>
              <div className="mt-2 flex items-center justify-between rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-4 py-3.5 text-white shadow-lg shadow-indigo-950/40">
                <dt className="text-xs sm:text-sm font-black uppercase tracking-wider text-white/85">
                  Total
                </dt>
                <dd className="text-xl sm:text-2xl font-black tabular-nums tracking-tight">
                  {inr(order.total_amount)}
                </dd>
              </div>
            </dl>

          </Card>

          {/* ---------- side column ---------- */}
          <div className="space-y-4">
            <Card title="Delivery address" icon={P.pin}>
              <div className="text-sm text-slate-700 space-y-1.5">
                <p className="flex items-center flex-wrap gap-2 font-bold text-slate-900">
                  <Icon d={P.user} className="h-3.5 w-3.5 text-purple-400" />
                  {order.delivery_name || "Not available"}
                  {order.address_type && (
                    <span className="text-[11px] font-black uppercase tracking-wider rounded-full bg-purple-100 text-purple-700 px-2.5 py-0.5">
                      {order.address_type}
                    </span>
                  )}
                </p>
                {order.delivery_phone && (
                  <p className="flex items-center gap-2 tabular-nums font-semibold">
                    <Icon d={P.phone} className="h-3.5 w-3.5 text-purple-400" />
                    {order.delivery_phone}
                  </p>
                )}
                <p className="pt-1 leading-relaxed font-medium">
                  {order.address_line
                    ? `${order.address_line}, ${order.city}`
                    : "No address was saved with this order."}
                  {order.pincode && ` - ${order.pincode}`}
                </p>
                {order.landmark && (
                  <p className="text-slate-500 font-medium">Landmark: {order.landmark}</p>
                )}
                {order.alternate_phone && (
                  <p className="text-slate-500 font-medium tabular-nums">
                    Alternate: {order.alternate_phone}
                  </p>
                )}
              </div>
            </Card>

            <Card title="Payment" icon={P.card}>
              <dl>
                <Row label="Method">
                  <span className="capitalize">{order.payment_method}</span>
                </Row>
                {order.payment_method === "online" ? (
                  <>
                    <Row label="Status">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-black uppercase tracking-wider ${
                          key(order.payment_status) === "success"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {order.payment_status || "Unknown"}
                      </span>
                    </Row>
                    <Row label="Transaction ID">
                      <CopyValue value={order.razorpay_payment_id} />
                    </Row>
                    <Row label="Razorpay order">
                      <CopyValue value={order.razorpay_order_id} />
                    </Row>
                  </>
                ) : (
                  <p className="text-xs font-medium text-slate-500 pt-1">
                    {order.payment_method === "udhaar"
                      ? "Added to the customer's credit balance."
                      : "Collect cash when the order is delivered."}
                  </p>
                )}
              </dl>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOrderDetails;