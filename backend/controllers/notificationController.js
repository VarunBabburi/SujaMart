const db =
require("../config/db");


exports.getNotifications =
(req,res)=>{


db.query(

`
SELECT *
FROM notifications
ORDER BY created_at DESC
LIMIT 20
`

,

(err,result)=>{


if(err){

return res.status(500)
.json({
message:err.message
});

}


res.json(result);


}


);


};




exports.clearNotifications =
(req,res)=>{


db.query(

`
DELETE FROM notifications
`

,

(err,result)=>{


if(err){

return res.status(500)
.json({
message:err.message
});

}


res.json({

message:
"Notifications cleared"

});


}


);


};

exports.deleteNotification =
(req,res)=>{


const {id} =
req.params;


db.query(

`
DELETE FROM notifications
WHERE id=?
`

,

[id],

(err)=>{


if(err){

return res.status(500)
.json({
message:err.message
});

}


res.json({

message:
"Notification removed"

});


}

);


};