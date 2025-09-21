// src/pages/admin/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/api";

export default function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post("/admin/login", { email, password });
      if (onLoginSuccess) onLoginSuccess(response.data.user);
      navigate("/admin/dashboard");
    } catch (err) {
      setError("Invalid credentials.");
    }
  };

  return (
    <div className="admin-login" style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      <h2 style={{ color: "#facc15", textAlign: "center" }}>Admin Login</h2>
      {error && <div style={{ color: "#dc2626", marginBottom: "10px" }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", color: "#0f172a" }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #e5e7eb" }}
            required
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", color: "#0f172a" }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #e5e7eb" }}
            required
          />
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            background: "#facc15",
            color: "#ffffff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </form>
      <style>{`
        :root {
          --admin-yellow: #facc15;
          --admin-white: #ffffff;
          --admin-muted: #6b7280;
          --admin-border: #e5e7eb;
          --admin-shadow: 0 10px 24px -18px rgba(2,6,23,.35);
        }
        .admin-login input:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(250,204,21,.2);
          border-color: #facc15;
        }
      `}</style>
    </div>
  );
}