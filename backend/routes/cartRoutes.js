const express = require("express");
const router = express.Router();

const { body } = require("express-validator");

const validate =
require("../middleware/validate");

const verifyToken = require("../middleware/authMiddleware");

const {
  addToCart,getCart,removeCartItem,updateCartQuantity,getCartSummary
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
router.put(
  "/:id",
  verifyToken,
  body("quantity")
.isInt({
min:1
})
.withMessage(
"Invalid quantity"
),validate,
  updateCartQuantity
);
router.get(
  "/summary",
  verifyToken,
  getCartSummary
);

module.exports = router;