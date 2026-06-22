const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

const {
  getDashboardStats,getAllOrders,
updateOrderStatus,getCreditAccounts
,recordCustomerPayment,
} = require("../controllers/adminController");

router.get(
  "/dashboard",
  verifyToken,
  isAdmin,
  getDashboardStats
);
router.get(
  "/orders",
  verifyToken,
  isAdmin,
  getAllOrders
);

router.put(
  "/orders/:orderId",
  verifyToken,
  isAdmin,
  updateOrderStatus
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