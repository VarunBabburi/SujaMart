import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Icon, ICONS } from "../components/Icon";
import { INFO_LINKS } from "../constants/appInfo";
import { toast } from "react-toastify";

const card =
  "bg-white rounded-3xl border border-purple-100/70 shadow-[0_2px_16px_rgba(76,29,149,0.05)]";

const inputCls =
  "w-full border border-slate-200 bg-white rounded-xl px-3.5 py-3 text-[14px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition";

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user")) || {};
      return {
        name: storedUser.name || "",
        email: storedUser.email || "",
        phone: storedUser.phone || "",
        address: storedUser.address || "",
      };
    } catch (e) {
      return { name: "", email: "", phone: "", address: "" };
    }
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile((prev) => ({
        ...prev,
        ...res.data,
        // Fallback to local storage if API field is null/empty
        name: res.data.name || prev.name,
      }));
    } catch (error) {
      console.log("Failed to fetch profile:", error);
    }
  };

  const updateProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        "/user/profile",
        {
          name: profile.name,
          address: profile.address,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let user = {};
      try {
        user = JSON.parse(localStorage.getItem("user")) || {};
      } catch (e) {
        user = {};
      }

      const updatedUser = {
        ...user,
        name: profile.name,
        address: profile.address,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Profile Updated Successfully");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message ||
        "Update Failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const initial = (profile.name || "U").trim().charAt(0).toUpperCase();

  const shortcuts = [
    { to: "/orders", label: "Orders", icon: ICONS.box, tone: "bg-purple-100 text-purple-700" },
    { to: "/addresses", label: "Addresses", icon: ICONS.pin, tone: "bg-orange-100 text-orange-700" },
    { to: "/ledger", label: "Credit", icon: ICONS.book, tone: "bg-sky-100 text-sky-700" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F3FF] font-sans text-slate-900 antialiased">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 pt-4 sm:pt-6 pb-32 md:pb-10 space-y-4">
        {/* Header card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6D1BEA] via-[#B318B0] to-[#FF4E6B] text-white p-5 sm:p-6 shadow-xl shadow-purple-500/20">
          <div className="absolute -top-10 -right-8 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-14 left-24 h-36 w-36 rounded-full bg-white/10" />

          <div className="relative flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white text-purple-700 text-2xl font-black flex items-center justify-center shadow-lg shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight truncate">
                {profile.name || "Add your name"}
              </h1>
              <p className="text-xs sm:text-sm text-white/85 font-semibold truncate">
                {profile.phone || profile.email || "Welcome to SujaMart"}
              </p>
            </div>
          </div>
        </div>

        {/* Shortcuts */}
        <div className="grid grid-cols-3 gap-2.5">
          {shortcuts.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className={`${card} py-4 flex flex-col items-center gap-2 hover:shadow-lg hover:shadow-purple-500/10 active:scale-95 transition-all`}
            >
              <span className={`h-11 w-11 rounded-2xl flex items-center justify-center ${s.tone}`}>
                <Icon d={s.icon} className="h-5 w-5" />
              </span>
              <span className="text-[13px] font-extrabold">{s.label}</span>
            </Link>
          ))}
        </div>

        {/* Details form */}
        <section className={`${card} p-5`}>
          <h2 className="text-[15px] font-extrabold tracking-tight mb-4">Personal details</h2>

          <div className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Name
              </label>
              <input
                className={inputCls}
                value={profile.name || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    name: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Email
              </label>
              <input
                className={`${inputCls} bg-slate-50 text-slate-500`}
                value={profile.email || ""}
                readOnly
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Phone
              </label>
              <input
                className={`${inputCls} bg-slate-50 text-slate-500`}
                value={profile.phone || ""}
                readOnly
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Address
              </label>
              <textarea
                className={`${inputCls} resize-none`}
                rows="4"
                value={profile.address}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    address: e.target.value,
                  })
                }
              />
            </div>

            <button
              onClick={updateProfile}
              className="w-full bg-gradient-to-r from-[#7A22FD] via-[#B318B0] to-[#FF4E6B] text-white font-black py-3.5 rounded-xl text-[14px] shadow-lg shadow-purple-500/25 active:scale-[0.98] transition"
            >
              Save changes
            </button>
          </div>
        </section>

        {/* Help & info (this is where the info pages live on mobile) */}
        <section className={`${card} overflow-hidden`}>
          <p className="px-5 pt-5 pb-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
            Help &amp; information
          </p>
          <ul className="divide-y divide-slate-100">
            {INFO_LINKS.map((l) => (
              <li key={l.path}>
                <Link
                  to={l.path}
                  className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-purple-50/60 active:bg-purple-50 transition"
                >
                  <span className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Icon d={ICONS[l.iconKey]} className="h-5 w-5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-extrabold">{l.label}</p>
                    <p className="text-[12px] text-slate-400 font-medium truncate">{l.desc}</p>
                  </div>
                  <Icon d={ICONS.chevron} className="h-4 w-4 text-slate-300" sw={2.6} />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 font-black text-[14px] py-3.5 rounded-2xl transition active:scale-[0.98]"
        >
          <Icon d={ICONS.logout} className="h-[18px] w-[18px]" />
          Logout
        </button>

        <p className="text-center text-[11px] font-semibold text-slate-400 pt-1">SujaMart · Quick Grocery</p>
      </main>

      <Footer />
    </div>
  );
}

export default Profile;