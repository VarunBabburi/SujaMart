const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const validate =
require("../middleware/validate");
const verifyToken = require("../middleware/authMiddleware");
const upload = require(
  "../middleware/uploadMiddleware"
);

const isAdmin = require("../middleware/adminMiddleware");


const {
  addProduct,
  getProducts,
  getActiveProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  toggleProductStatus
} = require(
  "../controllers/productController"
);

router.post(
  "/",
  verifyToken,
  isAdmin,
  upload.single("image"),
  body("price")
    .notEmpty()
    .isFloat({ min: 1 })
    .withMessage("Invalid price"),
  validate,
  addProduct
);

router.put(
  "/:id",
  verifyToken,
  isAdmin,
  body("price")
    .optional()
    .isFloat({ min: 1 })
    .withMessage("Invalid price"),

  validate,
  upload.single("image"),
  updateProduct
);

router.put(
  "/status/:id",
  verifyToken,
  isAdmin,
  toggleProductStatus
);

router.delete(
  "/:id",
  verifyToken,
  isAdmin,
  deleteProduct
);

router.get(
  "/active/all",
  getActiveProducts
);

router.get("/", getProducts);
router.get("/:id", getProductById);

module.exports = router;