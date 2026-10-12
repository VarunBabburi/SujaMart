// Put this file at: src/pages/admin/SupportInbox.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import Navbar from "../../components/Navbar";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const CATEGORY_LABELS = {
  order: "Order issue",
  delivery: "Delivery",
  payment: "Payment & refunds",
  quality: "Product quality",
  account: "Account & profile",
  udhaar: "Udhaar (credit)",
};

const TICKET_STATUS = {
  open: { label: "Open", cls: "bg-rose-100 text-rose-700" },
  in_progress: { label: "In progress", cls: "bg-amber-100 text-amber-700" },
  resolved: { label: "Resolved", cls: "bg-emerald-100 text-emerald-700" },
  closed: { label: "Closed", cls: "bg-slate-200 text-slate-600" },
};

const MESSAGE_STATUS = {
  new: { label: "New", cls: "bg-rose-100 text-rose-700" },
  read: { label: "Read", cls: "bg-sky-100 text-sky-700" },
  resolved: { label: "Resolved", cls: "bg-emerald-100 text-emerald-700" },
};

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : "";

const toWhatsApp = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits.length === 10 ? `91${digits}` : digits}`;
};

function Badge({ map, value }) {
  const s = map[value] || { label: value, cls: "bg-slate-100 text-slate-600" };
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${s.cls}`}>
      {s.label}
    </span>
  );
}

function ContactLinks({ name, email, phone }) {
  const wa = toWhatsApp(phone);
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
      {name && <span className="text-slate-800">{name}</span>}
      {phone && (
        <a href={`tel:${phone}`} className="rounded-lg bg-emerald-50 px-2.5 py-1 text-emerald-700 hover:bg-emerald-100">
          📞 {phone}
        </a>
      )}
      {wa && (
        <a href={wa} target="_blank" rel="noreferrer" className="rounded-lg bg-green-50 px-2.5 py-1 text-green-700 hover:bg-green-100">
          WhatsApp
        </a>
      )}
      {email && (
        <a href={`mailto:${email}`} className="rounded-lg bg-sky-50 px-2.5 py-1 text-sky-700 hover:bg-sky-100">
          ✉️ {email}
        </a>
      )}
    </div>
  );
}

