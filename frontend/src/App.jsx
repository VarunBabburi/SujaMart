import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Ledger from "./pages/Ledger";
import Dashboard from "./pages/admin/Dashboard";
import AdminOrders from "./pages/admin/Orders";
import CreditAccounts from "./pages/admin/CreditAccounts";
import AdminProducts from "./pages/admin/Products";
import AdminRoute from "./components/AdminRoute";
import AuthRoute from "./components/AuthRoute";
import PrivateRoute from "./components/PrivateRoute";
import Categories from "./pages/admin/Categories";
import OrderDetails from "./pages/OrderDetails";
import Profile from "./pages/Profile";
import Customers from "./pages/admin/Customers";
import CustomerDetails from "./pages/admin/CustomerDetails";
import AdminOrderDetails from "./pages/admin/AdminOrderDetails";
import Payments from "./pages/admin/Payments";
import Addresses from "./pages/Addresses";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
//import BottomNav from "./components/BottomNav";
import PhoneLogin from "./pages/PhoneLogin";
import AdminPanel from "./pages/admin/AdminPanel";
import SupportInbox from "./pages/admin/SupportInbox";

import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import CustomerSupport from "./pages/CustomerSupport";
import FAQs from "./pages/FAQs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import ScrollToTop from "./components/ScrollToTop";



function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={
            //<AuthRoute>
              <Login />
          //  </AuthRoute>
          } />

        

        <Route
          path="/register"
          element={<AuthRoute>
              <Register />
            </AuthRoute>}
        />

        <Route
          path="/products"
          element={
            
              <Products />
           
          }
        />

        <Route
          path="/cart"
          element={
            <PrivateRoute>
              <Cart />
            </PrivateRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <PrivateRoute>
              <Orders />
            </PrivateRoute>
          }
        />

        <Route
          path="/ledger"
          element={
            <PrivateRoute>
              <Ledger />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <AdminOrders />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <AdminProducts />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/credit"
          element={
            <AdminRoute>
              <CreditAccounts />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/categories"
          element={
            <AdminRoute>
              <Categories />
            </AdminRoute>
          }
        />

        <Route
          path="/orders/:orderId"
          element={<OrderDetails />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

      

        <Route
  path="/admin-panel"
  element={
    <AdminRoute>
      <AdminPanel />
    </AdminRoute>
  }
/>

        <Route
          path="/admin/customers"
          element={
            <AdminRoute>
              <Customers />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/customers/:id"
          element={
            <AdminRoute>
              <CustomerDetails />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/orders/:orderId"
          element={
            <AdminRoute>
              <AdminOrderDetails />
            </AdminRoute>
          }
        />

         <Route
          path="/admin/support"
          element={
            <AdminRoute>
              <SupportInbox />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/payments"
          element={<AdminRoute>
              <Payments />
            </AdminRoute>}
        />

        <Route
          path="/addresses"
          element={<PrivateRoute>
              <Addresses />
            </PrivateRoute>}
        />

        <Route
path="/phone-login"
element={
<AuthRoute>
              <PhoneLogin />
            </AuthRoute>
}

/>
 <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/support" element={<CustomerSupport />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsAndConditions />} />

      </Routes>
      {/* <BottomNav /> */}
      <ToastContainer />
    </>
  );
}

export default App;