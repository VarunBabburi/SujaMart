// Put this file at: src/pages/ContactUs.jsx
import { useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import InfoPageLayout from "../components/InfoPageLayout";
import { Icon, ICONS } from "../components/Icon";
import { APP_INFO } from "../constants/appInfo";

const card =
  "bg-white rounded-3xl border border-purple-100/70 shadow-[0_2px_16px_rgba(76,29,149,0.05)]";

const inputCls =
  "w-full border border-slate-200 bg-white rounded-xl px-3.5 py-3 text-[13px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition";

function ContactUs() {
  // Pre-fill from the logged-in user, if any
  const [form, setForm] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user")) || {};
      return { name: u.name || "", email: u.email || "", phone: u.phone || "", message: "" };
    } catch (e) {
      return { name: "", email: "", phone: "", message: "" };
    }
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const contactCards = [
    {
      icon: ICONS.phone,
      label: "Call us",
      value: APP_INFO.phone,
      href: `tel:${APP_INFO.phoneLink}`,
      tone: "bg-emerald-100 text-emerald-700",
    },
    {
      icon: ICONS.chat,
      label: "WhatsApp",
      value: "Chat with us",
      href: `https://wa.me/${APP_INFO.whatsapp}`,
      tone: "bg-green-100 text-green-700",
    },
    {
      icon: ICONS.mail,
      label: "Email",
      value: APP_INFO.email,
      href: `mailto:${APP_INFO.email}`,
      tone: "bg-sky-100 text-sky-700",
    },
    {
      icon: ICONS.pin,
      label: "Visit us",
      value: APP_INFO.address,
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(APP_INFO.address)}`,
      tone: "bg-orange-100 text-orange-700",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) return toast.error("Please enter your name");
    if (!form.email.trim() && !form.phone.trim()) {
      return toast.error("Please enter an email or phone number so we can reach you");
    }
    if (form.message.trim().length < 10) {
      return toast.error("Please write a few more words in your message");
    }

    setSending(true);
    try {
      const token = localStorage.getItem("token");
      // TODO (backend step): create POST /support/contact
      await api.post(
        "/support/contact",
        form,
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      );
      setSent(true);
      setForm({ ...form, message: "" });
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Could not send your message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <InfoPageLayout
      iconKey="mail"
      title="Contact us"
      subtitle="We are here to help. Reach out and we will get back to you quickly."
    >
      <div className="lg:grid lg:grid-cols-[1fr_1.15fr] lg:gap-5 lg:items-start space-y-4 lg:space-y-0">
        {/* Contact options */}
        <div className="space-y-3">
          {contactCards.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className={`${card} p-4 flex items-center gap-3.5 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-0.5 active:scale-[0.99] transition-all`}
            >
              <span className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${c.tone}`}>
                <Icon d={c.icon} className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">{c.label}</p>
                <p className="text-[14px] font-extrabold truncate">{c.value}</p>
              </div>
              <Icon d={ICONS.chevron} className="h-4 w-4 text-slate-300 shrink-0" sw={2.6} />
            </a>
          ))}

          <div className={`${card} p-4 flex items-center gap-3.5`}>
            <span className="h-12 w-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Icon d={ICONS.clock} className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Support hours</p>
              <p className="text-[14px] font-extrabold">{APP_INFO.hours}</p>
            </div>
          </div>
        </div>

        {/* Message form */}
        <section className={`${card} p-5 sm:p-6`}>
          {sent ? (
            <div className="text-center py-8">
              <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <Icon d={ICONS.check} className="h-8 w-8" sw={3} />
              </div>
              <h2 className="text-xl font-black tracking-tight">Message sent!</h2>
              <p className="text-sm text-slate-500 font-medium mt-1.5 max-w-xs mx-auto">
                Thanks for reaching out. Our team will get back to you within 24 hours.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-5 px-5 py-2.5 rounded-xl bg-purple-50 border border-purple-100 text-purple-700 text-[13px] font-black active:scale-95 transition"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <h2 className="text-lg font-extrabold tracking-tight">Send us a message</h2>
                <p className="text-[13px] text-slate-500 font-medium mt-0.5">
                  Fill in the form and we will reply by email or phone.
                </p>
              </div>

              <input
                placeholder="Your name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputCls}
              />

              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputCls}
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={inputCls}
                />
              </div>

              <textarea
                rows="5"
                placeholder="How can we help you? *"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className={`${inputCls} resize-none`}
              />

              <button
                type="submit"
                disabled={sending}
                className="w-full bg-gradient-to-r from-[#7A22FD] via-[#B318B0] to-[#FF4E6B] text-white font-black py-3.5 rounded-xl text-[14px] shadow-lg shadow-purple-500/25 active:scale-[0.98] transition disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {sending ? "Sending..." : "Send message"}
                {!sending && <Icon d={ICONS.send} className="h-4 w-4" />}
              </button>
            </form>
          )}
        </section>
      </div>
    </InfoPageLayout>
  );
}

export default ContactUs;