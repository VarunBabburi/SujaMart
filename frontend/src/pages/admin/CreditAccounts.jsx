import { useEffect, useState } from "react";
import api from "../../services/api";
import Navbar from "../../components/Navbar";
import { toast } from "react-toastify";

function CreditAccounts() {
  const [accounts, setAccounts] =
    useState([]);

  const [paymentAmounts,
    setPaymentAmounts] =
    useState({});

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const token =
        localStorage.getItem("token");

      const res = await api.get(
        "/admin/credit",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setAccounts(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const recordPayment = async (
    userId
  ) => {
    const amount =
      paymentAmounts[userId];

    if (!amount) {
      toast.info("Enter Amount");
      return;
    }

    try {
      const token =
        localStorage.getItem("token");

      await api.post(
        "/admin/credit/payment",
        {
          userId,
          amount,
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      toast.success(
        "Payment Recorded"
      );

      setPaymentAmounts({
        ...paymentAmounts,
        [userId]: "",
      });

      fetchAccounts();

    } catch (error) {
      console.log(error);
      toast.error("Failed");
    }
  };

  return (
    <>
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">

        <h1 className="text-3xl font-bold mb-6">
          Credit Accounts
        </h1>

        {accounts.length === 0 ? (
          <div className="bg-white shadow-md rounded-xl p-8 text-center">
            <h2 className="text-gray-500">
              No Credit Accounts Found
            </h2>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">

            {accounts.map(
              (account) => (
                <div
                  key={account.id}
                  className="bg-white shadow-md rounded-xl p-5"
                >

                  <div className="flex justify-between items-start">

                    <div>
                      <h2 className="text-xl font-semibold">
                        {account.name}
                      </h2>

                      <p className="text-gray-500 mt-1">
                        📞 {account.phone}
                      </p>
                    </div>

                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                      Udhaar
                    </span>

                  </div>

                  <div className="mt-4 space-y-2">

                    <p>
                      Credit Limit:
                      <span className="font-semibold ml-2">
                        ₹
                        {
                          account.credit_limit
                        }
                      </span>
                    </p>

                    <p>
                      Outstanding:
                      <span className="font-semibold text-red-600 ml-2">
                        ₹
                        {
                          account.outstanding_balance
                        }
                      </span>
                    </p>

                  </div>

                  <div className="mt-5 flex gap-3">

                    <input
                      type="number"
                      placeholder="Enter Amount"
                      value={
                        paymentAmounts[
                          account.user_id
                        ] || ""
                      }
                      onChange={(e) =>
                        setPaymentAmounts({
                          ...paymentAmounts,
                          [account.user_id]:
                            e.target.value,
                        })
                      }
                      className="flex-1 border rounded-lg px-3 py-2"
                    />

                    <button
                      onClick={() =>
                        recordPayment(
                          account.user_id
                        )
                      }
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                    >
                      Record
                    </button>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>
    </>
  );
}

export default CreditAccounts;