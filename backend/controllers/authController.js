const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

exports.registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, address } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users(name,email,phone,password,address)
      VALUES(?,?,?,?,?)
    `;

    db.query(
  sql,
  [name, email, phone, hashedPassword, address],
  (err, result) => {

    if (err) {
      return res.status(500).json({
        message: err.message,
      });
    }

    const userId =
      result.insertId;

    db.query(
      `
      INSERT INTO credit_accounts
      (
        user_id,
        credit_limit,
        outstanding_balance
      )
      VALUES(?,?,?)
      `,
      [
        userId,
        5000,
        0
      ],
      (creditErr) => {

        if (creditErr) {
          return res.status(500).json({
            message:
              creditErr.message,
          });
        }

        logger.info({
  action: "USER_REGISTER",
  email,
});

        res.status(201).json({
          message:
            "User Registered Successfully",
        });

      }
    );
  }
);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, results) => {
      if (err) {
        return res.status(500).json({
          message: err.message,
        });
      }

      if (results.length === 0) {
        return res.status(400).json({
          message: "User not found",
        });
      }

      const user = results[0];

      const isMatch = await bcrypt.compare(
        password,
        user.password
      );

      if (!isMatch) {
        return res.status(400).json({
          message: "Invalid Password",
        });
      }

      const token = jwt.sign(
  {
    id: user.id,
    role: user.role,
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "1d",
  }
);

logger.info({
  action: "USER_LOGIN",
  userId: user.id,
  email: user.email,
});

      res.json({
        message: "Login Successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};