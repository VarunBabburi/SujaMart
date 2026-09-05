const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadmiddleware");

const {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

router.get("/", getCategories);

router.post(
  "/",
  verifyToken,
  isAdmin,
  upload.single("image"),
  addCategory
);
router.put("/:id", verifyToken, isAdmin, upload.single("image"), updateCategory);
router.delete("/:id", verifyToken, isAdmin, deleteCategory);

module.exports = router;