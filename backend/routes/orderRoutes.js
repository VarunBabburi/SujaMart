const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
  placeOrder,getMyOrders,getOrderDetails
} = require("../controllers/orderController");

router.post(
  "/place",
  verifyToken,
  placeOrder
);
router.get(
  "/my-orders",
  verifyToken,
  getMyOrders
);
router.get(
  "/:orderId",
  verifyToken,
  getOrderDetails
);

module.exports = router;