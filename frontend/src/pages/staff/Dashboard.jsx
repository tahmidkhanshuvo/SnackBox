import React, { useEffect, useState } from "react";
import StaffLayout from "./StaffLayout.jsx";
import apiClient from "../../api/api.js";

/* ---------- Icons ---------- */
const Icon = {
  Clock: (p) => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Menu: (p) => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M4 6h16M4 12h16M4 18h16"/></svg>,
  Alert: (p) => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Users: (p) => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
};

/* ---------- UI Components ---------- */
function StatCard({ title, value, icon, color = "#16a34a" }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16,
      padding: 20,
      background: "#fff",
      border: "1px solid #e5e7eb", borderRadius: 16
    }}>
      <div style={{
        flexShrink: 0, width: 52, height: 52,
        display: "grid", placeItems: "center",
        borderRadius: 999, background: `${color}1A`, color: color
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#6b7280" }}>{title}</div>
        <div style={{ fontSize: 32, fontWeight: 900, color: "#0f172a" }}>{value}</div>
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: 20 }}>
      <div style={{ flexShrink: 0, width: 52, height: 52, borderRadius: 999, background: "#eef2f7" }} />
      <div style={{ flexGrow: 1 }}>
        <div style={{ height: 10, width: "60%", background: "#eef2f7", borderRadius: 999, marginBottom: 12 }} />
        <div style={{ height: 24, width: "30%", background: "#eef2f7", borderRadius: 999 }} />
      </div>
    </div>
  );
}


/* ---------- Page Component ---------- */
export default function StaffDashboard() {
  const [stats, setStats] = useState({ orders: "—", menuItems: "—", complaints: "—", staff: "—" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError("");
      try {
        const requests = [
          apiClient.get("/api/orders", { params: { status: "Pending", per_page: 1 } }),
          apiClient.get("/api/menu-items", { params: { per_page: 1 } }),
          apiClient.get("/api/complaints", { params: { status: "Pending", per_page: 1 } }),
          apiClient.get("/api/staff", { params: { per_page: 1 } }),
        ];

        const [ordersRes, menuRes, complaintsRes, staffRes] = await Promise.all(requests);

        setStats({
          orders: ordersRes.data?.meta?.total ?? 0,
          menuItems: menuRes.data?.meta?.total ?? 0,
          complaints: complaintsRes.data?.meta?.total ?? 0,
          staff: staffRes.data?.meta?.total ?? 0,
        });

      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <StaffLayout title="Dashboard">
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 16,
      }}>
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard title="Pending Orders" value={stats.orders} icon={<Icon.Clock />} color="#3b82f6" />
            <StatCard title="Total Menu Items" value={stats.menuItems} icon={<Icon.Menu />} color="#16a34a" />
            <StatCard title="Open Complaints" value={stats.complaints} icon={<Icon.Alert />} color="#f97316" />
            <StatCard title="Active Staff" value={stats.staff} icon={<Icon.Users />} color="#6366f1" />
          </>
        )}
      </div>

      {error && (
        <div style={{ marginTop: 20, padding: 12, background: "#fff1f2", border: "1px solid #fecdd3", color: "#9f1239", borderRadius: 10 }}>
          {error}
        </div>
      )}
    </StaffLayout>
  );
}