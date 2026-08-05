const db = require("../config/db");
const jwt = require("jsonwebtoken");
const axios = require("axios");

// SEND OTP
exports.sendOtp = (req, res) => {
  const { phone } = req.body;
  const cleanPhone = phone ? phone.toString().replace(/\D/g, "").slice(-10) : "";

  if (cleanPhone.length !== 10) {
    return res.status(400).json({ message: "Invalid mobile number" });
  }

  // Check today's OTP count
  db.query(
    `SELECT * FROM otp_verifications WHERE phone=? AND DATE(created_at)=CURDATE()`,
    [cleanPhone],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });

      if (result.length > 0 && result[0].attempts >= 5) {
        return res.status(429).json({ message: "Daily OTP limit reached. Try again tomorrow." });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date(Date.now() + 5 * 60 * 1000);

      const smsMessage = `Your SujaMart OTP is ${otp}. Do not share this code.\n\n@sujamart.vercel.app #${otp}`;

      const saveOtpQuery = result.length > 0
        ? `UPDATE otp_verifications SET otp=?, expires_at=?, attempts=attempts+1 WHERE phone=?`
        : `INSERT INTO otp_verifications (otp, expires_at, attempts, phone) VALUES (?, ?, 1, ?)`;

      const params = result.length > 0 ? [otp, expiry, cleanPhone] : [otp, expiry, cleanPhone];

      db.query(saveOtpQuery, params, (err) => {
        if (err) return res.status(500).json({ message: err.message });

        // Send SMS via Fast2SMS
        axios.post(
          "https://www.fast2sms.com/dev/bulkV2",
          {
            route: "q",
            message: smsMessage,
            language: "english",
            numbers: cleanPhone
          },
          {
            headers: { authorization: process.env.FAST2SMS_API_KEY },
            timeout: 7000
          }
        )
        .then(() => res.json({ message: "OTP Sent Successfully" }))
        .catch((error) => {
          console.error("Fast2SMS Error:", error.response?.data || error.message);
          return res.status(500).json({ message: "SMS sending failed. Check Fast2SMS balance/key." });
        });
      });
    }
  );
};

// VERIFY OTP
exports.verifyOtp = (req, res) => {
  const { phone, otp } = req.body;
  const cleanPhone = phone ? phone.toString().replace(/\D/g, "").slice(-10) : "";

  db.query(
    `SELECT * FROM otp_verifications WHERE phone=? AND otp=?`,
    [cleanPhone, otp],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });

      if (result.length === 0) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      const record = result[0];
      if (new Date() > new Date(record.expires_at)) {
        return res.status(400).json({ message: "OTP expired. Request a new one." });
      }

      // Cleanup verified OTP
      db.query(`DELETE FROM otp_verifications WHERE phone=?`, [cleanPhone]);

      // Check if user exists (check for exact match OR last 10 digits match)
      db.query(
        `SELECT * FROM users WHERE phone LIKE ? OR phone=?`,
        [`%${cleanPhone}`, cleanPhone],
        (err, users) => {
          if (err) return res.status(500).json({ message: err.message });

          if (users.length > 0) {
            const user = users[0];
            const token = jwt.sign(
              { id: user.id, role: user.role },
              process.env.JWT_SECRET,
              { expiresIn: "7d" }
            );
            return res.json({ token, user });
          }

          // Register new user only if no user matched
          db.query(
            `INSERT INTO users (name, phone, password, role) VALUES (?, ?, ?, ?)`,
            ["Customer", cleanPhone, "OTP_LOGIN", "customer"],
            (err, newUser) => {
              if (err) return res.status(500).json({ message: err.message });

              const newUserId = newUser.insertId;

    // Create Credit Account for OTP registered user
    db.query(
      `INSERT INTO credit_accounts (user_id, credit_limit, outstanding_balance) VALUES (?, ?, ?)`,
      [newUserId, 5000, 0],
      (creditErr) => {
        if (creditErr) {
          return res.status(500).json({ message: creditErr.message });
        }

              const token = jwt.sign(
                { id: newUser.insertId, role: "customer" },
                process.env.JWT_SECRET,
                { expiresIn: "90d" }
              );

return res.json({
                token,
                user: { id: newUser.insertId, name: "Customer", phone: cleanPhone, role: "customer" }
              });
            }
          );
        }
      );
    }
  );
    }
  );
};
