import { useEffect, useState } from "react";
import api from "../../services/api";
import Navbar from "../../components/Navbar";

import { Line } from "react-chartjs-2";


import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);


function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalOutstanding: 0,
  });

  const [loading, setLoading] =
    useState(true);
  const [topProducts, setTopProducts] =
    useState([]);
  const [lowStock, setLowStock] =
    useState([]);
  const [salesChart, setSalesChart] =
    useState([]);


  useEffect(() => {

    fetchStats();
    fetchTopProducts();
    fetchLowStock();
    fetchSalesChart();

    console.log(
      "Admin dashboard opened"
    );
  }, []);

  const fetchStats = async () => {
    try {
      const token =
        localStorage.getItem("token");

      const res = await api.get(
        "/admin/dashboard",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setStats(res.data);
    } catch (error) {
      console.log(error);
      alert(
        "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchTopProducts =
    async () => {
      try {
        const token =
          localStorage.getItem("token");

        const res = await api.get(
          "/admin/top-products",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        setTopProducts(res.data);
      } catch (error) {
        console.log(error);
      }
    };

  const fetchLowStock =
    async () => {
      try {
        const token =
          localStorage.getItem("token");

        const res =
          await api.get(
            "/admin/low-stock",
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        setLowStock(res.data);
      } catch (error) {
        console.log(error);
      }
    };


  const fetchSalesChart = async () => {
    try {

      const token =
        localStorage.getItem("token");

      const res = await api.get(
        "/admin/sales-chart",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSalesChart(res.data);

    } catch (error) {
      console.log(error);
    }
  };


  const chartData = {
    labels: salesChart.map((item) =>
      new Date(item.sale_date).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
        }
      )
    ),

    datasets: [
      {
        label: "Sales",

        data: salesChart.map((item) =>
          Number(item.total_sales)
        ),

        borderColor: "#16a34a",

        backgroundColor:
          "rgba(22,163,74,0.2)",

        fill: true,

        tension: 0.4,
      },
    ],
  };


  if (loading) {
    return (
      <>
        <Navbar />
        <div className="p-10 text-center">
          <h2 className="text-2xl font-bold">
            Loading Dashboard...
          </h2>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto p-6">

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Admin Dashboard
          </h1>

          <p className="text-gray-500 mt-2">
            Manage products,
            customers, orders
            and credit accounts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">


          <div className="bg-white rounded-2xl shadow-md p-6">
            <p className="text-gray-500">
              Total Products
            </p>

            <h2 className="text-4xl font-bold text-green-600 mt-2">
              {
                stats.totalProducts
              }
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <p className="text-gray-500">
              Total Orders
            </p>

            <h2 className="text-4xl font-bold text-blue-600 mt-2">
              {
                stats.totalOrders
              }
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <p className="text-gray-500">
              Customers
            </p>

            <h2 className="text-4xl font-bold text-purple-600 mt-2">
              {
                stats.totalCustomers
              }
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <p className="text-gray-500">
              Outstanding Udhaar
            </p>

            <h2 className="text-4xl font-bold text-red-600 mt-2">
              ₹
              {
                stats.totalOutstanding
              }
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <p className="text-gray-500">
              Today's Sales
            </p>

            <h2 className="text-4xl font-bold text-blue-600 mt-2">
              ₹{stats.todaySales}
            </h2>
          </div>


          <div className="bg-white rounded-2xl shadow-md p-6">
            <p className="text-gray-500">
              Monthly Sales
            </p>

            <h2 className="text-4xl font-bold text-purple-600 mt-2">
              ₹{stats.monthlySales}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <p className="text-gray-500">
              Pending Orders
            </p>

            <h2 className="text-4xl font-bold text-yellow-500 mt-2">
              {stats.pendingOrders}
            </h2>
          </div>


          <div className="bg-white rounded-2xl shadow-md p-6">
            <p className="text-gray-500">
              Delivered Orders
            </p>

            <h2 className="text-4xl font-bold text-green-500 mt-2">
              {stats.deliveredOrders}
            </h2>
          </div>

          <div className="mt-8 bg-white rounded-2xl shadow-md p-6">

            <h2 className="text-2xl font-bold mb-4">
              📈 Sales Overview
            </h2>

            <Line data={chartData} />

          </div>

          <div className="mt-8 bg-white rounded-2xl shadow-md p-6">

            <h2 className="text-2xl font-bold mb-4">
              🏆 Top Selling Products
            </h2>

            {topProducts.length === 0 ? (
              <p>No Sales Yet</p>
            ) : (
              topProducts.map(
                (product, index) => (
                  <div
                    key={index}
                    className="flex justify-between border-b py-3"
                  >
                    <span>
                      {index + 1}. {product.name}
                    </span>

                    <span className="font-bold text-green-600">
                      {product.totalSold} sold
                    </span>
                  </div>
                )
              )
            )}
          </div>



          <div className="mt-8 bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">
              ⚠ Low Stock Alerts
            </h2>

            {lowStock.length === 0 ? (
              <p className="text-green-600">
                All Products Well Stocked
              </p>
            ) : (
              lowStock.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between border-b py-3"
                >
                  <span>{item.name}</span>

                  <span className="font-bold text-red-600">
                    {item.stock_quantity} left
                  </span>
                </div>
              ))
            )}
          </div>


        </div>

        <div className="mt-10 bg-white rounded-2xl shadow-md p-6">

          <h2 className="text-2xl font-semibold mb-4">
            Quick Summary
          </h2>

          <div className="space-y-3 text-gray-700">

            <p>
              📦 Products Available:
              {" "}
              <strong>
                {
                  stats.totalProducts
                }
              </strong>
            </p>

            <p>
              🛒 Orders Placed:
              {" "}
              <strong>
                {
                  stats.totalOrders
                }
              </strong>
            </p>

            <p>
              👥 Registered Customers:
              {" "}
              <strong>
                {
                  stats.totalCustomers
                }
              </strong>
            </p>

            <p>
              💰 Outstanding Udhaar:
              {" "}
              <strong>
                ₹
                {
                  stats.totalOutstanding
                }
              </strong>
            </p>

          </div>

        </div>

      </div>
    </>
  );
}

export default Dashboard;