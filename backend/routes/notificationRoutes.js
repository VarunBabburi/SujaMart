const express =
require("express");


const router =
express.Router();


const {

getNotifications,
clearNotifications,
deleteNotification

}=require(
"../controllers/notificationController"
);


router.get(
"/",
getNotifications
);


router.delete(
"/clear",
clearNotifications
);

router.delete(
"/:id",
deleteNotification
);

module.exports =
router;