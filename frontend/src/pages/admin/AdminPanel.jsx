import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";

const adminSections = [
  {
    title: "Dashboard",
    description: "View business performance and statistics",
    path: "/admin",
    icon: "📊",
    color: "from-purple-500 to-indigo-600",
  },
  {
    title: "Customer Orders",
    description: "Manage and track customer orders",
    path: "/admin/orders",
    icon: "🛒",
    color: "from-blue-500 to-cyan-600",
  },
  {
    title: "Products",
    description: "Add, edit and manage grocery products",
    path: "/admin/products",
    icon: "📦",
    color: "from-emerald-500 to-green-600",
  },
  {
    title: "Categories",
    description: "Organize your grocery categories",
    path: "/admin/categories",
    icon: "🗂️",
    color: "from-orange-500 to-amber-600",
  },
  {
    title: "Customers",
    description: "View and manage customer accounts",
    path: "/admin/customers",
    icon: "👥",
    color: "from-pink-500 to-rose-600",
  },
  {
    title: "Payments",
    description: "Monitor payments and transactions",
    path: "/admin/payments",
    icon: "💳",
    color: "from-cyan-500 to-blue-600",
  },
  {
    title: "Credit Ledger",
    description: "Manage customer credit accounts",
    path: "/admin/credit",
    icon: "📒",
    color: "from-violet-500 to-purple-600",
  },
];

function AdminPanel() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-purple-600">
                SujaMart Administration
              </p>

              <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Admin Panel
              </h1>

              <p className="mt-2 text-sm font-medium text-slate-500">
                Manage your grocery store from one central place.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-xl">
                ⚡
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400">
                  STORE STATUS
                </p>
                <p className="text-sm font-black text-emerald-600">
                  ● Store Active
                </p>
              </div>
            </div>
          </div>

          {/* Welcome Banner */}
          <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#35105c] via-[#6420a0] to-[#9b35d4] p-6 text-white shadow-xl sm:p-8">
            <div className="relative z-10 max-w-2xl">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-purple-200">
                Control Center
              </p>

              <h2 className="text-2xl font-black sm:text-3xl">
                Welcome to SujaMart Admin 👋
              </h2>

              <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-purple-100">
                Manage products, orders, customers, payments and credit
                accounts efficiently from your administration center.
              </p>
            </div>

            <div className="absolute -right-10 -top-16 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-28 right-20 h-72 w-72 rounded-full bg-white/10" />
          </section>

          {/* Section Heading */}
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Management Sections
              </h2>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Select a section to continue
              </p>
            </div>

            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-slate-500 shadow-sm">
              {adminSections.length} Sections
            </span>
          </div>

          {/* Admin Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {adminSections.map((section) => (
              <Link
                key={section.path}
                to={section.path}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-300 hover:shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${section.color} text-2xl shadow-lg transition-transform duration-300 group-hover:scale-110`}
                  >
                    {section.icon}
                  </div>

                  <span className="text-xl font-bold text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-purple-600">
                    →
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-black text-slate-800">
                  {section.title}
                </h3>

                <p className="mt-2 min-h-[40px] text-sm font-medium leading-5 text-slate-500">
                  {section.description}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  {/* <span className="text-[10px] font-black uppercase tracking-widest text-purple-600">
                    Open Section
                  </span> */}

                  <span className="text-xs font-bold text-slate-400 transition-colors group-hover:text-purple-600">
                    View →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Footer Information */}
          <div className="mt-8 rounded-2xl border border-purple-100 bg-purple-50 px-5 py-4">
            <p className="text-center text-xs font-semibold text-purple-700">
              SujaMart Admin Center · Manage your store with ease
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

export default AdminPanel;