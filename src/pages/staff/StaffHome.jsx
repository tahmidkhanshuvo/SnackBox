import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { 
  ClipboardList, 
  MessageSquare, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  User,
  LogOut,
  Bell,
  RefreshCw,
  Package,
  Users,
  TrendingUp,
  Timer
} from 'lucide-react';
import './StaffHome.css';

const StaffHome = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Get current user data
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!userData.isAuthenticated || userData.role !== 'staff') {
      navigate('/login');
      return;
    }
    setCurrentUser(userData);

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  // Mock data for staff dashboard
  const orderStats = {
    pending: 8,
    inProgress: 5,
    completed: 23,
    complaints: 2
  };

  const recentOrders = [
    {
      id: 'ORD-001',
      customer: 'John Doe',
      items: ['Beef Biryani', 'Cold Drink'],
      total: 225,
      status: 'pending',
      time: '10:30 AM',
      table: 'T-5'
    },
    {
      id: 'ORD-002',
      customer: 'Jane Smith',
      items: ['Chicken Burger', 'Fries'],
      total: 180,
      status: 'in-progress',
      time: '10:45 AM',
      table: 'T-12'
    },
    {
      id: 'ORD-003',
      customer: 'Mike Johnson',
      items: ['Pasta', 'Juice'],
      total: 150,
      status: 'ready',
      time: '11:00 AM',
      table: 'T-8'
    }
  ];

  const quickActions = [
    { 
      title: "Order Management", 
      icon: ClipboardList, 
      color: "bg-gradient-to-r from-yellow-500 to-yellow-600",
      description: "Manage incoming orders",
      count: orderStats.pending,
      path: "/staff/orders"
    },
    { 
      title: "Complaints", 
      icon: MessageSquare, 
      color: "bg-gradient-to-r from-yellow-600 to-yellow-700",
      description: "Handle customer complaints",
      count: orderStats.complaints,
      path: "/staff/complaints"
    },
    { 
      title: "My Schedule", 
      icon: Calendar, 
      color: "bg-gradient-to-r from-yellow-500 to-yellow-600",
      description: "View work schedule",
      path: "/staff/schedule"
    },
    { 
      title: "Salary Info", 
      icon: DollarSign, 
      color: "bg-gradient-to-r from-yellow-600 to-yellow-700",
      description: "Check salary details",
      path: "/staff/salary"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={14} />;
      case 'in-progress': return <RefreshCw size={14} />;
      case 'ready': return <CheckCircle size={14} />;
      default: return <Package size={14} />;
    }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    // In a real app, this would update the database
    console.log(`Order ${orderId} updated to ${newStatus}`);
  };

  if (!currentUser) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="staff-home">
      {/* Header */}
      <header className="staff-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">
              <Package size={32} />
              <span>SnackBox Staff</span>
            </div>
          </div>
          
          <div className="header-right">
            <div className="time-display">
              <Clock size={18} />
              <span>{currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}</span>
            </div>
            
            <button className="notification-btn">
              <Bell size={20} />
              <span className="notification-badge">{orderStats.pending}</span>
            </button>
            
            <div className="user-menu">
              <div className="user-info">
                <User size={20} />
                <span>{currentUser.fullName}</span>
                <Badge className="staff-badge">Staff</Badge>
              </div>
              <button className="logout-btn" onClick={handleLogout}>
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="staff-main">
        {/* Dashboard Summary */}
        <section className="dashboard-summary">
          <div className="summary-header">
            <h1>Staff Dashboard</h1>
            <p>Welcome back, {currentUser.fullName}! Here's your workstation overview.</p>
          </div>
          
          <div className="stats-grid">
            <Card className="stat-card pending">
              <div className="stat-icon">
                <Clock size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-number">{orderStats.pending}</span>
                <span className="stat-label">Pending Orders</span>
              </div>
            </Card>
            
            <Card className="stat-card in-progress">
              <div className="stat-icon">
                <RefreshCw size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-number">{orderStats.inProgress}</span>
                <span className="stat-label">In Progress</span>
              </div>
            </Card>
            
            <Card className="stat-card completed">
              <div className="stat-icon">
                <CheckCircle size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-number">{orderStats.completed}</span>
                <span className="stat-label">Completed Today</span>
              </div>
            </Card>
            
            <Card className="stat-card complaints">
              <div className="stat-icon">
                <AlertTriangle size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-number">{orderStats.complaints}</span>
                <span className="stat-label">Active Complaints</span>
              </div>
            </Card>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            {quickActions.map((action, index) => (
              <Card 
                key={index} 
                className="action-card"
                onClick={() => navigate(action.path)}
              >
                <div className={`action-icon ${action.color}`}>
                  <action.icon size={24} />
                </div>
                <div className="action-content">
                  <div className="action-header">
                    <h3>{action.title}</h3>
                    {action.count && (
                      <Badge className="action-count">{action.count}</Badge>
                    )}
                  </div>
                  <p>{action.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Recent Orders */}
        <section className="recent-orders">
          <div className="section-header">
            <h2>Recent Orders</h2>
            <Button variant="outline" className="refresh-btn">
              <RefreshCw size={16} />
              Refresh
            </Button>
          </div>
          
          <div className="orders-list">
            {recentOrders.map((order) => (
              <Card key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{order.id}</h3>
                    <div className="order-meta">
                      <span className="customer-name">
                        <Users size={14} />
                        {order.customer}
                      </span>
                      <span className="order-time">
                        <Timer size={14} />
                        {order.time}
                      </span>
                      <span className="table-number">
                        Table: {order.table}
                      </span>
                    </div>
                  </div>
                  
                  <Badge className={`status-badge ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>
                
                <div className="order-items">
                  <p><strong>Items:</strong> {order.items.join(', ')}</p>
                  <p><strong>Total:</strong> ৳{order.total}</p>
                </div>
                
                <div className="order-actions">
                  {order.status === 'pending' && (
                    <Button 
                      className="start-btn"
                      onClick={() => updateOrderStatus(order.id, 'in-progress')}
                    >
                      Start Preparation
                    </Button>
                  )}
                  {order.status === 'in-progress' && (
                    <Button 
                      className="ready-btn"
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                    >
                      Mark as Ready
                    </Button>
                  )}
                  {order.status === 'ready' && (
                    <Button 
                      className="complete-btn"
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                    >
                      Mark as Delivered
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Performance Metrics */}
        <section className="performance-metrics">
          <h2>Today's Performance</h2>
          <div className="metrics-grid">
            <Card className="metric-card">
              <div className="metric-icon">
                <TrendingUp size={32} />
              </div>
              <div className="metric-content">
                <span className="metric-value">92%</span>
                <span className="metric-label">Orders On Time</span>
              </div>
            </Card>
            
            <Card className="metric-card">
              <div className="metric-icon">
                <Users size={32} />
              </div>
              <div className="metric-content">
                <span className="metric-value">28</span>
                <span className="metric-label">Customers Served</span>
              </div>
            </Card>
            
            <Card className="metric-card">
              <div className="metric-icon">
                <Clock size={32} />
              </div>
              <div className="metric-content">
                <span className="metric-value">6h 45m</span>
                <span className="metric-label">Hours Worked</span>
              </div>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
};

export default StaffHome;