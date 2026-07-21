const db =
require("../config/db");


// Add address

exports.addAddress =
(req,res)=>{


const userId =
req.user.id;


const {

name,
phone,
address_line,
city,
pincode,
landmark,
alternate_phone,
address_type

}=req.body;



if(
!name ||
!phone ||
!address_line ||
!city ||
!pincode
){

return res.status(400)
.json({
message:
"Required fields missing"
});

}



const sql = `

INSERT INTO addresses

(
user_id,
name,
phone,
address_line,
city,
pincode,
landmark,
alternate_phone,
address_type
)

VALUES(?,?,?,?,?,?,?,?,?)

`;



db.query(
sql,
[

userId,
name,
phone,
address_line,
city,
pincode,
landmark || null,
alternate_phone || null,
address_type || "home"

],

(err,result)=>{


if(err){

return res.status(500)
.json({
message:err.message
});

}


res.json({

message:
"Address Added Successfully",

addressId:
result.insertId

});


}

);


};

exports.getAddresses =
(req,res)=>{


const userId =
req.user.id;


db.query(

`
SELECT *
FROM addresses
WHERE user_id=?
AND is_deleted=false
ORDER BY created_at DESC
`

,

[userId],

(err,results)=>{


if(err){

return res.status(500)
.json({
message:err.message
});

}


res.json(results);


}


);


};
exports.deleteAddress =
(req,res)=>{


const userId =
req.user.id;


const {id} =
req.params;


db.query(

`
UPDATE addresses
SET is_deleted = true
WHERE id=?
AND user_id=?
`

,

[
id,
userId
],

(err,result)=>{


if(err){

return res.status(500)
.json({
message:err.message
});

}


if(result.affectedRows===0){

return res.status(404)
.json({
message:
"Address not found"
});

}


res.json({

message:
"Address Deleted Successfully"

});


}

);


};