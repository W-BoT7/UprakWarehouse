import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FiPlus, FiBox, FiEdit, FiTrash2 } from "react-icons/fi";
import axios from "axios";
import jwt_decode from "jwt-decode";
import AddItemModal from "../components/AddItemModal";
import DetailModalItem from "../components/DetailModalItem";
import "../components/style/inventory.css";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [role, setRole] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwt_decode(token);
        setRole(decoded.role);
      } catch (e) {
        console.error("Invalid token", e);
        setRole(null);
      }
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (items.length > 0 && location.state?.searchQuery) {
      const searchQuery = location.state.searchQuery.toLowerCase();
      const match = items.find((item) => item.name.toLowerCase() === searchQuery);
      if (match) setDetailItem(match);
    }
  }, [location.state?.searchQuery, items]);

  const fetchItems = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/inventory");
      setItems(res.data);
    } catch (err) {
      console.error("Failed to fetch items", err);
    }
  };

  const toggleExpand = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAddItem = async (newItemFormData) => {
    try {
      await axios.post("http://localhost:5000/api/inventory", newItemFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setIsModalVisible(false);
      fetchItems();
    } catch (err) {
      console.error("Failed to add item", err);
    }
  };

  const handleUpdateItem = async (updatedItemFormData) => {
    try {
      const id = editingItem?.id;
      if (!id) return;

      await axios.put(`http://localhost:5000/api/inventory/${id}`, updatedItemFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setIsModalVisible(false);
      setEditingItem(null);
      fetchItems();
    } catch (err) {
      console.error("Failed to update item", err);
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await axios.delete(`http://localhost:5000/api/inventory/${id}`);
        fetchItems();
      } catch (err) {
        console.error("Failed to delete item", err);
      }
    }
  };

  const canAdd = role === "admin" || role === "staff";

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <h1 className="inventory-title">
          <FiBox size={26} style={{ marginRight: 8 }} />
          Inventory
        </h1>

        {canAdd && (
          <button
            onClick={() => {
              setEditingItem(null);
              setIsModalVisible(true);
            }}
            className="btn-add-item"
          >
            <FiPlus size={16} style={{ marginRight: 4 }} />
            Add Item
          </button>
        )}
      </div>

      <DetailModalItem item={detailItem} onClose={() => setDetailItem(null)} />

      <AddItemModal
        visible={isModalVisible}
        onClose={() => {
          setEditingItem(null);
          setIsModalVisible(false);
        }}
        onSave={editingItem ? handleUpdateItem : handleAddItem}
        initialData={editingItem}
      />

      {items.length === 0 ? (
        <div className="inventory-empty">
          No items yet. {canAdd ? "Click Add Item to start adding products." : "No data to display."}
        </div>
      ) : (
        <div className="inventory-grid">
          {items.map((item) => {
            const isExpanded = expandedItems[item.id];
            const showToggle = item.description && item.description.length > 100;
            const descriptionPreview = isExpanded
              ? item.description
              : (item.description || "No description").slice(0, 100);

            return (
              <div
                key={item.id}
                className="inventory-card"
                onClick={() => setDetailItem(item)}
                style={{ cursor: "pointer" }}
              >
                <div className="inventory-card-header">
                  <h3 className="item-name">{item.name}</h3>
                  <span className="item-price">
                    Rp {item.price?.toLocaleString("id-ID") || "0"}
                  </span>
                </div>

                {item.imageUrl ? (
                  <img
                    src={`http://localhost:5000/uploads/${item.imageUrl}`}
                    alt={item.name}
                    className="item-image"
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: 150,
                      backgroundColor: "#f3f4f6",
                      borderRadius: 8,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "#9ca3af",
                      fontStyle: "italic",
                      marginBottom: 8,
                    }}
                  >
                    No Image
                  </div>
                )}

                <p className="item-description">
                  {descriptionPreview}
                  {showToggle && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(item.id);
                      }}
                      className="btn-show-more"
                    >
                      {isExpanded ? " Show Less" : "... Show More"}
                    </button>
                  )}
                </p>

                <p className="item-createdAt">{formatDate(item.createdAt)}</p>

                {canAdd && (
                  <div
                    className="inventory-actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setIsModalVisible(true);
                      }}
                      className="btn-edit"
                      title="Edit Item"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="btn-delete"
                      title="Delete Item"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Inventory;
