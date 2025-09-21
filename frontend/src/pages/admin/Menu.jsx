// src/pages/admin/Menu.jsx
import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import apiClient from "../../api/api";

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const { data } = await apiClient.get("/api/admin/menu-items");
        setMenuItems(data);
      } catch (err) {
        setError("Failed to load menu items.");
      } finally {
        setLoading(false);
      }
    };
    fetchMenuItems();
  }, []);

  return (
    <AdminLayout title="Menu">
      <div className="adm-card p-6">
        <h3 className="text-lg font-bold text-amber-900 mb-4">Menu Items</h3>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-yellow-100 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-yellow-100 rounded w-1/2"></div>
          </div>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : menuItems.length === 0 ? (
          <p className="text-amber-700">No menu items available.</p>
        ) : (
          <ul className="space-y-4">
            {menuItems.map((item) => (
              <li key={item.id} className="flex items-center justify-between p-4 bg-white/80 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <span className="text-amber-900">{item.item_name} - ${item.price}</span>
                <button className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-full hover:from-yellow-500 hover:to-amber-600 transition-all duration-200">
                  Edit
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminLayout>
  );
}