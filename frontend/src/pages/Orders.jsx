import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import socket from "../socket";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
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
      alert("Invoice Download Failed");
    }
  };

  // const getRemainingTime = (order) => {
  //   if (!order.delivery_assigned_at || !order.delivery_time) {
  //     return null;
  //   }
  //   const assigned = new Date(order.delivery_assigned_at).getTime();
  //   const endTime = assigned + Number(order.delivery_time) * 60 * 1000;
  //   const now = new Date().getTime();
  //   const diff = endTime - now;

  //   if (diff <= 0) {  
  //     return "Arriving soon";
  //   }
  //   const minutes = Math.floor(diff / 60000);
  //   const seconds = Math.floor((diff % 60000) / 1000);
  //   return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  // };


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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-32 px-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-lg font-semibold text-slate-600 tracking-wide animate-pulse">
            Fetching your orders...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Orders
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track and manage your recent purchases
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm text-slate-600 hidden sm:block">
            {orders.length} {orders.length === 1 ? "Order" : "Orders"} Total
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm max-w-md mx-auto mt-12 transition-all hover:shadow-md">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <span className="text-3xl">📦</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">No Orders Found</h2>
            <p className="text-slate-500 text-sm mb-6">
              Looks like you haven't placed any orders yet. Start exploring your favorite items!
            </p>
            <button 
              onClick={() => navigate("/")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-98"
            >
              Shop Now
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 group"
              >
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                        Order Id {order.id}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(order.order_status)}`}>
                        {order.order_status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      {new Date(order.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1 sm:text-right">
                    <span className="text-xs text-slate-400 font-medium self-center mr-1">Total:</span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      ₹{order.total_amount}
                    </h2>
                  </div>
                </div>

                {/* Live Delivery Info Widget */}
                {order.order_status?.toLowerCase() === "out for delivery" && (
                  <div className="mt-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-inner text-lg">
                        🚚
                      </div>
                      <div>
                        <h4 className="font-bold text-emerald-900 text-sm sm:text-base">
                          Your order is on the way!
                        </h4>
                        <p className="text-xs text-emerald-700 font-medium mt-0.5">
                          Rider: <span className="font-bold text-emerald-900">👦 {order.delivery_boy || "Assigned"}</span>
                        </p>
                      </div>
                    </div>
                    <div className="w-full sm:w-auto bg-white/80 backdrop-blur-sm border border-emerald-200/60 px-4 py-2 rounded-xl text-center shadow-sm">
                      <span className="block text-[10px] font-bold text-emerald-600 tracking-wider uppercase">Arriving In</span>
                      <span key={tick} className="text-xl font-black text-emerald-600 font-mono tracking-tight">
                        ⏱ {getRemainingTime(order)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Footer Buttons Section */}
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-all active:scale-98"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => downloadInvoice(order.id)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 active:scale-98"
                  >
                    <span>📄</span> Download Invoice
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
