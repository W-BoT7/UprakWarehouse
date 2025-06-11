import React, { useState, useEffect } from "react";
import { FiPlus, FiRepeat } from "react-icons/fi";
import "../components/style/Transaction.css";
import TransactionModal from "../components/TransactionModal";

const Transaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchTransactions = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/transactions");
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAddTransaction = async (newTransaction) => {
    try {
      const res = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTransaction),
      });

      if (!res.ok) throw new Error("Failed to save transaction");

      const saved = await res.json();
      setTransactions((prev) => [saved, ...prev]);
    } catch (err) {
      console.error("Error saving transaction:", err);
      alert("Failed to save transaction. Please try again.");
    }
  };

  return (
    <div className="transaction-container">
      <header className="transaction-header">
        <h1>
          <FiRepeat size={26} style={{ marginRight: 8 }} />
          Transactions
        </h1>
        <button className="btn-add-transaction" onClick={() => setIsModalVisible(true)}>
          <FiPlus size={18} /> Add Transaction
        </button>
      </header>

      <TransactionModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={handleAddTransaction}
      />

      <table className="transaction-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Item</th>
            <th>Quantity</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>
                No transactions available.
              </td>
            </tr>
          ) : (
            transactions.map(({ id, date, type, item, quantity, notes }) => (
              <tr key={id}>
                <td>{date}</td>
                <td className={`type-${type.toLowerCase()}`}>{type}</td>
                <td>{item}</td>
                <td>{quantity}</td>
                <td>{notes}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Transaction;
