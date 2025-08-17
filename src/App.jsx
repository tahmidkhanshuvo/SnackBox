import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Button } from './components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Register from './src/auth/Register.jsx';
import Login from './src/auth/Login.jsx';
import CustomerHome from './src/pages/customer/CustomerHome.jsx';
import StaffHome from './src/pages/staff/StaffHome.jsx';
import ManagerHome from './src/pages/manager/ManagerHome.jsx';

// Placeholder Page Component with Back Button
const PlaceholderPage = ({ title }) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-6xl">🚧</div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-lg text-gray-600">Coming Soon</p>
        <p className="text-gray-500">
          This page is under development and will be available in a future update.
        </p>
        <Button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2"
          variant="outline"
        >
          <ArrowLeft size={16} />
          Go Back
        </Button>
      </div>
    </div>
  );
};

// Protected Route Component (Laravel-inspired middleware pattern)
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  if (!currentUser.isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    // Redirect to appropriate home based on user role
    switch (currentUser.role) {
      case 'customer':
        return <Navigate to="/customer/home" />;
      case 'staff':
        return <Navigate to="/staff/home" />;
      case 'manager':
        return <Navigate to="/manager/home" />;
      default:
        return <Navigate to="/login" />;
    }
  }
  
  return <>{children}</>;
};

// Public Route Component (redirects authenticated users)
const PublicRoute = ({ children }) => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  if (currentUser.isAuthenticated) {
    // Redirect to appropriate home based on user role
    switch (currentUser.role) {
      case 'customer':
        return <Navigate to="/customer/home" />;
      case 'staff':
        return <Navigate to="/staff/home" />;
      case 'manager':
        return <Navigate to="/manager/home" />;
      default:
        return <Navigate to="/login" />;
    }
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <div className="size-full min-h-screen">
        <Routes>
          {/* Default route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Public routes */}
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          
          {/* Protected Customer routes */}
          <Route 
            path="/customer/home" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerHome />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected Staff routes */}
          <Route 
            path="/staff/home" 
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffHome />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected Manager routes */}
          <Route 
            path="/manager/home" 
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <ManagerHome />
              </ProtectedRoute>
            } 
          />
          
          {/* Placeholder routes for future pages */}
          <Route path="/customer/menu" element={<PlaceholderPage title="Customer Menu Page" />} />
          <Route path="/customer/orders" element={<PlaceholderPage title="Order Tracking Page" />} />
          <Route path="/customer/reservation" element={<PlaceholderPage title="Table Reservation Page" />} />
          
          <Route path="/staff/orders" element={<PlaceholderPage title="Staff Order Management" />} />
          <Route path="/staff/complaints" element={<PlaceholderPage title="Staff Complaints Page" />} />
          <Route path="/staff/schedule" element={<PlaceholderPage title="Staff Schedule Page" />} />
          <Route path="/staff/salary" element={<PlaceholderPage title="Staff Salary Page" />} />
          
          <Route path="/manager/menu" element={<PlaceholderPage title="Manager Menu Management" />} />
          <Route path="/manager/staff" element={<PlaceholderPage title="Manager Staff Management" />} />
          <Route path="/manager/inventory" element={<PlaceholderPage title="Manager Inventory Page" />} />
          <Route path="/manager/reports" element={<PlaceholderPage title="Manager Reports Page" />} />
          <Route path="/manager/complaints" element={<PlaceholderPage title="Manager Complaints Page" />} />
          <Route path="/manager/settings" element={<PlaceholderPage title="Manager Settings Page" />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;