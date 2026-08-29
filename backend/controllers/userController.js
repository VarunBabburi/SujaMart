const db = require("../config/db");

exports.getProfile = (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT
      id,
      name,
      email,
      phone,
      address
    FROM users
    WHERE id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: err.message,
      });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(results[0]);
  });
};

exports.updateProfile = (req, res) => {
  const userId = req.user.id;
  const { name, address } = req.body;

  // Use COALESCE so undefined fields keep their existing values in the database
  const sql = `
    UPDATE users
    SET
      name = COALESCE(?, name),
      address = COALESCE(?, address)
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      name !== undefined ? name : null,
      address !== undefined ? address : null,
      userId,
    ],
    (err, result) => {
      if (err) {
        console.error("Profile update error:", err);
        return res.status(500).json({
          message: err.message,
        });
      }

      res.json({
        message: "Profile Updated Successfully",
      });
    }
  );
};