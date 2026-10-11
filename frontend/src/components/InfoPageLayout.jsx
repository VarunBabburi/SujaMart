// Put this file at: src/components/InfoPageLayout.jsx
// Shared shell for About, Contact, Support, FAQs, Privacy and Terms pages.
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Icon, ICONS } from "./Icon";
import { INFO_LINKS } from "../constants/appInfo";

function InfoPageLayout({ title, subtitle, iconKey = "info", children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const otherLinks = INFO_LINKS.filter((l) => l.path !== location.pathname);

  return (
    <div className="min-h-screen bg-[#F5F3FF] font-sans text-slate-900 antialiased">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-4 sm:pt-6 pb-32 md:pb-10">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-slate-600 hover:text-slate-900 transition mb-3"
        >
          <span className="h-8 w-8 rounded-full bg-white border border-purple-100 flex items-center justify-center shadow-sm">
            <Icon d={ICONS.back} className="h-4 w-4" sw={2.6} />
          </span>
          Back
        </button>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6D1BEA] via-[#B318B0] to-[#FF4E6B] text-white p-5 sm:p-8 shadow-xl shadow-purple-500/20 mb-5">
          <div className="absolute -top-10 -right-8 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-14 left-24 h-36 w-36 rounded-full bg-white/10" />
          <div className="relative flex items-center gap-4">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/25 flex items-center justify-center shrink-0">
              <Icon d={ICONS[iconKey]} className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">{title}</h1>
              {subtitle && (
                <p className="mt-1 text-xs sm:text-sm font-semibold text-white/85 max-w-xl">{subtitle}</p>
              )}
            </div>
          </div>
        </div>

        {children}

        {/* Mobile only: quick links to the other info pages */}
        <section className="md:hidden mt-6 bg-white rounded-3xl border border-purple-100/70 shadow-[0_2px_16px_rgba(76,29,149,0.05)] overflow-hidden">
          <p className="px-4 pt-4 pb-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
            More help &amp; info
          </p>
          <ul className="divide-y divide-slate-100">
            {otherLinks.map((l) => (
              <li key={l.path}>
                <Link to={l.path} className="flex items-center gap-3 px-4 py-3.5 active:bg-purple-50 transition">
                  <span className="h-9 w-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Icon d={ICONS[l.iconKey]} className="h-[18px] w-[18px]" />
                  </span>
                  <span className="flex-1 text-[14px] font-bold">{l.label}</span>
                  <Icon d={ICONS.chevron} className="h-4 w-4 text-slate-300" sw={2.6} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default InfoPageLayout;