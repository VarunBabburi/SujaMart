// backend/controllers/supportAdminController.js
// Admin side of the support system: read, reply to and resolve messages and tickets.
const db = require("../config/db");
const logger = require("../utils/logger");

const TICKET_STATUSES = ["open", "in_progress", "resolved", "closed"];
const MESSAGE_STATUSES = ["new", "read", "resolved"];

// GET /api/support/admin/tickets
exports.adminListTickets = (req, res) => {
  const sql = `
    SELECT
      t.id, t.user_id, t.category, t.order_id, t.message, t.status,
      t.admin_reply, t.created_at, t.updated_at,
      u.name AS user_name, u.email AS user_email, u.phone AS user_phone
    FROM support_tickets t
    LEFT JOIN users u ON u.id = t.user_id
    ORDER BY
      FIELD(t.status, 'open', 'in_progress', 'resolved', 'closed'),
      t.created_at DESC
    LIMIT 500
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("ADMIN_LIST_TICKETS_ERROR:", err);
      return res.status(500).json({ message: "Could not load tickets" });
    }
    res.json(results);
  });
};

// PUT /api/support/admin/tickets/:id   body: { status?, admin_reply? }
exports.adminUpdateTicket = (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid ticket id" });
  }

  const fields = [];
  const values = [];

  if (req.body.status !== undefined) {
    if (!TICKET_STATUSES.includes(req.body.status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    fields.push("status = ?");
    values.push(req.body.status);
  }

  if (req.body.admin_reply !== undefined) {
    const reply = String(req.body.admin_reply || "").trim();
    if (reply.length > 2000) {
      return res.status(400).json({ message: "Reply is too long (max 2000 characters)" });
    }
    fields.push("admin_reply = ?");
    values.push(reply || null);
  }

  if (fields.length === 0) {
    return res.status(400).json({ message: "Nothing to update" });
  }

  values.push(id);

  db.query(
    `UPDATE support_tickets SET ${fields.join(", ")} WHERE id = ?`,
    values,
    (err, result) => {
      if (err) {
        console.error("ADMIN_UPDATE_TICKET_ERROR:", err);
        return res.status(500).json({ message: "Could not update ticket" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      logger.info({
        action: "SUPPORT_TICKET_UPDATED",
        ticketId: id,
        adminId: req.user.id,
        status: req.body.status,
        replied: req.body.admin_reply !== undefined,
      });

      res.json({ message: "Ticket updated" });
    }
  );
};

// GET /api/support/admin/messages
exports.adminListMessages = (req, res) => {
  const sql = `
    SELECT id, user_id, name, email, phone, message, status, created_at
    FROM contact_messages
    ORDER BY FIELD(status, 'new', 'read', 'resolved'), created_at DESC
    LIMIT 500
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("ADMIN_LIST_MESSAGES_ERROR:", err);
      return res.status(500).json({ message: "Could not load messages" });
    }
    res.json(results);
  });
};

// PUT /api/support/admin/messages/:id   body: { status }
exports.adminUpdateMessage = (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid message id" });
  }
  if (!MESSAGE_STATUSES.includes(req.body.status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  db.query(
    "UPDATE contact_messages SET status = ? WHERE id = ?",
    [req.body.status, id],
    (err, result) => {
      if (err) {
        console.error("ADMIN_UPDATE_MESSAGE_ERROR:", err);
        return res.status(500).json({ message: "Could not update message" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json({ message: "Message updated" });
    }
  );
};