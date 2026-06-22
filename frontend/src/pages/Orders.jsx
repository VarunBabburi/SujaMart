import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get(
        "/orders/my-orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <h2>Loading Orders...</h2>;
  }

  return (
    <>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <h1>My Orders</h1>

        {orders.length === 0 ? (
          <h3>No Orders Found</h3>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              style={{
                border: "1px solid #ddd",
                padding: "15px",
                marginBottom: "15px",
                borderRadius: "10px",
              }}
            >
              <h3>
                Order #{order.id}
              </h3>

              <p>
                Total Amount:
                ₹{order.total_amount}
              </p>

              <p>
                Status:
                {order.order_status}
              </p>

              <p>
                Date:
                {new Date(
                  order.created_at
                ).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default Orders;