function TicketCard({ t, onSaved }) {
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState(t.admin_reply || "");
  const [status, setStatus] = useState(t.status);
  const [saving, setSaving] = useState(false);

  const save = async (nextStatus) => {
    const finalStatus = nextStatus || status;
    try {
      setSaving(true);
      await api.put(
        `/support/admin/tickets/${t.id}`,
        { status: finalStatus, admin_reply: reply },
        authHeader()
      );
      setStatus(finalStatus);
      toast.success("Ticket updated");
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update ticket");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-start gap-3 p-4 text-left">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-sm font-black text-purple-700">
          #{t.id}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-black text-slate-900">
              {CATEGORY_LABELS[t.category] || t.category}
            </span>
            <Badge map={TICKET_STATUS} value={t.status} />
            {t.admin_reply && (
              <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-black text-purple-700">
                Replied
              </span>
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-[13px] font-medium text-slate-600">{t.message}</p>
          <p className="mt-1.5 text-[11px] font-semibold text-slate-400">
            {t.user_name || "Customer"} · {formatDate(t.created_at)}
            {t.order_id ? ` · Order #${t.order_id}` : ""}
          </p>
        </div>
        <span className={`mt-1 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-slate-100 p-4">
          <ContactLinks name={t.user_name} email={t.user_email} phone={t.user_phone} />

          <div className="whitespace-pre-wrap rounded-xl bg-slate-50 p-3.5 text-[13px] font-medium leading-relaxed text-slate-700">
            {t.message}
          </div>

          {t.order_id && (
            <Link
              to={`/admin/orders/${t.order_id}`}
              className="inline-block text-xs font-black text-purple-700 hover:underline"
            >
              View order #{t.order_id} →
            </Link>
          )}

          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Your reply (customer will see this)
            </label>
            <textarea
              rows="4"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              maxLength={2000}
              placeholder="Type your reply to the customer..."
              className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-[13px] font-semibold text-slate-800 placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-black text-slate-700 focus:outline-none"
            >
              {Object.entries(TICKET_STATUS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>

            <button
              onClick={() => save()}
              disabled={saving}
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black text-white transition active:scale-95 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>

            <button
              onClick={() => save("resolved")}
              disabled={saving || status === "resolved"}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white transition active:scale-95 disabled:opacity-40"
            >
              Reply &amp; resolve
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageCard({ m, onSaved }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const setStatus = async (status) => {
    try {
      setSaving(true);
      await api.put(`/support/admin/messages/${m.id}`, { status }, authHeader());
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update message");
    } finally {
      setSaving(false);
    }
  };

  const toggle = () => {
    const willOpen = !open;
    setOpen(willOpen);
    // Opening a new message marks it as read
    if (willOpen && m.status === "new") setStatus("read");
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button onClick={toggle} className="flex w-full items-start gap-3 p-4 text-left">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-lg">
          ✉️
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-black text-slate-900">{m.name}</span>
            <Badge map={MESSAGE_STATUS} value={m.status} />
          </div>
          <p className="mt-1 line-clamp-2 text-[13px] font-medium text-slate-600">{m.message}</p>
          <p className="mt-1.5 text-[11px] font-semibold text-slate-400">{formatDate(m.created_at)}</p>
        </div>
        <span className={`mt-1 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-slate-100 p-4">
          <ContactLinks email={m.email} phone={m.phone} />
          <div className="whitespace-pre-wrap rounded-xl bg-slate-50 p-3.5 text-[13px] font-medium leading-relaxed text-slate-700">
            {m.message}
          </div>
          <div className="flex flex-wrap gap-2.5">
            {m.status !== "resolved" ? (
              <button
                onClick={() => setStatus("resolved")}
                disabled={saving}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white transition active:scale-95 disabled:opacity-50"
              >
                Mark resolved
              </button>
            ) : (
              <button
                onClick={() => setStatus("read")}
                disabled={saving}
                className="rounded-xl bg-slate-200 px-4 py-2.5 text-xs font-black text-slate-700 transition active:scale-95 disabled:opacity-50"
              >
                Reopen
              </button>
            )}
          </div>
          <p className="text-[11px] font-semibold text-slate-400">
            Reply by phone, WhatsApp or email using the buttons above, then mark it resolved.
          </p>
        </div>
      )}
    </div>
  );
}

function SupportInbox() {
  const [tab, setTab] = useState("tickets");
  const [tickets, setTickets] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  const load = async () => {
    try {
      const [t, m] = await Promise.all([
        api.get("/support/admin/tickets", authHeader()),
        api.get("/support/admin/messages", authHeader()),
      ]);
      setTickets(t.data);
      setMessages(m.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not load the support inbox");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openTickets = tickets.filter((t) => t.status === "open").length;
  const progressTickets = tickets.filter((t) => t.status === "in_progress").length;
  const newMessages = messages.filter((m) => m.status === "new").length;
  const resolvedCount =
    tickets.filter((t) => ["resolved", "closed"].includes(t.status)).length +
    messages.filter((m) => m.status === "resolved").length;

  const visibleTickets = useMemo(() => {
    if (filter === "all") return tickets;
    if (filter === "pending") return tickets.filter((t) => ["open", "in_progress"].includes(t.status));
    return tickets.filter((t) => ["resolved", "closed"].includes(t.status));
  }, [tickets, filter]);

  const visibleMessages = useMemo(() => {
    if (filter === "all") return messages;
    if (filter === "pending") return messages.filter((m) => m.status !== "resolved");
    return messages.filter((m) => m.status === "resolved");
  }, [messages, filter]);

  const stats = [
    { label: "Open tickets", value: openTickets, tone: "bg-rose-50 text-rose-700 border-rose-100" },
    { label: "In progress", value: progressTickets, tone: "bg-amber-50 text-amber-700 border-amber-100" },
    { label: "New messages", value: newMessages, tone: "bg-sky-50 text-sky-700 border-sky-100" },
    { label: "Resolved", value: resolvedCount, tone: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  ];

  const list = tab === "tickets" ? visibleTickets : visibleMessages;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <Link to="/admin-panel" className="text-xs font-black text-slate-500 hover:text-slate-800">
            ← Admin panel
          </Link>

          <div className="mb-6 mt-3">
            <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-purple-600">
              SujaMart Administration
            </p>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Support inbox</h1>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Reply to customer tickets and handle contact messages.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className={`rounded-2xl border p-4 ${s.tone}`}>
                <p className="text-2xl font-black">{s.value}</p>
                <p className="mt-0.5 text-[11px] font-black uppercase tracking-wider opacity-80">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-2xl bg-white p-1 shadow-sm">
              {[
                { id: "tickets", label: `Tickets (${tickets.length})` },
                { id: "messages", label: `Messages (${messages.length})` },
              ].map((x) => (
                <button
                  key={x.id}
                  onClick={() => setTab(x.id)}
                  className={`rounded-xl px-4 py-2 text-xs font-black transition ${
                    tab === x.id ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {x.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              {[
                { id: "pending", label: "Pending" },
                { id: "resolved", label: "Resolved" },
                { id: "all", label: "All" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-black transition ${
                    filter === f.id
                      ? "border-purple-600 bg-purple-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-purple-300"
                  }`}
                >
                  {f.label}
                </button>
              ))}
              <button
                onClick={load}
                className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-black text-slate-600 hover:border-purple-300"
              >
                ↻ Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-white" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <div className="rounded-2xl bg-white py-14 text-center shadow-sm">
              <p className="text-4xl">🎉</p>
              <p className="mt-2 text-sm font-black text-slate-800">Nothing here</p>
              <p className="text-xs font-medium text-slate-500">No {tab} match this filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tab === "tickets"
                ? visibleTickets.map((t) => <TicketCard key={t.id} t={t} onSaved={load} />)
                : visibleMessages.map((m) => <MessageCard key={m.id} m={m} onSaved={load} />)}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default SupportInbox;