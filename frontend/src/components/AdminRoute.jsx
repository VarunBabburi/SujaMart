import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const user = JSON.parse(
    localStorage.getItem("user")
  );

  if (
    !user ||
    user.role !== "admin"
  ) {
    return (
      <Navigate
        to="/products"
        replace
      />
    );
  }

  return children;
}

export default AdminRoute;