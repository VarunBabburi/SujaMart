import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user")) || {};
      return {
        name: storedUser.name || "",
        email: storedUser.email || "",
        phone: storedUser.phone || "",
        address: storedUser.address || "",
      };
    } catch (e) {
      return { name: "", email: "", phone: "", address: "" };
    }
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile((prev) => ({
        ...prev,
        ...res.data,
        // Fallback to local storage if API field is null/empty
        name: res.data.name || prev.name,
      }));
    } catch (error) {
      console.log("Failed to fetch profile:", error);
    }
  };

  const updateProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        "/user/profile",
        {
          name: profile.name,
          address: profile.address,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let user = {};
      try {
        user = JSON.parse(localStorage.getItem("user")) || {};
      } catch (e) {
        user = {};
      }

      const updatedUser = {
        ...user,
        name: profile.name,
        address: profile.address,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Profile Updated Successfully");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message ||
        "Update Failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <>
      <Navbar />

      <div className="max-w-md mx-auto mt-10 mb-24 bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>

        <label className="font-semibold">Name</label>
        <input
          className="w-full border rounded-lg p-2 mt-2 mb-4"
          value={profile.name || ""}
          onChange={(e) =>
            setProfile({
              ...profile,
              name: e.target.value,
            })
          }
        />

        <label className="font-semibold">Email</label>
        <input
          className="w-full border rounded-lg p-2 mt-2 mb-4 bg-gray-100"
          value={profile.email || ""}
          readOnly
        />

        <label className="font-semibold">Phone</label>
        <input
          className="w-full border rounded-lg p-2 mt-2 mb-4"
          value={profile.phone || ""}
          onChange={(e) =>
            setProfile({
              ...profile,
              phone: e.target.value,
            })
          }
        />

        <label className="font-semibold">Address</label>
        <textarea
          className="w-full border rounded-lg p-2 mt-2 mb-6"
          rows="4"
          value={profile.address}
          onChange={(e) =>
            setProfile({
              ...profile,
              address: e.target.value,
            })
          }
        />

        <div className="flex items-center gap-4">
          <button
            onClick={updateProfile}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-bold"
          >
            Save Changes
          </button>
          <button
            onClick={logout}
            className="text-xs font-black uppercase tracking-wider text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100/60 px-3 py-2 rounded-xl transition duration-150 active:scale-95"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

export default Profile;