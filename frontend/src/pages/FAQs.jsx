// Put this file at: src/pages/FAQs.jsx
// NOTE: These answers are a starting point. Review them and adjust to your
// real policies (cancellation, refund timelines, Udhaar rules) before launch.
import { useState } from "react";
import { Link } from "react-router-dom";
import InfoPageLayout from "../components/InfoPageLayout";
import { Icon, ICONS } from "../components/Icon";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "orders", label: "Orders & delivery" },
  { id: "payments", label: "Payments" },
  { id: "refunds", label: "Refunds" },
  { id: "account", label: "Account" },
  { id: "udhaar", label: "Udhaar" },
];

const FAQS = [
  // Orders & delivery
  {
    cat: "orders",
    q: "How fast will my order arrive?",
    a: "We aim to deliver most orders within 10 minutes. The actual time depends on distance, traffic, weather and how busy we are. Once your order is out for delivery, you can watch a live countdown in the My Orders section.",
  },
  {
    cat: "orders",
    q: "Is there a minimum order value?",
    a: "Yes, the minimum basket value is ₹99. Delivery is free on every order.",
  },
  {
    cat: "orders",
    q: "How do I track my order?",
    a: "Open the Orders tab and tap your order. You will see a step-by-step tracker from Pending to Delivered, and you will also get a notification whenever the status changes.",
  },
  {
    cat: "orders",
    q: "Can I change or cancel my order?",
    a: "Contact support as soon as possible after placing the order. We can usually cancel or change an order only before it has been packed.",
  },
  {
    cat: "orders",
    q: "Do you charge delivery or platform fees?",
    a: "No. Delivery and platform fees are currently free. The bill details on the cart page always show exactly what you pay.",
  },
  {
    cat: "orders",
    q: "An item is missing or damaged. What should I do?",
    a: "We are sorry about that. Please raise a request from Customer Support within 24 hours of delivery with your order ID and a short description, and we will fix it.",
  },

  // Payments
  {
    cat: "payments",
    q: "Which payment methods do you accept?",
    a: "You can pay by Cash on Delivery, online (UPI, cards and net banking), or use Udhaar (credit) if it is enabled for your account.",
  },
  {
    cat: "payments",
    q: "Is online payment safe?",
    a: "Yes. Online payments are processed by Razorpay, a secure payment gateway. We never see or store your card, UPI or net banking details.",
  },
  {
    cat: "payments",
    q: "Money was deducted but my order was not placed. What now?",
    a: "This is rare, and the amount is normally refunded automatically to your original payment method within 5–7 working days. If it is not, contact support with your transaction ID and we will look into it.",
  },
  {
    cat: "payments",
    q: "Where can I download my invoice?",
    a: "Go to Orders, find your order and tap the Invoice button to download a PDF.",
  },

  // Refunds
  {
    cat: "refunds",
    q: "How do refunds work?",
    a: "Approved refunds for online payments go back to your original payment method within 5–7 working days. For Cash on Delivery orders, we will refund via UPI or bank transfer, or as store credit if you prefer.",
  },
  {
    cat: "refunds",
    q: "Can I return fresh or perishable items?",
    a: "Perishable items cannot be returned, but if something is stale, damaged or not as described, report it within 24 hours and we will replace it or refund you.",
  },

  // Account
  {
    cat: "account",
    q: "How do I update my name or address?",
    a: "Open the Profile tab, edit your details and tap Save Changes.",
  },
  {
    cat: "account",
    q: "How do I add a new delivery address?",
    a: "On the cart page, tap Add new address under Delivery address, or manage your saved addresses from the Addresses page.",
  },
  {
    cat: "account",
    q: "How can I delete my account and data?",
    a: "Send us a request from Contact Us and we will process it as described in our Privacy Policy. Some records, such as invoices, may need to be kept for legal reasons.",
  },

  // Udhaar
  {
    cat: "udhaar",
    q: "What is Udhaar?",
    a: "Udhaar is our credit option for regular customers. You place your order now and pay later. Everything you owe is tracked in the Credit tab. Udhaar is offered at the store's discretion.",
  },
  {
    cat: "udhaar",
    q: "How do I pay my Udhaar dues?",
    a: "Contact us to settle your dues. Every payment you make is recorded in your ledger so you can always see your balance.",
  },
];

function FAQs() {
  const [activeCat, setActiveCat] = useState("all");
  const [query, setQuery] = useState("");
  const [openKey, setOpenKey] = useState(null);

  const keyword = query.trim().toLowerCase();

  const visible = FAQS.filter((f) => {
    const matchesCat = activeCat === "all" || f.cat === activeCat;
    const matchesQuery =
      !keyword || f.q.toLowerCase().includes(keyword) || f.a.toLowerCase().includes(keyword);
    return matchesCat && matchesQuery;
  });

  return (
    <InfoPageLayout
      iconKey="help"
      title="Frequently asked questions"
      subtitle="Quick answers to the things people ask us most."
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="relative rounded-2xl bg-white border border-slate-200 shadow-sm focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-500/10 transition-all">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500">
            <Icon d={ICONS.search} className="h-5 w-5" sw={2.2} />
          </span>
          <input
            type="text"
            placeholder="Search questions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent py-3.5 pl-12 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-semibold"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
            >
              <Icon d={ICONS.x} className="h-3 w-3" sw={3} />
            </button>
          )}
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-black border transition-all active:scale-95 ${
                activeCat === c.id
                  ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-600/25"
                  : "bg-white border-slate-200 text-slate-600 hover:border-purple-300"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Accordion */}
        {visible.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-3xl border border-dashed border-purple-200 shadow-sm">
            <div className="text-4xl mb-2">🔍</div>
            <h2 className="text-sm font-extrabold text-slate-700">No matching questions</h2>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Try different words, or{" "}
              <Link to="/support" className="font-bold text-purple-700 underline underline-offset-2">
                contact support
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {visible.map((f) => {
              const open = openKey === f.q;
              return (
                <div
                  key={f.q}
                  className={`bg-white rounded-2xl border transition-all ${
                    open
                      ? "border-purple-300 shadow-md shadow-purple-500/10"
                      : "border-purple-100/70 shadow-[0_2px_12px_rgba(76,29,149,0.04)]"
                  }`}
                >
                  <button
                    onClick={() => setOpenKey(open ? null : f.q)}
                    className="w-full flex items-center gap-3 text-left px-4 py-4"
                    aria-expanded={open}
                  >
                    <span className="flex-1 text-[14px] sm:text-[15px] font-extrabold leading-snug">
                      {f.q}
                    </span>
                    <span
                      className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                        open ? "bg-purple-600 text-white rotate-180" : "bg-purple-50 text-purple-700"
                      }`}
                    >
                      <Icon d={ICONS.chevronDown} className="h-4 w-4" sw={2.8} />
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-4 pb-4 text-sm leading-relaxed text-slate-600 font-medium">{f.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Still need help */}
        <section className="rounded-3xl bg-slate-900 text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight">Still need help?</h2>
            <p className="text-sm text-slate-400 font-medium mt-0.5">Our support team is happy to assist.</p>
          </div>
          <Link
            to="/support"
            className="self-start sm:self-auto px-5 py-3 rounded-xl bg-gradient-to-r from-[#7A22FD] to-[#B318B0] text-white text-[13px] font-black active:scale-95 transition"
          >
            Contact support
          </Link>
        </section>
      </div>
    </InfoPageLayout>
  );
}

export default FAQs;