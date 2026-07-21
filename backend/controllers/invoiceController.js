const PDFDocument =
require("pdfkit");

const db =
require("../config/db");


exports.generateInvoice =
(req,res)=>{


const orderId =
req.params.orderId;


const sql = `

SELECT

o.id AS order_id,
o.total_amount,
o.payment_method,
o.created_at,

u.name AS customer_name,
u.email,
u.phone,

a.name AS delivery_name,
a.phone AS delivery_phone,
a.address_line,
a.city,
a.pincode,
a.landmark,
a.address_type,

p.name AS product_name,

oi.quantity,

oi.price_at_purchase,


pay.razorpay_payment_id


FROM orders o

LEFT JOIN addresses a
ON o.address_id = a.id

JOIN users u
ON o.user_id = u.id


JOIN order_items oi
ON o.id = oi.order_id


JOIN products p
ON oi.product_id = p.id


LEFT JOIN payments pay
ON o.id = pay.order_id


WHERE o.id = ?

`;


db.query(
sql,
[orderId],
(err,results)=>{


if(err){

return res.status(500)
.json({
message:err.message
});

}


if(results.length===0){

return res.status(404)
.json({
message:
"Order not found"
});

}



const order =
results[0];



const doc =
new PDFDocument();



res.setHeader(
"Content-Type",
"application/pdf"
);


res.setHeader(
"Content-Disposition",
`attachment; filename=invoice-${orderId}.pdf`
);



doc.pipe(res);



// HEADER

doc
.fontSize(25)
.text(
"SujaMart Invoice",
{
align:"center"
}
);


doc.moveDown();



doc
.fontSize(12)
.text(
`Invoice No: #${order.order_id}`
);


doc.text(
`Date: ${new Date(
order.created_at
).toLocaleDateString()}`
);



doc.moveDown();



doc
.fontSize(14)
.text(
"Delivery Address:"
);


doc.moveDown(0.5);


doc
.fontSize(12)
.text(
`Name: ${order.delivery_name}`
);


doc.text(
`Phone: ${order.delivery_phone}`
);


doc.text(
`Address: ${order.address_line}, ${order.city}`
);


doc.text(
`Pincode: ${order.pincode}`
);



if(order.landmark){

doc.text(
`Landmark: ${order.landmark}`
);

}


doc.text(
`Type: ${order.address_type}`
);



doc.moveDown();


doc.text(
"Items:"
);


doc.moveDown();



results.forEach(
(item)=>{

doc.text(
`${item.product_name}
Qty: ${item.quantity}
Price: ₹${item.price_at_purchase}
`
);

});



doc.moveDown();


doc.text(
`Total Amount: ₹${order.total_amount}`
);



doc.text(
`Payment Method: ${order.payment_method}`
);



if(
order.razorpay_payment_id
){

doc.text(
`Transaction ID: ${order.razorpay_payment_id}`
);

}



doc.moveDown();


doc.text(
"Thank you for shopping with SujaMart ❤️",
{
align:"center"
}
);



doc.end();



}
);


};