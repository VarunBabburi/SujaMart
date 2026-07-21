const db = require("../config/db");
const logger = require("../utils/logger");

exports.placeOrder = (req, res) => {
  const userId = req.user.id;

  const {
    paymentMethod,
    razorpay_order_id,
    razorpay_payment_id,
    address_id
  } = req.body;

  if (!address_id) {

    return res.status(400).json({
      message:
        "Please select delivery address"
    });

  }

  console.log(
    "ORDER BODY:",
    req.body
  );

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
      `
INSERT INTO orders
(
  user_id,
  total_amount,
  payment_method,
  address_id
)
VALUES(?,?,?,?)
`,
      [userId, totalAmount, paymentMethod || "cash", address_id],
      (err, orderResult) => {

        if (err) {
          return res.status(500).json({
            message: err.message
          });
        }

        const orderId = orderResult.insertId;


        // Save Razorpay Payment Details

        if (paymentMethod === "online") {

          db.query(
            `
    INSERT INTO payments
    (
      order_id,
      razorpay_order_id,
      razorpay_payment_id,
      amount,
      payment_status
    )
    VALUES(?,?,?,?,?)
    `,
            [
              orderId,
              razorpay_order_id,
              razorpay_payment_id,
              totalAmount,
              "success"
            ],
            (err) => {

              if (err) {
                console.log(
                  "Payment Save Error:",
                  err
                );
              }

            }
          );

        }


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
            console.log(
              "Payment Method:",
              paymentMethod
            );

            console.log(
              "Total Amount:",
              totalAmount
            );

            if (
              paymentMethod === "udhaar"
            ) {

              console.log(
                "Updating Credit Account"
              );

              db.query(
                `
    UPDATE credit_accounts
    SET outstanding_balance =
      outstanding_balance + ?
    WHERE user_id = ?
    `,
                [
                  totalAmount,
                  userId
                ],
                (err, result) => {

                  if (err) {
                    console.log(err);
                  }

                  console.log(
                    "Credit Update Result:",
                    result
                  );
                }
              );
            }

            db.query(
              "DELETE FROM cart_items WHERE cart_id = ?",
              [cartItems[0].cart_id]
            );


            db.query(
`
INSERT INTO notifications
(
title,
message,
order_id
)
VALUES(?,?,?)
`,
[

"New Order",

`Order #${orderId} received ₹${totalAmount}`,

orderId

]
);
            const io =
req.app.get("io");


console.log(
  "IO OBJECT:",
  io ? "FOUND" : "NOT FOUND"
);


console.log(
  "SENDING NEW ORDER SOCKET:",
  orderId
);


io.emit(
  "new-order",
  {

    orderId:
    orderId,

    amount:
    totalAmount,

    message:
    "New Order Received"

  }
);


console.log(
  "SOCKET SENT SUCCESSFULLY"
);

logger.info({
  action: "ORDER_PLACED",
  orderId,
  userId,
  amount: totalAmount,
  paymentMethod: paymentMethod || "cash",
  addressId: address_id,
  items: cartItems.length,
});

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
      delivery_boy,
delivery_time,
delivery_assigned_at,
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
  o.payment_method,
  o.created_at,

    a.name AS delivery_name,
  a.phone AS delivery_phone,
  a.address_line,
  a.city,
  a.pincode,
  a.landmark,
  a.address_type,
  a.alternate_phone,

  pay.razorpay_order_id,
  pay.razorpay_payment_id,
  pay.payment_status,

  p.name,
  p.image_url,

  oi.quantity,
  oi.price_at_purchase,

  (oi.quantity * oi.price_at_purchase) AS subtotal

FROM orders o

LEFT JOIN addresses a
ON o.address_id = a.id

JOIN order_items oi
ON o.id = oi.order_id

JOIN products p
ON oi.product_id = p.id

LEFT JOIN payments pay
ON o.id = pay.order_id

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