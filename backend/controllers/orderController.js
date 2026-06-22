const db = require("../config/db");

exports.placeOrder = (req, res) => {
  const userId = req.user.id;

  // Get cart items
  const cartQuery = `
    SELECT
      ci.product_id,
      ci.quantity,
      p.price,
      c.id AS cart_id
    FROM carts c
    JOIN cart_items ci
      ON c.id = ci.cart_id
    JOIN products p
      ON ci.product_id = p.id
    WHERE c.user_id = ?
  `;

  db.query(cartQuery, [userId], (err, cartItems) => {
    if (err) {
      return res.status(500).json({
        message: err.message
      });
    }

    if (cartItems.length === 0) {
      return res.status(400).json({
        message: "Cart is empty"
      });
    }

    let totalAmount = 0;

    cartItems.forEach(item => {
      totalAmount += item.price * item.quantity;
    });

    // Create Order
    db.query(
      "INSERT INTO orders(user_id,total_amount) VALUES(?,?)",
      [userId, totalAmount],
      (err, orderResult) => {

        if (err) {
          return res.status(500).json({
            message: err.message
          });
        }

        const orderId = orderResult.insertId;

        let completed = 0;

        cartItems.forEach(item => {

          db.query(
            `INSERT INTO order_items
            (order_id,product_id,quantity,price_at_purchase)
            VALUES(?,?,?,?)`,
            [
              orderId,
              item.product_id,
              item.quantity,
              item.price
            ]
          );

          // Reduce Stock
          db.query(
            `UPDATE products
             SET stock_quantity = stock_quantity - ?
             WHERE id = ?`,
            [
              item.quantity,
              item.product_id
            ]
          );

          completed++;

          if (completed === cartItems.length) {

            db.query(
              "DELETE FROM cart_items WHERE cart_id = ?",
              [cartItems[0].cart_id]
            );

            res.json({
              message: "Order Placed Successfully",
              orderId,
              totalAmount
            });
          }
        });
      }
    );
  });
};
exports.getMyOrders = (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT
      id,
      total_amount,
      order_status,
      created_at
    FROM orders
    WHERE user_id = ?
    ORDER BY created_at DESC
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
exports.getOrderDetails = (req, res) => {
  const userId = req.user.id;
  const { orderId } = req.params;

  const sql = `
    SELECT
      o.id AS order_id,
      o.total_amount,
      o.order_status,
      p.name,
      oi.quantity,
      oi.price_at_purchase
    FROM orders o
    JOIN order_items oi
      ON o.id = oi.order_id
    JOIN products p
      ON oi.product_id = p.id
    WHERE o.id = ?
      AND o.user_id = ?
  `;

  db.query(sql, [orderId, userId], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: err.message
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Order Not Found"
      });
    }

    res.json(results);
  });
};