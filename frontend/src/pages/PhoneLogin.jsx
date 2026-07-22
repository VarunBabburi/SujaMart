import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function PhoneLogin() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const sendOtp = async () => {
    if (phone.length !== 10) {
      toast.error("Enter valid 10-digit mobile number");
      return;
    }

    try {
      setLoading(true);
      await api.post("/otp/send", { phone });
      toast.success("OTP Sent Successfully");
      setOtpSent(true);
      setTimer(60); // Start 60-second cooldown for resend
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Enter valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/otp/verify", { phone, otp });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Login Successful");
      navigate("/products");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-green-600 text-center">SujaMart</h1>
        <p className="text-center text-gray-500 mt-2 mb-6">Login with mobile number</p>

        {/* Mobile Number Input */}
        <div className="flex border rounded-xl p-3">
          <span>🇮🇳 +91</span>
          <input
            value={phone}
            disabled={otpSent}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Mobile number"
            className="ml-3 flex-1 outline-none disabled:bg-transparent"
            maxLength={10}
          />
        </div>

        {/* OTP Input */}
        {otpSent && (
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            className="border rounded-xl p-3 w-full mt-4 outline-none"
          />
        )}

        {/* Primary Action Button */}
        <button
          onClick={otpSent ? verifyOtp : sendOtp}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white w-full py-3 rounded-xl font-bold mt-5 disabled:opacity-50"
        >
          {loading ? "Please wait..." : otpSent ? "Verify OTP" : "Send OTP"}
        </button>

        {/* Resend Option when OTP is already sent */}
        {otpSent && (
          <div className="text-center mt-4">
            {timer > 0 ? (
              <p className="text-sm text-gray-500">
                Resend OTP in <span className="font-semibold">{timer}s</span>
              </p>
            ) : (
              <button
                onClick={sendOtp}
                disabled={loading}
                className="text-sm text-green-600 font-semibold underline hover:text-green-700"
              >
                Resend OTP
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PhoneLogin;