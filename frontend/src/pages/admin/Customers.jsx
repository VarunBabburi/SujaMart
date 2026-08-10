import { useEffect, useState } from "react";
import api from "../../services/api";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";

function Customers() {
    const navigate = useNavigate();
  const [customers, setCustomers] =
    useState([]);
    const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token =
        localStorage.getItem("token");

      const res = await api.get(
        "/admin/customers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCustomers(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  const filteredCustomers = customers.filter((customer) => {
  const keyword = search.toLowerCase();

  return (
    customer.order_id?.toString().toLowerCase().includes(keyword)||
    customer.name?.toLowerCase().includes(keyword) ||
    customer.email?.toLowerCase().includes(keyword) ||
    customer.phone?.toLowerCase().includes(keyword)
  );
});

  return (
    <>
      <Navbar />
 <div className="max-w-7xl mx-auto p-4 md:p-6">

      <div className="mb-6">

  <input
    type="text"
    placeholder="🔍 Search by Name, Email or Phone..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
  />

</div>
{filteredCustomers.length === 0 && (
  <div className="text-center py-8 text-gray-500 font-semibold">
    No Customers Found 🔍
  </div>
)}

      

        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          Customers
        </h1>

        <div className="bg-white shadow rounded-xl overflow-x-auto">

          <table className="w-full min-w-[650px]">

            <thead className="bg-green-600 text-white">

              <tr>
                <th className="p-4 text-left">
                  Name
                </th>

                <th className="p-4 text-left">
                  Email
                </th>

                <th className="p-4 text-left">
                  Phone
                </th>

                <th className="p-4 text-center">
                  Orders
                </th>

                <th className="p-4 text-center">
                  Outstanding
                </th>

                <th className="p-4 text-center">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredCustomers.map(
                (customer) => (

                  <tr
                    key={customer.id}
                    className="border-b hover:bg-gray-50"
                  >

                    <td className="p-4">
                      {customer.name}
                    </td>

                    <td className="p-4">
                      {customer.email}
                    </td>

                    <td className="p-4">
                      {customer.phone}
                    </td>

                    <td className="text-center">
                      {customer.totalOrders}
                    </td>

                    <td className="text-center font-bold text-red-600">
                      ₹{customer.outstanding}
                    </td>

                    <td className="text-center">
                      <button
  onClick={() =>
    navigate(
      `/admin/customers/${customer.id}`
    )
  }
  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
>
  View
</button>
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </>
  );
}

export default Customers;