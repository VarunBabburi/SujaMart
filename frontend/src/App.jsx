import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Ledger from "./pages/Ledger";
import Dashboard from "./pages/admin/Dashboard";
import AdminOrders from "./pages/admin/Orders";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/products"
        element={<Products />}
      />

      <Route
        path="/cart"
        element={<Cart />}
      />
      
      <Route
        path="/orders"
        element={<Orders />}
      />

      <Route
        path="/ledger"
        element={<Ledger />}
      />

      <Route
  path="/admin"
  element={<Dashboard />}
/>
        <Route
  path="/admin/orders"
  element={<AdminOrders />}
/>
    </Routes>
  );
}

export default App;