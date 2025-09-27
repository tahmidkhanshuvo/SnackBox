// src/App.jsx
import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import apiClient, { getMe } from "./api/api";
import LoginPage from "./pages/Login";
import Home from "./pages/customer/Home";
import Product from "./pages/customer/Product";
import Profile from "./pages/customer/Profile";
import Layout from "./components/Layout.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import Cart from "./pages/customer/Cart.jsx";
import CustomerOrders from "./pages/customer/Orders.jsx";
import StaffDashboard from "./pages/staff/Dashboard.jsx";
import StaffOrders from "./pages/staff/Orders.jsx";
import StaffOrderDetails from "./pages/staff/OrderDetails.jsx";
import StaffInventory from "./pages/staff/Inventory.jsx";
import StaffMenu from "./pages/staff/Menu.jsx";
import StaffComplaints from "./pages/staff/Complaints.jsx";
import StaffComplaintDetails from "./pages/staff/ComplaintDetails.jsx";
import StaffShifts from "./pages/staff/Shifts.jsx";
import StaffSalaries from "./pages/staff/Salaries.jsx";
import StaffProfile from "./pages/staff/Profile.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import Users from "./pages/admin/Users.jsx";
import AdminMenu from "./pages/admin/Menu.jsx";
import AdminOrders from "./pages/admin/Orders.jsx";

/* ================== local helpers ================== */

const DashboardStyles = () => (
  <style>{`
    .page-container {
      display: flex;
      width: 100vw;
      height: 100vh;
      align-items: center;
      justify-content: center;
      background-color: #f0f2f5;
      overflow: auto;
    }
    .dashboard-container {
      text-align: left;
      background: #fff;
      padding: 24px;
      border-radius: 20px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 1200px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    }
  `}</style>
);

