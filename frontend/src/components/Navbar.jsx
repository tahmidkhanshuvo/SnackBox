import React, { useState } from "react";
import { LogoutOutlined, BulbOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const Navbar = ({ isLoggedIn = true, onLogout }) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.body.setAttribute("data-theme", darkMode ? "light" : "dark");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "rgb(178, 34, 34)", // fresh meat red
        color: "#f5f5f0", // pearl
        padding: "12px 24px",
        fontWeight: "bold",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Left - Brand */}
      <Link
        to="/"
        style={{
          textDecoration: "none",
          color: "#f5f5f0",
          fontSize: "22px",
          fontWeight: "700",
        }}
      >
        SnackBox
      </Link>

      {/* Right - Theme + Logout */}
      <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
        <BulbOutlined
          onClick={toggleTheme}
          style={{ fontSize: "22px", cursor: "pointer", color: "#f5f5f0" }}
        />

        {/* FORCE SHOW logout button for debug */}
        <button
          onClick={onLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "yellow", // 🔥 bright color to check visibility
            color: "black",
            border: "2px solid black",
            padding: "6px 12px",
            borderRadius: "6px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          <LogoutOutlined />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
