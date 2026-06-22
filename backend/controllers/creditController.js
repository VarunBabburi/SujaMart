const db = require("../config/db");

exports.addCreditPurchase = (req, res) => {
  const userId = req.user.id;

  const { amount, description } = req.body;

  const accountQuery = `
    SELECT *
    FROM credit_accounts
    WHERE user_id = ?
  `;

  db.query(accountQuery, [userId], (err, accounts) => {

    if (err) {
      return res.status(500).json({
        message: err.message
      });
    }

    if (accounts.length === 0) {
      return res.status(404).json({
        message: "Credit Account Not Found"
      });
    }

    const account = accounts[0];

    const newBalance =
      Number(account.outstanding_balance) +
      Number(amount);

    if (newBalance > account.credit_limit) {
      return res.status(400).json({
        message: "Credit Limit Exceeded"
      });
    }

    // Update Balance
    db.query(
      `
      UPDATE credit_accounts
      SET outstanding_balance = ?
      WHERE id = ?
      `,
      [newBalance, account.id],
      (err) => {

        if (err) {
          return res.status(500).json({
            message: err.message
          });
        }

        // Add Ledger Entry
        db.query(
          `
          INSERT INTO credit_transactions
          (credit_account_id,type,amount,description)
          VALUES(?,?,?,?)
          `,
          [
            account.id,
            "purchase",
            amount,
            description
          ],
          (err) => {

            if (err) {
              return res.status(500).json({
                message: err.message
              });
            }

            res.json({
              message: "Credit Purchase Added",
              outstandingBalance: newBalance
            });
          }
        );
      }
    );
  });
};
exports.recordPayment = (req, res) => {
  const userId = req.user.id;

  const { amount, description } = req.body;

  const accountQuery = `
    SELECT *
    FROM credit_accounts
    WHERE user_id = ?
  `;

  db.query(accountQuery, [userId], (err, accounts) => {

    if (err) {
      return res.status(500).json({
        message: err.message
      });
    }

    if (accounts.length === 0) {
      return res.status(404).json({
        message: "Credit Account Not Found"
      });
    }

    const account = accounts[0];

    if (amount > account.outstanding_balance) {
      return res.status(400).json({
        message: "Payment exceeds outstanding balance"
      });
    }

    const newBalance =
      Number(account.outstanding_balance) -
      Number(amount);

    db.query(
      `
      UPDATE credit_accounts
      SET outstanding_balance = ?
      WHERE id = ?
      `,
      [newBalance, account.id],
      (err) => {

        if (err) {
          return res.status(500).json({
            message: err.message
          });
        }

        db.query(
          `
          INSERT INTO credit_transactions
          (credit_account_id,type,amount,description)
          VALUES(?,?,?,?)
          `,
          [
            account.id,
            "payment",
            amount,
            description
          ],
          (err) => {

            if (err) {
              return res.status(500).json({
                message: err.message
              });
            }

            res.json({
              message: "Payment Recorded Successfully",
              outstandingBalance: newBalance
            });
          }
        );
      }
    );
  });
};
exports.getLedger = (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT
      ct.id,
      ct.type,
      ct.amount,
      ct.description,
      ct.transaction_date
    FROM credit_transactions ct
    JOIN credit_accounts ca
      ON ct.credit_account_id = ca.id
    WHERE ca.user_id = ?
    ORDER BY ct.transaction_date DESC
  `;

  db.query(sql, [userId], (err, results) => {

    if (err) {
      return res.status(500).json({
        message: err.message
      });
    }

    res.json(results);
  });
};