import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 20px",
        backgroundColor: "#f4f4f4",
        marginBottom: "20px",
      }}
    >
      <h2>SujaMart</h2>

      <div>
        <Link
          to="/products"
          style={{ marginRight: "15px" }}
        >
          Products
        </Link>

        <Link
          to="/cart"
          style={{ marginRight: "15px" }}
        >
          Cart
        </Link>

        <Link
          to="/orders"
          style={{ marginRight: "15px" }}
        >
          Orders
        </Link>

        <Link
          to="/ledger"
          style={{ marginRight: "15px" }}
        >
          Udhaar
        </Link>
      </div>

      <div>
        <span
          style={{
            marginRight: "15px",
          }}
        >
          {user?.name}
        </span>
        <Link
  to="/admin"
  style={{ marginRight: "15px" }}
>
  Admin
</Link>
            <Link
  to="/admin/orders"
  style={{ marginRight: "15px" }}
>
  Manage Orders
</Link>

        <button onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;