import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCartItems(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const token = localStorage.getItem("token");

      await api.delete(`/cart/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchCart();
    } catch (error) {
      console.log(error);
    }
  };

  const placeOrder = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.post(
        "/orders/place",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        `Order Placed Successfully\nOrder ID: ${res.data.orderId}`
      );

      fetchCart();
    } catch (error) {
      console.log(error);

      alert(
        error?.response?.data?.message ||
          "Failed to place order"
      );
    }
  };

  const totalAmount = cartItems.reduce(
    (total, item) =>
      total + Number(item.subtotal),
    0
  );

  if (loading) {
    return <h2>Loading Cart...</h2>;
  }

  return (
    <>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <h1>My Cart</h1>

        {cartItems.length === 0 ? (
          <h3>Cart is Empty</h3>
        ) : (
          <>
            {cartItems.map((item) => (
              <div
                key={item.id}
                style={{
                  border: "1px solid #ddd",
                  padding: "15px",
                  marginBottom: "10px",
                  borderRadius: "10px",
                }}
              >
                <h3>{item.name}</h3>

                <p>
                  Price: ₹{item.price}
                </p>

                <p>
                  Quantity: {item.quantity}
                </p>

                <p>
                  Subtotal: ₹{item.subtotal}
                </p>

                <button
                  onClick={() =>
                    removeItem(item.id)
                  }
                >
                  Remove
                </button>
              </div>
            ))}

            <h2>
              Total: ₹{totalAmount}
            </h2>

            <button
              onClick={placeOrder}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
              }}
            >
              Place Order
            </button>
          </>
        )}
      </div>
    </>
  );
}

export default Cart;