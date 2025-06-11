import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";

const ItemModal = ({ visible, onClose, onSave, initialData }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData?.name || "");
      setDescription(initialData?.description || "");
      setPrice(initialData?.price || "");
    } else {
      setName("");
      setDescription("");
      setPrice("");
    }
    setImageFile(null);
  }, [initialData, visible]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setImageFile(acceptedFiles[0]);
      }
    },
  });

  if (!visible) return null;

  const handleSave = () => {
    if (!name.trim()) {
      alert("Product name cannot be empty!");
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      alert("Please enter a valid price.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", parsedPrice);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    onSave(formData);

    setName("");
    setDescription("");
    setPrice("");
    setImageFile(null);
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        className="modal-content"
        style={{
          backgroundColor: "white",
          padding: 40,
          borderRadius: 8,
          minWidth: 100,
        }}
      >
        <h2 style={{ marginBottom: 16 }}>
          {initialData?.id ? "Edit Product" : "Add New Product"}
        </h2>

        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", marginBottom: 12, padding: 8 }}
        />

        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Price (e.g., 10000)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={{ width: "100%", marginBottom: 12, padding: 8 }}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: "100%", marginBottom: 12, padding: 8, minHeight: 60 }}
        />

        <div
          {...getRootProps()}
          style={{
            border: "2px dashed #ccc",
            padding: 20,
            textAlign: "center",
            marginBottom: 16,
            backgroundColor: isDragActive ? "#e6f7ff" : "#fafafa",
            cursor: "pointer",
            borderRadius: 8,
          }}
        >
          <input {...getInputProps()} />
          {imageFile ? (
            <>
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Preview"
                style={{ maxWidth: "150px", maxHeight: "150px", objectFit: "contain", marginBottom: 8 }}
              />
              <p>{imageFile.name}</p>
            </>
          ) : (
            <p>Drag & drop an image here, or click to select</p>
          )}
        </div>

        <button
          onClick={handleSave}
          className="btn-primary"
          style={{ marginRight: 8 }}
        >
          Save
        </button>
        <button onClick={onClose} className="btn-secondary">
          Cancel
        </button>

        <style>{`
          .btn-primary {
            background-color: #2563eb;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          }
          .btn-primary:hover {
            background-color: #1d4ed8;
          }
          .btn-secondary {
            background-color: #e5e7eb;
            color: #111;
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          }
          .btn-secondary:hover {
            background-color: #d1d5db;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ItemModal;
