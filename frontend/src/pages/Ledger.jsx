import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Ledger() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [outstanding, setOutstanding] = useState(0);

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/credit/ledger", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTransactions(res.data.transactions);
      setOutstanding(res.data.outstanding);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col justify-center items-center">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin mb-3"></div>
        <h2 className="text-neutral-500 text-sm font-medium tracking-wide">Loading your statements...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-16">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-10">
        
        {/* Simple Minimalist Header */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-neutral-800 tracking-tight">
            Udhaar Account Ledger
          </h1>
          <p className="text-neutral-400 text-xs mt-0.5">
            Overview of your recent credits and transactions
          </p>
        </div>

        {/* Muted Premium Balance Card */}
        <div className="bg-white border border-neutral-100 rounded-2xl p-6 mb-8 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
              Outstanding Balance
            </p>
            <h2 className="text-3xl font-semibold text-neutral-800 tracking-tight">
              ₹{outstanding}
            </h2>
          </div>
          <div>
            <span className="bg-neutral-50 border border-neutral-200 px-3 py-1 rounded-full text-xs font-medium text-neutral-600">
              {outstanding > 0 ? "Active Balance" : "Clear"}
            </span>
          </div>
        </div>

        {/* History Block */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-1 mb-2">
            Statement History
          </h3>

          {transactions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-neutral-100">
              <svg className="w-8 h-8 text-neutral-300 mx-auto mb-2.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
              <p className="text-neutral-400 text-sm">No transaction entries found</p>
            </div>
          ) : (
            transactions.map((tx) => {
              const isCredit = tx.type?.toLowerCase() === "credit";
              return (
                <div
                  key={tx.id}
                  className="bg-white border border-neutral-100 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-neutral-200 transition duration-150"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Small muted geometric indicator instead of colored circles */}
                    <div className="w-2 h-2 rounded-full bg-neutral-200 shrink-0"></div>

                    <div className="min-w-0 space-y-0.5">
                      <p className="text-sm font-medium text-neutral-800 truncate">
                        {tx.description || "Transaction entry"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <span className="capitalize font-medium text-neutral-500">
                          {tx.type}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(tx.transaction_date).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Soft clean pricing with fine weights */}
                  <div className="text-right shrink-0">
                    <span className={`text-base font-semibold tracking-tight ${isCredit ? "text-emerald-600" : "text-neutral-700"}`}>
                      {isCredit ? "+" : "-"} ₹{tx.amount}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Ledger;
