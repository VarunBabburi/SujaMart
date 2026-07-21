const db = require("../config/db");
const logger = require("../utils/logger");


exports.getDashboardStats = (req, res) => {
  const dashboardData = {};

  db.query(
    "SELECT COUNT(*) AS totalProducts FROM products",
    (err, products) => {

      dashboardData.totalProducts =
        products[0].totalProducts;

      db.query(
        "SELECT COUNT(*) AS totalOrders FROM orders",
        (err, orders) => {

          dashboardData.totalOrders =
            orders[0].totalOrders;

          db.query(
            "SELECT COUNT(*) AS totalCustomers FROM users WHERE role='customer'",
            (err, users) => {

              dashboardData.totalCustomers =
                users[0].totalCustomers;

              db.query(
                `SELECT IFNULL(
                  SUM(outstanding_balance),
                  0
                ) AS totalOutstanding
                FROM credit_accounts`,
                (err, credit) => {

                  dashboardData.totalOutstanding =
                    credit[0].totalOutstanding;

                  db.query(
                    `
                    SELECT IFNULL(
                      SUM(total_amount),
                      0
                    ) AS todaySales
                    FROM orders
                    WHERE DATE(created_at)=CURDATE()
                    `,
                    (err, today) => {

                      dashboardData.todaySales =
                        today[0].todaySales;

                      db.query(
                        `
                        SELECT IFNULL(
                          SUM(total_amount),
                          0
                        ) AS monthlySales
                        FROM orders
                        WHERE MONTH(created_at)=MONTH(CURDATE())
                        AND YEAR(created_at)=YEAR(CURDATE())
                        `,
                        (err, monthly) => {

                          dashboardData.monthlySales =
                            monthly[0].monthlySales;

                          db.query(
                            `
                            SELECT COUNT(*) AS pendingOrders
                            FROM orders
                            WHERE order_status='Pending'
                            `,
                            (err, pending) => {

                              dashboardData.pendingOrders =
                                pending[0].pendingOrders;

                              db.query(
                                `
                                SELECT COUNT(*) AS deliveredOrders
                                FROM orders
                                WHERE order_status='Delivered'
                                `,
                                (err, delivered) => {

                                  dashboardData.deliveredOrders =
                                    delivered[0].deliveredOrders;

                                  res.json(
                                    dashboardData
                                  );
                                }
                              );
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
};
exports.getAllOrders =
(req,res)=>{


const sql = `

SELECT

o.id AS order_id,
o.total_amount,
o.order_status,
o.delivery_boy,
o.delivery_time,

u.name AS customer_name,
u.phone,


p.name AS product_name,
p.image_url,

oi.quantity,
oi.price_at_purchase


FROM orders o


JOIN users u
ON o.user_id = u.id       


JOIN order_items oi
ON o.id = oi.order_id


JOIN products p
ON oi.product_id = p.id

ORDER BY o.id DESC


`;


db.query(
sql,
(err,result)=>{


if(err){

return res.status(500)
.json({
message:err.message
});

}


// group products by order

const orders ={};


result.forEach(row=>{


if(!orders[row.order_id]){


orders[row.order_id]={

id:
row.order_id,

customer_name:
row.customer_name,

phone:
row.phone,

total_amount:
row.total_amount,

order_status:
row.order_status,

delivery_boy: row.delivery_boy,  
          delivery_time: row.delivery_time,

items:[]

};


}


orders[row.order_id]
.items
.push({

name:
row.product_name,

image:
row.image_url,

quantity:
row.quantity,

price:
row.price_at_purchase

});


});


res.json(

Object.values(
orders
)

);


}

);


};


exports.updateOrderStatus = (req, res) => {
  const { orderId } = req.params;

  const { status } = req.body;
  const io = req.app.get("io");

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

      db.query(
`
SELECT user_id
FROM orders
WHERE id=?
`,
[orderId],
(err,result)=>{


if(
!err &&
result.length>0
){


const userId =
result[0].user_id;


io.to(
`user_${userId}`
)
.emit(

"order-status-update",

{

orderId,

status,

message:
`Your order #${orderId} is ${status}`

}

);


}


}
);

logger.info({
  action: "ORDER_STATUS_CHANGED",
  orderId,
  status,
});

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

   const newBalance = Math.max(
  0,
  Number(account.outstanding_balance) -
  Number(amount)
);
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


        logger.info({
  action: "CUSTOMER_PAYMENT_RECORDED",
  adminId: req.user.id,
  userId,
  amount,
  remainingBalance: newBalance,
});
        res.json({
          message:
            "Payment Recorded"
        });
      }
    );
  });
};
exports.getTopProducts = (req, res) => {
  const sql = `
    SELECT
      p.name,
      SUM(oi.quantity) AS totalSold
    FROM order_items oi
    JOIN products p
      ON oi.product_id = p.id
    GROUP BY p.id
    ORDER BY totalSold DESC
    LIMIT 5
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

exports.getLowStockProducts = (req, res) => {
  const sql = `
    SELECT
      id,
      name,
      stock_quantity
    FROM products
    WHERE stock_quantity <= 10
    AND is_active = TRUE
    ORDER BY stock_quantity ASC
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
exports.getCustomers = (req, res) => {
  const sql = `
    SELECT
      u.id,
      u.name,
      u.email,
      u.phone,

      COUNT(o.id) AS totalOrders,

      COALESCE(
        ca.outstanding_balance,
        0
      ) AS outstanding

    FROM users u

    LEFT JOIN orders o
      ON u.id = o.user_id

    LEFT JOIN credit_accounts ca
      ON u.id = ca.user_id

    WHERE u.role='customer'

    GROUP BY
      u.id

    ORDER BY
      u.name
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
exports.getCustomerDetails = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT
      u.id,
      u.name,
      u.email,
      u.phone,
      u.address,

      COUNT(o.id) AS totalOrders,

      COALESCE(
        SUM(o.total_amount),
        0
      ) AS totalSpent,

      COALESCE(
        ca.outstanding_balance,
        0
      ) AS outstanding

    FROM users u

    LEFT JOIN orders o
      ON u.id = o.user_id

    LEFT JOIN credit_accounts ca
      ON u.id = ca.user_id

    WHERE u.id = ?

    GROUP BY u.id
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: err.message,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Customer Not Found",
      });
    }

    res.json(results[0]);
  });
};
exports.getCustomerOrders = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT
      id,
      total_amount,
      payment_method,
      order_status,
      created_at
    FROM orders
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: err.message,
      });
    }

    res.json(results);
  });
};

exports.getOrderDetailsAdmin = (req, res) => {
  const { orderId } = req.params;

  const sql = `
    SELECT
      o.id AS order_id,
      o.total_amount,
      o.payment_method,
      o.order_status,
      o.created_at,

      a.name AS delivery_name,
a.phone AS delivery_phone,
a.address_line,
a.city,
a.pincode,
a.landmark,
a.address_type,


      pay.razorpay_order_id,
 pay.razorpay_payment_id,
 pay.payment_status,

      p.name,
      p.image_url,

      oi.quantity,
      oi.price_at_purchase

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
  `;

  db.query(sql, [orderId], (err, results) => {

    if (err) {
      return res.status(500).json({
        message: err.message,
      });
    }

    res.json(results);

  });
};
exports.getSalesChart = (req, res) => {

  const sql = `
    SELECT
      DATE(created_at) AS sale_date,
      SUM(total_amount) AS total_sales

    FROM orders

    GROUP BY DATE(created_at)

    ORDER BY sale_date DESC

    LIMIT 7
  `;

  db.query(sql, (err, results) => {

    if (err) {
      return res.status(500).json({
        message: err.message,
      });
    }

    res.json(results.reverse());

  });

};

exports.getAllPayments = (req, res) => {

  const sql = `
    SELECT

      pay.id,

      pay.razorpay_order_id,

      pay.razorpay_payment_id,

      pay.amount,

      pay.payment_status,

      pay.created_at,


      o.id AS order_id,

      o.payment_method,


      u.name AS customer_name,

      u.email,

      u.phone


    FROM payments pay


    JOIN orders o
    ON pay.order_id = o.id


    JOIN users u
    ON o.user_id = u.id


    ORDER BY pay.created_at DESC
  `;


  db.query(
    sql,
    (err, results) => {

      if (err) {

        return res
        .status(500)
        .json({
          message: err.message
        });

      }


      res.json(results);

    }
  );

};


exports.assignDelivery =(req,res)=>{


const {orderId} =
req.params;


const {
deliveryBoy,
deliveryTime
}=req.body;


const sql = `

UPDATE orders

SET

delivery_boy=?,

delivery_time=?,

delivery_assigned_at=NOW(),

order_status='Out For Delivery'

WHERE id=?

`;


db.query(
sql,
[
deliveryBoy,
deliveryTime,
orderId
],
(err)=>{


if(err){

return res.status(500)
.json({
message:err.message
});

}

// Get io instance
  const io = req.app.get("io");

  // Find the customer who owns this order
  db.query(
    "SELECT user_id FROM orders WHERE id=?",
    [orderId],
    (err, result) => {
      if (!err && result.length > 0) {
        io.to(`user_${result[0].user_id}`).emit(
          "order-status-update",
          {
            orderId,
            message: "Your order is Out For Delivery 🚚",
          }
        );
      }
    }
  );

logger.info({
  action: "DELIVERY_ASSIGNED",
  orderId,
  deliveryBoy,
  deliveryTime,
});

res.json({
  success: true,
  message: "Delivery Assigned",
  orderId,
  deliveryBoy,
  deliveryTime,
  status: "Out For Delivery"
});


}

);


};