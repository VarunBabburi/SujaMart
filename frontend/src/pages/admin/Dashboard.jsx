import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Navbar from "../../components/Navbar";

import { Line } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

/* ---------- design tokens (one accent, neutral surfaces) ---------- */
const ACCENT = "#4F46E5";

/* ---------- helpers ---------- */
const inr = (n, decimals = 0) =>
  "₹" +
  Number(n || 0).toLocaleString("en-IN", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  });

const num = (n) => Number(n || 0).toLocaleString("en-IN");

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

/* ---------- small icon set (inline SVG, no extra dependency) ---------- */
const Icon = ({ d, className = "h-5 w-5" }) => (
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

const PATHS = {
  rupee: "M6 4h12M6 9h12M9 4c4 0 6 2 6 5s-2 5-6 5H6l8 6",
  calendar: "M8 3v3M16 3v3M4 9h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z",
  bag: "M6 7h12l1 13H5L6 7zM9 7a3 3 0 016 0",
  clock: "M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  users: "M16 19v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1M10 11a3 3 0 100-6 3 3 0 000 6zM20 19v-1a3 3 0 00-2-2.8M16 5.2a3 3 0 010 5.6",
  box: "M21 8l-9-5-9 5v8l9 5 9-5V8zM3 8l9 5 9-5M12 13v8",
  check: "M5 12l5 5L20 7",
  wallet: "M4 7h15a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V7zm0 0V6a1 1 0 011-1h11M16 13h2",
  refresh: "M20 11a8 8 0 00-14.9-3M4 5v4h4M4 13a8 8 0 0014.9 3M20 19v-4h-4",
  arrow: "M9 6l6 6-6 6",
  alert: "M12 9v4M12 17h.01M10.3 4l-8 14a2 2 0 001.7 3h16a2 2 0 001.7-3l-8-14a2 2 0 00-3.4 0z",
  headset: "M4 14v-2a8 8 0 0116 0v2M4 14a2 2 0 002 2h1v-5H6a2 2 0 00-2 2zm16 0a2 2 0 01-2 2h-1v-5h1a2 2 0 012 2z",
};

/* ---------- presentational pieces ---------- */
const Card = ({ className = "", children }) => (
  <div
    className={`bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${className}`}
  >
    {children}
  </div>
);

const CardHeader = ({ title, subtitle, right }) => (
  <div className="flex items-start justify-between gap-3 px-5 pt-5">
    <div className="min-w-0">
      <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {right}
  </div>
);

const TONES = {
  indigo: "bg-indigo-50 text-indigo-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
  slate: "bg-slate-100 text-slate-600",
  sky: "bg-sky-50 text-sky-600",
  violet: "bg-violet-50 text-violet-600",
};

// Solid gradient cards for the headline numbers
const SOLID = {
  indigo: "from-indigo-600 to-violet-600 shadow-indigo-500/25",
  sky: "from-sky-500 to-blue-600 shadow-sky-500/25",
  emerald: "from-emerald-500 to-teal-600 shadow-emerald-500/25",
  amber: "from-amber-400 to-orange-500 shadow-orange-500/25",
};

// Soft tinted cards for the secondary numbers
const SOFT = {
  violet: { card: "bg-violet-50/80 border-violet-200", value: "text-violet-700", chip: "bg-violet-600" },
  sky: { card: "bg-sky-50/80 border-sky-200", value: "text-sky-700", chip: "bg-sky-600" },
  emerald: { card: "bg-emerald-50/80 border-emerald-200", value: "text-emerald-700", chip: "bg-emerald-600" },
  rose: { card: "bg-rose-50/80 border-rose-200", value: "text-rose-700", chip: "bg-rose-600" },
};

const RANK_COLORS = ["#4F46E5", "#7C3AED", "#C026D3", "#EC4899", "#F97316"];

const Kpi = ({ label, value, hint, icon, tone = "slate", onClick, emphasis, variant = "soft" }) => {
  const Wrapper = onClick ? "button" : "div";

  if (variant === "solid") {
    return (
      <Wrapper
        onClick={onClick}
        className={`relative overflow-hidden text-left rounded-2xl p-5 text-white bg-gradient-to-br shadow-lg transition ${
          SOLID[tone]
        } ${onClick ? "hover:-translate-y-0.5 hover:shadow-xl cursor-pointer" : ""} ${
          emphasis ? "ring-2 ring-offset-2 ring-amber-300 ring-offset-[#F5F6F8]" : ""
        }`}
      >
        <span className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
        <span className="pointer-events-none absolute -right-2 bottom-[-36px] h-24 w-24 rounded-full bg-white/10" />
        <div className="relative flex items-center justify-between">
          <p className="text-[13px] font-medium text-white/85">{label}</p>
          <span className="h-9 w-9 rounded-xl grid place-items-center bg-white/20">
            <Icon d={PATHS[icon]} className="h-[18px] w-[18px]" />
          </span>
        </div>
        <p className="relative mt-3 text-[30px] leading-none font-bold tracking-tight tabular-nums">
          {value}
        </p>
        {hint && <p className="relative mt-2 text-xs text-white/80">{hint}</p>}
      </Wrapper>
    );
  }

  const soft = SOFT[tone] || SOFT.violet;
  return (
    <Wrapper
      onClick={onClick}
      className={`text-left rounded-2xl border p-5 transition ${soft.card} ${
        onClick ? "hover:shadow-md hover:-translate-y-0.5 cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-slate-600">{label}</p>
        <span className={`h-9 w-9 rounded-xl grid place-items-center text-white ${soft.chip}`}>
          <Icon d={PATHS[icon]} className="h-[18px] w-[18px]" />
        </span>
      </div>
      <p className={`mt-3 text-[26px] leading-none font-bold tracking-tight tabular-nums ${soft.value}`}>
        {value}
      </p>
      {hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
    </Wrapper>
  );
};

const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-lg bg-slate-200/70 ${className}`} />
);

function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-72 mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[132px] rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Skeleton className="h-[360px] rounded-2xl lg:col-span-2" />
        <Skeleton className="h-[360px] rounded-2xl" />
      </div>
    </div>
  );
}

