import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.info("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post(
        "/auth/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem(
        "token",
        res.data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(
          res.data.user
        )
      );

      navigate("/products");
    } catch (err) {
      toast.error(
        err?.response?.data
          ?.message ||
          "Login Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    /* 1. Dynamic background grid with a blurred premium overlay */
    <div 
      className="relative min-h-screen w-full flex items-center justify-center px-4 overflow-hidden bg-cover bg-center"
      style={{ 
        backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop')" 
      }}
    >
      {/* Heavy modern blur overlay looking into the app */}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/70 via-emerald-950/25 to-slate-900/60 backdrop-blur-[px]"></div>

      {/* 2. Glassmorphic Premium Login Card */}
      <div className="relative z-10 bg-white/95 backdrop-blur-md shadow-2xl rounded-3xl w-full max-w-md p-8 border border-white/40 transform transition-all">
        
        {/* Fast-commerce modern pill badge */}
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

        <div className="h-px w-full bg-slate-200/60 my-5"></div>

        <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-6">
          Welcome Back! 👋
        </h2>

        {/* Form elements with slicker input fields and interactive focus states */}
        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >

          <button
            type="button"
            onClick={() => navigate("/phone-login")}
            className="w-full border-2 border-slate-200 hover:bg-slate-50 active:scale-[0.99] p-3.5 rounded-xl font-bold text-slate-700 transition flex items-center justify-center gap-2"
          >
            <span>📱</span> Continue with Phone
          </button>

          <div className="relative flex py-2 items-center text-slate-400 font-bold text-xs tracking-widest">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4">OR</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Premium call-to-action button with micro-interactions */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white py-4 rounded-xl font-bold tracking-wide transition shadow-lg shadow-emerald-600/20 disabled:opacity-70 mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              "Let's Shop 🛒"
            )}
          </button>

          {/* Divider style upgraded */}
          {/* <div className="relative flex py-2 items-center text-slate-400 font-bold text-xs tracking-widest">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4">OR</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div> */}

          {/* Phone login button modernized */}
          {/* <button
            type="button"
            onClick={() => navigate("/phone-login")}
            className="w-full border-2 border-slate-200 hover:bg-slate-50 active:scale-[0.99] p-3.5 rounded-xl font-bold text-slate-700 transition flex items-center justify-center gap-2"
          >
            <span>📱</span> Continue with Phone
          </button> */}
        </form>

        <p className="text-center text-slate-500 font-medium mt-8 text-sm">
          Don't have an account?
          <Link
            to="/register"
            className="text-emerald-600 font-bold ml-1.5 hover:underline decoration-2"
          >
            Register Now
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;