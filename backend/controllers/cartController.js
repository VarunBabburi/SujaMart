const db = require("../config/db");

exports.addToCart = (req, res) => {
  const userId = req.user.id;

  const { product_id, quantity } = req.body;
  const cartQuery = `
    SELECT *
    FROM carts
    WHERE user_id = ?
  `;

  db.query(
    cartQuery,
    [userId],
    (err, cartResult) => {

      if (err) {
        return res.status(500).json({
          message: err.message
        });
      }

      if (cartResult.length === 0) {

        db.query(
          `
          INSERT INTO carts(user_id)
          VALUES(?)
          `,
          [userId],
          (err, result) => {

            if (err) {
              return res.status(500).json({
                message: err.message
              });
            }

            insertCartItem(
              result.insertId
            );
          }
        );

      } else {

        insertCartItem(
          cartResult[0].id
        );

      }

      function insertCartItem(
        cartId
      ) {

        const checkQuery = `
          SELECT *
          FROM cart_items
          WHERE cart_id = ?
          AND product_id = ?
        `;

        db.query(
          checkQuery,
          [cartId, product_id],
          (err, items) => {

            if (err) {
              return res.status(500).json({
                message: err.message
              });
            }

            if (
              items.length > 0
            ) {

              db.query(
                `
                UPDATE cart_items
                SET quantity =
                    quantity + ?
                WHERE id = ?
                `,
                [
                  quantity,
                  items[0].id
                ],
                (err) => {

                  if (err) {
                    return res.status(500).json({
                      message:
                        err.message
                    });
                  }

                  res.json({
                    message:
                      "Cart Updated"
                  });
                }
              );

            } else {

              db.query(
                `
                INSERT INTO cart_items
                (
                  cart_id,
                  product_id,
                  quantity
                )
                VALUES(?,?,?)
                `,
                [
                  cartId,
                  product_id,
                  quantity
                ],
                (err) => {

                  if (err) {
                    return res.status(500).json({
                      message:
                        err.message
                    });
                  }

                  res.json({
                    message:
                      "Product Added To Cart"
                  });
                }
              );

            }
          }
        );
      }
    }
  );
};
exports.getCart = (req, res) => {
  const userId = req.user.id;

  const sql = `
  SELECT
    ci.id,
    ci.product_id,
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
exports.updateCartQuantity = (
  req,
  res
) => {
  const { id } = req.params;
  const { quantity } = req.body;

  const sql = `
    UPDATE cart_items
    SET quantity = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [quantity, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: err.message,
        });
      }

      res.json({
        message:
          "Quantity Updated",
      });
    }
  );
};
exports.getCartSummary = (
  req,
  res
) => {
  const userId = req.user.id;

  const sql = `
    SELECT
      COUNT(ci.id) AS items,
      IFNULL(
        SUM(
          p.price * ci.quantity
        ),
        0
      ) AS total
    FROM cart_items ci
    JOIN carts c
      ON ci.cart_id = c.id
    JOIN products p
      ON ci.product_id = p.id
    WHERE c.user_id = ?
  `;

  db.query(
    sql,
    [userId],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          message: err.message,
        });
      }

      res.json(results[0]);
    }
  );
};