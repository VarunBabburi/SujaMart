const mysql = require("mysql2");
const fs = require("fs");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,

  ssl: {
  ca: fs.readFileSync(
    process.env.NODE_ENV === "production"
      ? "/etc/secrets/ca.pem"
      : path.join(__dirname, "../certificate/ca.pem")
  ),
},

    dateStrings: true,
  timezone: "Z",

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Database Connection Failed:", err.message);
    return;
  }

  console.log("✅ MySQL Pool Connected Successfully");
  connection.release();
});

module.exports = pool.promise();