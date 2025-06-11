import React from "react";
import { FiX } from "react-icons/fi";

const DetailModalItem = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "white",
          padding: 30,
          borderRadius: 12,
          maxWidth: "500px",
          width: "90%",
          maxHeight: "80vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 15,
            right: 15,
            background: "none",
            border: "none",
            fontSize: 24,
            cursor: "pointer",
          }}
          aria-label="Close"
        >
          <FiX />
        </button>

        <h2 style={{ marginBottom: 16 }}>{item.name}</h2>

        {item.imageUrl ? (
          <img
            src={`http://localhost:5000/uploads/${item.imageUrl}`}
            alt={item.name}
            style={{
              width: "100%",
              borderRadius: 10,
              marginBottom: 16,
              objectFit: "cover",
              maxHeight: 300,
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: 200,
              backgroundColor: "#f3f4f6",
              borderRadius: 10,
              marginBottom: 16,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#9ca3af",
              fontStyle: "italic",
            }}
          >
            No Image
          </div>
        )}

        <p style={{ fontWeight: "bold", color: "#10b981", fontSize: 18 }}>
          Rp {item.price?.toLocaleString("id-ID") || "0"}
        </p>

        <p style={{ whiteSpace: "pre-wrap", color: "#4b5563", marginTop: 12 }}>
          {item.description || "No description"}
        </p>

        <p style={{ marginTop: 16, fontSize: 12, color: "#9ca3af" }}>
          Created at: {new Date(item.createdAt).toLocaleString("id-ID")}
        </p>
      </div>
    </div>
  );
};

export default DetailModalItem;
