import {
useState
}
from "react";


import {
RecaptchaVerifier,
signInWithPhoneNumber
}
from "firebase/auth";





import api
from "../services/api";


import {
toast
}
from "react-toastify";



function AuthBottomSheet({
show,
onClose,
onSuccess
}){


const [phone,setPhone]=
useState("");


const [otp,setOtp]=
useState("");


const [confirmation,setConfirmation]=
useState(null);



if(!show){

return null;

}



const sendOtp =
async()=>{


try{


if(
!window.recaptchaVerifier
){

window.recaptchaVerifier =
new RecaptchaVerifier(

auth,

"recaptcha-container",

{
size:"invisible"
}

);

}



const result =
await signInWithPhoneNumber(

auth,

"+91"+phone,

window.recaptchaVerifier

);



setConfirmation(result);


toast.success(
"OTP sent"
);


}
catch(error){


toast.error(
"OTP failed"
);


}


};




const verifyOtp =
async()=>{


try{


await confirmation.confirm(
otp
);



const res =
await api.post(
"/otp/phone-login",
{
phone
}
);



localStorage.setItem(
"token",
res.data.token
);



localStorage.setItem(
"user",
JSON.stringify(
res.data.user
)
);



toast.success(
"Login Successful"
);



onSuccess();


onClose();



}
catch(error){


toast.error(
"Invalid OTP"
);


}



};




return(

<div
className="
fixed
inset-0
bg-black/40
z-50
flex
items-end
"
>


<div
className="
bg-white
w-full
rounded-t-3xl
p-6
animate-slideUp
"
>


<h2
className="
text-2xl
font-bold
"
>

Welcome to SujaMart 👋

</h2>



<p
className="
text-gray-500
mt-2
"
>

Login to continue shopping

</p>




<div
className="
mt-6
flex
border
rounded-xl
p-3
"
>


<span>

🇮🇳 +91

</span>


<input

className="
flex-1
ml-3
outline-none
"

placeholder="Mobile Number"

value={phone}

onChange={(e)=>
setPhone(e.target.value)
}

/>


</div>




<button

onClick={sendOtp}

className="
mt-5
bg-green-600
text-white
w-full
py-3
rounded-xl
font-bold
"

>

Continue

</button>




{
confirmation && (

<>

<input

placeholder="Enter OTP"

value={otp}

onChange={(e)=>
setOtp(e.target.value)
}

className="
border
w-full
mt-4
p-3
rounded-xl
"

/>



<button

onClick={verifyOtp}

className="
bg-blue-600
text-white
w-full
py-3
rounded-xl
mt-3
"

>

Verify OTP

</button>


</>

)

}


<div id="recaptcha-container"/>


</div>


</div>


);

}


export default AuthBottomSheet;