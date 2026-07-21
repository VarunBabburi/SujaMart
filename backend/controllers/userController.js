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

    res.json(results[0]);
  });
};


exports.updateProfile = (req, res) => {
  const userId = req.user.id;

  const {
    name,
    phone,
    address,
  } = req.body;

  const sql = `
    UPDATE users
    SET
      name = ?,
      phone = ?,
      address = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      name,
      phone,
      address,
      userId,
    ],
    (err) => {
      if (err) {
        return res.status(500).json({
          message: err.message,
        });
      }

      res.json({
        message:
          "Profile Updated Successfully",
      });
    }
  );
};