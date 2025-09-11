import React, { useState, useEffect } from 'react';
import apiClient from './api/api';
import LoginPage from './pages/Login';
import UserDashboard from './pages/UserDashboard'; // Import the new UserDashboard

// --- STYLES for DASHBOARD ---
const DashboardStyles = () => (
  <style>{`
    .page-container {
      display: flex;
      width: 100vw;
      height: 100vh;
      align-items: center;
      justify-content: center;
      background-color: #f0f2f5;
      overflow: auto; /* Allow scrolling for dashboard content */
    }
    .dashboard-container {
        text-align: center;
        background: #fff;
        padding: 40px;
        border-radius: 20px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        width: 100%;
        max-width: 600px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
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

// --- Simple Staff Dashboard Placeholder ---
const StaffDashboard = ({ user, onLogout }) => (
    <div className="dashboard-container">
        <h2>Staff Dashboard</h2>
        <p>Welcome, <strong>{user.name}</strong>!</p>
        <p>This is the staff management area.</p>
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
            setUser(null);
        }
    };

    if (loading) {
        return <div className="page-container"><h2>Loading...</h2></div>;
    }
    
    // The main routing logic
    if (!user) {
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }

    if (user.staff) {
        return (
            <>
                <DashboardStyles />
                <div className="page-container">
                    <StaffDashboard user={user} onLogout={handleLogout} />
                </div>
            </>
        );
    }

    // If user exists and is not staff, show the UserDashboard
    return <UserDashboard user={user} onLogout={handleLogout} />;
};

export default App;

