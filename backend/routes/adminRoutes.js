const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

const {
  getDashboardStats,getTopProducts,getAllOrders,
updateOrderStatus,getCreditAccounts,getCustomers,getSalesChart,getAllPayments,assignDelivery
,recordCustomerPayment,getLowStockProducts,getCustomerDetails,getCustomerOrders,getOrderDetailsAdmin,
} = require("../controllers/adminController");



router.get(
  "/dashboard",
  verifyToken,
  isAdmin,
  getDashboardStats
);
router.get(
  "/top-products",
  verifyToken,
  isAdmin,
  getTopProducts
);
router.get(
  "/orders",
  verifyToken,
  isAdmin,
  getAllOrders
);

router.get(
  "/payments",
  verifyToken,
  isAdmin,
  getAllPayments
);

router.get(
  "/customers",
  verifyToken,
  isAdmin,
  getCustomers
);

router.get(
  "/customers/:id",
  verifyToken,
  isAdmin,
  getCustomerDetails
);

router.get(
  "/customers/:id/orders",
  verifyToken,
  isAdmin,
  getCustomerOrders
);

router.get(
  "/sales-chart",
  verifyToken,
  isAdmin,
  getSalesChart
);

router.get(
  "/orders/:orderId",
  verifyToken,
  isAdmin,
  getOrderDetailsAdmin
);

router.get(
  "/low-stock",
  verifyToken,
  isAdmin,
  getLowStockProducts
);



router.put(
  "/orders/:orderId",
  verifyToken,
  isAdmin,
  updateOrderStatus
);

router.put(
"/orders/:orderId/delivery",
verifyToken,
  isAdmin,
assignDelivery
);

router.get(
  "/credit",
  verifyToken,
  isAdmin,
  getCreditAccounts
);

router.post(
  "/credit/payment",
  verifyToken,
  isAdmin,
  recordCustomerPayment
);

module.exports = router;