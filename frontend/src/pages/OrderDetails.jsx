import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function OrderDetails() {
    const { orderId } = useParams();

    const [items, setItems] =
        useState([]);

    useEffect(() => {
        fetchDetails();
    }, []);

    const fetchDetails =
        async () => {
            try {
                const token =
                    localStorage.getItem(
                        "token"
                    );

                const res =
                    await api.get(
                        `/orders/${orderId}`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );
                    console.log("ORDER DETAILS:", res.data);

                setItems(res.data);
            } catch (error) {
                console.log(error);
            }
        };

    if (items.length === 0) {
        return (
            <h2>
                Loading...
            </h2>
        );
    }

    const order = items[0];

    const statuses = [
  "Pending",
  "Accepted",
  "Packed",
  "Out for Delivery",
  "Delivered",
];

const currentStep =
  statuses.indexOf(order.order_status);


    return (
        <>
            <Navbar />

            <div
                style={{
                    padding: "20px",
                }}
            >
                <h1>
                    Order #
                    {order.order_id}
                </h1>

                <p>
                    Status:
                    {order.order_status}
                </p>

                <div className="mt-8">
  <h2 className="text-xl font-bold mb-6">
    Order Tracking
  </h2>

  <div className="flex items-center justify-between">
    {statuses.map((status, index) => (
      <div
        key={status}
        className="flex-1 flex flex-col items-center relative"
      >
        {/* Line */}
        {index !== statuses.length - 1 && (
          <div
            className={`absolute top-5 left-1/2 w-full h-1 ${
              index < currentStep
                ? "bg-green-500"
                : "bg-gray-300"
            }`}
          />
        )}

        {/* Circle */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center z-10 font-bold ${
            index <= currentStep
              ? "bg-green-600 text-white"
              : "bg-gray-300 text-gray-600"
          }`}
        >
          {index <= currentStep ? "✓" : ""}
        </div>

        <p className="text-sm mt-3 text-center">
          {status}
        </p>
      </div>
    ))}
  </div>
</div>


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


                <p>
  <strong>
    Payment Method:
  </strong>{" "}
  {order.payment_method}
</p>

{order.payment_method === "online" && (
  <div className="mt-5 bg-green-50 border border-green-200 rounded-xl p-5">

    <h2 className="text-xl font-bold text-green-700 mb-3">
      💳 Payment Details
    </h2>

    <p>
      <strong>Status:</strong>{" "}
      <span className="text-green-600 font-bold">
        {order.payment_status}
      </span>
    </p>


    <p className="mt-2">
      <strong>Transaction ID:</strong>{" "}
      {order.razorpay_payment_id}
    </p>


    <p className="mt-2">
      <strong>Razorpay Order ID:</strong>{" "}
      {order.razorpay_order_id}
    </p>

  </div>
)}

                <p>
                    Date:
                    {new Date(
                        order.created_at
                    ).toLocaleString()}
                </p>

                <hr />

                {items.map(
                    (item) => (
                        <div
                            key={
                                item.name
                            }
                            style={{
                                border:
                                    "1px solid #ddd",
                                padding:
                                    "10px",
                                marginBottom:
                                    "10px",
                            }}
                        >
                            <img
                                src={
                                    item.image_url
                                }
                                alt={
                                    item.name
                                }
                                width="80"
                            />

                            <h3>
                                {item.name}
                            </h3>

                            <p>
                                Qty:
                                {
                                    item.quantity
                                }
                            </p>

                            <p>
                                ₹
                                {
                                    item.price_at_purchase
                                }
                            </p>

                          <p>
  Subtotal: ₹
  {item.quantity *
    item.price_at_purchase}
</p>
                        </div>
                    )
                )}

                <h2>
                    Total:
                    ₹
                    {
                        order.total_amount
                    }
                </h2>
            </div>
        </>
    );
}

export default OrderDetails;