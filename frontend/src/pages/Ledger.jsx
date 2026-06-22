import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Ledger() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get(
        "/credit/ledger",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTransactions(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const outstandingBalance = transactions.reduce(
    (balance, tx) => {
      if (tx.type === "purchase") {
        return balance + Number(tx.amount);
      }

      return balance - Number(tx.amount);
    },
    0
  );

  if (loading) {
    return <h2>Loading Ledger...</h2>;
  }

  return (
    <>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <h1>My Udhaar Ledger</h1>

        <h2>
          Outstanding Balance: ₹
          {outstandingBalance}
        </h2>

        {transactions.length === 0 ? (
          <h3>No Transactions Found</h3>
        ) : (
          transactions.map((tx) => (
            <div
              key={tx.id}
              style={{
                border: "1px solid #ddd",
                padding: "15px",
                marginBottom: "10px",
                borderRadius: "10px",
              }}
            >
              <p>
                <strong>Type:</strong>{" "}
                {tx.type}
              </p>

              <p>
                <strong>Amount:</strong> ₹
                {tx.amount}
              </p>

              <p>
                <strong>Description:</strong>{" "}
                {tx.description}
              </p>

              <p>
                <strong>Date:</strong>{" "}
                {new Date(
                  tx.transaction_date
                ).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default Ledger;