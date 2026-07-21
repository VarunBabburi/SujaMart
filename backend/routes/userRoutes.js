const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
  getProfile,
  updateProfile,
} = require("../controllers/userController");

router.get(
  "/profile",
  verifyToken,
  getProfile
);

router.put(
  "/profile",
  verifyToken,
  updateProfile
);

module.exports = router;