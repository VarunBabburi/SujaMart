const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
  addToCart,getCart,removeCartItem
} = require("../controllers/cartController");

router.post(
  "/add",
  verifyToken,
  addToCart
);
router.get(
  "/",
  verifyToken,
  getCart
);
router.delete(
  "/:itemId",
  verifyToken,
  removeCartItem
);

module.exports = router;