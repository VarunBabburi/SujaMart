import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import socket from "../socket";
import api from "../services/api";
import { toast } from "react-toastify";
import orderSound from "../assets/order.mp3";
import { useLocation } from "react-router-dom";
import logo from '../assets/logo.png';



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
      setNotifications(
        notifications.filter((n) => n.id !== notification.id)
      );
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

  return (
    <header className="sticky top-0 z-50 flex flex-col w-full font-sans">
      {/* Primary Top Navbar */}
      <nav className="bg-[#F4F6FB]/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex justify-between items-center gap-4">
          {/* Brand Logo & Location (Blinkit / Zepto Style) */}
          <div className="flex items-center gap-3">
            {/* <Link to="/products" className="flex items-center gap-2 group">
              <div className="h-10 w-10 bg-gradient-to-tr from-[#7A22FD] to-[#D119A5] text-white font-black text-lg rounded-2xl flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                ⚡
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-extrabold tracking-tight text-[#0f172a]">
                  Suja<span className="text-[#a855f7]">Mart</span>
                </span>
                <span className="text-[9px] font-black text-purple-600 uppercase tracking-widest">
                  Quick Grocery
                </span>
              </div>
            </Link> */}



            {/* <Link to="/products" className="flex items-center group">
    <img 
      src={logo}
      alt="SujaMart Quick Grocery Logo" 
      className="h-12 w-auto object-contain group-hover:scale-105 transition-transform" 
    />
  </Link> */}


  <Link to="/products" className="flex items-center gap-2 group">
  {/* Left Icon Badge */}
 {/* Left Icon Badge with Logo Image */}
{/* Left Icon Badge - Sticker Style */}
<div className="relative shrink-0 flex items-center justify-center filter drop-shadow-[0_2px_4px_rgba(107,33,168,0.25)] group-hover:scale-105 transition-transform">
  {/* White Sticker Border Wrapper */}
  <div className="h-10 w-10 bg-white p-0.5 rounded-2xl ring-2 ring-purple-100 flex items-center justify-center overflow-hidden">
    <img 
      src="/logo.png" 
      alt="SujaMart Sticker Logo" 
      className="w-full h-full object-cover rounded-xl"
    />
  </div>

  {/* Optional Subtle Badge Glow */}
  <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 text-[7px] text-white font-black items-center justify-center">⚡</span>
  </span>
</div>

  {/* Right Typography */}
  <div className="flex flex-col leading-tight">
    <span className="text-lg font-black tracking-tight text-[#3B0954] flex items-center gap-0.5">
      SUJAMART
    </span>
    <span className="text-[8px] font-extrabold text-[#7e22ce] uppercase tracking-wider">
      QUICK GROCERY
    </span>
  </div>
</Link>



            {/* Delivery Location Pill (Desktop) */}
            <button
              onClick={() => navigate("/addresses")}
              className="hidden sm:flex items-center gap-2 bg-white hover:bg-purple-50/60 border border-slate-200/80 hover:border-purple-300 px-3 py-1.5 rounded-2xl shadow-xs ml-2 transition-all cursor-pointer group active:scale-95"
              title="Change Delivery Address"
            >
              <span className="text-amber-500 text-xs">⚡</span>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[10px] font-black text-[#0f172a] uppercase tracking-wider">
                  6 MINS TO
                </span>
                <span className="text-xs font-bold text-slate-500 truncate max-w-[120px]">
                  📍 Home - Hanamkonda
                </span>
              </div>
            </button>
          </div>

          {/* Mobile Specific Header Sub-Text */}
          <button
            onClick={() => navigate("/addresses")}
            className="flex sm:hidden flex-col items-end text-right bg-white/60 hover:bg-purple-50/80 px-2.5 py-1 rounded-xl border border-slate-200/60 transition active:scale-95 cursor-pointer"
            title="Change Delivery Address"
          >
            <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider flex items-center gap-1">
              <span className="text-amber-500">⚡</span> 6 MINS
            </span>
            <span className="text-[11px] font-bold text-slate-600 truncate max-w-[110px]">
              📍 Home
            </span>
          </button>

          {/* Clean Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 bg-white/80 border border-slate-200/80 p-1 rounded-2xl shadow-xs">
            {[
              { path: "/products", label: "Products", icon: "🛒" },
              { path: "/cart", label: "Cart", icon: "🛍️" },
              { path: "/orders", label: "Orders", icon: "📦" },
              { path: "/ledger", label: "Udhaar", icon: "📖" },
              { path: "/addresses", label: "Addresses", icon: "📍" },
            ].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-150 flex items-center gap-1.5 ${
                  isActive(link.path)
                    ? "bg-gradient-to-r from-[#7A22FD] to-[#a855f7] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
                }`}
              >
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Actions Profile & Logout */}
          <div className="hidden sm:flex items-center gap-2.5">
            <Link
              to="/profile"
              className="flex items-center gap-2 bg-white border border-slate-200/80 hover:bg-slate-50 transition px-3 py-1.5 rounded-xl text-xs font-extrabold text-slate-700 shadow-xs"
            >
              <span>👋 {user?.name || "User"}</span>
              {user?.role === "admin" && (
                <span className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white px-1.5 py-0.5 rounded-md text-[9px] font-black tracking-widest uppercase shadow-xs">
                  Admin
                </span>
              )}
            </Link>

            {/* Admin Notification Bell */}
            {user?.role === "admin" && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="w-9 h-9 bg-white border border-slate-200/80 rounded-xl flex items-center justify-center text-lg hover:bg-slate-50 transition shadow-xs relative"
                >
                  🔔
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-12 bg-white border border-slate-200/80 shadow-2xl rounded-2xl w-80 p-4 z-50 text-slate-800">
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
                            className="p-2.5 bg-slate-50 hover:bg-purple-50/60 rounded-xl cursor-pointer border border-slate-100 transition"
                          >
                            <h3 className="font-extrabold text-xs text-slate-800">
                              {n.title}
                            </h3>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                              {n.message}
                            </p>
                          </div>
                        ))}

                        <button
                          onClick={clearNotifications}
                          className="mt-2 w-full bg-rose-500 hover:bg-rose-600 text-white py-2 rounded-xl text-xs font-extrabold transition shadow-xs"
                        >
                          Clear Notifications
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={logout}
              className="text-xs font-black uppercase tracking-wider text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 px-3 py-2 rounded-xl transition active:scale-95 border border-rose-100 shadow-xs"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Admin Console Navigation Sub-Bar */}
      {user?.role === "admin" && (
        <div className="bg-[#0f172a] text-slate-300 border-b border-slate-800 shadow-inner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center overflow-x-auto gap-1 scrollbar-none">
            <div className="text-[9px] font-black uppercase tracking-widest text-purple-400 bg-purple-950/60 border border-purple-800/50 px-2 py-1 rounded-md mr-2 shrink-0">
              Admin Panel
            </div>

            {[
              { path: "/admin", label: "Dashboard" },
              { path: "/admin/orders", label: "Customer Orders" },
              { path: "/admin/products", label: "Products" },
              { path: "/admin/credit", label: "Credit" },
              { path: "/admin/categories", label: "Categories" },
              { path: "/admin/customers", label: "Customers" },
              { path: "/admin/payments", label: "Payments" },
            ].map((adminLink) => (
              <Link
                key={adminLink.path}
                to={adminLink.path}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold tracking-wide shrink-0 transition-all ${
                  isActive(adminLink.path)
                    ? "text-white bg-purple-600 shadow-xs"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {adminLink.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Bottom Quick Navigation Bar (Smooth Hide on Scroll Down, Show on Scroll Up) */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-50 py-2 px-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transition-transform duration-300 ease-in-out ${
          showMobileNav ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex justify-around items-center">
          {[
            { path: "/products", label: "Shop", icon: "🛒" },
            { path: "/cart", label: "Cart", icon: "🛍️" },
            { path: "/orders", label: "Orders", icon: "📦" },
            { path: "/ledger", label: "Udhaar", icon: "📖" },
            { path: "/profile", label: "Profile", icon: "👤" },
          ].map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
                  active
                    ? "text-[#7A22FD]"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                <span
                  className={`text-[10px] ${
                    active ? "font-black" : "font-semibold"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}

export default Navbar;