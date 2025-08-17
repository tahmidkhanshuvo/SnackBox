import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { 
  BarChart3, 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  Settings,
  MessageSquare,
  User,
  LogOut,
  Bell,
  RefreshCw,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  ShoppingCart,
  Star,
  Activity
} from 'lucide-react';
import './ManagerHome.css';

const ManagerHome = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Get current user data
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!userData.isAuthenticated || userData.role !== 'manager') {
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

  // Mock data for manager dashboard
  const dashboardStats = {
    totalSales: 15420,
    totalOrders: 89,
    activeStaff: 12,
    pendingComplaints: 3,
    lowStockItems: 5,
    todayRevenue: 8760
  };

  const quickActions = [
    { 
      title: "Menu Management", 
      icon: Package, 
      color: "bg-gradient-to-r from-emerald-500 to-emerald-600",
      description: "Add, edit, delete menu items",
      path: "/manager/menu"
    },
    { 
      title: "Staff Management", 
      icon: Users, 
      color: "bg-gradient-to-r from-emerald-600 to-emerald-700",
      description: "Manage staff and shifts",
      path: "/manager/staff"
    },
    { 
      title: "Inventory", 
      icon: Package, 
      color: "bg-gradient-to-r from-emerald-500 to-emerald-600",
      description: "Track stock levels",
      count: dashboardStats.lowStockItems,
      path: "/manager/inventory"
    },
    { 
      title: "Sales Reports", 
      icon: BarChart3, 
      color: "bg-gradient-to-r from-emerald-600 to-emerald-700",
      description: "View analytics & reports",
      path: "/manager/reports"
    },
    { 
      title: "Complaints", 
      icon: MessageSquare, 
      color: "bg-gradient-to-r from-emerald-500 to-emerald-600",
      description: "Handle customer issues",
      count: dashboardStats.pendingComplaints,
      path: "/manager/complaints"
    },
    { 
      title: "Settings", 
      icon: Settings, 
      color: "bg-gradient-to-r from-emerald-600 to-emerald-700",
      description: "System configuration",
      path: "/manager/settings"
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'order',
      message: 'New order #ORD-089 placed',
      time: '2 min ago',
      icon: ShoppingCart,
      color: 'text-emerald-600'
    },
    {
      id: 2,
      type: 'staff',
      message: 'John Doe clocked in',
      time: '15 min ago',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      id: 3,
      type: 'complaint',
      message: 'New complaint received',
      time: '30 min ago',
      icon: AlertTriangle,
      color: 'text-red-600'
    },
    {
      id: 4,
      type: 'inventory',
      message: 'Chicken stock running low',
      time: '1 hour ago',
      icon: Package,
      color: 'text-yellow-600'
    }
  ];

  const salesData = {
    today: 8760,
    yesterday: 7450,
    thisWeek: 52300,
    lastWeek: 48900
  };

  const topMenuItems = [
    { name: 'Beef Biryani', orders: 23, revenue: 4140 },
    { name: 'Chicken Burger', orders: 18, revenue: 2160 },
    { name: 'Mixed Fried Rice', orders: 15, revenue: 2250 },
    { name: 'Cold Coffee', orders: 12, revenue: 720 }
  ];

  if (!currentUser) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="manager-home">
      {/* Header */}
      <header className="manager-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">
              <BarChart3 size={32} />
              <span>SnackBox Manager</span>
            </div>
          </div>
          
          <div className="header-right">
            <div className="time-display">
              <Clock size={18} />
              <span>{currentTime.toLocaleString('en-US', { 
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit', 
                minute: '2-digit'
              })}</span>
            </div>
            
            <button className="notification-btn">
              <Bell size={20} />
              <span className="notification-badge">{dashboardStats.pendingComplaints}</span>
            </button>
            
            <div className="user-menu">
              <div className="user-info">
                <User size={20} />
                <span>{currentUser.fullName}</span>
                <Badge className="manager-badge">Manager</Badge>
              </div>
              <button className="logout-btn" onClick={handleLogout}>
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="manager-main">
        {/* Dashboard Overview */}
        <section className="dashboard-overview">
          <div className="overview-header">
            <h1>Manager Dashboard</h1>
            <p>Complete overview of your canteen operations</p>
          </div>
          
          <div className="stats-grid">
            <Card className="stat-card revenue">
              <div className="stat-icon">
                <DollarSign size={28} />
              </div>
              <div className="stat-content">
                <span className="stat-number">৳{dashboardStats.todayRevenue.toLocaleString()}</span>
                <span className="stat-label">Today's Revenue</span>
                <div className="stat-change positive">
                  <TrendingUp size={14} />
                  +12% from yesterday
                </div>
              </div>
            </Card>
            
            <Card className="stat-card orders">
              <div className="stat-icon">
                <ShoppingCart size={28} />
              </div>
              <div className="stat-content">
                <span className="stat-number">{dashboardStats.totalOrders}</span>
                <span className="stat-label">Total Orders Today</span>
                <div className="stat-change positive">
                  <TrendingUp size={14} />
                  +8% from yesterday
                </div>
              </div>
            </Card>
            
            <Card className="stat-card staff">
              <div className="stat-icon">
                <Users size={28} />
              </div>
              <div className="stat-content">
                <span className="stat-number">{dashboardStats.activeStaff}</span>
                <span className="stat-label">Active Staff</span>
                <div className="stat-change neutral">
                  <Activity size={14} />
                  8 on duty now
                </div>
              </div>
            </Card>
            
            <Card className="stat-card rating">
              <div className="stat-icon">
                <Star size={28} />
              </div>
              <div className="stat-content">
                <span className="stat-number">4.8</span>
                <span className="stat-label">Average Rating</span>
                <div className="stat-change positive">
                  <TrendingUp size={14} />
                  +0.2 this week
                </div>
              </div>
            </Card>
          </div>
        </section>

        <div className="dashboard-grid">
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
                    <action.icon size={20} />
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

          {/* Recent Activities */}
          <section className="recent-activities">
            <div className="section-header">
              <h2>Recent Activities</h2>
              <Button variant="outline" className="refresh-btn">
                <RefreshCw size={16} />
                Refresh
              </Button>
            </div>
            
            <Card className="activities-card">
              <div className="activities-list">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className={`activity-icon ${activity.color}`}>
                      <activity.icon size={16} />
                    </div>
                    <div className="activity-content">
                      <p>{activity.message}</p>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        </div>

        {/* Sales Overview */}
        <section className="sales-overview">
          <h2>Sales Overview</h2>
          <div className="sales-grid">
            <Card className="sales-card">
              <h3>Today</h3>
              <span className="sales-amount">৳{salesData.today.toLocaleString()}</span>
              <div className="sales-change positive">
                <TrendingUp size={14} />
                +17.6% vs yesterday
              </div>
            </Card>
            
            <Card className="sales-card">
              <h3>Yesterday</h3>
              <span className="sales-amount">৳{salesData.yesterday.toLocaleString()}</span>
              <div className="sales-change neutral">
                Similar to avg
              </div>
            </Card>
            
            <Card className="sales-card">
              <h3>This Week</h3>
              <span className="sales-amount">৳{salesData.thisWeek.toLocaleString()}</span>
              <div className="sales-change positive">
                <TrendingUp size={14} />
                +7.0% vs last week
              </div>
            </Card>
            
            <Card className="sales-card">
              <h3>Last Week</h3>
              <span className="sales-amount">৳{salesData.lastWeek.toLocaleString()}</span>
              <div className="sales-change neutral">
                Good performance
              </div>
            </Card>
          </div>
        </section>

        {/* Top Menu Items */}
        <section className="top-menu-items">
          <h2>Top Performing Items</h2>
          <Card className="menu-items-card">
            <div className="menu-items-list">
              {topMenuItems.map((item, index) => (
                <div key={index} className="menu-item">
                  <div className="item-rank">#{index + 1}</div>
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p>{item.orders} orders today</p>
                  </div>
                  <div className="item-revenue">
                    <span>৳{item.revenue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Alert Section */}
        {(dashboardStats.lowStockItems > 0 || dashboardStats.pendingComplaints > 0) && (
          <section className="alerts-section">
            <h2>Attention Required</h2>
            <div className="alerts-grid">
              {dashboardStats.lowStockItems > 0 && (
                <Card className="alert-card warning">
                  <div className="alert-icon">
                    <Package size={24} />
                  </div>
                  <div className="alert-content">
                    <h3>Low Stock Alert</h3>
                    <p>{dashboardStats.lowStockItems} items running low</p>
                    <Button 
                      className="alert-action"
                      onClick={() => navigate('/manager/inventory')}
                    >
                      View Inventory
                    </Button>
                  </div>
                </Card>
              )}
              
              {dashboardStats.pendingComplaints > 0 && (
                <Card className="alert-card danger">
                  <div className="alert-icon">
                    <MessageSquare size={24} />
                  </div>
                  <div className="alert-content">
                    <h3>Pending Complaints</h3>
                    <p>{dashboardStats.pendingComplaints} complaints need attention</p>
                    <Button 
                      className="alert-action"
                      onClick={() => navigate('/manager/complaints')}
                    >
                      Handle Complaints
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default ManagerHome;