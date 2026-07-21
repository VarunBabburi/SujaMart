import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import Navbar from "../../components/Navbar";

function AdminOrderDetails() {

  const { orderId } = useParams();

  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {

      const token =
        localStorage.getItem("token");

      const res = await api.get(
        `/admin/orders/${orderId}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setItems(res.data);

    } catch (error) {
      console.log(error);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <h2 className="text-center mt-10">
          Loading...
        </h2>
      </>
    );
  }

  const order = items[0];

  return (
    <>
      <Navbar />

      <div className="max-w-5xl mx-auto p-6">

        <div className="bg-white shadow rounded-xl p-6">

          <h1 className="text-3xl font-bold mb-6">
            Order #{order.order_id}
          </h1>

          <div className="
mt-5
bg-blue-50
border
border-blue-200
rounded-xl
p-5
">

<h2 className="
text-xl
font-bold
text-blue-700
mb-3
">
🚚 Delivery Address
</h2>


<p>
<strong>Name:</strong>{" "}
{order.delivery_name}
</p>


<p>
<strong>Phone:</strong>{" "}
{order.delivery_phone}
</p>


<p>
<strong>Address:</strong>{" "}
{order.address_line},
{" "}
{order.city}
</p>


<p>
<strong>Pincode:</strong>{" "}
{order.pincode}
</p>


{
order.landmark && (

<p>
<strong>Landmark:</strong>{" "}
{order.landmark}
</p>

)
}


{
order.alternate_phone && (

<p>
<strong>Alternate Phone:</strong>{" "}
{order.alternate_phone}
</p>

)
}


<p>
<strong>Type:</strong>{" "}

<span className="
bg-blue-100
text-blue-700
px-3
py-1
rounded-full
">

{order.address_type}

</span>

</p>


</div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <strong>Payment</strong>
              <p>{order.payment_method}</p>
              {order.payment_method === "online" && (

<div className="mt-5 bg-green-50 border border-green-200 rounded-xl p-5">

<h2 className="text-xl font-bold text-green-700 mb-3">
💳 Payment Information
</h2>


<p>
<strong>Status:</strong>{" "}
{order.payment_status}
</p>


<p>
<strong>Transaction ID:</strong>{" "}
{order.razorpay_payment_id}
</p>


<p>
<strong>Razorpay Order:</strong>{" "}
{order.razorpay_order_id}
</p>


</div>

)}
            </div>

            <div>
              <strong>Date</strong>
              <p>
                {new Date(
                  order.created_at
                ).toLocaleString()}
              </p>
            </div>

            <div>
              <strong>Status</strong>
              <p>{order.order_status}</p>
            </div>

            <div>
              <strong>Total</strong>
              <p className="text-2xl font-bold text-green-600">
                ₹{order.total_amount}
              </p>
            </div>

          </div>

          <hr className="mb-6" />

          <h2 className="text-2xl font-bold mb-4">
            Products
          </h2>

          {items.map((item) => (

            <div
              key={item.name}
              className="flex items-center justify-between border rounded-lg p-4 mb-4"
            >

              <div className="flex items-center gap-4">

                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />

                <div>

                  <h3 className="font-bold text-lg">
                    {item.name}
                  </h3>

                  <p>
                    Qty :
                    {item.quantity}
                  </p>

                  <p>
                    ₹
                    {item.price_at_purchase}
                  </p>

                </div>

              </div>

              <h3 className="font-bold text-green-600">

                ₹
                {item.quantity *
                  item.price_at_purchase}

              </h3>

            </div>

          ))}

        </div>

      </div>

    </>
  );
}

export default AdminOrderDetails;