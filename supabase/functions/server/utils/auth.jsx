// AuthContext.jsx - React auth utilities (frontend version of your auth.js)
import React, { createContext, useState, useEffect, useContext } from "react";

// Create context
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // Simulate login
  const login = async (email, password) => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!data.success) throw new Error(data.message);

      setToken(data.token);
      setUser(data.user);
      return true;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  };

  // Logout
  const logout = () => {
    setToken(null);
    setUser(null);
  };

  // Check token expiration (frontend side)
  const isTokenExpired = (exp) => {
    return Date.now() >= exp * 1000;
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isTokenExpired }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export function useAuth() {
  return useContext(AuthContext);
}
