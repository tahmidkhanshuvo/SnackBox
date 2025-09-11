import React, { useState, useEffect } from 'react';
import apiClient from './api/api';
import LoginPage from './pages/Login';

// --- STYLES for DASHBOARD ---
// These are minimal styles needed for the dashboard views, keeping the UI consistent.
const DashboardStyles = () => (
  <style>{`
    .page-container {
      display: flex;
      width: 100vw;
      height: 100vh;
      align-items: center;
      justify-content: center;
      background-color: #f0f2f5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    .dashboard-container {
        text-align: center;
        background: #fff;
        padding: 40px;
        border-radius: 20px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        width: 100%;
        max-width: 600px;
    }
    .dashboard-container h2 {
        margin-top: 0;
        font-size: 2rem;
        color: #333;
    }
    .dashboard-container p {
        font-size: 1.1rem;
        color: #555;
    }
    .dashboard-container .role-badge {
        display: inline-block;
        padding: 5px 15px;
        border-radius: 15px;
        font-weight: 600;
        margin-top: 10px;
    }
    .dashboard-container .role-staff {
        background-color: #d1e7dd;
        color: #0f5132;
    }
    .dashboard-container .role-user {
        background-color: #cce5ff;
        color: #004085;
    }
    .button-submit {
      margin: 20px 0 10px 0;
      background-color: #151717;
      border: none;
      color: white;
      font-size: 15px;
      font-weight: 500;
      border-radius: 10px;
      height: 50px;
      width: 100%;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
    .button-submit:hover {
      background-color: #2d79f3;
    }
  `}</style>
);


// --- DASHBOARD COMPONENTS ---
const StaffDashboard = ({ user, onLogout }) => (
    <div className="dashboard-container">
        <h2>Staff Dashboard</h2>
        <p>Welcome, <strong>{user.name}</strong>!</p>
        <span className="role-badge role-staff">Staff Member</span>
        <button className="button-submit" onClick={onLogout}>Logout</button>
    </div>
);

const UserDashboard = ({ user, onLogout }) => (
    <div className="dashboard-container">
        <h2>Customer Dashboard</h2>
        <p>Welcome, <strong>{user.name}</strong>!</p>
        <span className="role-badge role-user">Customer</span>
        <button className="button-submit" onClick={onLogout}>Logout</button>
    </div>
);


// --- Main App Component ---
function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On initial load, check if a user session already exists.
    useEffect(() => {
        const checkUserSession = async () => {
            try {
                const { data } = await apiClient.get('/api/auth/me');
                setUser(data);
            } catch (error) {
                console.log('No active session found.');
            } finally {
                setLoading(false);
            }
        };
        checkUserSession();
    }, []);

    const handleLoginSuccess = (loggedInUser) => {
        setUser(loggedInUser);
    };
    
    const handleLogout = async () => {
        try {
            await apiClient.post('/api/auth/logout');
        } catch (error) {
            console.error("Logout request failed:", error);
        } finally {
            setUser(null); // Clear user state on the client regardless of API call success
        }
    };

    if (loading) {
        return <div className="page-container"><h2>Loading...</h2></div>;
    }
    
    // This is the core routing logic. It decides which component to show.
    if (user) {
        // If a user is logged in, show the correct dashboard.
        // This relies on your Laravel API returning the 'staff' relationship for staff users.
        return (
            <>
                <DashboardStyles />
                <div className="page-container">
                    {user.staff ? (
                        <StaffDashboard user={user} onLogout={handleLogout} />
                    ) : (
                        <UserDashboard user={user} onLogout={handleLogout} />
                    )}
                </div>
            </>
        );
    } else {
        // If no user is logged in, show the full login page.
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }
};

export default App;

