import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

export default function StaffDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("currentUser") || "null");

  const logout = () => {
    localStorage.removeItem("currentUser");
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 rounded-2xl shadow-md bg-white w-[560px]">
        <h1 className="text-2xl font-semibold mb-2">Staff Dashboard</h1>
        <p className="text-gray-600 mb-6">
          Welcome {user?.name || "Staff"} ({user?.role || "staff"}).
        </p>
        <div className="flex gap-3">
          <Button type="primary">Live Orders</Button>
          <Button>Update Status</Button>
          <Button>Stock</Button>
          <Button danger onClick={logout}>
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
}
