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

const DashboardStyles = () => (
  <style>{`
    .page-container{display:flex;width:100vw;height:100vh;align-items:center;justify-content:center;background-color:#f0f2f5;overflow:auto}
    .dashboard-container{text-align:center;background:#fff;padding:40px;border-radius:20px;box-shadow:0 10px 25px rgba(0,0,0,.1);width:100%;max-width:600px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Open Sans','Helvetica Neue',sans-serif}
    .dashboard-container h2{margin-top:0;font-size:2rem;color:#333}.dashboard-container p{font-size:1.1rem;color:#555}
    .button-submit{margin:20px 0 10px 0;background-color:#151717;border:none;color:#fff;font-size:15px;font-weight:600;border-radius:10px;height:50px;width:100%;cursor:pointer;transition:background-color .3s ease}
    .button-submit:hover{background-color:#2d79f3}
    .toast-wrap{position:fixed;top:16px;right:16px;z-index:50;display:flex;flex-direction:column;gap:8px}.toast{background:rgba(17,24,39,.92);color:#fff;padding:10px 14px;border-radius:10px;box-shadow:0 10px 20px rgba(0,0,0,.25);font-weight:600;letter-spacing:.2px;animation:fadeIn .15s ease-out;max-width:300px}.toast button{background:transparent;border:none;color:#a5b4fc;font-weight:700;cursor:pointer;margin-left:8px}
    @keyframes fadeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
  `}</style>
);

const Toast = ({ message, onClose, duration = 3000 }) => {
  const t = useRef(null);
  useEffect(() => { t.current = setTimeout(onClose, duration); return () => clearTimeout(t.current); }, [onClose, duration]);
  return (<div className="toast-wrap" role="status" aria-live="polite"><div className="toast">{message}<button onClick={onClose}>×</button></div></div>);
};

const StaffDashboard = ({ user, onLogout }) => (
  <div className="dashboard-container">
    <h2>Staff Dashboard</h2>
    <p>Welcome, <strong>{user?.name}</strong>!</p>
    <p>This is the staff management area.</p>
    <button className="button-submit" onClick={onLogout}>Logout</button>
  </div>
);

// Tiny router helpers (History API)
const getPath = () => window.location.pathname || '/';
const navigate = (path) => { if (getPath() !== path) window.history.replaceState({}, '', path); };
const scrollTop = () => { try { window.scrollTo({ top: 0, behavior: 'instant' }); } catch { window.scrollTo(0,0); } };

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
        const okCustomerPath =
          p === '/' ||
          p.startsWith('/product/') ||
          p === '/profile' ||
          p === '/cart' ||
          p === '/orders';
        if (me?.staff) goto('/staff');
        else goto(okCustomerPath ? p : '/');
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
    if (!user) { if (route !== '/login') goto('/login'); return; }
    if (user?.staff) { if (route !== '/staff') goto('/staff'); return; }
    if (route === '/' || route.startsWith('/product/') || route === '/profile' || route === '/cart' || route === '/orders') return;
    goto('/');
  }, [user, route, booting]);

  const handleLoginSuccess = (u) => {
    setUser(u);
    const p = getPath();
    const okCustomerPath = p.startsWith('/product/') || p === '/profile' || p === '/cart' || p === '/orders';
    const dest = u?.staff ? '/staff' : (okCustomerPath ? p : '/');
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

      {/* Provide cart state to the whole app */}
      <CartProvider>
        {/* Everything below inherits the fixed Topbar/Footer from Layout */}
        <Layout user={user} onLogout={handleLogout}>
          {!user && route === '/login' && <LoginPage onLoginSuccess={handleLoginSuccess} />}

          {user && route === '/staff' && (
            <div className="page-container"><StaffDashboard user={user} onLogout={handleLogout} /></div>
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
