import { useEffect, useState } from "react";
import api from "../../services/api";
import Navbar from "../../components/Navbar";
import { useNavigate }
from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";


function AdminOrders() {
  const navigate =
useNavigate();
  const [orders, setOrders] =
    useState([]);
    const [search,setSearch] =
useState("");
const [deliveryData,setDeliveryData] =
useState({});
const [editingOrders, setEditingOrders] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token =
        localStorage.getItem("token");

      const res = await api.get(
        "/admin/orders",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );console.log("Fetched Orders Data:", res.data);

      setOrders(
res.data.sort(
(a,b)=>b.id-a.id
)
);
    } catch (error) {
      console.log(error);
    }
  };

  const updateStatus = async (
    orderId,
    status
  ) => {
    try {
      const token =
        localStorage.getItem("token");

      await api.put(
        `/admin/orders/${orderId}`,
        { status },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      fetchOrders();
    } catch (error) {
      console.log(error);
    }
  };

  const getStatusColor = (
    status
  ) => {
    switch (
      status?.toLowerCase()
    ) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "accepted":
        return "bg-blue-100 text-blue-700";

      case "packed":
        return "bg-purple-100 text-purple-700";

      case "out for delivery":
        return "bg-orange-100 text-orange-700";

      case "delivered":
        return "bg-green-100 text-green-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredOrders =
orders.filter(
(order)=>{


return (

order.id
.toString()
.includes(
search
)


||

order.customer_name
.toLowerCase()
.includes(
search.toLowerCase()
)


||

order.phone
.includes(
search
)


);


}

);


      const assignDelivery =async(orderId)=>{


try{


const token =
localStorage.getItem("token");


await api.put(
`/admin/orders/${orderId}/delivery`,
{

deliveryBoy:
deliveryData[orderId]?.boy,


deliveryTime:
deliveryData[orderId]?.time

},
{
headers:{
Authorization:
`Bearer ${token}`
}
}
);


toast.success(
"Delivery Assigned 🚚"
);

setDeliveryData(( prev) => {
      const updated = { ...prev };
      delete updated[orderId];
      return updated;
    });

    // Exit edit mode if actively editing
    setEditingOrders((prev) => {
      const updated = { ...prev };
      delete updated[orderId];
      return updated;
    });

fetchOrders();


}
catch(error){

console.log(error);

}


};  

// Toggle edit mode for an order and pre-fill input values
const handleEditClick = (order) => {
  setDeliveryData((prev) => ({
    ...prev,
    [order.id]: {
      boy: order.delivery_boy || "",
      time: order.delivery_time || "",
    },
  }));

  setEditingOrders((prev) => ({
    ...prev,
    [order.id]: true,
  }));
};

// Cancel editing and revert to view mode
const handleCancelEdit = (orderId) => {
  setEditingOrders((prev) => {
    const updated = { ...prev };
    delete updated[orderId];
    return updated;
  });
};  

  return (
    <>
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">

        <h1 className="text-3xl font-bold mb-6">
          Manage Orders
        </h1>

        <input

type="text"

placeholder="
Search by Order ID, Name, Phone...
"

value={search}

onChange={(e)=>
setSearch(
e.target.value
)
}

className="
w-full
mb-6
p-3
border
rounded-xl
shadow-sm
focus:outline-none
focus:ring-2
focus:ring-green-500
"

/>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <h2 className="text-gray-500">
              No Orders Found
            </h2>
          </div>
        ) : (
          <div className="space-y-4">

            {filteredOrders.map(
              (order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-md p-5"
                >

                  <div className="flex justify-between items-start">

                    <div>
                      <h2 className="text-xl font-semibold">
                        Order #
                        {order.id}
                      </h2>

                      <p className="text-gray-600 mt-1">
                        👤 {order.customer_name}
                      </p>

                      <p className="text-gray-600">
                        📞 {order.phone}
                      </p>
<button

onClick={() =>
navigate(
`/admin/orders/${order.id}`
)
}

className="
mt-4
bg-green-600
text-white
px-5
py-2
rounded-lg
font-bold
"

>

View Order

</button> 

                      <p className="text-green-600 font-bold mt-2">
                        ₹
                        {
                          order.total_amount
                        }
                      </p>

                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        order.order_status
                      )}`}
                    >
                      {
                        order.order_status
                      }
                    </span>

                  </div>

                  <div className="mt-4">

                    <label className="block text-sm text-gray-500 mb-2">
                      Update Status
                    </label>

                    <select
                      value={
                        order.order_status
                      }
                      onChange={(e) =>
                        updateStatus(
                          order.id,
                          e.target.value
                        )
                      }
                      className="border rounded-lg px-3 py-2"
                    >
                      <option value="Pending">
                        Pending
                      </option>

                      <option value="Accepted">
                        Accepted
                      </option>

                      <option value="Packed">
                        Packed
                      </option>

                      <option value="Out for Delivery">
                        Out for Delivery
                      </option>

                      <option value="Delivered">
                        Delivered
                      </option>

                      <option value="Cancelled">
                        Cancelled
                      </option>
                    </select>

                  </div>

 <div className="mt-5">
  <h3 className="font-bold mb-2">🚚 Assign Delivery</h3>

  {order.delivery_boy && !editingOrders[order.id] ? (
    /* If already assigned, show a clean confirmation card instead of empty input fields */
    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl inline-flex items-center gap-3">
      <span className="text-emerald-700 font-medium text-sm">
        Assigned to:{" "}
      <span className="font-bold">
        {order.delivery_boy || order.deliveryBoy}
      </span>{" "}
      ({order.delivery_time || order.deliveryTime} mins)
      </span>
      <span className="bg-emerald-600 text-white font-bold text-xs px-2.5 py-1 rounded-md shadow-sm">
        ✅ Active
      </span>
      {/* ✏️ Edit Button */}
      <button
        onClick={() => handleEditClick(order)}
        className="ml-2 text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-3 py-1 rounded-lg transition-all"
      >
        ✏️ Edit
      </button>


    </div>
  ) : (
    /* If not assigned, show the functional input fields and button */
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="text"
        placeholder="Delivery Boy Name"
        className="border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={deliveryData[order.id]?.boy || ""}
        onChange={(e) =>
          setDeliveryData({
            ...deliveryData,
            [order.id]: {
              ...deliveryData[order.id],
              boy: e.target.value
            }
          })
        }
      />

      <input
        type="number"
        placeholder="Minutes"
        className="border p-2 rounded-xl w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={deliveryData[order.id]?.time || ""}
        onChange={(e) =>
          setDeliveryData({
            ...deliveryData,
            [order.id]: {
              ...deliveryData[order.id],
              time: e.target.value
            }
          })
        }
      />

      <button
        onClick={() => assignDelivery(order.id)}
        disabled={!deliveryData[order.id]?.boy || !deliveryData[order.id]?.time}
        className={`px-5 py-2 rounded-xl font-bold text-white transition-all active:scale-98 ${
          deliveryData[order.id]?.boy && deliveryData[order.id]?.time
            ? "bg-blue-600 hover:bg-blue-700 shadow-md"
            : "bg-slate-300 cursor-not-allowed"
        }`}
      >
        {editingOrders[order.id] ? "Save Changes" : "Assign Rider"}
      </button>
      {/* Cancel Button (visible during edit mode) */}
      {editingOrders[order.id] && (
        <button
          onClick={() => handleCancelEdit(order.id)}
          className="px-4 py-2 rounded-xl font-bold text-gray-600 bg-gray-200 hover:bg-gray-300 transition-all"
        >
          Cancel
        </button>
      )}


    </div>
  )}
</div>

                </div>
              )
            )}
            {
filteredOrders.length===0 && (

<p className="text-center">
No orders found
</p>

)
}

          </div>
        )}

      </div>
    </>
  );
}

export default AdminOrders;