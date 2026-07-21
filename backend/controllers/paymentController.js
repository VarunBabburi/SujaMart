const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const db = require("../config/db");

exports.createOrder =
async (req,res)=>{


try{


const userId =
req.user.id;



const sql =
`
SELECT 
products.price,
cart_items.quantity

FROM cart_items

JOIN carts
ON cart_items.cart_id =
carts.id

JOIN products
ON cart_items.product_id =
products.id

WHERE carts.user_id=?
`;



db.query(
sql,
[userId],
async(err,items)=>{


if(err){

return res.status(500)
.json(err);

}



if(items.length===0){

return res.status(400)
.json({

message:
"Cart is empty"

});

}



let total = 0;


items.forEach(
(item)=>{


total +=
item.price *
item.quantity;


}
);



const order =
await razorpay.orders.create({

amount:
Math.round(total*100),

currency:"INR",

receipt:
`receipt_${Date.now()}`

});



res.json({

...order,

actualAmount:
total

});



}

);



}
catch(error){


console.log(error);


res.status(500)
.json({

message:
"Payment failed"

});


}


};


exports.verifyPayment = async (req, res) => {

  try {

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;


    const sign =
      razorpay_order_id +
      "|" +
      razorpay_payment_id;


    const expectedSign =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(sign)
        .digest("hex");


    if (
      razorpay_signature === expectedSign
    ) {

      return res.json({
        success: true,
        message:
          "Payment Verified Successfully",
      });

    } else {

      return res.status(400).json({
        success: false,
        message:
          "Invalid Payment Signature",
      });

    }


  } catch (error) {

    console.log(error);

    res.status(500).json({
      message:
        "Payment Verification Failed",
    });

  }

};