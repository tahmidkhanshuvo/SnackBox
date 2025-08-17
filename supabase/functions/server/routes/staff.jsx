// StaffDashboard.jsx
import React, { useEffect, useState } from "react";

export function StaffDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/staff/dashboard", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((json) => setData(json.data));
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">{data.message}</h1>
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold">Profile</h2>
        <p>{data.user.name} ({data.user.role})</p>
        <p>{data.user.email}</p>
        <p>Employee ID: {data.user.employeeId}</p>
      </div>
      <div className="bg-gray-100 rounded-lg shadow p-4">
        <h2 className="font-semibold">Stats</h2>
        <ul>
          <li>Pending Orders: {data.stats.pendingOrders}</li>
          <li>Completed Today: {data.stats.completedToday}</li>
          <li>Total Revenue: {data.stats.totalRevenue}</li>
          <li>Avg. Order Time: {data.stats.averageOrderTime}</li>
        </ul>
      </div>
    </div>
  );
}
