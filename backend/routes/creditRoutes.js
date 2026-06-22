const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
  addCreditPurchase,recordPayment,getLedger
} = require("../controllers/creditController");

router.post(
  "/purchase",
  verifyToken,
  addCreditPurchase
);
router.post(
  "/payment",
  verifyToken,
  recordPayment
);
router.get(
  "/ledger",
  verifyToken,
  getLedger
);

module.exports = router;