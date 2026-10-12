// Put this file at: src/pages/AboutUs.jsx
import { Link } from "react-router-dom";
import InfoPageLayout from "../components/InfoPageLayout";
import { Icon, ICONS } from "../components/Icon";
import { APP_INFO } from "../constants/appInfo";

const STATS = [
  { value: "10 min", label: "Delivery target" },
  { value: "₹0", label: "Delivery fee" },
  { value: "₹99", label: "Minimum basket" },
];

const VALUES = [
  {
    icon: ICONS.bolt,
    title: "Lightning fast",
    text: "We pack and dispatch in minutes, so your essentials reach you while you still need them.",
    tone: "bg-amber-100 text-amber-700",
  },
  {
    icon: ICONS.sparkles,
    title: "Fresh & quality",
    text: "Fruits, vegetables and daily needs are picked with care before they leave our store.",
    tone: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: ICONS.tag,
    title: "Fair prices",
    text: "Everyday prices with free delivery and no hidden platform fees.",
    tone: "bg-sky-100 text-sky-700",
  },
  {
    icon: ICONS.heart,
    title: "Local & caring",
    text: "We are a neighbourhood store at heart, and we treat every customer like family.",
    tone: "bg-rose-100 text-rose-700",
  },
];

const STEPS = [
  { n: 1, title: "Browse", text: "Pick from fresh produce, staples, snacks and more." },
  { n: 2, title: "Order", text: "Add to cart, choose your address and pay your way." },
  { n: 3, title: "Delivered", text: "Track your order live until it arrives at your door." },
];

const OWNER = APP_INFO.owner || "Varun Babburi";
const OWNER_TITLE = APP_INFO.ownerTitle || "Founder & Owner";
const OWNER_INITIALS = OWNER.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

const card =
  "bg-white rounded-3xl border border-purple-100/70 shadow-[0_2px_16px_rgba(76,29,149,0.05)]";

function AboutUs() {
  return (
    <InfoPageLayout
      iconKey="info"
      title="About us"
      subtitle={`${APP_INFO.name} is your neighbourhood quick-grocery store, now in your pocket.`}
    >
      <div className="space-y-4">

         {/* Founder */}
        <section className={`${card} p-5 sm:p-6`}>
          <h2 className="text-lg font-extrabold tracking-tight mb-4">Meet the founder</h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-[#7A22FD] via-[#B318B0] to-[#FF4E6B] text-white text-2xl font-black flex items-center justify-center shadow-lg shadow-purple-500/25 shrink-0">
              {OWNER_INITIALS}
            </div>
            <div className="flex-1">
              <p className="text-xl font-black tracking-tight">{OWNER}</p>
              <p className="text-[12px] font-black uppercase tracking-wider text-purple-700 mt-0.5">
                {OWNER_TITLE}, {APP_INFO.name}
              </p>
              <p className="text-sm leading-relaxed text-slate-600 font-medium mt-2.5">
                {APP_INFO.name} is built and run by {OWNER} in {APP_INFO.address.split(",").slice(-3, -1).join(",").trim() || "Telangana"}.
                Every order, every product and every support request is handled with one goal: groceries
                that arrive fast, fresh and fairly priced. If something is not right, you can reach the
                owner directly.
              </p>
              <div className="mt-3.5 flex flex-wrap gap-2">
                <a
                  href={`mailto:${APP_INFO.email}`}
                  className="px-4 py-2 rounded-xl bg-purple-50 border border-purple-100 text-purple-700 text-[12px] font-black active:scale-95 transition"
                >
                  Email {OWNER.split(" ")[0]}
                </a>
                <a
                  href={`https://wa.me/${APP_INFO.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-[12px] font-black active:scale-95 transition"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className={`${card} p-5 sm:p-6`}>
          <h2 className="text-lg font-extrabold tracking-tight mb-2">Our story</h2>
          <p className="text-sm leading-relaxed text-slate-600 font-medium">
            {APP_INFO.name} started with a simple idea: groceries should reach your door in minutes, not
            hours. We combine the trust of a local store with the speed and ease of a modern delivery app,
            so you can skip the queues and the trips and spend your time on what matters.
          </p>
          <p className="text-sm leading-relaxed text-slate-600 font-medium mt-3">
            From daily staples to fresh fruits and vegetables, snacks and household items, we keep our
            shelves stocked and our delivery fast, with fair prices and honest service every day.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2.5">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-2xl bg-purple-50 border border-purple-100 py-3.5 text-center">
                <div className="text-xl sm:text-2xl font-black text-purple-700 leading-none">{s.value}</div>
                <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500 mt-1.5">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section>
          <h2 className="text-lg font-extrabold tracking-tight mb-3 px-1">What we stand for</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {VALUES.map((v) => (
              <div key={v.title} className={`${card} p-4 flex items-start gap-3.5`}>
                <span className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${v.tone}`}>
                  <Icon d={v.icon} className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-[15px] font-extrabold">{v.title}</h3>
                  <p className="text-[13px] leading-relaxed text-slate-500 font-medium mt-1">{v.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className={`${card} p-5 sm:p-6`}>
          <h2 className="text-lg font-extrabold tracking-tight mb-4">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {STEPS.map((s) => (
              <div key={s.n} className="flex sm:flex-col items-start gap-3.5 sm:gap-2.5">
                <span className="h-10 w-10 rounded-full bg-gradient-to-br from-[#7A22FD] to-[#B318B0] text-white font-black flex items-center justify-center shrink-0 shadow-md shadow-purple-500/25">
                  {s.n}
                </span>
                <div>
                  <h3 className="text-[15px] font-extrabold">{s.title}</h3>
                  <p className="text-[13px] leading-relaxed text-slate-500 font-medium mt-0.5">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-3xl bg-slate-900 text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight">Questions or feedback?</h2>
            <p className="text-sm text-slate-400 font-medium mt-0.5">We would love to hear from you.</p>
          </div>
          <div className="flex gap-2.5">
            <Link
              to="/contact"
              className="px-5 py-3 rounded-xl bg-white text-slate-900 text-[13px] font-black active:scale-95 transition"
            >
              Contact us
            </Link>
            <Link
              to="/products"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#7A22FD] to-[#B318B0] text-white text-[13px] font-black active:scale-95 transition"
            >
              Start shopping
            </Link>
          </div>
        </section>
      </div>
    </InfoPageLayout>
  );
}

export default AboutUs;