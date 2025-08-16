import React from 'react';
import './ManagerHome.css';

const ManagerHome = () => {
    return (
        <div className="manager-home-container">
            <header className="manager-header">
                <h1>Manager Dashboard</h1>
                <p>Oversee Canteen Performance and Analytics</p>
            </header>
            <main className="page-container">
                {/* Overview Stats */}
                <section className="overview-stats">
                    <div className="stat-card">
                        <h4>Total Sales Today</h4>
                        <p>$1,250</p>
                    </div>
                    <div className="stat-card">
                        <h4>Orders Today</h4>
                        <p>150</p>
                    </div>
                    <div className="stat-card">
                        <h4>Low Stock Items</h4>
                        <p>3</p>
                    </div>
                </section>

                {/* Quick Actions */}
                <div className="dashboard-grid">
                    <div className="card manager-card">
                        <h3>Menu Management</h3>
                        <p>Add, edit, or delete menu items and set availability.</p>
                        <button className="btn">Manage Menu</button>
                    </div>
                    <div className="card manager-card">
                        <h3>Inventory Management</h3>
                        <p>View current stock levels and receive low-stock alerts.</p>
                        <button className="btn">Manage Inventory</button>
                    </div>
                    <div className="card manager-card">
                        <h3>Staff Management</h3>
                        <p>Manage staff records, assign shifts, and handle salaries.</p>
                        <button className="btn">Manage Staff</button>
                    </div>
                    <div className="card manager-card">
                        <h3>Order & Sales Reports</h3>
                        <p>View and download sales reports and analytics.</p>
                        <button className="btn">View Reports</button>
                    </div>
                    <div className="card manager-card">
                        <h3>Complaint Management</h3>
                        <p>View and resolve all customer complaints.</p>
                        <button className="btn">Manage Complaints</button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ManagerHome;