/* ====================================================== */

function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalOutstanding: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [topProducts, setTopProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [salesChart, setSalesChart] = useState([]);
  const [updatedAt, setUpdatedAt] = useState(null);

  const adminName = (() => {
    try {
      const u = JSON.parse(localStorage.getItem("user")) || {};
      return (u.name || "").trim().split(" ")[0] || "Admin";
    } catch (e) {
      return "Admin";
    }
  })();

  useEffect(() => {
    loadAll(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAll = async (first = false) => {
    if (!first) setRefreshing(true);
    setError("");
    await Promise.all([
      fetchStats(),
      fetchTopProducts(),
      fetchLowStock(),
      fetchSalesChart(),
    ]);
    setUpdatedAt(new Date());
    setRefreshing(false);
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/dashboard", authHeader());
      setStats(res.data);
    } catch (err) {
      console.log(err);
      setError("We could not load the dashboard figures.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTopProducts = async () => {
    try {
      const res = await api.get("/admin/top-products", authHeader());
      setTopProducts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchLowStock = async () => {
    try {
      const res = await api.get("/admin/low-stock", authHeader());
      setLowStock(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchSalesChart = async () => {
    try {
      const res = await api.get("/admin/sales-chart", authHeader());
      setSalesChart(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  /* ---------- derived numbers (all from real data) ---------- */
  const weekTotal = useMemo(
    () => salesChart.reduce((sum, d) => sum + Number(d.total_sales || 0), 0),
    [salesChart]
  );
  const weekAvg = salesChart.length ? weekTotal / salesChart.length : 0;
  const bestDay = useMemo(() => {
    if (!salesChart.length) return null;
    return salesChart.reduce((a, b) =>
      Number(b.total_sales) > Number(a.total_sales) ? b : a
    );
  }, [salesChart]);

  const maxSold = Math.max(1, ...topProducts.map((p) => Number(p.totalSold || 0)));

  const fmtDay = (d) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  const chartData = {
    labels: salesChart.map((item) => fmtDay(item.sale_date)),
    datasets: [
      {
        label: "Sales",
        data: salesChart.map((item) => Number(item.total_sales)),
        borderColor: ACCENT,
        borderWidth: 2.5,
        backgroundColor: (ctx) => {
          const { chart } = ctx;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return "rgba(79,70,229,0.12)";
          const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          g.addColorStop(0, "rgba(79,70,229,0.22)");
          g.addColorStop(1, "rgba(79,70,229,0)");
          return g;
        },
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: "#fff",
        pointBorderColor: ACCENT,
        pointBorderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0F172A",
        padding: 10,
        displayColors: false,
        titleFont: { weight: "600" },
        callbacks: { label: (c) => ` ${inr(c.parsed.y, 2)}` },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#64748B", font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: "#EEF0F4" },
        ticks: {
          color: "#64748B",
          font: { size: 11 },
          maxTicksLimit: 5,
          callback: (v) => inr(v),
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F6F8]">
        <Navbar />
        <DashboardSkeleton />
      </div>
    );
  }

  const quickLinks = [
    { label: "Orders", path: "/admin/orders" },
    { label: "Products", path: "/admin/products" },
    { label: "Customers", path: "/admin/customers" },
    { label: "Credit", path: "/admin/credit" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-[#F5F6F8] to-[#F5F6F8] pb-28 md:pb-12">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* ---------- banner header ---------- */}
<div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-lg mb-6">          <span className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10" />
          <span className="pointer-events-none absolute right-24 -bottom-20 h-48 w-48 rounded-full bg-white/10" />
          <span className="pointer-events-none absolute left-1/3 -top-10 h-24 w-24 rounded-full bg-fuchsia-300/20" />

          <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wider uppercase text-white/75">
                SujaMart admin
              </p>
              <h1 className="text-2xl sm:text-[32px] font-bold tracking-tight mt-1">
                Welcome back, {adminName} 👋
              </h1>
              <p className="text-sm text-white/80 mt-1">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                {updatedAt && (
                  <span className="text-white/60">
                    {" "}
                    · Updated{" "}
                    {updatedAt.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {quickLinks.map((l) => (
                <button
                  key={l.path}
                  onClick={() => navigate(l.path)}
                  className="px-3.5 py-2 rounded-lg bg-white/15 hover:bg-white/25 backdrop-blur text-[13px] font-semibold text-white border border-white/20 transition"
                >
                  {l.label}
                </button>
              ))}
              <button
                onClick={() => loadAll(false)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white text-indigo-700 text-[13px] font-semibold hover:bg-indigo-50 disabled:opacity-60 transition"
              >
                <Icon
                  d={PATHS.refresh}
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                {refreshing ? "Refreshing" : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            <span>{error}</span>
            <button
              onClick={() => loadAll(false)}
              className="font-semibold underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        )}

        {/* ---------- primary KPIs ---------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Kpi
            label="Today's sales"
            value={inr(stats.todaySales)}
            hint="Orders placed today"
            icon="rupee"
            tone="indigo"
            variant="solid"
          />
          <Kpi
            label="This month"
            value={inr(stats.monthlySales)}
            hint="Month to date"
            icon="calendar"
            tone="sky"
            variant="solid"
          />
          <Kpi
            label="Total orders"
            value={num(stats.totalOrders)}
            hint={`${num(stats.deliveredOrders)} delivered`}
            icon="bag"
            tone="emerald"
            variant="solid"
            onClick={() => navigate("/admin/orders")}
          />
          <Kpi
            label="Pending orders"
            value={num(stats.pendingOrders)}
            hint={
              Number(stats.pendingOrders) > 0
                ? "Waiting for your action"
                : "Nothing waiting"
            }
            icon="clock"
            tone="amber"
            variant="solid"
            emphasis={Number(stats.pendingOrders) > 0}
            onClick={() => navigate("/admin/orders")}
          />
        </div>

        {/* ---------- secondary KPIs ---------- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <Kpi
            label="Customers"
            value={num(stats.totalCustomers)}
            icon="users"
            tone="violet"
            onClick={() => navigate("/admin/customers")}
          />
          <Kpi
            label="Products"
            value={num(stats.totalProducts)}
            icon="box"
            tone="sky"
            onClick={() => navigate("/admin/products")}
          />
          <Kpi
            label="Delivered"
            value={num(stats.deliveredOrders)}
            icon="check"
            tone="emerald"
          />
          <Kpi
            label="Outstanding udhaar"
            value={inr(stats.totalOutstanding)}
            hint="Owed by customers"
            icon="wallet"
            tone="rose"
            onClick={() => navigate("/admin/credit")}
          />
        </div>

        {/* ---------- chart + attention ---------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          <Card className="lg:col-span-2">
            <CardHeader
              title="Revenue"
              subtitle={`Last ${salesChart.length || 7} days with sales`}
              right={
                <div className="text-right">
                  <p className="text-xl font-semibold text-slate-900 tabular-nums">
                    {inr(weekTotal)}
                  </p>
                  <p className="text-xs text-slate-500">
                    Avg {inr(weekAvg)} / day
                  </p>
                </div>
              }
            />
            <div className="px-3 sm:px-5 pt-4 pb-5">
              {salesChart.length === 0 ? (
                <div className="h-64 grid place-items-center text-sm text-slate-500">
                  No sales recorded yet.
                </div>
              ) : (
                <div className="h-64 sm:h-72">
                  <Line data={chartData} options={chartOptions} />
                </div>
              )}
              {bestDay && (
                <p className="text-xs text-slate-500 mt-3 px-2">
                  Best day: <span className="font-medium text-slate-700">{fmtDay(bestDay.sale_date)}</span>{" "}
                  with {inr(bestDay.total_sales)}
                </p>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Needs attention"
              subtitle="Items that should be handled today"
            />
            <div className="p-5 space-y-3">
              <button
                onClick={() => navigate("/admin/orders")}
                className="w-full flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 hover:bg-slate-50 transition text-left"
              >
                <span className="flex items-center gap-3">
                  <span className={`h-9 w-9 rounded-lg grid place-items-center ${TONES.amber}`}>
                    <Icon d={PATHS.clock} className="h-[18px] w-[18px]" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-slate-900">
                      {num(stats.pendingOrders)} pending orders
                    </span>
                    <span className="block text-xs text-slate-500">Open the order desk</span>
                  </span>
                </span>
                <Icon d={PATHS.arrow} className="h-4 w-4 text-slate-400" />
              </button>

              <button
                onClick={() => navigate("/admin/products")}
                className="w-full flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 hover:bg-slate-50 transition text-left"
              >
                <span className="flex items-center gap-3">
                  <span className={`h-9 w-9 rounded-lg grid place-items-center ${TONES.rose}`}>
                    <Icon d={PATHS.alert} className="h-[18px] w-[18px]" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-slate-900">
                      {lowStock.length} low-stock {lowStock.length === 1 ? "item" : "items"}
                    </span>
                    <span className="block text-xs text-slate-500">10 or fewer left</span>
                  </span>
                </span>
                <Icon d={PATHS.arrow} className="h-4 w-4 text-slate-400" />
              </button>

              <button
                onClick={() => navigate("/admin/support")}
                className="w-full flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 hover:bg-slate-50 transition text-left"
              >
                <span className="flex items-center gap-3">
                  <span className={`h-9 w-9 rounded-lg grid place-items-center ${TONES.indigo}`}>
                    <Icon d={PATHS.headset} className="h-[18px] w-[18px]" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-slate-900">
                      Support inbox
                    </span>
                    <span className="block text-xs text-slate-500">Tickets and messages</span>
                  </span>
                </span>
                <Icon d={PATHS.arrow} className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </Card>
        </div>

        {/* ---------- top products + low stock ---------- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <Card>
            <CardHeader title="Top selling products" subtitle="By units sold, all time" />
            <div className="p-5">
              {topProducts.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">No sales yet.</p>
              ) : (
                <ol className="space-y-4">
                  {topProducts.map((product, index) => {
                    const sold = Number(product.totalSold || 0);
                    return (
                      <li key={index}>
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="flex items-center gap-3 min-w-0">
                            <span
                              className="h-6 w-6 shrink-0 rounded-md text-white text-xs font-bold grid place-items-center"
                              style={{ background: RANK_COLORS[index % RANK_COLORS.length] }}
                            >
                              {index + 1}
                            </span>
                            <span className="truncate font-medium text-slate-800">
                              {product.name}
                            </span>
                          </span>
                          <span className="shrink-0 font-semibold text-slate-900 tabular-nums">
                            {num(sold)} <span className="font-normal text-slate-500">sold</span>
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.max(4, (sold / maxSold) * 100)}%`,
                              background: RANK_COLORS[index % RANK_COLORS.length],
                            }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Low stock alerts"
              subtitle="Active products with 10 or fewer units"
              right={
                lowStock.length > 0 && (
                  <span className="text-xs font-semibold px-2 py-1 rounded-md bg-rose-50 text-rose-700">
                    {lowStock.length} to restock
                  </span>
                )
              }
            />
            <div className="p-5">
              {lowStock.length === 0 ? (
                <div className="py-6 text-center">
                  <span className={`mx-auto h-10 w-10 rounded-full grid place-items-center ${TONES.emerald}`}>
                    <Icon d={PATHS.check} />
                  </span>
                  <p className="text-sm font-medium text-slate-800 mt-3">
                    All products are well stocked
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {lowStock.map((item) => {
                    const left = Number(item.stock_quantity);
                    const critical = left <= 3;
                    return (
                      <li key={item.id} className="py-3 flex items-center gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {item.name}
                          </p>
                          <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                critical ? "bg-rose-500" : "bg-amber-400"
                              }`}
                              style={{ width: `${Math.max(6, Math.min(100, (left / 10) * 100))}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-slate-900 tabular-nums">
                            {left} left
                          </p>
                          <p
                            className={`text-[11px] font-semibold ${
                              critical ? "text-rose-600" : "text-amber-600"
                            }`}
                          >
                            {critical ? "Critical" : "Low"}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;