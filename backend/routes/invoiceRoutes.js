const express =
require("express");

const router =
express.Router();


const {
generateInvoice
} =
require(
"../controllers/invoiceController"
);


const verifyToken =
require("../middleware/authMiddleware");


router.get(
"/:orderId",
verifyToken,
generateInvoice
);


module.exports =
router;