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

const {
  adminListTickets,
  adminUpdateTicket,
  adminListMessages,
  adminUpdateMessage,
} = require("../controllers/supportAdminController");

// Stops people from spamming the forms: 5 submissions per 15 minutes per IP.
// (Swap this for your own limiter from middleware/rateLimiter.js if you prefer.)
const supportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again in a few minutes." },
});

// The JWT already carries the role (see authController), so no DB lookup is needed.
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  return res.status(403).json({ message: "Admin access only" });
};

// Public: contact form
router.post("/contact", supportLimiter, submitContactMessage);

// Logged-in users: support tickets
router.post("/tickets", verifyToken, supportLimiter, createTicket);
router.get("/tickets", verifyToken, getMyTickets);

// Admin: support inbox
router.get("/admin/tickets", verifyToken, requireAdmin, adminListTickets);
router.put("/admin/tickets/:id", verifyToken, requireAdmin, adminUpdateTicket);
router.get("/admin/messages", verifyToken, requireAdmin, adminListMessages);
router.put("/admin/messages/:id", verifyToken, requireAdmin, adminUpdateMessage);

module.exports = router;