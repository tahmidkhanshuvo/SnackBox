import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { 
  ShoppingCart, 
  Calendar, 
  Menu, 
  Star, 
  Clock, 
  Utensils, 
  Coffee, 
  Apple,
  User,
  LogOut,
  Bell,
  Heart,
  ChevronRight
} from 'lucide-react';
import './CustomerHome.css';

const CustomerHome = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [cartItems, setCartItems] = useState(0);

  useEffect(() => {
    // Get current user data
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!userData.isAuthenticated) {
      navigate('/login');
      return;
    }
    setCurrentUser(userData);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  // Mock data for today's specials
  const todaysSpecials = [
    {
      id: 1,
      name: "Beef Biryani",
      price: 180,
      rating: 4.8,
      image: "🍚",
      category: "Lunch",
      discount: 15
    },
    {
      id: 2,
      name: "Chicken Burger",
      price: 120,
      rating: 4.6,
      image: "🍔",
      category: "Snacks",
      discount: 10
    },
    {
      id: 3,
      name: "Mango Lassi",
      price: 45,
      rating: 4.9,
      image: "🥤",
      category: "Cold Drinks",
      discount: 20
    }
  ];

  const quickActions = [
    { 
      title: "Order Now", 
      icon: ShoppingCart, 
      color: "bg-gradient-to-r from-red-600 to-red-700",
      description: "Browse menu & place order",
      path: "/customer/menu"
    },
    { 
      title: "Reserve Table", 
      icon: Calendar, 
      color: "bg-gradient-to-r from-red-500 to-red-600",
      description: "Book a table in advance",
      path: "/customer/reservation"
    },
    { 
      title: "View Menu", 
      icon: Menu, 
      color: "bg-gradient-to-r from-red-700 to-red-800",
      description: "See all available items",
      path: "/customer/menu"
    },
    { 
      title: "Track Orders", 
      icon: Clock, 
      color: "bg-gradient-to-r from-red-600 to-red-700",
      description: "Check order status",
      path: "/customer/orders"
    }
  ];

  const menuCategories = [
    { name: "Breakfast", icon: Coffee, items: 15, color: "text-red-600" },
    { name: "Lunch", icon: Utensils, items: 25, color: "text-red-700" },
    { name: "Snacks", icon: Apple, items: 18, color: "text-red-600" },
    { name: "Cold Drinks", icon: Menu, items: 12, color: "text-red-500" }
  ];

  if (!currentUser) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="customer-home">
      {/* Header */}
      <header className="customer-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">
              <Utensils size={32} />
              <span>SnackBox</span>
            </div>
          </div>
          
          <div className="header-right">
            <button className="notification-btn">
              <Bell size={20} />
              <span className="notification-badge">3</span>
            </button>
            
            <div className="cart-btn">
              <ShoppingCart size={20} />
              {cartItems > 0 && <span className="cart-badge">{cartItems}</span>}
            </div>
            
            <div className="user-menu">
              <div className="user-info">
                <User size={20} />
                <span>{currentUser.fullName}</span>
              </div>
              <button className="logout-btn" onClick={handleLogout}>
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="customer-main">
        {/* Welcome Banner */}
        <section className="welcome-banner">
          <div className="welcome-content">
            <h1>Welcome back, {currentUser.fullName}!</h1>
            <p>Ready to satisfy your cravings? Discover delicious meals and special offers.</p>
            <div className="banner-stats">
              <div className="stat">
                <span className="stat-number">50+</span>
                <span className="stat-label">Menu Items</span>
              </div>
              <div className="stat">
                <span className="stat-number">4.8</span>
                <span className="stat-label">Average Rating</span>
              </div>
              <div className="stat">
                <span className="stat-number">15min</span>
                <span className="stat-label">Avg Delivery</span>
              </div>
            </div>
          </div>
          <div className="welcome-image">
            <div className="food-emoji">🍽️</div>
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
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>
                <ChevronRight className="action-arrow" size={20} />
              </Card>
            ))}
          </div>
        </section>

        {/* Today's Specials */}
        <section className="todays-specials">
          <div className="section-header">
            <h2>Today's Specials</h2>
            <Button variant="outline" className="view-all-btn">
              View All Menu
            </Button>
          </div>
          
          <div className="specials-grid">
            {todaysSpecials.map((item) => (
              <Card key={item.id} className="special-card">
                <div className="special-image">
                  <span className="food-icon">{item.image}</span>
                  <div className="discount-badge">
                    {item.discount}% OFF
                  </div>
                  <button className="favorite-btn">
                    <Heart size={16} />
                  </button>
                </div>
                
                <div className="special-info">
                  <div className="special-header">
                    <h3>{item.name}</h3>
                    <Badge variant="secondary" className="category-badge">
                      {item.category}
                    </Badge>
                  </div>
                  
                  <div className="special-rating">
                    <Star className="star-icon" size={14} />
                    <span>{item.rating}</span>
                  </div>
                  
                  <div className="special-footer">
                    <div className="price-section">
                      <span className="current-price">৳{item.price}</span>
                      <span className="original-price">
                        ৳{Math.round(item.price / (1 - item.discount / 100))}
                      </span>
                    </div>
                    
                    <Button 
                      className="add-to-cart-btn"
                      onClick={() => setCartItems(prev => prev + 1)}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Menu Categories */}
        <section className="menu-categories">
          <h2>Browse by Category</h2>
          <div className="categories-grid">
            {menuCategories.map((category, index) => (
              <Card 
                key={index} 
                className="category-card"
                onClick={() => navigate('/customer/menu')}
              >
                <div className="category-content">
                  <category.icon className={`category-icon ${category.color}`} size={32} />
                  <h3>{category.name}</h3>
                  <p>{category.items} items available</p>
                </div>
                <ChevronRight className="category-arrow" size={20} />
              </Card>
            ))}
          </div>
        </section>

        {/* Recent Orders */}
        <section className="recent-orders">
          <div className="section-header">
            <h2>Recent Orders</h2>
            <Button variant="outline" className="view-all-btn">
              View Order History
            </Button>
          </div>
          
          <Card className="order-summary">
            <div className="no-orders">
              <Clock size={48} className="no-orders-icon" />
              <h3>No Recent Orders</h3>
              <p>Start by placing your first order!</p>
              <Button 
                className="order-now-btn"
                onClick={() => navigate('/customer/menu')}
              >
                Order Now
              </Button>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default CustomerHome;