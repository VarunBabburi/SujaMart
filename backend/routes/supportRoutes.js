// backend/routes/supportRoutes.js
const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const verifyToken = require("../middleware/authMiddleware");

const {
  submitContactMessage,
  createTicket,
  getMyTickets,
} = require("../controllers/supportController");

// Stops people from spamming the forms: 5 submissions per 15 minutes per IP.
// (Swap this for your own limiter from middleware/rateLimiter.js if you prefer.)
const supportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again in a few minutes." },
});

// Public: contact form
router.post("/contact", supportLimiter, submitContactMessage);

// Logged-in users: support tickets
router.post("/tickets", verifyToken, supportLimiter, createTicket);
router.get("/tickets", verifyToken, getMyTickets);

module.exports = router;