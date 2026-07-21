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

    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      !address
    ) {
      toast.info(
        "Please fill all fields"
      );
      return;
    }

    try {
      setLoading(true);

      const res = await api.post(
        "/auth/register",
        formData
      );

      alert(
        res.data.message
      );

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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">

      <div className="bg-white shadow-xl rounded-2xl w-full max-w-lg p-8">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-600">
            SujaMart
          </h1>

          <p className="text-gray-500 mt-2">
            Create Your Account
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
            placeholder="Full Name"
            value={
              formData.name
            }
            onChange={
              handleChange
            }
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

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

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={
              formData.phone
            }
            onChange={
              handleChange
            }
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

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

          <textarea
            name="address"
            placeholder="Address"
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