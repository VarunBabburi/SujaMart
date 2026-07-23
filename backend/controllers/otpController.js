const db = require("../config/db");
const jwt = require("jsonwebtoken");
const axios = require("axios");

// SEND OTP
exports.sendOtp = async (req, res) => {
  const { phone } = req.body;
  const phoneRegex = /^[6-9]\d{9}$/;

  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ message: "Enter a valid 10-digit Indian phone number" });
  }

  try {
    // Check total OTP requests for this phone today
    const [rows] = await db.query(
      `SELECT attempts FROM otp_verifications WHERE phone=? AND DATE(created_at)=CURDATE()`,
      [phone]
    );

    if (rows.length > 0 && rows[0].attempts >= 5) {
      return res.status(429).json({
        message: "Daily limit reached (5 OTPs/day). Try again tomorrow."
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins validity

    if (rows.length > 0) {
      await db.query(
        `UPDATE otp_verifications SET otp=?, expires_at=?, attempts=attempts+1 WHERE phone=?`,
        [otp, expiry, phone]
      );
    } else {
      await db.query(
        `INSERT INTO otp_verifications (phone, otp, expires_at, attempts) VALUES (?, ?, ?, 1)`,
        [phone, otp, expiry]
      );
    }

    // Fast2SMS API Call
    // Inside sendOtp function in backend:
const domain = "sujamart.vercel.app"; // Your Vercel domain without https://

const message = `Your SujaMart OTP is ${otp}. Do not share this code.\n\n@${domain} #${otp}`;

await axios.post(
  "https://www.fast2sms.com/dev/bulkV2",
  {
    route: "q",
    message: message,
    language: "english",
    numbers: phone
  },
  {
    headers: { authorization: process.env.FAST2SMS_API_KEY },
    timeout: 5000
  }
);

    return res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("SMS / DB Error:", error.response?.data || error.message);
    return res.status(500).json({
      message: error.response?.data?.message || "Failed to send OTP. Please try again."
    });
  }
};

// VERIFY OTP
exports.verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp || otp.length !== 6) {
    return res.status(400).json({ message: "Please provide both mobile number and 6-digit OTP" });
  }

  try {
    const [records] = await db.query(
      `SELECT * FROM otp_verifications WHERE phone=? AND otp=?`,
      [phone, otp]
    );

    if (records.length === 0) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const record = records[0];
    const now = new Date();
    const expiresAt = new Date(record.expires_at);

    // Verify expiration threshold in JS runtime
    if (now > expiresAt) {
      return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }

    // Clean up used OTP
    await db.query(`DELETE FROM otp_verifications WHERE phone=?`, [phone]);

    // Check if user exists
    const [existingUsers] = await db.query(`SELECT id, name, phone, role FROM users WHERE phone=?`, [phone]);

    if (existingUsers.length > 0) {
      const user = existingUsers[0];
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({ token, user });
    }

    // Auto-register new customer
    const [result] = await db.query(
      `INSERT INTO users (name, phone, password, role) VALUES (?, ?, ?, ?)`,
      ["Customer", phone, "OTP_LOGIN", "customer"]
    );

    const newUser = {
      id: result.insertId,
      name: "Customer",
      phone,
      role: "customer"
    };

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ token, user: newUser });
  } catch (error) {
    console.error("Verify OTP Error:", error.message);
    return res.status(500).json({ message: "Verification failed due to server error" });
  }
};