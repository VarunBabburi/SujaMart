const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

const {
  addProduct,
  getProducts,
  getProductById,
   updateProduct,
  deleteProduct
} = require("../controllers/productController");

router.post(
  "/",
  verifyToken,
  isAdmin,
  addProduct
);

router.put(
  "/:id",
  verifyToken,
  isAdmin,
  updateProduct
);

router.delete(
  "/:id",
  verifyToken,
  isAdmin,
  deleteProduct
);
router.get("/", getProducts);
router.get("/:id", getProductById);

module.exports = router;