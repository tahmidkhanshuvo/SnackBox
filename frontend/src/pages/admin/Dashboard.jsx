// src/pages/admin/Dashboard.jsx
import React from "react";
import AdminLayout from "../../components/AdminLayout";

export default function Dashboard() {
  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="adm-card p-6 bg-gradient-to-br from-white/90 to-yellow-50/90">
          <h3 className="text-lg font-bold text-amber-900">Total Users</h3>
          <p className="text-3xl font-extrabold text-amber-700 mt-2">45</p>
        </div>
        <div className="adm-card p-6 bg-gradient-to-br from-white/90 to-yellow-50/90">
          <h3 className="text-lg font-bold text-amber-900">Pending Approvals</h3>
          <p className="text-3xl font-extrabold text-amber-700 mt-2">3</p>
        </div>
      </div>
      <style>{`
        .grid { display: grid; }
        .grid-cols-1 { grid-template-columns: 1fr; }
        .md:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .gap-6 { gap: 1.5rem; }
        .p-6 { padding: 1.5rem; }
        .bg-gradient-to-br { background-image: linear-gradient(to bottom right, var(--from), var(--to)); }
        .from-white\/90 { --from: rgba(255, 255, 255, 0.9); }
        .to-yellow-50\/90 { --to: rgba(254, 252, 191, 0.9); }
        .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
        .font-bold { font-weight: 700; }
        .text-amber-900 { color: #713f12; }
        .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
        .font-extrabold { font-weight: 800; }
        .text-amber-700 { color: #ca8a04; }
        .mt-2 { margin-top: 0.5rem; }
      `}</style>
    </AdminLayout>
  );
}