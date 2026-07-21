const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

const {
  getCategories,
  addCategory,
} = require("../controllers/categoryController");

router.get("/", getCategories);

router.post(
  "/",
  verifyToken,
  isAdmin,
  addCategory
);

module.exports = router;