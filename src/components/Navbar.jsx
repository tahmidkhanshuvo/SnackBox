import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
    const themeContext = useContext(ThemeContext);
    const navigate = useNavigate();

    // --- SAFETY CHECK ---
    // If the context is not found, don't render the parts that need it.
    if (!themeContext) {
        // You can return null or a fallback UI
        return null; 
    }

    const { theme, toggleTheme } = themeContext; // Destructure only after the check

    const handleLogout = () => {
        localStorage.removeItem('loggedInUser');
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    SnackBox
                </Link>
                <div className="navbar-menu">
                    <div className="theme-switcher" onClick={toggleTheme}>
                        {theme === 'light' ? '🌙' : '☀️'}
                    </div>
                    <button onClick={handleLogout} className="logout-button">
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;