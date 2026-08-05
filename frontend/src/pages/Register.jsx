import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    address: "",
  });

  const [loading, setLoading] =
    useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleRegister = async (
    e
  ) => {
    e.preventDefault();

    const {
      name,
      email,
      phone,
      password,
      address,
    } = formData;

    if (!email || !password) {
  toast.info("Email and Password are required");
  return;
}

    try {
      setLoading(true);

      const res = await api.post(
        "/auth/register",
        formData
      );

     toast.success(res.data.message);

      navigate("/");
    } catch (err) {
      toast.error(
        err?.response?.data
          ?.message ||
          "Registration Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
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

      

        {/* <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-600">
            SujaMart
          </h1>

          <p className="text-gray-500 mt-2">
            Create Your Account
          </p>
        </div> */}
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

        <h2 className="text-2xl font-semibold text-center mb-6">
          Register
        </h2>

        <form
          onSubmit={
            handleRegister
          }
          className="space-y-4"
        >

          <input
            type="text"
            name="name"
            placeholder="Full Name (Optional)"
            value={
              formData.name
            }
            onChange={
              handleChange
            }
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <label className="block mb-1 font-medium">
  Email <span className="text-red-500">*</span>
</label>


          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={
              formData.email
            }
            onChange={
              handleChange
            }
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <label className="block mb-1 font-medium">
  Password <span className="text-red-500">*</span>
</label>

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={
              formData.password
            }
            onChange={
              handleChange
            }
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number (Optional)"
            value={
              formData.phone
            }
            onChange={
              handleChange
            }
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <textarea
            name="address"
            placeholder="Address (Optional)"
            value={
              formData.address
            }
            onChange={
              handleChange
            }
            rows="4"
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
          >
            {loading
              ? "Registering..."
              : "Register"}
          </button>

        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?
          <Link
            to="/"
            className="text-green-600 font-semibold ml-2"
          >
            Login
          </Link>
        </p>

      

    </div>
    </div>
  );
}

export default Register;