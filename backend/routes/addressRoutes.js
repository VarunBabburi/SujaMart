const express =
require("express");

const router =
express.Router();


const verifyToken =
require("../middleware/authMiddleware");


const {

addAddress,
getAddresses,
deleteAddress

}=require(
"../controllers/addressController"
);



router.post(
"/",
verifyToken,
addAddress
);



router.get(
"/",
verifyToken,
getAddresses
);

router.delete(
"/:id",
verifyToken,
deleteAddress
);


module.exports=router;