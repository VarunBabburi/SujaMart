const db = require("../config/db");

exports.addToCart = (req, res) => {
  const userId = req.user.id;

  const { product_id, quantity } = req.body;

  // Check if cart exists
  const cartQuery = `
    SELECT * FROM carts
    WHERE user_id = ?
  `;

  db.query(cartQuery, [userId], (err, cartResult) => {
    if (err) {
      return res.status(500).json({
        message: err.message
      });
    }

    // Create cart if not exists
    if (cartResult.length === 0) {
      db.query(
        "INSERT INTO carts(user_id) VALUES(?)",
        [userId],
        (err, result) => {
          if (err) {
            return res.status(500).json({
              message: err.message
            });
          }

          const cartId = result.insertId;

          insertCartItem(cartId);
        }
      );
    } else {
      const cartId = cartResult[0].id;

      insertCartItem(cartId);
    }

    function insertCartItem(cartId) {
      const itemQuery = `
        INSERT INTO cart_items
        (cart_id, product_id, quantity)
        VALUES(?,?,?)
      `;

      db.query(
        itemQuery,
        [cartId, product_id, quantity],
        (err) => {
          if (err) {
            return res.status(500).json({
              message: err.message
            });
          }

          res.json({
            message: "Product Added To Cart"
          });
        }
      );
    }
  });
};
exports.getCart = (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT
      ci.id,
      p.name,
      p.price,
      ci.quantity,
      (p.price * ci.quantity) AS subtotal
    FROM carts c
    JOIN cart_items ci
      ON c.id = ci.cart_id
    JOIN products p
      ON ci.product_id = p.id
    WHERE c.user_id = ?
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
exports.removeCartItem = (req, res) => {
  const { itemId } = req.params;

  const sql = `
    DELETE FROM cart_items
    WHERE id = ?
  `;

  db.query(sql, [itemId], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: err.message
      });
    }

    res.json({
      message: "Item Removed From Cart"
    });
  });
};