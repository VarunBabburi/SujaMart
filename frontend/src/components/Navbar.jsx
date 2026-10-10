import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import socket from "../socket";
import api from "../services/api";
import { toast } from "react-toastify";
import orderSound from "../assets/order.mp3";
import logo from "../assets/logo.png";

/* ---------- inline icons (no emoji, crisp on every device) ---------- */
const Icon = ({ d, className = "h-5 w-5", filled = false }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={filled ? 0 : 2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const ICONS = {
  shop: "M3 9l1.5-5h15L21 9M3 9v10a1 1 0 001 1h16a1 1 0 001-1V9M3 9h18M9 20v-6h6v6",
  cart: "M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-2.3 2.3a1 1 0 00.7 1.7H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
  orders: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  ledger: "M12 6.25v13m0-13C10.83 5.48 9.25 5 7.5 5S4.17 5.48 3 6.25v13C4.17 18.48 5.75 18 7.5 18s3.33.48 4.5 1.25m0-13C13.17 5.48 14.75 5 16.5 5c1.75 0 3.33.48 4.5 1.25v13C19.83 18.48 18.25 18 16.5 18c-1.75 0-3.33.48-4.5 1.25",
  pin: "M17.66 16.66L13.41 20.9a2 2 0 01-2.82 0l-4.25-4.24a8 8 0 1111.32 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
  user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  bell: "M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  logout: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  admin: "M10.3 4.3c.4-1.7 3-1.7 3.4 0a1.7 1.7 0 002.6 1.1c1.5-.9 3.3.8 2.4 2.4a1.7 1.7 0 001.1 2.6c1.7.4 1.7 3 0 3.4a1.7 1.7 0 00-1.1 2.6c.9 1.5-.8 3.3-2.4 2.4a1.7 1.7 0 00-2.6 1.1c-.4 1.7-3 1.7-3.4 0a1.7 1.7 0 00-2.6-1.1c-1.5.9-3.3-.8-2.4-2.4a1.7 1.7 0 00-1.1-2.6c-1.7-.4-1.7-3 0-3.4a1.7 1.7 0 001.1-2.6c-.9-1.5.8-3.3 2.4-2.4.9.5 2.1 0 2.6-1.1zM15 12a3 3 0 11-6 0 3 3 0 016 0z",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7l1-8z",
};

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Scroll visibility state for mobile bottom navbar
  const [showMobileNav, setShowMobileNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Scroll listener for hide/show on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show navbar if scrolling up or near the top; hide if scrolling down past 50px
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setShowMobileNav(true);
      } else {
        setShowMobileNav(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  useEffect(() => {
    if (user?.role !== "admin") {
      return;
    }

    fetchNotifications();

    socket.on("new-order", (data) => {
      const audio = new Audio(orderSound);

      audio.play().catch((err) => console.log(err));

      toast.success(`🔔 New Order #${data.orderId} ₹${data.amount}`, {
        autoClose: 10000,
      });

      fetchNotifications();
    });

    return () => {
      socket.off("new-order");
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const clearNotifications = async () => {
    try {
      await api.delete("/notifications/clear");
      setNotifications([]);
      setShowNotifications(false);
    } catch (error) {
      console.log(error);
    }
  };

  const openNotification = async (notification) => {
    try {
      await api.delete(`/notifications/${notification.id}`);
      setNotifications(notifications.filter((n) => n.id !== notification.id));
      setShowNotifications(false);

      navigate("/admin/orders", {
        state: {
          orderId: notification.order_id,
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const desktopLinks = [
    { path: "/products", label: "Shop", icon: ICONS.shop },
    { path: "/cart", label: "Cart", icon: ICONS.cart },
    { path: "/orders", label: "Orders", icon: ICONS.orders },
    { path: "/ledger", label: "Udhaar", icon: ICONS.ledger },
    { path: "/addresses", label: "Addresses", icon: ICONS.pin },
  ];

  const mobileLinks = [
    { path: "/products", label: "Shop", icon: ICONS.shop },
    { path: "/cart", label: "Cart", icon: ICONS.cart },
    { path: "/orders", label: "Orders", icon: ICONS.orders },
    { path: "/ledger", label: "Credit", icon: ICONS.ledger },
    { path: "/profile", label: "Profile", icon: ICONS.user },
  ];

  const initial = (user?.name || "U").trim().charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 flex flex-col w-full font-sans">
      {/* ---------- Top bar ---------- */}
      <nav className="bg-white/90 backdrop-blur-xl border-b border-purple-100/80 shadow-[0_2px_16px_rgba(109,27,234,0.06)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex justify-between items-center gap-3">
          {/* Brand + location */}
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/products" className="flex items-center gap-2.5 group shrink-0">
              <div className="relative shrink-0">
                <div className="h-10 w-10 bg-white p-0.5 rounded-2xl ring-2 ring-purple-100 shadow-md shadow-purple-500/20 overflow-hidden group-hover:scale-105 transition-transform">
                  <img
                    src={logo}
                    alt="SujaMart logo"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center ring-2 ring-white">
                  <Icon d={ICONS.bolt} className="h-2.5 w-2.5" filled />
                </span>
              </div>

              <div className="flex flex-col leading-none">
                <span className="text-[19px] font-black tracking-tight text-[#3B0954]">
                  SUJA<span className="text-purple-600">MART</span>
                </span>
                <span className="mt-0.5 text-[8px] font-extrabold text-purple-600/80 uppercase tracking-[0.18em]">
                  Quick Grocery
                </span>
              </div>
            </Link>

            {/* Delivery location pill (desktop) */}
            <button
              onClick={() => navigate("/addresses")}
              className="hidden sm:flex items-center gap-2.5 bg-purple-50/70 hover:bg-purple-100/70 border border-purple-100 px-3 py-1.5 rounded-2xl ml-1 transition-all group active:scale-95"
              title="Change Delivery Address"
            >
              <span className="h-7 w-7 rounded-xl bg-white text-purple-600 flex items-center justify-center shadow-sm">
                <Icon d={ICONS.pin} className="h-4 w-4" />
              </span>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider flex items-center gap-1">
                  <Icon d={ICONS.bolt} className="h-2.5 w-2.5 text-amber-500" filled />6 mins
                </span>
                <span className="text-xs font-bold text-slate-600 truncate max-w-[130px]">
                  Home - Hanamkonda
                </span>
              </div>
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl">
            {desktopLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-150 flex items-center gap-1.5 ${
                  isActive(link.path)
                    ? "bg-white text-purple-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Icon d={link.icon} className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Mobile right side */}
          <div className="flex sm:hidden items-center gap-2">
            {user?.role === "admin" && (
              <Link
                to="/admin-panel"
                className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white flex items-center justify-center shadow-sm active:scale-95 transition"
                aria-label="Admin panel"
              >
                <Icon d={ICONS.admin} className="h-4.5 w-4.5" />
              </Link>
            )}
            <button
              onClick={() => navigate("/addresses")}
              className="flex flex-col items-end text-right bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-100 transition active:scale-95"
              title="Change Delivery Address"
            >
              <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider flex items-center gap-0.5">
                <Icon d={ICONS.bolt} className="h-2.5 w-2.5 text-amber-500" filled /> 6 mins
              </span>
              <span className="text-[11px] font-bold text-slate-600 flex items-center gap-0.5 truncate max-w-[100px]">
                <Icon d={ICONS.pin} className="h-3 w-3 shrink-0" /> Home
              </span>
            </button>
          </div>

          {/* Desktop right actions */}
          <div className="hidden sm:flex items-center gap-2">
            {user?.role === "admin" && (
              <Link
                to="/admin-panel"
                className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white px-3 py-2 rounded-xl text-[10px] font-black tracking-wider uppercase shadow-sm shadow-purple-500/30 flex items-center gap-1.5 active:scale-95 transition"
              >
                <Icon d={ICONS.admin} className="h-3.5 w-3.5" />
                <span>Admin</span>
              </Link>
            )}

            {/* Admin notification bell */}
            {user?.role === "admin" && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition relative"
                  aria-label="Notifications"
                >
                  <Icon d={ICONS.bell} />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-12 bg-white border border-slate-200/80 shadow-2xl shadow-purple-900/10 rounded-2xl w-80 p-4 z-50 text-slate-800">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <span className="font-extrabold text-xs uppercase tracking-wider text-slate-500">
                        Notifications ({notifications.length})
                      </span>
                    </div>

                    {notifications.length === 0 ? (
                      <p className="text-xs font-bold text-slate-400 text-center py-4">
                        No new notifications
                      </p>
                    ) : (
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => openNotification(n)}
                            className="p-2.5 bg-slate-50 hover:bg-purple-50 rounded-xl cursor-pointer border border-slate-100 transition"
                          >
                            <h3 className="font-extrabold text-xs text-slate-800">{n.title}</h3>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                              {n.message}
                            </p>
                          </div>
                        ))}

                        <button
                          onClick={clearNotifications}
                          className="mt-2 w-full bg-rose-500 hover:bg-rose-600 text-white py-2 rounded-xl text-xs font-extrabold transition"
                        >
                          Clear Notifications
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Profile */}
            <Link
              to="/profile"
              className="flex items-center gap-2 bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition pl-1.5 pr-3 py-1.5 rounded-full text-xs font-extrabold text-slate-700"
            >
              <span className="h-7 w-7 rounded-full bg-gradient-to-br from-[#7A22FD] to-[#D119A5] text-white text-xs font-black flex items-center justify-center">
                {initial}
              </span>
              <span className="max-w-[90px] truncate">{user?.name || "User"}</span>
            </Link>

            <button
              onClick={logout}
              className="h-10 w-10 flex items-center justify-center text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition active:scale-95 border border-rose-100"
              title="Logout"
              aria-label="Logout"
            >
              <Icon d={ICONS.logout} className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </nav>

      {/* ---------- Mobile bottom navigation (hides on scroll down) ---------- */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-2 pt-1 transition-transform duration-300 ease-in-out ${
          showMobileNav ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-xl border border-purple-100 rounded-3xl shadow-[0_8px_30px_rgba(109,27,234,0.18)] px-2 py-1.5">
          <div className="flex justify-around items-center">
            {mobileLinks.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-[56px] transition-all"
                >
                  <span
                    className={`flex items-center justify-center h-8 w-12 rounded-2xl transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-r from-[#7A22FD] to-[#B318B0] text-white shadow-md shadow-purple-500/30"
                        : "text-slate-400"
                    }`}
                  >
                    <Icon d={item.icon} className="h-5 w-5" />
                  </span>
                  <span
                    className={`text-[10px] ${
                      active ? "font-black text-purple-700" : "font-semibold text-slate-400"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;