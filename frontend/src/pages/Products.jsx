import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (error) {
      console.log(error);
      alert("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId) => {
    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/cart/add",
        {
          product_id: productId,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Product Added To Cart");
    } catch (error) {
      console.log(error);
      alert("Failed to add product");
    }
  };

  if (loading) {
    return <h2>Loading Products...</h2>;
  }

  return (
    <>
      <Navbar />

      <div
        style={{
          padding: "20px",
        }}
      >
        <h1>Products</h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill,minmax(250px,1fr))",
            gap: "20px",
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "15px",
                boxShadow:
                  "0 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              <h3>{product.name}</h3>

              <p>
                <strong>Category:</strong>{" "}
                {product.category_name}
              </p>

              <p>{product.description}</p>

              <p>
                <strong>Price:</strong> ₹
                {product.price}
              </p>

              <p>
                <strong>Stock:</strong>{" "}
                {product.stock_quantity}
              </p>

              <button
                onClick={() =>
                  addToCart(product.id)
                }
                style={{
                  padding: "8px 15px",
                  cursor: "pointer",
                }}
              >
                Add To Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Products;