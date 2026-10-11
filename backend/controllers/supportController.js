// backend/controllers/supportController.js
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

// Must match the topic ids used in the frontend CustomerSupport page
const CATEGORIES = ["order", "delivery", "payment", "quality", "account", "udhaar"];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─────────────────────────────────────────────
// POST /api/support/contact   (public)
// Works for logged-out users; links the user if a valid token is sent
// ─────────────────────────────────────────────
exports.submitContactMessage = (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim();
    const phoneRaw = String(req.body.phone || "").trim();
    const message = String(req.body.message || "").trim();

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (name.length > 100) {
      return res.status(400).json({ message: "Name is too long" });
    }

    if (!email && !phoneRaw) {
      return res.status(400).json({
        message: "Please provide an email or phone number so we can reach you",
      });
    }

    if (email && (!EMAIL_REGEX.test(email) || email.length > 150)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    // Same flexible cleaning as the address form: spaces, dashes and + are allowed
    const phone = phoneRaw.replace(/[\s\-\+]/g, "");
    if (phoneRaw && !/^\d{10,13}$/.test(phone)) {
      return res.status(400).json({ message: "Please enter a valid phone number" });
    }

    if (message.length < 10) {
      return res.status(400).json({ message: "Message is too short" });
    }
    if (message.length > 2000) {
      return res.status(400).json({ message: "Message is too long (max 2000 characters)" });
    }

    // Optional auth: attach user id if the request carries a valid token
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        const decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (e) {
        userId = null;
      }
    }

    const sql = `
      INSERT INTO contact_messages (user_id, name, email, phone, message)
      VALUES (?,?,?,?,?)
    `;

    db.query(
      sql,
      [userId, name, email || null, phone || null, message],
      (err, result) => {
        if (err) {
          console.error("CONTACT_MESSAGE_ERROR:", err);
          return res.status(500).json({
            message: "Could not send your message. Please try again.",
          });
        }

        logger.info({
          action: "CONTACT_MESSAGE_RECEIVED",
          messageId: result.insertId,
          userId,
        });

        res.status(201).json({
          message: "Message sent successfully",
          messageId: result.insertId,
        });
      }
    );
  } catch (error) {
    console.error("CONTACT_MESSAGE_ERROR:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ─────────────────────────────────────────────
// POST /api/support/tickets   (login required)
// ─────────────────────────────────────────────
exports.createTicket = (req, res) => {
  try {
    const userId = req.user.id;

    const category = String(req.body.category || "").trim();
    const message = String(req.body.message || "").trim();

    let orderId = null;
    if (req.body.order_id !== undefined && req.body.order_id !== null && req.body.order_id !== "") {
      orderId = Number(req.body.order_id);
      if (!Number.isInteger(orderId) || orderId <= 0) {
        return res.status(400).json({ message: "Order ID must be a valid number" });
      }
    }

    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ message: "Please choose a valid topic" });
    }
    if (message.length < 10) {
      return res.status(400).json({ message: "Please describe your issue in a few words" });
    }
    if (message.length > 2000) {
      return res.status(400).json({ message: "Message is too long (max 2000 characters)" });
    }

    const sql = `
      INSERT INTO support_tickets (user_id, category, order_id, message)
      VALUES (?,?,?,?)
    `;

    db.query(sql, [userId, category, orderId, message], (err, result) => {
      if (err) {
        console.error("CREATE_TICKET_ERROR:", err);
        return res.status(500).json({
          message: "Could not submit your request. Please try again.",
        });
      }

      logger.info({
        action: "SUPPORT_TICKET_CREATED",
        ticketId: result.insertId,
        userId,
        category,
        orderId,
      });

      res.status(201).json({
        message: "Support request submitted",
        ticketId: result.insertId,
      });
    });
  } catch (error) {
    console.error("CREATE_TICKET_ERROR:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ─────────────────────────────────────────────
// GET /api/support/tickets   (login required)
// The logged-in user's own tickets, newest first
// ─────────────────────────────────────────────
exports.getMyTickets = (req, res) => {
  const sql = `
    SELECT id, category, order_id, message, status, admin_reply, created_at, updated_at
    FROM support_tickets
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [req.user.id], (err, results) => {
    if (err) {
      console.error("GET_TICKETS_ERROR:", err);
      return res.status(500).json({ message: "Could not load your requests" });
    }

    res.json(results);
  });
};