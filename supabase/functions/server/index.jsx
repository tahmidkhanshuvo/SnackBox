// apiClient.jsx - SnackBox API client (React-friendly)
const BASE_URL = "https://your-server.com/make-server-bd12b0df/api";

export async function apiRequest(endpoint, method = "GET", data = null, token = null) {
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const options = {
    method,
    headers,
    ...(data && { body: JSON.stringify(data) }),
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const json = await response.json();
    if (!response.ok) throw json;
    return json;
  } catch (err) {
    console.error("API request error:", err);
    throw err;
  }
}

// Example endpoints
export const getDashboard = (token) => apiRequest("/staff/dashboard", "GET", null, token);
export const getOrders = (token, status = "all", page = 1, limit = 20) =>
  apiRequest(`/staff/orders?status=${status}&page=${page}&limit=${limit}`, "GET", null, token);
export const updateOrderStatus = (orderId, status, token) =>
  apiRequest(`/staff/orders/${orderId}/status`, "PUT", { status }, token);
export const getProfile = (token) => apiRequest("/staff/profile", "GET", null, token);
export const updateProfile = (data, token) => apiRequest("/staff/profile", "PUT", data, token);
export const healthCheck = () => apiRequest("/health", "GET");

// Usage example in a React component
/*
import React, { useEffect, useState } from "react";
import { getDashboard } from "./apiClient.jsx";

export default function Dashboard({ token }) {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    getDashboard(token)
      .then((data) => setDashboard(data.data))
      .catch((err) => console.error(err));
  }, [token]);

  if (!dashboard) return <p>Loading...</p>;

  return (
    <div>
      <h1>{dashboard.message}</h1>
      <p>Total Revenue: {dashboard.stats.totalRevenue}</p>
    </div>
  );
}
*/
