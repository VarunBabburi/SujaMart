// Put this file at: src/components/AuthBottomSheet.jsx  (replaces your current one)
// Props are the same as before: show, onClose, onSuccess
// Phone + OTP login as a bottom sheet on mobile and a centred card on desktop.
// Uses the same /otp/send and /otp/verify API calls as PhoneLogin.jsx.
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

function AuthBottomSheet({ show, onClose, onSuccess }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("phone"); // "phone" | "email"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const phoneRef = useRef(null);
  const otpRef = useRef(null);
  const abortRef = useRef(null);

  // Reset everything each time the sheet opens
  useEffect(() => {
    if (!show) return;
    setPhone("");
    setOtp("");
    setOtpSent(false);
    setTimer(0);
    setError("");
    setMode("phone");
    setEmail("");
    setPassword("");
    setShowPass(false);
    const t = setTimeout(() => phoneRef.current?.focus(), 250);
    return () => clearTimeout(t);
  }, [show]);

  // Lock page scroll + close on Escape
  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [show, onClose]);

  // Resend countdown
  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  // Stop the WebOTP listener on close/unmount
  useEffect(() => {
    if (!show) abortRef.current?.abort();
    return () => abortRef.current?.abort();
  }, [show]);

  const listenForWebOTP = () => {
    if (!("OTPCredential" in window)) return;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    navigator.credentials
      .get({ otp: { transport: ["sms"] }, signal: ac.signal })
      .then((o) => {
        if (o?.code) {
          setOtp(o.code);
          verifyOtp(o.code);
        }
      })
      .catch(() => {});
  };

  const handlePhoneChange = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(-10);
    setPhone(v);
    setError("");
  };

  const handleOtpChange = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH);
    setOtp(v);
    setError("");
    if (v.length === OTP_LENGTH && !loading) verifyOtp(v);
  };

  const sendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await api.post("/otp/send", { phone });
      toast.success("OTP sent to your mobile");
      setOtpSent(true);
      setOtp("");
      setTimer(RESEND_SECONDS);
      listenForWebOTP();
      setTimeout(() => otpRef.current?.focus(), 150);
    } catch (err) {
      setError(
        err.response?.data?.errors?.[0]?.msg ||
          err.response?.data?.message ||
          "Could not send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (code = otp) => {
    const target = typeof code === "string" ? code : otp;
    if (target.length !== OTP_LENGTH) {
      setError("Enter the 6-digit code");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await api.post("/otp/verify", { phone, otp: target });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Logged in successfully");
      onSuccess?.(res.data);
    } catch (err) {
      setOtp("");
      setError(err.response?.data?.message || "Invalid OTP");
      setTimeout(() => otpRef.current?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter your email and password");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await api.post("/auth/login", { email: email.trim(), password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Logged in successfully");
      onSuccess?.(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setError("");
    setOtpSent(false);
    setOtp("");
  };

  if (!show) return null;

  const phoneValid = /^[6-9]\d{9}$/.test(phone);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Log in or sign up"
    >
      {/* Backdrop */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm animate-[fadeIn_.2s_ease-out]"
      />

      {/* Sheet / card */}
      <div className="relative w-full md:max-w-[420px] bg-white rounded-t-[28px] md:rounded-[28px] shadow-2xl overflow-hidden animate-[sheetUp_.28s_cubic-bezier(.2,.9,.3,1)]">
        {/* Gradient header */}
        <div className="relative bg-gradient-to-br from-emerald-800 via-emerald-600 to-teal-500 px-6 pt-6 pb-8 text-white">
          <div className="md:hidden mx-auto mb-4 h-1.5 w-10 rounded-full bg-white/40" />
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center active:scale-90 transition"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          <div className="absolute -right-8 -bottom-10 h-32 w-32 rounded-full bg-white/10" />

          <div className="flex items-center gap-2.5">
            {/* <span className="h-9 w-9 rounded-xl bg-white text-emerald-700 flex items-center justify-center text-lg shadow-md">
              🛒
            </span> */}
            <span className="text-[22px] font-black tracking-tight leading-none">
              Suja<span className="text-amber-300">Mart</span>
            </span>
          </div>
          <span className="mt-3 inline-flex items-center gap-1 bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
            ⚡ Delivery in 10 mins
          </span>
          <h2 className="mt-3 text-[26px] leading-tight font-black tracking-tight">
            {mode === "email" ? "Log in with email" : otpSent ? "Verify your number" : "Log in or sign up"}
          </h2>
          <p className="mt-1 text-[13px] font-medium text-white/85">
            {mode === "email"
              ? "Welcome back! Enter your email and password."
              : otpSent
              ? `We sent a 6-digit code to +91 ${phone}`
              : "Groceries at your door in minutes."}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 pt-6 pb-7 -mt-4 bg-white rounded-t-3xl relative">
          {mode === "email" ? (
            <form onSubmit={loginWithEmail}>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                Email address
              </label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="name@example.com"
                className="mt-1.5 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-[15px] font-bold text-slate-900 placeholder:font-medium placeholder:text-slate-400 outline-none transition focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15"
              />

              <label className="mt-4 block text-[11px] font-black text-slate-500 uppercase tracking-wider">
                Password
              </label>
              <div className="mt-1.5 flex items-center rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 transition focus-within:bg-white focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-500/15">
                <input
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="Your password"
                  className="flex-1 bg-transparent py-3 text-[15px] font-bold text-slate-900 placeholder:font-medium placeholder:text-slate-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="text-xs font-black text-emerald-700 pl-3"
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>

              {error && <p className="mt-2 text-xs font-bold text-rose-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mt-5 w-full rounded-2xl py-3.5 text-[15px] font-black text-white bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-500 shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition disabled:opacity-45 disabled:pointer-events-none"
              >
                {loading ? "Logging in..." : "Log in"}
              </button>

              <div className="mt-4 flex items-center justify-between text-[13px]">
                <button
                  type="button"
                  onClick={() => switchMode("phone")}
                  className="font-bold text-slate-500 hover:text-slate-800"
                >
                  ← Use phone number
                </button>
                <Link to="/register" onClick={onClose} className="font-black text-emerald-700 hover:underline">
                  Create account
                </Link>
              </div>
            </form>
          ) : !otpSent ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendOtp();
              }}
            >
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                Mobile number
              </label>
              <div
                className={`mt-1.5 flex items-center rounded-2xl border-2 bg-slate-50 px-4 py-3 transition focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/15 ${
                  error ? "border-rose-400" : "border-slate-200 focus-within:border-emerald-600"
                }`}
              >
                <span className="text-[15px] font-extrabold text-slate-700 pr-3 mr-3 border-r border-slate-200">
                  +91
                </span>
                <input
                  ref={phoneRef}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="Enter 10-digit number"
                  className="flex-1 bg-transparent outline-none text-[16px] font-bold tracking-wide text-slate-900 placeholder:font-medium placeholder:text-slate-400 placeholder:tracking-normal"
                />
              </div>

              {error && <p className="mt-2 text-xs font-bold text-rose-600">{error}</p>}

              <button
                type="submit"
                disabled={loading || !phoneValid}
                className="mt-5 w-full rounded-2xl py-3.5 text-[15px] font-black text-white bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-500 shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition disabled:opacity-45 disabled:shadow-none disabled:pointer-events-none"
              >
                {loading ? "Sending OTP..." : "Continue"}
              </button>

              <div className="mt-4 flex items-center gap-3 text-[11px] font-black tracking-widest text-slate-300">
                <span className="h-px flex-1 bg-slate-200" /> OR <span className="h-px flex-1 bg-slate-200" />
              </div>
              <button
                type="button"
                onClick={() => switchMode("email")}
                className="mt-4 w-full rounded-2xl border-2 border-slate-200 py-3 text-[14px] font-extrabold text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition"
              >
                Continue with email
              </button>
            </form>
          ) : (
            <div>
              {/* 6 OTP boxes driven by one real input (keeps SMS autofill working) */}
              <div
                className="relative"
                onClick={() => otpRef.current?.focus()}
              >
                <div className="grid grid-cols-6 gap-2">
                  {Array.from({ length: OTP_LENGTH }).map((_, i) => {
                    const active = i === Math.min(otp.length, OTP_LENGTH - 1);
                    return (
                      <div
                        key={i}
                        className={`h-14 rounded-2xl border-2 flex items-center justify-center text-xl font-black transition ${
                          error
                            ? "border-rose-400 bg-rose-50 text-rose-700"
                            : otp[i]
                            ? "border-emerald-500 bg-emerald-50 text-slate-900"
                            : active
                            ? "border-emerald-600 bg-white ring-4 ring-emerald-500/15"
                            : "border-slate-200 bg-slate-50"
                        }`}
                      >
                        {otp[i] || ""}
                      </div>
                    );
                  })}
                </div>
                <input
                  ref={otpRef}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={OTP_LENGTH}
                  value={otp}
                  onChange={handleOtpChange}
                  aria-label="6-digit OTP"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-text"
                />
              </div>

              {error && <p className="mt-3 text-xs font-bold text-rose-600">{error}</p>}

              <button
                onClick={() => verifyOtp()}
                disabled={loading || otp.length !== OTP_LENGTH}
                className="mt-5 w-full rounded-2xl py-3.5 text-[15px] font-black text-white bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-500 shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition disabled:opacity-45 disabled:shadow-none disabled:pointer-events-none"
              >
                {loading ? "Verifying..." : "Verify & continue"}
              </button>

              <div className="mt-4 flex items-center justify-between text-[13px]">
                <button
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                    setError("");
                    setTimeout(() => phoneRef.current?.focus(), 100);
                  }}
                  className="font-bold text-slate-500 hover:text-slate-800"
                >
                  ← Change number
                </button>

                {timer > 0 ? (
                  <span className="font-semibold text-slate-500">
                    Resend in <span className="font-black text-slate-800">{timer}s</span>
                  </span>
                ) : (
                  <button
                    onClick={sendOtp}
                    disabled={loading}
                    className="font-black text-emerald-700 hover:underline disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-[11px] leading-relaxed font-medium text-slate-400">
            By continuing, you agree to our{" "}
            <Link to="/terms" onClick={onClose} className="font-bold text-slate-600 underline underline-offset-2">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy-policy" onClick={onClose} className="font-bold text-slate-600 underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes sheetUp { from { transform: translateY(40px); opacity: .6 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  );
}

export default AuthBottomSheet;