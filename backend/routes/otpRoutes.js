const router =
require("express").Router();


const {
otpLimiter
}
=
require("../middleware/rateLimiter");


const otp =
require(
"../controllers/otpController"
);

const {
body
}
=
require("express-validator");


const validate =
require("../middleware/validate");


// Send OTP with spam protection

router.post(
"/send",

otpLimiter,


body("phone")
.matches(/^[6-9]\d{9}$/)
.withMessage(
"Invalid phone number"
),


validate,


otp.sendOtp

);



// Verify OTP

router.post(
"/verify",
otp.verifyOtp
);



module.exports =
router;