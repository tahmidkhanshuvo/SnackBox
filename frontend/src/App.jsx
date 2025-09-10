import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

// Combined Auth page (Login + Sign Up)
import LoginAndSignUp from "./pages/Auth/Login&SignUp";

// Dashboards
import AdminDashboard from "./pages/Admin/AdminDashboard";
import StaffDashboard from "./pages/Staff/StaffDashboard";
import CustomerDashboard from "./pages/Customer/CustomerDashboard";

// Role-protected route wrapper
const RequireAuth = ({ role, children }) => {
  const location = useLocation();
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

  if (!currentUser) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  if (role && currentUser.role !== role) {
    const map = { admin: "/admin", staff: "/staff", customer: "/customer" };
    return <Navigate to={map[currentUser.role] || "/"} replace />;
  }
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* App starts at the combined Auth page */}
        <Route path="/" element={<LoginAndSignUp />} />

        {/* Protected dashboards */}
        <Route
          path="/admin"
          element={
            <RequireAuth role="admin">
              <AdminDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/staff"
          element={
            <RequireAuth role="staff">
              <StaffDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/customer"
          element={
            <RequireAuth role="customer">
              <CustomerDashboard />
            </RequireAuth>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
