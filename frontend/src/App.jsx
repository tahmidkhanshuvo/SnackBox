import React, { useEffect, useRef, useState } from 'react';
import apiClient, { getMe } from './api/api';
import LoginPage from './pages/Login';
import Home from './pages/customer/Home';
import Product from './pages/customer/Product';
import Profile from './pages/customer/Profile';
import Layout from './components/Layout.jsx';
import { CartProvider } from './context/CartContext.jsx';
import Cart from './pages/customer/Cart.jsx';
import Orders from './pages/customer/Orders.jsx';

// --- Staff pages
import StaffDashboard from './pages/staff/Dashboard.jsx';
import StaffOrders from './pages/staff/Orders.jsx';
import StaffOrderDetails from './pages/staff/OrderDetails.jsx';
import StaffInventory from './pages/staff/Inventory.jsx';
import StaffMenu from './pages/staff/Menu.jsx';
import StaffComplaints from './pages/staff/Complaints.jsx';
import StaffComplaintDetails from './pages/staff/ComplaintDetails.jsx';
import StaffShifts from './pages/staff/Shifts.jsx';
import StaffSalaries from './pages/staff/Salaries.jsx';
import StaffProfile from './pages/staff/Profile.jsx';

// ----------------- tiny CSS + toast -----------------
const DashboardStyles = () => (
  <style>{`
    .page-container{display:flex;width:100vw;height:100vh;align-items:center;justify-content:center;background-color:#f0f2f5;overflow:auto}
    .dashboard-container{text-align:left;background:#fff;padding:24px;border-radius:20px;box-shadow:0 10px 25px rgba(0,0,0,.1);width:100%;max-width:1200px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Open Sans','Helvetica Neue',sans-serif}
  `}</style>
);

const Toast = ({ message, onClose, duration = 3000 }) => {
  const t = useRef(null);
  useEffect(() => { t.current = setTimeout(onClose, duration); return () => clearTimeout(t.current); }, [onClose, duration]);
  return (<div style={{position:'fixed',top:16,right:16,zIndex:50}} role="status" aria-live="polite">
    <div style={{background:'rgba(17,24,39,.92)',color:'#fff',padding:'10px 14px',borderRadius:10,boxShadow:'0 10px 20px rgba(0,0,0,.25)',fontWeight:600}}>
      {message} <button onClick={onClose} style={{marginLeft:8,background:'transparent',border:'none',color:'#a5b4fc',cursor:'pointer'}}>×</button>
    </div>
  </div>);
};

// ----------------- tiny router helpers -----------------
const getPath = () => window.location.pathname || '/';
const navigate = (path) => { if (getPath() !== path) window.history.replaceState({}, '', path); };
const scrollTop = () => { try { window.scrollTo({ top: 0, behavior: 'instant' }); } catch { window.scrollTo(0,0); } };

// ----------------- Staff router -----------------
function StaffRouter({ route, user, goto, onLogout }) {
  const sub = route.replace(/^\/staff\/?/, ''); // "" | "orders" | "orders/123" ...

  const cleanId = (raw) => {
    const id = String(raw || '').split('?')[0].replace(/\/+$/, '');
    return /^\d+$/.test(id) ? id : null;
  };

  if (sub === '' || sub === 'dashboard') return <StaffDashboard user={user} goto={goto} onLogout={onLogout} />;

  if (sub === 'orders') return <StaffOrders goto={goto} />;
  if (sub.startsWith('orders/')) {
    const maybe = sub.split('/')[1];
    const id = cleanId(maybe);
    if (!id) {
      return (
        <div className="page-container">
          <div className="dashboard-container">
            <h2>Invalid order URL</h2>
            <p>The order ID in “{route}” is not valid.</p>
            <button onClick={() => goto('/staff/orders')} style={{padding:'8px 12px',borderRadius:10,border:'1px solid #e5e7eb',background:'#fff',cursor:'pointer'}}>Back to Orders</button>
          </div>
        </div>
      );
    }
    return <StaffOrderDetails orderId={id} goto={goto} />;
  }

  if (sub === 'inventory') return <StaffInventory goto={goto} />;
  if (sub === 'menu') return <StaffMenu goto={goto} />;

  if (sub === 'complaints') return <StaffComplaints goto={goto} />;
  if (sub.startsWith('complaints/')) {
    const maybe = sub.split('/')[1];
    const id = cleanId(maybe);
    if (!id) {
      return (
        <div className="page-container">
          <div className="dashboard-container">
            <h2>Invalid complaint URL</h2>
            <button onClick={() => goto('/staff/complaints')} style={{padding:'8px 12px',borderRadius:10,border:'1px solid #e5e7eb',background:'#fff',cursor:'pointer'}}>Back</button>
          </div>
        </div>
      );
    }
    return <StaffComplaintDetails complaintId={id} goto={goto} />;
  }

  if (sub === 'shifts') return <StaffShifts goto={goto} />;
  if (sub === 'salaries') return <StaffSalaries goto={goto} />;
  if (sub === 'profile') return <StaffProfile user={user} goto={goto} onLogout={onLogout} />;

  return (
    <div className="page-container">
      <div className="dashboard-container">
        <h2>Not found</h2>
        <p>The page “{route}” does not exist.</p>
        <button onClick={() => goto('/staff/dashboard')} style={{padding:'8px 12px',borderRadius:10,border:'1px solid #e5e7eb',background:'#fff',cursor:'pointer'}}>Go to Staff Dashboard</button>
      </div>
    </div>
  );
}

