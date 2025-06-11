import React, { useState, useEffect } from "react";
import "../components/style/TransactionModal.css";

const TransactionModal = ({ visible, onClose, onSave }) => {
  const [date, setDate] = useState("");
  const [type, setType] = useState("Incoming");
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (visible) {
      setDate("");
      setType("Incoming");
      setItem("");
      setQuantity("");
      setNotes("");
    }
  }, [visible]);

  if (!visible) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!date || !item || quantity === "") {
      alert("Tanggal, item, dan quantity harus diisi!");
      return;
    }

    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity)) {
      alert("Quantity harus berupa angka");
      return;
    }

    onSave({
      id: Date.now(),
      date,
      type,
      item,
      quantity: parsedQuantity,
      notes,
    });

    onClose();
  };

  return (
    <div className="modal-overlay">
      <form className="modal-content" onSubmit={handleSubmit}>
        <h2>Add New Transaction</h2>

        <label>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>

        <label>
          Type
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="Incoming">Incoming</option>
            <option value="Outgoing">Outgoing</option>
            <option value="Adjustment">Adjustment</option>
          </select>
        </label>

        <label>
          Item
          <input type="text" value={item} onChange={(e) => setItem(e.target.value)} required />
        </label>

        <label>
          Quantity
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        </label>

        <label>
          Notes
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </label>

        <div className="modal-buttons">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionModal;
