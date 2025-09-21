// src/pages/admin/Orders.jsx
import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import apiClient from "../../api/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await apiClient.get("/api/admin/orders");
        setOrders(data);
      } catch (err) {
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <AdminLayout title="Orders">
      <div className="adm-card p-6">
        <h3 className="text-lg font-bold text-amber-900 mb-4">Orders</h3>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-yellow-100 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-yellow-100 rounded w-1/2"></div>
          </div>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : orders.length === 0 ? (
          <p className="text-amber-700">No orders available.</p>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li key={order.id} className="flex items-center justify-between p-4 bg-white/80 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <span className="text-amber-900">Order #{order.id} - {order.status}</span>
                <button className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-full hover:from-yellow-500 hover:to-amber-600 transition-all duration-200">
                  View
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminLayout>
  );
}