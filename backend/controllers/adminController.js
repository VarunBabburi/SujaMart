const db = require("../config/db");

exports.getDashboardStats = (req, res) => {
  const stats = {};

  db.query(
    "SELECT COUNT(*) AS totalProducts FROM products",
    (err, products) => {
      if (err) {
        return res.status(500).json({
          message: err.message,
        });
      }

      stats.totalProducts =
        products[0].totalProducts;

      db.query(
        "SELECT COUNT(*) AS totalOrders FROM orders",
        (err, orders) => {
          if (err) {
            return res.status(500).json({
              message: err.message,
            });
          }

          stats.totalOrders =
            orders[0].totalOrders;

          db.query(
            "SELECT COUNT(*) AS totalCustomers FROM users WHERE role='customer'",
            (err, customers) => {
              if (err) {
                return res.status(500).json({
                  message: err.message,
                });
              }

              stats.totalCustomers =
                customers[0].totalCustomers;

              db.query(
                `SELECT IFNULL(
                  SUM(outstanding_balance),
                  0
                ) AS totalOutstanding
                FROM credit_accounts`,
                (err, credit) => {
                  if (err) {
                    return res.status(500).json({
                      message: err.message,
                    });
                  }

                  stats.totalOutstanding =
                    credit[0].totalOutstanding;

                  res.json(stats);
                }
              );
            }
          );
        }
      );
    }
  );
};
exports.getAllOrders = (req, res) => {
  const sql = `
    SELECT
      o.id,
      o.total_amount,
      o.order_status,
      o.created_at,
      u.name,
      u.phone
    FROM orders o
    JOIN users u
      ON o.user_id = u.id
    ORDER BY o.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: err.message,
      });
    }

    res.json(results);
  });
};
exports.updateOrderStatus = (req, res) => {
  const { orderId } = req.params;

  const { status } = req.body;

  const sql = `
    UPDATE orders
    SET order_status = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [status, orderId],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: err.message,
        });
      }

      res.json({
        message:
          "Order Status Updated",
      });
    }
  );
};
exports.getCreditAccounts = (req, res) => {
  const sql = `
    SELECT
      ca.id,
      ca.outstanding_balance,
      ca.credit_limit,
      u.id as user_id,
      u.name,
      u.phone
    FROM credit_accounts ca
    JOIN users u
      ON ca.user_id = u.id
    ORDER BY ca.outstanding_balance DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: err.message
      });
    }

    res.json(results);
  });
};

exports.recordCustomerPayment = (
  req,
  res
) => {
  const { userId, amount } = req.body;

  const sql = `
    SELECT *
    FROM credit_accounts
    WHERE user_id = ?
  `;

  db.query(sql, [userId], (err, accounts) => {

    if (err) {
      return res.status(500).json({
        message: err.message
      });
    }

    if (accounts.length === 0) {
      return res.status(404).json({
        message:
          "Credit Account Not Found"
      });
    }

    const account = accounts[0];

    const newBalance =
      Number(account.outstanding_balance) -
      Number(amount);

    db.query(
      `
      UPDATE credit_accounts
      SET outstanding_balance = ?
      WHERE user_id = ?
      `,
      [newBalance, userId],
      (err) => {

        if (err) {
          return res.status(500).json({
            message: err.message
          });
        }

        db.query(
          `
          INSERT INTO credit_transactions
          (
            credit_account_id,
            type,
            amount,
            description
          )
          VALUES(?,?,?,?)
          `,
          [
            account.id,
            "payment",
            amount,
            "Admin Payment Entry"
          ]
        );

        res.json({
          message:
            "Payment Recorded"
        });
      }
    );
  });
};