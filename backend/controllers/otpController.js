const db =
require("../config/db");


const jwt =
require("jsonwebtoken");

const axios =
require("axios");

// SEND OTP

exports.sendOtp = (req,res)=>{


const {phone} = req.body;


const phoneRegex =
/^[6-9]\d{9}$/;


if(
!phoneRegex.test(phone)
){

return res.status(400)
.json({

message:
"Invalid mobile number"

});

}



// check today OTP count

db.query(
`
SELECT *
FROM otp_verifications
WHERE phone=?
AND DATE(created_at)=CURDATE()
`,
[phone],
(err,result)=>{


if(err){

return res.status(500)
.json({
message:err.message
});

}



// max 2 OTP per day


if(
result.length > 0 &&
result[0].attempts >= 3
){


return res.status(429)
.json({

message:
"OTP limit reached. Try again tomorrow"

});


}




// generate OTP

const otp =
Math.floor(
100000 +
Math.random()*900000
)
.toString();



const expiry =
new Date(
Date.now()+5*60*1000
);




// Existing phone today

if(result.length > 0){


db.query(
`
UPDATE otp_verifications

SET
otp=?,
expires_at=?,
attempts=attempts+1

WHERE phone=?
`,
[
otp,
expiry,
phone
],
(err)=>{


if(err){

return res.status(500)
.json({
message:err.message
});

}


sendSms();


}

);



}



// first OTP today

else{


db.query(
`
INSERT INTO otp_verifications
(
phone,
otp,
expires_at,
attempts
)

VALUES(?,?,?,1)
`,
[
phone,
otp,
expiry
],
(err)=>{


if(err){

return res.status(500)
.json({
message:err.message
});

}


sendSms();


}

);


}





// SMS function

function sendSms(){


axios.post(

"https://www.fast2sms.com/dev/bulkV2",

{

route:"q",

message:
`Your SujaMart OTP is ${otp}. Do not share this code.`,

language:"english",

numbers:phone

},

{

headers:{

authorization:
process.env.FAST2SMS_API_KEY

}

}

)


.then(()=>{


res.json({

message:
"OTP Sent Successfully"

});


})


.catch((error)=>{


console.log(
"SMS ERROR:",
error.response?.data
);



return res.status(500)
.json({

message:
"SMS sending failed"

});


});


}



});


};



exports.verifyOtp =
(req,res)=>{


const {
phone,
otp
}
=req.body;

console.log("Verify OTP API called");
console.log(req.body);

db.query(
`
SELECT *
FROM otp_verifications
WHERE phone=?
AND otp=?
AND expires_at > NOW()
`,
[
phone,
otp
],
(err,result)=>{


if(err){

return res.status(500)
.json(err);

}



if(result.length===0){

return res.status(400)
.json({

message:
"Invalid OTP"

});

}


db.query(
`
DELETE FROM otp_verifications
WHERE phone=?
`,
[phone],
(err)=>{
   if(err){
      console.log(err);
   }

   // Continue checking user here
});




// check user


db.query(
`
SELECT *
FROM users
WHERE phone=?
`,
[phone],
(err,user)=>{

    if(err){
    return res.status(500).json({
        message:err.message
    });
}


if(user.length>0){


const token =
jwt.sign(
{
id:user[0].id,
role:user[0].role
},
process.env.JWT_SECRET,
{
expiresIn:"7d"
}); 


return res.json({

token,
user:user[0]

});


}



// create user


db.query(
`
INSERT INTO users
(
name,
phone,
password,
role
)
VALUES(?,?,?,?)
`,
[
"Customer",
phone,
"OTP_LOGIN",
"customer"
],
(err,newUser)=>{



if(err){

return res.status(500)
.json(err);

}



const token =
jwt.sign(
{
id:newUser.insertId,
role:"customer"
},
process.env.JWT_SECRET
);



res.json({

token,

user:{

id:newUser.insertId,
name:"Customer",
phone,
role:"customer"

}

});


}

);



});


}

);


};