import React from "react";
import { FiPlus } from "react-icons/fi";

const PageHeader = ({ title, onAddClick }) => (
  <div className="page-header" style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  }}>
    <h1 style={{ margin: 0 }}>{title}</h1>
    <button
      onClick={onAddClick}
      style={{
        backgroundColor: "#3b82f6",
        color: "white",
        border: "none",
        padding: "10px 16px",
        borderRadius: 6,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 14,
      }}
    >
      <FiPlus /> Add Item
    </button>
  </div>
);

export default PageHeader;
