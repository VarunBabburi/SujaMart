import React, { useState, useEffect, useRef } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import bgImage from "../assets/bg-preview.png";

function PhoneLogin() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);

  const abortControllerRef = useRef(null);

  // Countdown Timer
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // Clean up WebOTP listener when component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // WebOTP API: Listen for incoming SMS automatically
  const listenForWebOTP = () => {
    if ("OTPCredential" in window) {
      const ac = new AbortController();
      abortControllerRef.current = ac;

      navigator.credentials
        .get({
          otp: { transport: ["sms"] },
          signal: ac.signal
        })
        .then((otpObj) => {
          if (otpObj && otpObj.code) {
            setOtp(otpObj.code);
            // Auto-verify as soon as WebOTP captures the code
            verifyOtp(otpObj.code);
          }
        })
        .catch((err) => {
          // WebOTP cancelled by user or timed out — degrade gracefully to manual entry
          console.log("WebOTP info:", err.message);
        });
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) setPhone(value);
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 6) {
      setOtp(value);
      if (value.length === 6 && !loading) {
        verifyOtp(value);
      }
    }
  };

  const sendOtp = async () => {
    if (phone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      setLoading(true);
      await api.post("/otp/send", { phone });

      toast.success("OTP sent to your mobile");
      setOtpSent(true);
      setTimer(60);

      // Start listening for automatic SMS fill
      listenForWebOTP();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (otpToVerify = otp) => {
    const targetOtp = typeof otpToVerify === "string" ? otpToVerify : otp;

    if (targetOtp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/otp/verify", { phone, otp: targetOtp });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Login Successful!");
      navigate("/products");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="relative min-h-screen w-full flex items-center justify-center px-4 overflow-hidden bg-cover bg-center"
      style={{ 
        backgroundImage: `url(${bgImage})` 
      }}
    >
      {/* Heavy modern blur overlay looking into the app */}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/70 via-emerald-950/25 to-slate-900/60 backdrop-blur-[px]"></div>
    
      <div className="relative z-10 bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl w-full max-w-md p-8 border border-white/40 transform transition-all">
        {/* <h1 className="text-3xl font-extrabold text-green-600 text-center">SujaMart</h1>
        <p className="text-center text-gray-500 mt-1 mb-6 text-sm">
          Shop fresh grocery with 1-click mobile login
        </p> */}

        <div className="text-center mb-6 ">
          <span className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm animate-bounce">
            ⚡ Delivery in 10 Mins
          </span>
          
          <h1 className="text-5xl font-black text-emerald-600 mt-4 tracking-tight drop-shadow-sm">
            Suja<span className="text-amber-500">Mart</span>
          </h1>

          <p className="text-slate-500 mt-2 text-sm font-medium tracking-wide">
            Your favorite groceries, delivered instantly.
          </p>
        </div>

        {/* Mobile Input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-600 uppercase">Phone Number</label>
          <div className="flex border rounded-xl p-3 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-green-500 transition">
            <span className="font-semibold text-gray-700">🇮🇳 +91</span>
            <input
              type="tel"
              value={phone}
              disabled={otpSent}
              onChange={handlePhoneChange}
              placeholder="Enter 10-digit number"
              className="ml-3 flex-1 bg-transparent outline-none font-medium text-gray-800 disabled:text-gray-500"
            />
            {otpSent && (
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                }}
                className="text-xs text-green-600 font-bold hover:underline"
              >
                Change
              </button>
            )}
          </div>
        </div>

        {/* OTP Input with Auto-Fill attributes */}
        {otpSent && (
          <div className="space-y-1 mt-4">
            <label className="text-xs font-semibold text-gray-600 uppercase">Verification Code</label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code" // Critical for browser auto-fill
              value={otp}
              onChange={handleOtpChange}
              placeholder="6-digit OTP"
              autoFocus
              className="border rounded-xl p-3 w-full outline-none text-center tracking-widest text-lg font-bold text-gray-800 focus:ring-2 focus:ring-green-500 transition"
            />
          </div>
        )}

        {/* Action Button */}
        <button
          type="button"
          onClick={() => (otpSent ? verifyOtp() : sendOtp())}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white w-full py-3.5 rounded-xl font-bold mt-6 transition duration-200 disabled:opacity-50 shadow-md shadow-green-200"
        >
          {loading ? "Verifying..." : otpSent ? "Verify & Continue" : "Get OTP"}
        </button>

        {/* Resend Link */}
        {otpSent && (
          <div className="text-center mt-4">
            {timer > 0 ? (
              <p className="text-xs text-gray-500">
                Resend code in <span className="font-bold text-gray-700">{timer}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={sendOtp}
                disabled={loading}
                className="text-xs text-green-600 font-bold underline hover:text-green-800 transition"
              >
                Didn't get code? Resend OTP
              </button>
            )}
          </div>
        )}
      </div>
    
    </div>
  );
}

export default PhoneLogin;