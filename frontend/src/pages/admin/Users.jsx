// src/pages/admin/Users.jsx
import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import apiClient from "../../api/api";

export default function Users() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const { data } = await apiClient.get("/api/admin/pending-users");
        setPendingUsers(data);
      } catch (err) {
        setError("Failed to load pending users.");
      } finally {
        setLoading(false);
      }
    };
    fetchPendingUsers();
  }, []);

  const approveUser = async (userId) => {
    try {
      await apiClient.post(`/api/admin/approve-user/${userId}`);
      setPendingUsers(pendingUsers.filter((u) => u.id !== userId));
    } catch (err) {
      setError("Approval failed.");
    }
  };

  return (
    <AdminLayout title="Users">
      <div className="adm-card p-6">
        <h3 className="text-lg font-bold text-amber-900 mb-4">Pending Staff Approvals</h3>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-yellow-100 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-yellow-100 rounded w-1/2"></div>
          </div>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : pendingUsers.length === 0 ? (
          <p className="text-amber-700">No pending users.</p>
        ) : (
          <ul className="space-y-4">
            {pendingUsers.map((user) => (
              <li key={user.id} className="flex items-center justify-between p-4 bg-white/80 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <span className="text-amber-900">{user.name} ({user.email})</span>
                <button
                  onClick={() => approveUser(user.id)}
                  className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-full hover:from-yellow-500 hover:to-amber-600 transition-all duration-200"
                >
                  Approve
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <style>{`
        .animate-pulse { animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        .h-8 { height: 2rem; }
        .bg-yellow-100 { background-color: #fefcbf; }
        .rounded { border-radius: 0.25rem; }
        .w-1\/3 { width: 33.333333%; }
        .mb-2 { margin-bottom: 0.5rem; }
        .h-4 { height: 1rem; }
        .w-1\/2 { width: 50%; }
        .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .p-4 { padding: 1rem; }
        .bg-white\/80 { background-color: rgba(255, 255, 255, 0.8); }
        .shadow-md { box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .hover:shadow-lg { box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1); }
        .transition-shadow { transition-property: box-shadow; transition-duration: 0.2s; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .bg-gradient-to-r { background-image: linear-gradient(to right, var(--from), var(--to)); }
        .from-yellow-400 { --from: #facc15; }
        .to-amber-500 { --to: #fde047; }
        .text-white { color: #ffffff; }
        .rounded-full { border-radius: 9999px; }
        .hover:from-yellow-500 { --from: #fde047; }
        .hover:to-amber-600 { --to: #ca8a04; }
        .transition-all { transition-property: all; transition-duration: 0.2s; }
        .duration-200 { transition-duration: 200ms; }
      `}</style>
    </AdminLayout>
  );
}