const Toast = ({ message, onClose, duration = 3000 }) => {
  const t = useRef(null);
  useEffect(() => {
    t.current = setTimeout(onClose, duration);
    return () => clearTimeout(t.current);
  }, [onClose, duration]);
  return (
    <div style={{ position: "fixed", top: 16, right: 16, zIndex: 50 }} role="status" aria-live="polite">
      <div
        style={{
          background: "rgba(17, 24, 39, 0.92)",
          color: "#fff",
          padding: "10px 14px",
          borderRadius: 10,
          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.25)",
          fontWeight: 600,
        }}
      >
        {message}{" "}
        <button
          onClick={onClose}
          style={{ marginLeft: 8, background: "transparent", border: "none", color: "#a5b4fc", cursor: "pointer" }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

const getPath = () => window.location.pathname || "/";
const navigate = (path) => {
  if (getPath() !== path) window.history.replaceState({}, "", path);
};
const scrollTop = () => {
  try {
    window.scrollTo({ top: 0, behavior: "instant" });
  } catch {
    window.scrollTo(0, 0);
  }
};

// Normalize any backend payload shape into a plain user object (or null)
const normalizeUser = (raw) => raw?.user ?? raw?.data ?? raw ?? null;
const isOkCustomerPath = (p) =>
  p === "/" || p.startsWith("/product/") || p === "/profile" || p === "/cart" || p === "/orders";

/* ================== sub routers ================== */

function StaffRouter({ route, user, goto, onLogout }) {
  const sub = route.replace(/^\/staff\/?/, "");
  const cleanId = (raw) => {
    const id = String(raw || "").split("?")[0].replace(/\/+$/, "");
    return /^\d+$/.test(id) ? id : null;
  };

  if (sub === "" || sub === "dashboard") return <StaffDashboard user={user} goto={goto} onLogout={onLogout} />;
  if (sub === "orders") return <StaffOrders goto={goto} />;
  if (sub.startsWith("orders/")) {
    const id = cleanId(sub.split("/")[1]);
    if (!id) {
      return (
        <div className="page-container">
          <div className="dashboard-container">
            <h2>Invalid order URL</h2>
            <button onClick={() => goto("/staff/orders")}>Back to Orders</button>
          </div>
        </div>
      );
    }
    return <StaffOrderDetails orderId={id} goto={goto} />;
  }
  if (sub === "inventory") return <StaffInventory goto={goto} />;
  if (sub === "menu") return <StaffMenu goto={goto} />;
  if (sub === "complaints") return <StaffComplaints goto={goto} />;
  if (sub.startsWith("complaints/")) {
    const id = cleanId(sub.split("/")[1]);
    if (!id) {
      return (
        <div className="page-container">
          <div className="dashboard-container">
            <h2>Invalid complaint URL</h2>
            <button onClick={() => goto("/staff/complaints")}>Back</button>
          </div>
        </div>
      );
    }
    return <StaffComplaintDetails complaintId={id} goto={goto} />;
  }
  if (sub === "shifts") return <StaffShifts goto={goto} />;
  if (sub === "salaries") return <StaffSalaries goto={goto} />;
  if (sub === "profile") return <StaffProfile user={user} goto={goto} onLogout={onLogout} />;

  return (
    <div className="page-container">
      <div className="dashboard-container">
        <h2>Not found</h2>
        <button onClick={() => goto("/staff/dashboard")}>Go to Staff Dashboard</button>
      </div>
    </div>
  );
}

function AdminRouter({ route, user, goto, onLogout }) {
  const sub = route.replace(/^\/admin\/?/, "");

  if (sub === "" || sub === "dashboard") return <Dashboard user={user} goto={goto} onLogout={onLogout} />;
  if (sub === "users") return <Users goto={goto} />;
  if (sub === "menu") return <AdminMenu goto={goto} />;
  if (sub === "orders") return <AdminOrders goto={goto} />;

  return (
    <div className="page-container">
      <div className="dashboard-container">
        <h2>Not found</h2>
        <button onClick={() => goto("/admin/dashboard")}>Go to Admin Dashboard</button>
      </div>
    </div>
  );
}

/* ================== App ================== */

export default function App() {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);
  const [route, setRoute] = useState(getPath());
  const [toastMsg, setToastMsg] = useState("");

  const goto = (path) => {
    navigate(path);
    setRoute(path);
    scrollTop();
  };

  // 🔸 Sync route when *any* code changes history (e.g., Layout's buttons)
  useEffect(() => {
    const sync = () => setRoute(getPath());
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  // Boot: fetch session and route accordingly (treat null as guest)
  useEffect(() => {
    (async () => {
      try {
        const meRaw = await getMe();           // returns null (not throw) when 401
        const me = normalizeUser(meRaw);
        setUser(me);

        const p = getPath();

        if (!me) {
          // unauthenticated — send to the right login screen
          if (p.startsWith("/admin")) goto("/admin/login");
          else goto("/login");
          return;
        }

        const role = String(me?.role || "").toLowerCase();
        const isStaff = !!me?.staff;

        if (isStaff) {
          goto(p.startsWith("/staff") ? p : "/staff/dashboard");
        } else if (role === "admin") {
          goto(p === "/admin/login" ? "/admin/dashboard" : (p.startsWith("/admin") ? p : "/admin/dashboard"));
        } else {
          goto(isOkCustomerPath(p) ? p : "/");
        }
      } catch (err) {
        // Only true network/JS errors should land here
        console.error("Boot error:", err);
        const p = getPath();
        if (p.startsWith("/admin")) goto("/admin/login");
        else goto("/login");
      } finally {
        setBooting(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guards on route/user changes
  useEffect(() => {
    if (booting) return;

    if (!user) {
      // Unauthed: default to customer/staff login; allow explicit admin login page
      if (route !== "/login" && route !== "/admin/login") goto("/login");
      return;
    }

    const role = String(user?.role || "").toLowerCase();
    const isStaff = !!user?.staff;

    if (isStaff) {
      if (!route.startsWith("/staff")) goto("/staff/dashboard");
      return;
    }

    if (role === "admin") {
      if (route === "/admin/login" || !route.startsWith("/admin")) goto("/admin/dashboard");
      return;
    }

    if (!isOkCustomerPath(route)) goto("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, route, booting]);

  const handleLoginSuccess = (response) => {
    console.log("Login success payload:", response);

    // If a token is returned, attach and re-fetch canonical user
    if (response?.token) {
      localStorage.setItem("token", response.token);
      apiClient.defaults.headers.Authorization = `Bearer ${response.token}`;
      getMe()
        .then((meRaw) => {
          const me = normalizeUser(meRaw);
          setUser(me);
          const p = getPath();
          const role = String(me?.role || "").toLowerCase();
          const isStaff = !!me?.staff;

          const dest = isStaff
            ? (p.startsWith("/staff") ? p : "/staff/dashboard")
            : role === "admin"
            ? (p.startsWith("/admin") ? (p === "/admin/login" ? "/admin/dashboard" : p) : "/admin/dashboard")
            : (isOkCustomerPath(p) ? p : "/");
          goto(dest);
          setToastMsg(`Welcome, ${me?.name || "User"}!`);
        })
        .catch((err) => console.error("Retry getMe error:", err));
      return;
    }

    // Cookie session only: payload might be {user: {...}} or plain user
    const me = normalizeUser(response);
    setUser(me);
    const p = getPath();
    const role = String(me?.role || "").toLowerCase();
    const isStaff = !!me?.staff;

    const dest = isStaff
      ? (p.startsWith("/staff") ? p : "/staff/dashboard")
      : role === "admin"
      ? (p.startsWith("/admin") ? (p === "/admin/login" ? "/admin/dashboard" : p) : "/admin/dashboard")
      : (isOkCustomerPath(p) ? p : "/");
    goto(dest);
    setToastMsg(`Welcome, ${me?.name || "User"}!`);
  };

  const handleLogout = async () => {
    try {
      // Try API logout first; fall back if not present
      try {
        await apiClient.post("/api/auth/logout");
      } catch (e) {
        if (e?.response?.status !== 404) throw e;
        await apiClient.post("/auth/logout");
      }
      const token = localStorage.getItem("token");
      if (token) {
        try { await apiClient.post("/api/auth/token/logout"); } catch {}
        localStorage.removeItem("token");
        delete apiClient.defaults.headers.Authorization;
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
    setUser(null);
    // Default to customer/staff login after logout
    goto("/login");
    setToastMsg("Signed out successfully.");
  };

  if (booting) return <div className="page-container"><h2>Loading...</h2></div>;

  const openProduct = (id) => goto(`/product/${id}`);
  const openProfile = () => goto("/profile");

  return (
    <BrowserRouter>
      <DashboardStyles />
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg("")} />}
      <CartProvider>
        <Layout user={user} onLogout={handleLogout}>
          {/* Unauthenticated */}
          {!user && route === "/login" && <LoginPage onLoginSuccess={handleLoginSuccess} />}
          {!user && route === "/admin/login" && <AdminLogin onLoginSuccess={handleLoginSuccess} />}

          {/* Staff area */}
          {user && user.staff && (
            <StaffRouter route={route} user={user} goto={goto} onLogout={handleLogout} />
          )}

          {/* Admin area */}
          {user && String(user.role || "").toLowerCase() === "admin" && (
            <AdminRouter route={route} user={user} goto={goto} onLogout={handleLogout} />
          )}

          {/* Customer area */}
          {user && !user.staff && String(user.role || "").toLowerCase() !== "admin" && (
            <>
              {route === "/" && (
                <Home
                  onLogout={handleLogout}
                  openProduct={openProduct}
                  openProfile={openProfile}
                />
              )}
              {route.startsWith("/product/") && (
                <Product
                  onLogout={handleLogout}
                  productId={route.split("/")[2]}
                  goHome={() => goto("/")}
                />
              )}
              {route === "/profile" && (
                <Profile
                  seedUser={user}
                  onLogout={handleLogout}
                  goHome={() => goto("/")}
                  onUserUpdated={(fresh) => setUser(fresh)}
                />
              )}
              {route === "/cart" && (
                <Cart
                  goHome={() => goto("/")}
                  onContinueShopping={() => goto("/")}
                  onProfile={() => goto("/profile")}
                />
              )}
              {route === "/orders" && <CustomerOrders goHome={() => goto("/")} />}
            </>
          )}
        </Layout>
      </CartProvider>
    </BrowserRouter>
  );
}
