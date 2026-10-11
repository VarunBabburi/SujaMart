// Put this file at: src/pages/CustomerSupport.jsx
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import InfoPageLayout from "../components/InfoPageLayout";
import { Icon, ICONS } from "../components/Icon";
import { APP_INFO } from "../constants/appInfo";

const card =
  "bg-white rounded-3xl border border-purple-100/70 shadow-[0_2px_16px_rgba(76,29,149,0.05)]";

const inputCls =
  "w-full border border-slate-200 bg-white rounded-xl px-3.5 py-3 text-[13px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition";

const TOPICS = [
  { id: "order", label: "Order issue", hint: "Missing, wrong or damaged items", icon: ICONS.box, tone: "bg-purple-100 text-purple-700" },
  { id: "delivery", label: "Delivery", hint: "Late or not delivered", icon: ICONS.truck, tone: "bg-emerald-100 text-emerald-700" },
  { id: "payment", label: "Payment & refunds", hint: "Deductions, failed payments", icon: ICONS.card, tone: "bg-sky-100 text-sky-700" },
  { id: "quality", label: "Product quality", hint: "Fresh produce and packaging", icon: ICONS.sparkles, tone: "bg-amber-100 text-amber-700" },
  { id: "account", label: "Account & profile", hint: "Login, address, details", icon: ICONS.user, tone: "bg-rose-100 text-rose-700" },
  { id: "udhaar", label: "Udhaar (credit)", hint: "Ledger and dues", icon: ICONS.book, tone: "bg-orange-100 text-orange-700" },
];

function CustomerSupport() {
  const formRef = useRef(null);
  const [category, setCategory] = useState("");
  const [orderId, setOrderId] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [ticketRef, setTicketRef] = useState(null);

  const pickTopic = (id) => {
    setCategory(id);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submitTicket = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      toast.info("Please log in to raise a support request. You can also use Contact Us.");
      return;
    }
    if (!category) return toast.error("Please choose a topic");
    if (message.trim().length < 10) return toast.error("Please describe your issue in a few words");

    setSending(true);
    try {
      // TODO (backend step): create POST /support/tickets
      const res = await api.post(
        "/support/tickets",
        { category, order_id: orderId.trim() || null, message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTicketRef(res.data?.ticketId ?? "submitted");
      setCategory("");
      setOrderId("");
      setMessage("");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Could not submit your request. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <InfoPageLayout
      iconKey="lifebuoy"
      title="Customer support"
      subtitle="Tell us what went wrong and we will make it right."
    >
      <div className="space-y-4">
        {/* Quick contact */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: "Call", icon: ICONS.phone, href: `tel:${APP_INFO.phoneLink}`, tone: "bg-emerald-100 text-emerald-700" },
            { label: "WhatsApp", icon: ICONS.chat, href: `https://wa.me/${APP_INFO.whatsapp}`, tone: "bg-green-100 text-green-700" },
            { label: "Email", icon: ICONS.mail, href: `mailto:${APP_INFO.email}`, tone: "bg-sky-100 text-sky-700" },
          ].map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className={`${card} py-4 flex flex-col items-center gap-2 hover:shadow-lg hover:shadow-purple-500/10 active:scale-95 transition-all`}
            >
              <span className={`h-11 w-11 rounded-2xl flex items-center justify-center ${c.tone}`}>
                <Icon d={c.icon} className="h-5 w-5" />
              </span>
              <span className="text-[13px] font-extrabold">{c.label}</span>
            </a>
          ))}
        </div>

        {/* Topics */}
        <section>
          <h2 className="text-lg font-extrabold tracking-tight mb-3 px-1">What do you need help with?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {TOPICS.map((t) => {
              const active = category === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => pickTopic(t.id)}
                  className={`text-left rounded-3xl border-2 p-4 transition-all active:scale-[0.98] ${
                    active
                      ? "border-purple-600 bg-purple-50 shadow-md shadow-purple-500/15"
                      : "border-purple-100/70 bg-white hover:border-purple-300"
                  }`}
                >
                  <span className={`h-10 w-10 rounded-xl flex items-center justify-center ${t.tone}`}>
                    <Icon d={t.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="text-[14px] font-extrabold mt-3 leading-tight">{t.label}</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">{t.hint}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Request form */}
        <section ref={formRef} className={`${card} p-5 sm:p-6 scroll-mt-24`}>
          {ticketRef ? (
            <div className="text-center py-8">
              <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <Icon d={ICONS.check} className="h-8 w-8" sw={3} />
              </div>
              <h2 className="text-xl font-black tracking-tight">Request received</h2>
              {ticketRef !== "submitted" && (
                <p className="mt-1 text-sm font-bold text-purple-700">Reference: #{ticketRef}</p>
              )}
              <p className="text-sm text-slate-500 font-medium mt-1.5 max-w-xs mx-auto">
                Our team will review it and get back to you soon. Most requests are answered within 24 hours.
              </p>
              <div className="mt-5 flex justify-center gap-2.5">
                <button
                  onClick={() => setTicketRef(null)}
                  className="px-5 py-2.5 rounded-xl bg-purple-50 border border-purple-100 text-purple-700 text-[13px] font-black active:scale-95 transition"
                >
                  New request
                </button>
                <Link
                  to="/orders"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-[13px] font-black active:scale-95 transition"
                >
                  My orders
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={submitTicket} className="space-y-3.5">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight">Raise a request</h2>
                <p className="text-[13px] text-slate-500 font-medium mt-0.5">
                  Not logged in? Use{" "}
                  <Link to="/contact" className="font-bold text-purple-700 underline underline-offset-2">
                    Contact Us
                  </Link>{" "}
                  instead.
                </p>
              </div>

              {/* Topic chips */}
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setCategory(t.id)}
                    className={`px-3.5 py-2 rounded-full text-xs font-black border transition active:scale-95 ${
                      category === t.id
                        ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-600/25"
                        : "bg-white border-slate-200 text-slate-600 hover:border-purple-300"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <input
                placeholder="Order ID (optional)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className={inputCls}
                inputMode="numeric"
              />

              <textarea
                rows="5"
                placeholder="Describe your issue *"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`${inputCls} resize-none`}
              />

              <button
                type="submit"
                disabled={sending}
                className="w-full bg-gradient-to-r from-[#7A22FD] via-[#B318B0] to-[#FF4E6B] text-white font-black py-3.5 rounded-xl text-[14px] shadow-lg shadow-purple-500/25 active:scale-[0.98] transition disabled:opacity-60 disabled:pointer-events-none"
              >
                {sending ? "Submitting..." : "Submit request"}
              </button>
            </form>
          )}
        </section>

        {/* FAQ nudge */}
        <Link
          to="/faqs"
          className={`${card} p-4 flex items-center gap-3.5 hover:shadow-lg hover:shadow-purple-500/10 transition-all active:scale-[0.99]`}
        >
          <span className="h-11 w-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Icon d={ICONS.help} className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-[14px] font-extrabold">Looking for a quick answer?</p>
            <p className="text-xs text-slate-500 font-medium">Check our frequently asked questions.</p>
          </div>
          <Icon d={ICONS.chevron} className="h-4 w-4 text-slate-300" sw={2.6} />
        </Link>
      </div>
    </InfoPageLayout>
  );
}

export default CustomerSupport;