// ----------------- App -----------------
export default function App() {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);
  const [route, setRoute] = useState(getPath());
  const [toastMsg, setToastMsg] = useState('');

  const goto = (path) => {
    navigate(path);
    setRoute(path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    scrollTop();
  };

  // Boot: whoami
  useEffect(() => {
    (async () => {
      try {
        const me = await getMe(); // returns plain user object
        setUser(me);
        const p = getPath();

        const okCustomerPath = (
          p === '/' ||
          p.startsWith('/product/') ||
          p === '/profile' ||
          p === '/cart' ||
          p === '/orders'
        );

        if (me?.staff) {
          // keep any /staff/* deep-link, otherwise go to dashboard
          if (p.startsWith('/staff')) goto(p);
          else goto('/staff/dashboard');
        } else {
          goto(okCustomerPath ? p : '/');
        }
      } catch {
        goto('/login');
      } finally {
        setBooting(false);
      }
    })();

    const pop = () => setRoute(getPath());
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);

  // Guard routes when auth/user changes
  useEffect(() => {
    if (booting) return;

    // not logged in → only /login
    if (!user) { if (route !== '/login') goto('/login'); return; }

    // staff can visit any /staff/*
    if (user?.staff) { if (!route.startsWith('/staff')) goto('/staff/dashboard'); return; }

    // customer-only routes
    const okCustomerPath =
      route === '/' ||
      route.startsWith('/product/') ||
      route === '/profile' ||
      route === '/cart' ||
      route === '/orders';

    if (!okCustomerPath) goto('/');
  }, [user, route, booting]);

  const handleLoginSuccess = (u) => {
    setUser(u);
    const p = getPath();
    const okCustomerPath = p.startsWith('/product/') || p === '/profile' || p === '/cart' || p === '/orders';
    const dest = u?.staff ? (p.startsWith('/staff') ? p : '/staff/dashboard') : (okCustomerPath ? p : '/');
    goto(dest);
    setToastMsg(`Welcome, ${u?.name || 'User'}!`);
  };

  const handleLogout = async () => {
    try { await apiClient.post('/api/auth/logout'); } catch {}
    setUser(null);
    goto('/login');
    setToastMsg('Signed out successfully.');
  };

  if (booting) return <div className="page-container"><h2>Loading...</h2></div>;

  const openProduct = (id) => goto(`/product/${id}`);
  const openProfile = () => goto('/profile');

  return (
    <>
      <DashboardStyles />
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}

      <CartProvider>
        <Layout user={user} onLogout={handleLogout}>
          {!user && route === '/login' && <LoginPage onLoginSuccess={handleLoginSuccess} />}

          {user && user.staff && (
            <StaffRouter route={route} user={user} goto={goto} onLogout={handleLogout} />
          )}

          {user && !user.staff && (
            <>
              {route === '/' && <Home onLogout={handleLogout} openProduct={openProduct} openProfile={openProfile} />}

              {route.startsWith('/product/') && (
                <Product onLogout={handleLogout} productId={route.split('/')[2]} goHome={() => goto('/')} />
              )}

              {route === '/profile' && (
                <Profile
                  seedUser={user}
                  onLogout={handleLogout}
                  goHome={() => goto('/')}
                  onUserUpdated={(fresh) => setUser(fresh)}
                />
              )}

              {route === '/cart' && (
                <Cart
                  goHome={() => goto('/')}
                  onContinueShopping={() => goto('/')}
                  onProfile={() => goto('/profile')}
                />
              )}

              {route === '/orders' && (
                <Orders goHome={() => goto('/')} />
              )}
            </>
          )}
        </Layout>
      </CartProvider>
    </>
  );
}
