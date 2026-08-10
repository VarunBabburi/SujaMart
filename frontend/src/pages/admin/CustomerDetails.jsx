import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";

function CustomerDetails() {
    
  const { id } = useParams();
  const navigate = useNavigate();


  const [customer, setCustomer] =
    useState(null);
    const [orders, setOrders] =
  useState([]);

  useEffect(() => {
    fetchCustomer();
    fetchOrders();
  }, []);

  const fetchCustomer = async () => {

    try {

      const token =
        localStorage.getItem("token");

      const res =
        await api.get(
          `/admin/customers/${id}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      setCustomer(res.data);

    } catch (error) {
      console.log(error);
    }

  };


  const fetchOrders = async () => {
  try {
    const token =
      localStorage.getItem("token");

    const res = await api.get(
      `/admin/customers/${id}/orders`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

    setOrders(res.data);

  } catch (error) {
    console.log(error);
  }
};

  if (!customer)
    return <h2>Loading...</h2>;

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto p-6">

        <div className="bg-white shadow rounded-xl p-6">

          <h1 className="text-2xl md:text-3xl font-bold mb-6">

            Customer Details

          </h1>

          <p>

            <strong>Name:</strong>

            {customer.name}

          </p>

          <p>

            <strong>Email:</strong>

            {customer.email}

          </p>

          <p>

            <strong>Phone:</strong>

            {customer.phone}

          </p>

          <p>

            <strong>Address:</strong>

            {customer.address}

          </p>

          <hr className="my-6"/>

          <p>

            <strong>Total Orders:</strong>

            {customer.totalOrders}

          </p>

          <p>

            <strong>Total Purchase:</strong>

            ₹{customer.totalSpent}

          </p>

          <p className="text-red-600 font-bold">

            Outstanding:

            ₹{customer.outstanding}

          </p>

          <hr className="my-8" />

<h2 className="text-2xl md:text-3xl font-bold mb-6">
  Recent Orders
</h2>

<div className="bg-gray-50 rounded-lg overflow-x-auto">

  <table className="w-full min-w-[650px]">

    <thead className="bg-green-600 text-white">

      <tr>

        <th className="p-3">
  Order ID
</th>

<th className="p-3">
  Action
</th>

        <th className="p-3">
          Amount
        </th>

        <th className="p-3">
          Payment
        </th>

        <th className="p-3">
          Status
        </th>

        <th className="p-3">
          Date
        </th>
        

      </tr>

    </thead>

    <tbody>

      {orders.map((order) => (

        <tr
          key={order.id}
          className="border-b text-center"
        >

          <td className="p-3">

  <button
    onClick={() =>
      navigate(
        `/admin/orders/${order.id}`
      )
    }
    className="text-green-600 font-bold hover:underline"
  >
    #{order.id}
  </button>

</td>

          <td className="p-3">
            ₹{order.total_amount}
          </td>

          <td className="p-3">
            {order.payment_method}
          </td>

          <td className="p-3">
            {order.order_status}
          </td>

          <td className="p-3">
            {new Date(
              order.created_at
            ).toLocaleDateString()}
          </td>

          <td className="p-3">

  <button
    onClick={() =>
      navigate(
        `/admin/orders/${order.id}`
      )
    }
    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
  >
    View Details
  </button>

</td>

        </tr>

      ))}

    </tbody>

  </table>

</div>

        </div>

      </div>

    </>
  );

}

export default CustomerDetails;