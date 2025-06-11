import React, { useState, useEffect, useRef } from "react";
import { FiBell, FiChevronDown, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import './style/Header.css';

const Header = () => {
  const [username, setUsername] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) setUsername(savedUsername);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/search?q=${searchTerm}`);
        const data = await res.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Search error:", error);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    setUsername("");
    setDropdownOpen(false);
    navigate("/login");
  };

  return (
    <header className="app-header">
      <div className="header-left" style={{ position: "relative" }}>
        <input
          className="search-input"
          placeholder="Search items..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        {suggestions.length > 0 && (
          <ul className="suggestion-box">
            {suggestions.map((item, index) => (
              <li
                key={index}
                className="suggestion-item"
                onClick={() => {
                  navigate("/inventory", { state: { searchQuery: item.name } });
                  setSearchTerm("");
                  setSuggestions([]);
                }}
              >
                {item.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="header-right" ref={dropdownRef}>
        <span
          className="user-name"
          onClick={() => setDropdownOpen(prev => !prev)}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === "Enter") setDropdownOpen(prev => !prev);
          }}
        >
          <FiUser style={{ marginRight: 6, marginBottom: -2 }} />
          Hi, {username || "Guest"} <FiChevronDown />
        </span>

        <button className="btn-notification" title="Notifications">
          <FiBell size={20} />
        </button>

        {dropdownOpen && (
          <div className="dropdown-menu">
            {username ? (
              <button onClick={handleLogout} className="dropdown-item">
                Logout
              </button>
            ) : (
              <>
                <button onClick={() => {
                  setDropdownOpen(false);
                  navigate("/login");
                }} className="dropdown-item">Login</button>
                <button onClick={() => {
                  setDropdownOpen(false);
                  navigate("/signup");
                }} className="dropdown-item">Signup</button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
