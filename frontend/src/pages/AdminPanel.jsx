import React, { useState, useEffect } from "react";
import { FiUserPlus, FiEdit, FiTrash2, FiUserCheck } from "react-icons/fi";
import "../components/style/adminPanel.css";
import AddUserModal from "../components/AddUserModal";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const API_URL = "http://localhost:5000/api/users";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
      setUsers([]);
    }
  };

  const handleAddUser = async (newUser) => {
    if (editingUser) {
      try {
        const res = await fetch(`${API_URL}/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUser),
        });
        if (!res.ok) throw new Error("Failed to update user");

        setEditingUser(null);
        setIsModalOpen(false);
        fetchUsers();
      } catch (error) {
        console.error(error);
        alert("Failed to update user");
      }
    } else {
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUser),
        });
        if (!res.ok) throw new Error("Failed to add user");

        setIsModalOpen(false);
        fetchUsers();
      } catch (error) {
        console.error(error);
        alert("Failed to add user");
      }
    }
  };

  const handleEditUser = (id) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      setEditingUser(user);
      setIsModalOpen(true);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Yakin mau hapus user ini?")) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete user");
      fetchUsers();
    } catch (error) {
      console.error(error);
      alert("Failed to delete user");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="admin-panel-container">
      <header className="admin-panel-header">
        <h1>
          <FiUserCheck size={26} style={{ marginRight: 8 }} />
          Admin Panel
        </h1>
        <button className="btn-add-user" onClick={() => setIsModalOpen(true)}>
          <FiUserPlus size={18} /> Add User
        </button>
      </header>

      <table className="user-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>Email</th>
            <th className="actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>
                No users found.
              </td>
            </tr>
          ) : (
            users.map(({ id, username, role, email }) => (
              <tr key={id}>
                <td>{username}</td>
                <td>{role}</td>
                <td>{email}</td>
                <td className="actions-col">
                  <button className="btn-icon edit" onClick={() => handleEditUser(id)} title="Edit User">
                    <FiEdit />
                  </button>
                  <button className="btn-icon delete" onClick={() => handleDeleteUser(id)} title="Delete User">
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <AddUserModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onAddUser={handleAddUser}
        editingUser={editingUser}
      />
    </div>
  );
};

export default AdminPanel;
