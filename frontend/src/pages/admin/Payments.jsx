import { useEffect, useState } from "react";
import api from "../../services/api";
import Navbar from "../../components/Navbar";

function Payments() {

  const [payments, setPayments] =
    useState([]);

  useEffect(() => {
    fetchPayments();
  }, []);


  const fetchPayments = async () => {

    try {

      const token =
        localStorage.getItem("token");


      const res =
        await api.get(
          "/admin/payments",
          {
            headers:{
              Authorization:
              `Bearer ${token}`
            }
          }
        );


      setPayments(res.data);


    } catch(error) {

      console.log(error);

    }

  };


  return (

    <>

      <Navbar />


      <div className="max-w-7xl mx-auto p-6">


        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          💳 Payment Transactions
        </h1>


        <div className="bg-white rounded-xl shadow overflow-x-auto">


          <table className="w-full min-w-[650px]">

            <thead className="bg-green-600 text-white">

              <tr>

                <th className="p-3">
                  Order
                </th>

                <th className="p-3">
                  Customer
                </th>

                <th className="p-3">
                  Amount
                </th>

                <th className="p-3">
                  Status
                </th>

                <th className="p-3">
                  Transaction ID
                </th>

                <th className="p-3">
                  Date
                </th>

              </tr>

            </thead>


            <tbody>


              {payments.map(
                (pay)=> (

                <tr
                  key={pay.id}
                  className="border-b text-center"
                >

                  <td className="p-3 font-bold">

                    #{pay.order_id}

                  </td>


                  <td className="p-3">

                    {pay.customer_name}

                    <br />

                    <span className="text-sm text-gray-500">

                      {pay.phone}

                    </span>

                  </td>



                  <td className="p-3 text-green-600 font-bold">

                    ₹{pay.amount}

                  </td>



                  <td className="p-3">


                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">

                      {pay.payment_status}

                    </span>


                  </td>



                  <td className="p-3 text-xs">

                    {pay.razorpay_payment_id}

                  </td>



                  <td className="p-3">

                    {
                      new Date(
                        pay.created_at
                      )
                      .toLocaleDateString()
                    }

                  </td>


                </tr>

                )
              )}


            </tbody>


          </table>


        </div>


      </div>


    </>

  );

}

export default Payments;