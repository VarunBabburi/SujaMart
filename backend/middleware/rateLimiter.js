const rateLimit =
require("express-rate-limit");


// OTP limiter

const otpLimiter =
rateLimit({

windowMs:
15 * 60 * 1000,


max:5,


message:{

message:
"Too many OTP requests. Try again later."

},


standardHeaders:true,


legacyHeaders:false


});



module.exports =
{
otpLimiter
};